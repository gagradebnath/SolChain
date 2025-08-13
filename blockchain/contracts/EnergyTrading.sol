// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SolarToken.sol";

/**
 * @title EnergyTrading
 * @dev Smart contract for P2P energy trading with escrow functionality
 * @author Team GreyDevs
 */
contract EnergyTrading is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    SolarToken public immutable solarToken;
    
    uint256 public nextOfferId = 1;
    uint256 public nextTradeId = 1;
    
    // Trading parameters
    uint256 public tradingFeeBasisPoints = 25; // 0.25% platform fee
    uint256 public constant MAX_FEE_BASIS_POINTS = 1000; // 10% maximum fee
    uint256 public minimumTradeAmount = 1 * 10**18; // 1 SOLAR minimum
    uint256 public maximumTradeAmount = 10000 * 10**18; // 10,000 SOLAR maximum
    
    address public feeCollector;
    uint256 public escrowTimeoutDuration = 24 hours;

    enum OfferType { SELL, BUY }
    enum OfferStatus { ACTIVE, CANCELLED, COMPLETED }
    enum TradeStatus { PENDING, COMPLETED, DISPUTED, RESOLVED, REFUNDED }
    enum DisputeStatus { NONE, INITIATED, RESOLVED }

    struct Offer {
        uint256 offerId;
        address creator;
        OfferType offerType;
        uint256 energyAmount; // in kWh (represented as tokens)
        uint256 pricePerKWh; // in wei per token
        uint256 totalPrice; // energyAmount * pricePerKWh
        uint256 expirationTime;
        OfferStatus status;
        string location; // Grid location identifier
        string metadata; // Additional offer metadata
    }

    struct Trade {
        uint256 tradeId;
        uint256 offerId;
        address buyer;
        address seller;
        uint256 energyAmount;
        uint256 totalPrice;
        uint256 escrowAmount;
        uint256 createdAt;
        uint256 timeoutAt;
        TradeStatus status;
        DisputeStatus disputeStatus;
        address disputeInitiator;
        string disputeReason;
    }

    // Storage mappings
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Trade) public trades;
    mapping(address => uint256[]) public userOffers;
    mapping(address => uint256[]) public userTrades;
    mapping(address => bool) public blacklistedUsers;
    mapping(address => uint256) public userRatings; // Reputation system
    mapping(address => uint256) public totalTrades;

    // Events
    event OfferCreated(uint256 indexed offerId, address indexed creator, OfferType offerType, uint256 energyAmount, uint256 pricePerKWh);
    event OfferCancelled(uint256 indexed offerId, address indexed creator);
    event OfferUpdated(uint256 indexed offerId, uint256 newPricePerKWh, uint256 newExpirationTime);
        event TradeExecuted(uint256 indexed offerId, address indexed seller, address indexed buyer, uint256 energyAmount, uint256 totalPrice);
    event TradeCompleted(uint256 indexed tradeId, address indexed buyer, address indexed seller);
    event DisputeInitiated(uint256 indexed tradeId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed tradeId, address indexed winner, address indexed resolver);
    event EscrowReleased(uint256 indexed tradeId, address indexed recipient, uint256 amount);
    event EscrowRefunded(uint256 indexed tradeId, address indexed recipient, uint256 amount);
    event UserBlacklisted(address indexed user);
    event UserWhitelisted(address indexed user);
    event TradingParametersUpdated(uint256 fee, uint256 minAmount, uint256 maxAmount);

    modifier notBlacklisted(address user) {
        require(!blacklistedUsers[user], "EnergyTrading: user is blacklisted");
        _;
    }

    modifier validOffer(uint256 offerId) {
        require(offerId > 0 && offerId < nextOfferId, "EnergyTrading: invalid offer ID");
        require(offers[offerId].status == OfferStatus.ACTIVE, "EnergyTrading: offer not active");
        require(offers[offerId].expirationTime > block.timestamp, "EnergyTrading: offer expired");
        _;
    }

    modifier validTrade(uint256 tradeId) {
        require(tradeId > 0 && tradeId < nextTradeId, "EnergyTrading: invalid trade ID");
        _;
    }

    modifier onlyTradeParticipant(uint256 tradeId) {
        Trade memory trade = trades[tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "EnergyTrading: not trade participant");
        _;
    }

    constructor(
        address payable _solarToken,
        address _feeCollector
    ) {
        require(_solarToken != address(0), "EnergyTrading: invalid token address");
        require(_feeCollector != address(0), "EnergyTrading: invalid fee collector");
        
        solarToken = SolarToken(_solarToken);
        feeCollector = _feeCollector;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new energy offer
     */
    function createOffer(
        OfferType _offerType,
        uint256 _energyAmount,
        uint256 _pricePerKWh,
        uint256 _expirationTime,
        string calldata _location,
        string calldata _metadata
    ) external whenNotPaused notBlacklisted(msg.sender) nonReentrant {
        require(_energyAmount >= minimumTradeAmount, "EnergyTrading: amount too small");
        require(_energyAmount <= maximumTradeAmount, "EnergyTrading: amount too large");
        require(_pricePerKWh > 0, "EnergyTrading: invalid price");
        require(_expirationTime > block.timestamp, "EnergyTrading: invalid expiration");
        require(_expirationTime <= block.timestamp + 30 days, "EnergyTrading: expiration too far");

        uint256 totalPrice = _energyAmount * _pricePerKWh / 10**18;
        require(totalPrice > 0, "EnergyTrading: total price must be positive");

        // For sell offers, seller must have sufficient tokens
        if (_offerType == OfferType.SELL) {
            require(solarToken.balanceOf(msg.sender) >= _energyAmount, "EnergyTrading: insufficient token balance");
        }

        uint256 offerId = nextOfferId++;
        
        offers[offerId] = Offer({
            offerId: offerId,
            creator: msg.sender,
            offerType: _offerType,
            energyAmount: _energyAmount,
            pricePerKWh: _pricePerKWh,
            totalPrice: totalPrice,
            expirationTime: _expirationTime,
            status: OfferStatus.ACTIVE,
            location: _location,
            metadata: _metadata
        });

        userOffers[msg.sender].push(offerId);

        emit OfferCreated(offerId, msg.sender, _offerType, _energyAmount, _pricePerKWh);
    }

    /**
     * @dev Cancel an existing offer
     */
    function cancelOffer(uint256 offerId) external validOffer(offerId) nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.creator == msg.sender, "EnergyTrading: not offer creator");

        offer.status = OfferStatus.CANCELLED;
        emit OfferCancelled(offerId, msg.sender);
    }

    /**
     * @dev Update an existing offer
     */
    function updateOffer(
        uint256 offerId,
        uint256 _newPricePerKWh,
        uint256 _newExpirationTime
    ) external validOffer(offerId) nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.creator == msg.sender, "EnergyTrading: not offer creator");
        require(_newPricePerKWh > 0, "EnergyTrading: invalid price");
        require(_newExpirationTime > block.timestamp, "EnergyTrading: invalid expiration");

        offer.pricePerKWh = _newPricePerKWh;
        offer.totalPrice = offer.energyAmount * _newPricePerKWh / 10**18;
        offer.expirationTime = _newExpirationTime;

        emit OfferUpdated(offerId, _newPricePerKWh, _newExpirationTime);
    }

    /**
     * @dev Accept an offer and create a trade
     */
    function acceptOffer(uint256 offerId) external payable validOffer(offerId) whenNotPaused notBlacklisted(msg.sender) nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.creator != msg.sender, "EnergyTrading: cannot accept own offer");

        address buyer;
        address seller;
        
        if (offer.offerType == OfferType.SELL) {
            buyer = msg.sender;
            seller = offer.creator;
            // Buyer needs sufficient ETH to pay
            require(msg.value >= offer.totalPrice, "EnergyTrading: insufficient payment");
        } else {
            buyer = offer.creator;
            seller = msg.sender;
            // Seller must have sufficient tokens
            require(solarToken.balanceOf(msg.sender) >= offer.energyAmount, "EnergyTrading: insufficient tokens");
        }

        // Mark offer as completed
        offer.status = OfferStatus.COMPLETED;

        // Create trade with escrow
        uint256 tradeId = nextTradeId++;
        
        trades[tradeId] = Trade({
            tradeId: tradeId,
            offerId: offerId,
            buyer: buyer,
            seller: seller,
            energyAmount: offer.energyAmount,
            totalPrice: offer.totalPrice,
            escrowAmount: offer.totalPrice,
            createdAt: block.timestamp,
            timeoutAt: block.timestamp + escrowTimeoutDuration,
            status: TradeStatus.PENDING,
            disputeStatus: DisputeStatus.NONE,
            disputeInitiator: address(0),
            disputeReason: ""
        });

        userTrades[buyer].push(tradeId);
        userTrades[seller].push(tradeId);

        // Handle escrow based on offer type
        if (offer.offerType == OfferType.SELL) {
            // Transfer tokens from seller to escrow (this contract)
            solarToken.transferFrom(seller, address(this), offer.energyAmount);
            // Refund excess ETH to buyer
            if (msg.value > offer.totalPrice) {
                payable(buyer).transfer(msg.value - offer.totalPrice);
            }
        } else {
            // Transfer tokens from seller to escrow
            solarToken.transferFrom(seller, address(this), offer.energyAmount);
        }

        emit TradeExecuted(offerId, seller, buyer, offer.energyAmount, offer.totalPrice);
    }

    /**
     * @dev Complete a trade and release escrow
     */
    function completeTrade(uint256 tradeId) external validTrade(tradeId) onlyTradeParticipant(tradeId) nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.PENDING, "EnergyTrading: trade not pending");
        require(trade.disputeStatus == DisputeStatus.NONE, "EnergyTrading: trade under dispute");

        trade.status = TradeStatus.COMPLETED;
        
        // Calculate platform fee
        uint256 platformFee = (trade.totalPrice * tradingFeeBasisPoints) / 10000;
        uint256 sellerPayment = trade.totalPrice - platformFee;

        // Transfer tokens to buyer
        solarToken.transfer(trade.buyer, trade.energyAmount);
        
        // Transfer payment to seller and fee to collector
        payable(trade.seller).transfer(sellerPayment);
        payable(feeCollector).transfer(platformFee);

        // Update reputation
        totalTrades[trade.buyer]++;
        totalTrades[trade.seller]++;

        emit TradeCompleted(tradeId, trade.buyer, trade.seller);
        emit EscrowReleased(tradeId, trade.seller, sellerPayment);
    }

    /**
     * @dev Initiate a dispute for a trade
     */
    function initiateDispute(uint256 tradeId, string calldata reason) external validTrade(tradeId) onlyTradeParticipant(tradeId) {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.PENDING, "EnergyTrading: trade not pending");
        require(trade.disputeStatus == DisputeStatus.NONE, "EnergyTrading: dispute already initiated");

        trade.status = TradeStatus.DISPUTED;
        trade.disputeStatus = DisputeStatus.INITIATED;
        trade.disputeInitiator = msg.sender;
        trade.disputeReason = reason;

        emit DisputeInitiated(tradeId, msg.sender, reason);
    }

    /**
     * @dev Resolve a dispute (only dispute resolvers)
     */
    function resolveDispute(uint256 tradeId, address winner) external validTrade(tradeId) onlyRole(DISPUTE_RESOLVER_ROLE) {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.DISPUTED, "EnergyTrading: trade not disputed");
        require(winner == trade.buyer || winner == trade.seller, "EnergyTrading: invalid winner");

        trade.status = TradeStatus.RESOLVED;
        trade.disputeStatus = DisputeStatus.RESOLVED;

        if (winner == trade.seller) {
            // Seller wins - release tokens to buyer and payment to seller
            uint256 platformFee = (trade.totalPrice * tradingFeeBasisPoints) / 10000;
            uint256 sellerPayment = trade.totalPrice - platformFee;

            solarToken.transfer(trade.buyer, trade.energyAmount);
            payable(trade.seller).transfer(sellerPayment);
            payable(feeCollector).transfer(platformFee);
        } else {
            // Buyer wins - refund payment to buyer and return tokens to seller
            solarToken.transfer(trade.seller, trade.energyAmount);
            payable(trade.buyer).transfer(trade.totalPrice);
        }

        emit DisputeResolved(tradeId, winner, msg.sender);
    }

    /**
     * @dev Automatically refund trade if timeout exceeded
     */
    function refundExpiredTrade(uint256 tradeId) external validTrade(tradeId) {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.PENDING, "EnergyTrading: trade not pending");
        require(block.timestamp > trade.timeoutAt, "EnergyTrading: trade not expired");

        trade.status = TradeStatus.REFUNDED;

        // Return tokens to seller and payment to buyer
        solarToken.transfer(trade.seller, trade.energyAmount);
        payable(trade.buyer).transfer(trade.totalPrice);

        emit EscrowRefunded(tradeId, trade.buyer, trade.totalPrice);
    }

    /**
     * @dev Get offer details
     */
    function getOffer(uint256 offerId) external view returns (Offer memory) {
        return offers[offerId];
    }

    /**
     * @dev Get active offers with pagination
     */
    function getActiveOffers(uint256 offset, uint256 limit) external view returns (Offer[] memory) {
        require(limit <= 100, "EnergyTrading: limit too high");
        
        uint256 count = 0;
        for (uint256 i = 1; i < nextOfferId; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && offers[i].expirationTime > block.timestamp) {
                count++;
            }
        }

        if (offset >= count) {
            return new Offer[](0);
        }

        uint256 remaining = count - offset;
        uint256 returnCount = remaining > limit ? limit : remaining;
        Offer[] memory activeOffers = new Offer[](returnCount);

        uint256 found = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < nextOfferId && found < returnCount; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && offers[i].expirationTime > block.timestamp) {
                if (currentIndex >= offset) {
                    activeOffers[found] = offers[i];
                    found++;
                }
                currentIndex++;
            }
        }

        return activeOffers;
    }

    /**
     * @dev Get user's offers
     */
    function getUserOffers(address user) external view returns (uint256[] memory) {
        return userOffers[user];
    }

    /**
     * @dev Get user's trades
     */
    function getUserTrades(address user) external view returns (uint256[] memory) {
        return userTrades[user];
    }

    /**
     * @dev Set trading fee (only fee managers)
     */
    function setTradingFee(uint256 _tradingFeeBasisPoints) external onlyRole(FEE_MANAGER_ROLE) {
        require(_tradingFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "EnergyTrading: fee too high");
        tradingFeeBasisPoints = _tradingFeeBasisPoints;
    }

    /**
     * @dev Set trading limits
     */
    function setTradingLimits(uint256 _minimumTradeAmount, uint256 _maximumTradeAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_minimumTradeAmount > 0, "EnergyTrading: invalid minimum amount");
        require(_maximumTradeAmount > _minimumTradeAmount, "EnergyTrading: invalid maximum amount");
        
        minimumTradeAmount = _minimumTradeAmount;
        maximumTradeAmount = _maximumTradeAmount;
        
        emit TradingParametersUpdated(tradingFeeBasisPoints, _minimumTradeAmount, _maximumTradeAmount);
    }

    /**
     * @dev Blacklist a user
     */
    function blacklistUser(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        blacklistedUsers[user] = true;
        emit UserBlacklisted(user);
    }

    /**
     * @dev Remove user from blacklist
     */
    function whitelistUser(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        blacklistedUsers[user] = false;
        emit UserWhitelisted(user);
    }

    /**
     * @dev Pause trading
     */
    function pauseTrading() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Resume trading
     */
    function resumeTrading() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "EnergyTrading: no fees to withdraw");
        payable(feeCollector).transfer(balance);
    }

    /**
     * @dev Emergency function to withdraw stuck tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }

    /**
     * @dev Get trading statistics
     */
    function getTradingStats() external view returns (
        uint256 totalOffers,
        uint256 totalTradesCount,
        uint256 activeOffers,
        uint256 platformFeeRate
    ) {
        uint256 _activeOffers = 0;
        for (uint256 i = 1; i < nextOfferId; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && offers[i].expirationTime > block.timestamp) {
                _activeOffers++;
            }
        }

        return (
            nextOfferId - 1,
            nextTradeId - 1,
            _activeOffers,
            tradingFeeBasisPoints
        );
    }

    /**
     * @dev Allow contract to receive ETH for trades
     */
    receive() external payable {}
}
