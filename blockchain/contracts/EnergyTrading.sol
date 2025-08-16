// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EnergyTrading
 * @dev Smart contract for P2P energy trading with escrow functionality
 * 
 * Features:
 * - Create/cancel energy offers
 * - Automatic matching and execution
 * - Escrow system for secure trades
 * - Dispute resolution mechanism
 * - Dynamic pricing support
 * - Trading fees and limits
 * - Emergency pause functionality
 * 
 * @author Team GreyDevs
 */
contract EnergyTrading is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // Structs
    enum OfferType { SELL, BUY }
    enum OfferStatus { ACTIVE, CANCELLED, EXECUTED, DISPUTED }
    enum DisputeStatus { NONE, INITIATED, RESOLVED }

    struct Offer {
        uint256 id;
        address creator;
        OfferType offerType;
        uint256 energyAmount; // Amount in kWh (with 18 decimals)
        uint256 pricePerKwh;  // Price per kWh in tokens (with 18 decimals)
        uint256 totalPrice;   // Total price for the offer
        uint256 deadline;     // Offer expiration timestamp
        OfferStatus status;
        uint256 createdAt;
        string location;      // Grid location identifier
        string energySource;  // Solar, wind, etc.
    }

    struct Trade {
        uint256 id;
        uint256 offerId;
        address buyer;
        address seller;
        uint256 energyAmount;
        uint256 totalPrice;
        uint256 executedAt;
        DisputeStatus disputeStatus;
        address disputeInitiator;
        uint256 disputeDeadline;
        bool escrowReleased;
    }

    struct EscrowData {
        uint256 amount;
        uint256 releaseTime;
        bool released;
    }

    // State variables
    IERC20 public immutable solarToken;
    
    uint256 private _nextOfferId = 1;
    uint256 private _nextTradeId = 1;
    
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => EscrowData) public escrows; // tradeId => EscrowData
    mapping(address => bool) public blacklistedUsers;
    mapping(address => uint256[]) public userOffers;
    mapping(address => uint256[]) public userTrades;
    
    // Trading parameters
    uint256 public tradingFeePercentage = 25; // 0.25% in basis points
    uint256 public minimumTradeAmount = 100 * 10**15; // 0.1 kWh
    uint256 public maximumTradeAmount = 100000 * 10**18; // 100,000 kWh
    uint256 public escrowReleaseDelay = 24 hours;
    uint256 public disputeWindow = 7 days;
    address public feeCollector;
    
    // Statistics
    uint256 public totalTradesExecuted;
    uint256 public totalVolumeTraded;
    uint256 public totalFeesCollected;

    // Events
    event OfferCreated(
        uint256 indexed offerId, 
        address indexed creator, 
        OfferType offerType,
        uint256 energyAmount,
        uint256 pricePerKwh,
        string location
    );
    event OfferCancelled(uint256 indexed offerId, address indexed creator);
    event OfferUpdated(uint256 indexed offerId, uint256 newPricePerKwh);
    event TradeExecuted(
        uint256 indexed tradeId,
        uint256 indexed offerId,
        address indexed buyer,
        address seller,
        uint256 energyAmount,
        uint256 totalPrice
    );
    event DisputeInitiated(uint256 indexed tradeId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed tradeId, address indexed winner, uint256 compensation);
    event EscrowReleased(uint256 indexed tradeId, address indexed recipient, uint256 amount);
    event EscrowRefunded(uint256 indexed tradeId, address indexed recipient, uint256 amount);
    event UserBlacklisted(address indexed user, address indexed admin);
    event UserWhitelisted(address indexed user, address indexed admin);
    event TradingParametersUpdated(address indexed admin);

    // Errors
    error InvalidOffer(uint256 offerId);
    error InvalidTrade(uint256 tradeId);
    error UnauthorizedAccess(address user);
    error InsufficientBalance(uint256 required, uint256 available);
    error OfferExpired(uint256 deadline);
    error InvalidAmount(uint256 amount);
    error InvalidPrice(uint256 price);
    error UserIsBlacklisted(address user);
    error OfferNotActive(uint256 offerId);
    error TradeAlreadyExecuted(uint256 tradeId);
    error DisputeWindowExpired(uint256 deadline);
    error EscrowAlreadyReleased(uint256 tradeId);
    error InvalidParameter(string parameter);

    /**
     * @dev Constructor
     * @param _solarToken Address of the SolarToken contract
     * @param _feeCollector Address to collect trading fees
     */
    constructor(address _solarToken, address _feeCollector) {
        require(_solarToken != address(0), "Invalid token address");
        require(_feeCollector != address(0), "Invalid fee collector");

        solarToken = IERC20(_solarToken);
        feeCollector = _feeCollector;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new energy offer
     */
    function createOffer(
        OfferType _offerType,
        uint256 _energyAmount,
        uint256 _pricePerKwh,
        uint256 _deadline,
        string calldata _location,
        string calldata _energySource
    ) external whenNotPaused nonReentrant returns (uint256) {
        if (blacklistedUsers[msg.sender]) revert UserIsBlacklisted(msg.sender);
        if (_energyAmount < minimumTradeAmount || _energyAmount > maximumTradeAmount) {
            revert InvalidAmount(_energyAmount);
        }
        if (_pricePerKwh == 0) revert InvalidPrice(_pricePerKwh);
        if (_deadline <= block.timestamp) revert OfferExpired(_deadline);

        uint256 totalPrice = (_energyAmount * _pricePerKwh) / 10**18;
        
        // For sell offers, lock tokens in escrow
        if (_offerType == OfferType.SELL) {
            solarToken.safeTransferFrom(msg.sender, address(this), _energyAmount);
        }

        uint256 offerId = _nextOfferId++;
        
        offers[offerId] = Offer({
            id: offerId,
            creator: msg.sender,
            offerType: _offerType,
            energyAmount: _energyAmount,
            pricePerKwh: _pricePerKwh,
            totalPrice: totalPrice,
            deadline: _deadline,
            status: OfferStatus.ACTIVE,
            createdAt: block.timestamp,
            location: _location,
            energySource: _energySource
        });

        userOffers[msg.sender].push(offerId);

        emit OfferCreated(offerId, msg.sender, _offerType, _energyAmount, _pricePerKwh, _location);
        return offerId;
    }

    /**
     * @dev Cancel an existing offer
     */
    function cancelOffer(uint256 _offerId) external nonReentrant {
        Offer storage offer = offers[_offerId];
        if (offer.creator != msg.sender) revert UnauthorizedAccess(msg.sender);
        if (offer.status != OfferStatus.ACTIVE) revert OfferNotActive(_offerId);

        offer.status = OfferStatus.CANCELLED;

        // Refund locked tokens for sell offers
        if (offer.offerType == OfferType.SELL) {
            solarToken.safeTransfer(offer.creator, offer.energyAmount);
        }

        emit OfferCancelled(_offerId, msg.sender);
    }

    /**
     * @dev Update offer price
     */
    function updateOfferPrice(uint256 _offerId, uint256 _newPricePerKwh) external {
        Offer storage offer = offers[_offerId];
        if (offer.creator != msg.sender) revert UnauthorizedAccess(msg.sender);
        if (offer.status != OfferStatus.ACTIVE) revert OfferNotActive(_offerId);
        if (_newPricePerKwh == 0) revert InvalidPrice(_newPricePerKwh);

        offer.pricePerKwh = _newPricePerKwh;
        offer.totalPrice = (offer.energyAmount * _newPricePerKwh) / 10**18;

        emit OfferUpdated(_offerId, _newPricePerKwh);
    }

    /**
     * @dev Accept and execute a trade
     */
    function acceptOffer(uint256 _offerId) external whenNotPaused nonReentrant returns (uint256) {
        Offer storage offer = offers[_offerId];
        
        if (blacklistedUsers[msg.sender]) revert UserIsBlacklisted(msg.sender);
        if (offer.creator == msg.sender) revert UnauthorizedAccess(msg.sender);
        if (offer.status != OfferStatus.ACTIVE) revert OfferNotActive(_offerId);
        if (block.timestamp > offer.deadline) revert OfferExpired(offer.deadline);

        offer.status = OfferStatus.EXECUTED;

        address buyer = offer.offerType == OfferType.BUY ? offer.creator : msg.sender;
        address seller = offer.offerType == OfferType.SELL ? offer.creator : msg.sender;

        // For buy offers, transfer payment from buyer
        if (offer.offerType == OfferType.BUY) {
            solarToken.safeTransferFrom(buyer, address(this), offer.totalPrice);
        } else {
            // For sell offers, transfer payment from acceptor (buyer)
            solarToken.safeTransferFrom(buyer, address(this), offer.totalPrice);
        }

        uint256 tradeId = _nextTradeId++;
        
        trades[tradeId] = Trade({
            id: tradeId,
            offerId: _offerId,
            buyer: buyer,
            seller: seller,
            energyAmount: offer.energyAmount,
            totalPrice: offer.totalPrice,
            executedAt: block.timestamp,
            disputeStatus: DisputeStatus.NONE,
            disputeInitiator: address(0),
            disputeDeadline: 0,
            escrowReleased: false
        });

        escrows[tradeId] = EscrowData({
            amount: offer.totalPrice,
            releaseTime: block.timestamp + escrowReleaseDelay,
            released: false
        });

        userTrades[buyer].push(tradeId);
        userTrades[seller].push(tradeId);

        // Update statistics
        totalTradesExecuted++;
        totalVolumeTraded += offer.energyAmount;

        emit TradeExecuted(tradeId, _offerId, buyer, seller, offer.energyAmount, offer.totalPrice);
        return tradeId;
    }

    /**
     * @dev Release escrow funds to seller
     */
    function releaseEscrow(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        EscrowData storage escrow = escrows[_tradeId];
        
        if (trade.id == 0) revert InvalidTrade(_tradeId);
        if (escrow.released) revert EscrowAlreadyReleased(_tradeId);
        if (block.timestamp < escrow.releaseTime && msg.sender != trade.buyer) {
            revert UnauthorizedAccess(msg.sender);
        }
        if (trade.disputeStatus == DisputeStatus.INITIATED) {
            revert InvalidTrade(_tradeId);
        }

        escrow.released = true;
        trade.escrowReleased = true;

        // Calculate fee
        uint256 fee = (escrow.amount * tradingFeePercentage) / 10000;
        uint256 sellerAmount = escrow.amount - fee;

        // Transfer tokens and energy
        if (fee > 0) {
            solarToken.safeTransfer(feeCollector, fee);
            totalFeesCollected += fee;
        }
        
        solarToken.safeTransfer(trade.seller, sellerAmount);
        
        // Transfer energy tokens to buyer (for sell offers, tokens were already locked)
        Offer storage offer = offers[trade.offerId];
        if (offer.offerType == OfferType.SELL) {
            solarToken.safeTransfer(trade.buyer, trade.energyAmount);
        }

        emit EscrowReleased(_tradeId, trade.seller, sellerAmount);
    }

    /**
     * @dev Initiate dispute for a trade
     */
    function initiateDispute(uint256 _tradeId, string calldata _reason) external {
        Trade storage trade = trades[_tradeId];
        
        if (trade.id == 0) revert InvalidTrade(_tradeId);
        if (msg.sender != trade.buyer && msg.sender != trade.seller) {
            revert UnauthorizedAccess(msg.sender);
        }
        if (trade.disputeStatus != DisputeStatus.NONE) revert InvalidTrade(_tradeId);
        if (block.timestamp > trade.executedAt + disputeWindow) {
            revert DisputeWindowExpired(trade.executedAt + disputeWindow);
        }

        trade.disputeStatus = DisputeStatus.INITIATED;
        trade.disputeInitiator = msg.sender;
        trade.disputeDeadline = block.timestamp + disputeWindow;

        emit DisputeInitiated(_tradeId, msg.sender, _reason);
    }

    /**
     * @dev Resolve dispute (only dispute resolver)
     */
    function resolveDispute(
        uint256 _tradeId,
        address _winner,
        uint256 _compensation
    ) external onlyRole(DISPUTE_RESOLVER_ROLE) {
        Trade storage trade = trades[_tradeId];
        EscrowData storage escrow = escrows[_tradeId];
        
        if (trade.disputeStatus != DisputeStatus.INITIATED) revert InvalidTrade(_tradeId);
        if (_winner != trade.buyer && _winner != trade.seller) revert UnauthorizedAccess(_winner);

        trade.disputeStatus = DisputeStatus.RESOLVED;
        escrow.released = true;

        // Transfer compensation based on resolution
        if (_winner == trade.seller) {
            solarToken.safeTransfer(trade.seller, escrow.amount - _compensation);
            if (_compensation > 0) {
                solarToken.safeTransfer(trade.buyer, _compensation);
            }
        } else {
            solarToken.safeTransfer(trade.buyer, escrow.amount);
        }

        emit DisputeResolved(_tradeId, _winner, _compensation);
    }

    /**
     * @dev Emergency pause trading
     */
    function pauseTrading() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Resume trading
     */
    function resumeTrading() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Blacklist user
     */
    function blacklistUser(address _user) external onlyRole(ADMIN_ROLE) {
        blacklistedUsers[_user] = true;
        emit UserBlacklisted(_user, msg.sender);
    }

    /**
     * @dev Remove user from blacklist
     */
    function removeFromBlacklist(address _user) external onlyRole(ADMIN_ROLE) {
        blacklistedUsers[_user] = false;
        emit UserWhitelisted(_user, msg.sender);
    }

    /**
     * @dev Set trading parameters
     */
    function setTradingParameters(
        uint256 _feePercentage,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _escrowDelay,
        uint256 _disputeWindow
    ) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feePercentage > 1000) revert InvalidParameter("fee too high"); // Max 10%
        if (_minAmount >= _maxAmount) revert InvalidParameter("invalid amounts");
        if (_escrowDelay > 7 days) revert InvalidParameter("escrow delay too long");
        if (_disputeWindow > 30 days) revert InvalidParameter("dispute window too long");

        tradingFeePercentage = _feePercentage;
        minimumTradeAmount = _minAmount;
        maximumTradeAmount = _maxAmount;
        escrowReleaseDelay = _escrowDelay;
        disputeWindow = _disputeWindow;

        emit TradingParametersUpdated(msg.sender);
    }

    /**
     * @dev Get active offers
     */
    function getActiveOffers(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Offer[] memory) 
    {
        require(_limit <= 100, "Limit too high");
        
        uint256 activeCount = 0;
        for (uint256 i = 1; i < _nextOfferId; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && 
                offers[i].deadline > block.timestamp) {
                activeCount++;
            }
        }

        uint256 resultSize = activeCount > _offset ? 
            (activeCount - _offset > _limit ? _limit : activeCount - _offset) : 0;
        
        Offer[] memory result = new Offer[](resultSize);
        uint256 index = 0;
        uint256 count = 0;

        for (uint256 i = 1; i < _nextOfferId && index < resultSize; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && 
                offers[i].deadline > block.timestamp) {
                if (count >= _offset) {
                    result[index] = offers[i];
                    index++;
                }
                count++;
            }
        }

        return result;
    }

    /**
     * @dev Get user's offers
     */
    function getUserOffers(address _user) external view returns (uint256[] memory) {
        return userOffers[_user];
    }

    /**
     * @dev Get user's trades
     */
    function getUserTrades(address _user) external view returns (uint256[] memory) {
        return userTrades[_user];
    }

    /**
     * @dev Get trading statistics
     */
    function getTradingStats() external view returns (
        uint256 totalTrades,
        uint256 totalVolume,
        uint256 totalFees,
        uint256 activeOffers
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < _nextOfferId; i++) {
            if (offers[i].status == OfferStatus.ACTIVE && 
                offers[i].deadline > block.timestamp) {
                activeCount++;
            }
        }

        return (totalTradesExecuted, totalVolumeTraded, totalFeesCollected, activeCount);
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(address _token, uint256 _amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (_token == address(0)) {
            payable(msg.sender).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(msg.sender, _amount);
        }
    }
}
