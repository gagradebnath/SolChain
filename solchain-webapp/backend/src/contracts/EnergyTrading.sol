// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SolarToken.sol";

/**
 * @title EnergyTrading
 * @dev Smart contract for peer-to-peer solar energy trading
 * @author Team GreyDevs - BCOLBD 2025
 */
contract EnergyTrading {
    SolarToken public solarToken;
    address public owner;
    
    // Trading fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public tradingFee = 250;
    uint256 public constant MAX_TRADING_FEE = 1000; // 10% max
    
    struct Trade {
        address seller;
        address buyer;
        uint256 energyAmount; // in kWh (represented as tokens)
        uint256 pricePerKWh; // in wei per kWh
        uint256 totalPrice; // energyAmount * pricePerKWh
        uint256 timestamp;
        TradeStatus status;
        bool completed;
    }
    
    struct EnergyListing {
        address seller;
        uint256 energyAmount;
        uint256 pricePerKWh;
        uint256 expirationTime;
        bool active;
    }
    
    enum TradeStatus {
        Pending,
        Matched,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }
    
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => EnergyListing) public energyListings;
    mapping(address => uint256[]) public userTrades;
    mapping(address => uint256) public userRatings; // Simple rating system
    mapping(address => bool) public verifiedUsers;
    
    uint256 public tradeCount;
    uint256 public listingCount;
    uint256 public totalEnergyTraded;
    uint256 public totalFeesCollected;
    
    // Events
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 energyAmount,
        uint256 pricePerKWh,
        uint256 totalPrice
    );
    
    event EnergyListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 energyAmount,
        uint256 pricePerKWh,
        uint256 expirationTime
    );
    
    event TradeCompleted(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 energyAmount,
        uint256 totalPrice
    );
    
    event TradeStatusUpdated(
        uint256 indexed tradeId,
        TradeStatus oldStatus,
        TradeStatus newStatus
    );
    
    event UserVerified(address indexed user);
    event TradingFeeUpdated(uint256 oldFee, uint256 newFee);
    event DisputeRaised(uint256 indexed tradeId, address indexed raiser);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender], "User must be verified");
        _;
    }
    
    modifier validTrade(uint256 _tradeId) {
        require(_tradeId > 0 && _tradeId <= tradeCount, "Invalid trade ID");
        _;
    }
    
    modifier validListing(uint256 _listingId) {
        require(_listingId > 0 && _listingId <= listingCount, "Invalid listing ID");
        require(energyListings[_listingId].active, "Listing is not active");
        require(block.timestamp < energyListings[_listingId].expirationTime, "Listing has expired");
        _;
    }
    
    constructor(address _solarTokenAddress) {
        solarToken = SolarToken(_solarTokenAddress);
        owner = msg.sender;
        verifiedUsers[msg.sender] = true; // Owner is automatically verified
    }
    
    /**
     * @dev List energy for sale
     * @param _energyAmount Amount of energy in kWh
     * @param _pricePerKWh Price per kWh in wei
     * @param _durationHours How long the listing should be active
     */
    function listEnergy(
        uint256 _energyAmount,
        uint256 _pricePerKWh,
        uint256 _durationHours
    ) external onlyVerifiedUser returns (uint256) {
        require(_energyAmount > 0, "Energy amount must be greater than zero");
        require(_pricePerKWh > 0, "Price must be greater than zero");
        require(_durationHours > 0 && _durationHours <= 168, "Duration must be 1-168 hours"); // Max 1 week
        require(solarToken.balanceOf(msg.sender) >= _energyAmount, "Insufficient energy balance");
        
        listingCount++;
        uint256 expirationTime = block.timestamp + (_durationHours * 1 hours);
        
        energyListings[listingCount] = EnergyListing({
            seller: msg.sender,
            energyAmount: _energyAmount,
            pricePerKWh: _pricePerKWh,
            expirationTime: expirationTime,
            active: true
        });
        
        emit EnergyListed(listingCount, msg.sender, _energyAmount, _pricePerKWh, expirationTime);
        return listingCount;
    }
    
    /**
     * @dev Purchase energy from a listing
     * @param _listingId ID of the energy listing
     * @param _energyAmount Amount of energy to purchase (can be partial)
     */
    function purchaseEnergy(
        uint256 _listingId,
        uint256 _energyAmount
    ) external payable onlyVerifiedUser validListing(_listingId) returns (uint256) {
        EnergyListing storage listing = energyListings[_listingId];
        require(msg.sender != listing.seller, "Cannot purchase your own energy");
        require(_energyAmount > 0, "Energy amount must be greater than zero");
        require(_energyAmount <= listing.energyAmount, "Insufficient energy available");
        
        uint256 totalPrice = _energyAmount * listing.pricePerKWh;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Calculate fees
        uint256 feeAmount = (totalPrice * tradingFee) / 10000;
        uint256 sellerAmount = totalPrice - feeAmount;
        
        // Create trade record
        tradeCount++;
        trades[tradeCount] = Trade({
            seller: listing.seller,
            buyer: msg.sender,
            energyAmount: _energyAmount,
            pricePerKWh: listing.pricePerKWh,
            totalPrice: totalPrice,
            timestamp: block.timestamp,
            status: TradeStatus.InProgress,
            completed: false
        });
        
        // Update listing
        listing.energyAmount -= _energyAmount;
        if (listing.energyAmount == 0) {
            listing.active = false;
        }
        
        // Transfer tokens and payments
        require(solarToken.transferFrom(listing.seller, msg.sender, _energyAmount), "Token transfer failed");
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Store fee
        totalFeesCollected += feeAmount;
        
        // Update user trade history
        userTrades[listing.seller].push(tradeCount);
        userTrades[msg.sender].push(tradeCount);
        
        // Update statistics
        totalEnergyTraded += _energyAmount;
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit TradeCreated(tradeCount, listing.seller, msg.sender, _energyAmount, listing.pricePerKWh, totalPrice);
        
        // Auto-complete the trade (can be extended for multi-step processes)
        _completeTrade(tradeCount);
        
        return tradeCount;
    }
    
    /**
     * @dev Complete a trade (internal function)
     */
    function _completeTrade(uint256 _tradeId) internal {
        Trade storage trade = trades[_tradeId];
        trade.status = TradeStatus.Completed;
        trade.completed = true;
        
        emit TradeCompleted(_tradeId, trade.seller, trade.buyer, trade.energyAmount, trade.totalPrice);
    }
    
    /**
     * @dev Cancel an energy listing
     * @param _listingId ID of the listing to cancel
     */
    function cancelListing(uint256 _listingId) external validListing(_listingId) {
        EnergyListing storage listing = energyListings[_listingId];
        require(msg.sender == listing.seller, "Only seller can cancel listing");
        
        listing.active = false;
    }
    
    /**
     * @dev Raise a dispute for a trade
     * @param _tradeId ID of the trade to dispute
     */
    function raiseDispute(uint256 _tradeId) external validTrade(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.seller || msg.sender == trade.buyer, "Only trade participants can raise disputes");
        require(trade.status != TradeStatus.Disputed, "Trade already disputed");
        require(trade.status != TradeStatus.Completed, "Cannot dispute completed trade");
        
        TradeStatus oldStatus = trade.status;
        trade.status = TradeStatus.Disputed;
        
        emit TradeStatusUpdated(_tradeId, oldStatus, TradeStatus.Disputed);
        emit DisputeRaised(_tradeId, msg.sender);
    }
    
    /**
     * @dev Verify a user (only owner)
     * @param _user Address of user to verify
     */
    function verifyUser(address _user) external onlyOwner {
        verifiedUsers[_user] = true;
        emit UserVerified(_user);
    }
    
    /**
     * @dev Update trading fee (only owner)
     * @param _newFee New fee in basis points
     */
    function updateTradingFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_TRADING_FEE, "Fee too high");
        uint256 oldFee = tradingFee;
        tradingFee = _newFee;
        emit TradingFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Get trade details
     * @param _tradeId ID of the trade
     */
    function getTrade(uint256 _tradeId) external view validTrade(_tradeId) returns (Trade memory) {
        return trades[_tradeId];
    }
    
    /**
     * @dev Get energy listing details
     * @param _listingId ID of the listing
     */
    function getListing(uint256 _listingId) external view returns (EnergyListing memory) {
        return energyListings[_listingId];
    }
    
    /**
     * @dev Get user's trade history
     * @param _user Address of the user
     */
    function getUserTrades(address _user) external view returns (uint256[] memory) {
        return userTrades[_user];
    }
    
    /**
     * @dev Get active listings (limited to prevent gas issues)
     * @param _start Start index
     * @param _limit Maximum number of listings to return
     */
    function getActiveListings(uint256 _start, uint256 _limit) external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](_limit);
        uint256 count = 0;
        
        for (uint256 i = _start; i <= listingCount && count < _limit; i++) {
            if (energyListings[i].active && block.timestamp < energyListings[i].expirationTime) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalTrades,
        uint256 totalListings,
        uint256 totalEnergyTradedAmount,
        uint256 totalFeesCollectedAmount
    ) {
        return (tradeCount, listingCount, totalEnergyTraded, totalFeesCollected);
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");
        payable(owner).transfer(amount);
    }
    
    /**
     * @dev Emergency function to pause contract (only owner)
     */
    function pause() external onlyOwner {
        // Implementation for pausing contract operations
        // This would require additional state variables and modifiers
    }
    
    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {}
}