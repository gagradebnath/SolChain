// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title SolChainOracle
 * @dev Price and data oracle for external data feeds with multiple source aggregation
 * @author Team GreyDevs
 */
contract SolChainOracle is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORACLE_OPERATOR_ROLE = keccak256("ORACLE_OPERATOR_ROLE");
    bytes32 public constant DATA_FEED_MANAGER_ROLE = keccak256("DATA_FEED_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_UPDATER_ROLE = keccak256("EMERGENCY_UPDATER_ROLE");

    // Data structures
    struct PriceData {
        uint256 price; // Price in wei per kWh
        uint256 timestamp;
        uint256 roundId;
        address source;
        uint8 decimals;
    }

    struct WeatherData {
        int256 temperature; // Temperature in Celsius * 100 (e.g., 2550 = 25.50°C)
        uint256 solarIrradiance; // Solar irradiance in W/m² * 100
        uint256 humidity; // Humidity percentage * 100
        uint256 windSpeed; // Wind speed in m/s * 100
        uint256 timestamp;
        address source;
        string location;
    }

    struct GridStatus {
        bool isOnline;
        uint256 load; // Grid load percentage * 100
        uint256 frequency; // Grid frequency in Hz * 100
        uint256 voltage; // Grid voltage in V * 100
        uint256 timestamp;
        address source;
        string gridId;
    }

    struct DataFeed {
        address feedAddress;
        uint256 weight; // Weight in basis points (max 10000)
        bool isActive;
        uint256 lastUpdate;
        uint256 updateCount;
        string description;
    }

    // State variables
    mapping(address => DataFeed) public dataFeeds;
    address[] public activeFeedsList;
    
    PriceData[] public priceHistory;
    WeatherData[] public weatherHistory;
    GridStatus[] public gridStatusHistory;
    
    PriceData public latestPrice;
    WeatherData public latestWeather;
    GridStatus public latestGridStatus;
    
    uint256 public updateInterval = 1 hours;
    uint256 public maxPriceDeviation = 1000; // 10% in basis points
    uint256 public dataQualityThreshold = 8000; // 80% quality threshold
    
    // Chainlink price feeds
    mapping(string => AggregatorV3Interface) public chainlinkFeeds;
    
    // Events
    event PriceUpdated(uint256 indexed timestamp, uint256 price, address indexed source, uint256 roundId);
    event WeatherDataUpdated(uint256 indexed timestamp, int256 temperature, uint256 solarIrradiance, string location);
    event GridStatusUpdated(uint256 indexed timestamp, bool isOnline, uint256 load, string gridId);
    event DataFeedAdded(address indexed feed, uint256 weight, string description);
    event DataFeedRemoved(address indexed feed);
    event DataFeedWeightUpdated(address indexed feed, uint256 oldWeight, uint256 newWeight);
    event OracleOperatorAdded(address indexed operator);
    event OracleOperatorRemoved(address indexed operator);
    event EmergencyPriceUpdate(uint256 indexed timestamp, uint256 price, address indexed updater);
    event DataQualityAlert(string dataType, uint256 qualityScore, uint256 threshold);

    modifier onlyValidDataFeed(address feed) {
        require(dataFeeds[feed].feedAddress != address(0), "SolChainOracle: data feed does not exist");
        require(dataFeeds[feed].isActive, "SolChainOracle: data feed is not active");
        _;
    }

    modifier onlyRecentUpdate(uint256 timestamp) {
        require(block.timestamp - timestamp <= updateInterval * 2, "SolChainOracle: data too old");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_OPERATOR_ROLE, msg.sender);
        _grantRole(DATA_FEED_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_UPDATER_ROLE, msg.sender);
        
        // Initialize with default values
        latestPrice = PriceData({
            price: 5 * 10**16, // 0.05 ETH per kWh default
            timestamp: block.timestamp,
            roundId: 1,
            source: msg.sender,
            decimals: 18
        });
    }

    /**
     * @dev Add a new data feed
     */
    function addDataFeed(
        address feed,
        uint256 weight,
        string calldata description
    ) external onlyRole(DATA_FEED_MANAGER_ROLE) {
        require(feed != address(0), "SolChainOracle: invalid feed address");
        require(weight <= 10000, "SolChainOracle: weight exceeds maximum");
        require(dataFeeds[feed].feedAddress == address(0), "SolChainOracle: feed already exists");

        dataFeeds[feed] = DataFeed({
            feedAddress: feed,
            weight: weight,
            isActive: true,
            lastUpdate: 0,
            updateCount: 0,
            description: description
        });

        activeFeedsList.push(feed);
        emit DataFeedAdded(feed, weight, description);
    }

    /**
     * @dev Remove a data feed
     */
    function removeDataFeed(address feed) external onlyRole(DATA_FEED_MANAGER_ROLE) onlyValidDataFeed(feed) {
        dataFeeds[feed].isActive = false;
        
        // Remove from active feeds list
        for (uint256 i = 0; i < activeFeedsList.length; i++) {
            if (activeFeedsList[i] == feed) {
                activeFeedsList[i] = activeFeedsList[activeFeedsList.length - 1];
                activeFeedsList.pop();
                break;
            }
        }

        emit DataFeedRemoved(feed);
    }

    /**
     * @dev Set data feed weight
     */
    function setDataFeedWeight(address feed, uint256 newWeight) external onlyRole(DATA_FEED_MANAGER_ROLE) onlyValidDataFeed(feed) {
        require(newWeight <= 10000, "SolChainOracle: weight exceeds maximum");
        
        uint256 oldWeight = dataFeeds[feed].weight;
        dataFeeds[feed].weight = newWeight;
        
        emit DataFeedWeightUpdated(feed, oldWeight, newWeight);
    }

    /**
     * @dev Update energy price data
     */
    function updatePrice(
        uint256 price,
        uint256 roundId,
        uint8 decimals
    ) external onlyRole(ORACLE_OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(price > 0, "SolChainOracle: invalid price");
        require(_isValidPriceUpdate(price), "SolChainOracle: price deviation too high");

        PriceData memory newPriceData = PriceData({
            price: price,
            timestamp: block.timestamp,
            roundId: roundId,
            source: msg.sender,
            decimals: decimals
        });

        latestPrice = newPriceData;
        priceHistory.push(newPriceData);

        // Update data feed stats
        if (dataFeeds[msg.sender].feedAddress != address(0)) {
            dataFeeds[msg.sender].lastUpdate = block.timestamp;
            dataFeeds[msg.sender].updateCount++;
        }

        emit PriceUpdated(block.timestamp, price, msg.sender, roundId);
    }

    /**
     * @dev Update weather data
     */
    function updateWeatherData(
        int256 temperature,
        uint256 solarIrradiance,
        uint256 humidity,
        uint256 windSpeed,
        string calldata location
    ) external onlyRole(ORACLE_OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(temperature >= -5000 && temperature <= 6000, "SolChainOracle: invalid temperature"); // -50°C to 60°C
        require(solarIrradiance <= 150000, "SolChainOracle: invalid solar irradiance"); // Max 1500 W/m²
        require(humidity <= 10000, "SolChainOracle: invalid humidity"); // Max 100%
        require(windSpeed <= 10000, "SolChainOracle: invalid wind speed"); // Max 100 m/s

        WeatherData memory newWeatherData = WeatherData({
            temperature: temperature,
            solarIrradiance: solarIrradiance,
            humidity: humidity,
            windSpeed: windSpeed,
            timestamp: block.timestamp,
            source: msg.sender,
            location: location
        });

        latestWeather = newWeatherData;
        weatherHistory.push(newWeatherData);

        emit WeatherDataUpdated(block.timestamp, temperature, solarIrradiance, location);
    }

    /**
     * @dev Update grid status
     */
    function updateGridStatus(
        bool isOnline,
        uint256 load,
        uint256 frequency,
        uint256 voltage,
        string calldata gridId
    ) external onlyRole(ORACLE_OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(load <= 10000, "SolChainOracle: invalid load percentage"); // Max 100%
        require(frequency >= 4800 && frequency <= 5200, "SolChainOracle: invalid frequency"); // 48-52 Hz
        require(voltage >= 20000 && voltage <= 50000, "SolChainOracle: invalid voltage"); // 200-500V

        GridStatus memory newGridStatus = GridStatus({
            isOnline: isOnline,
            load: load,
            frequency: frequency,
            voltage: voltage,
            timestamp: block.timestamp,
            source: msg.sender,
            gridId: gridId
        });

        latestGridStatus = newGridStatus;
        gridStatusHistory.push(newGridStatus);

        emit GridStatusUpdated(block.timestamp, isOnline, load, gridId);
    }

    /**
     * @dev Emergency price update (bypass normal validation)
     */
    function emergencyUpdatePrice(uint256 price, string calldata reason) external onlyRole(EMERGENCY_UPDATER_ROLE) {
        require(price > 0, "SolChainOracle: invalid price");

        latestPrice = PriceData({
            price: price,
            timestamp: block.timestamp,
            roundId: latestPrice.roundId + 1,
            source: msg.sender,
            decimals: 18
        });

        emit EmergencyPriceUpdate(block.timestamp, price, msg.sender);
        emit PriceUpdated(block.timestamp, price, msg.sender, latestPrice.roundId);
    }

    /**
     * @dev Get latest price data
     */
    function getLatestPrice() external view returns (PriceData memory) {
        return latestPrice;
    }

    /**
     * @dev Get historical price data with pagination
     */
    function getHistoricalPrice(uint256 offset, uint256 limit) external view returns (PriceData[] memory) {
        require(limit <= 100, "SolChainOracle: limit too high");
        require(offset < priceHistory.length, "SolChainOracle: offset out of bounds");

        uint256 end = offset + limit;
        if (end > priceHistory.length) {
            end = priceHistory.length;
        }

        PriceData[] memory prices = new PriceData[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            prices[i - offset] = priceHistory[i];
        }

        return prices;
    }

    /**
     * @dev Get latest weather data
     */
    function getWeatherData() external view returns (WeatherData memory) {
        return latestWeather;
    }

    /**
     * @dev Get latest grid status
     */
    function getGridStatus() external view returns (GridStatus memory) {
        return latestGridStatus;
    }

    /**
     * @dev Get aggregated price from multiple sources
     */
    function getAggregatedPrice() external view returns (uint256 aggregatedPrice, uint256 confidence) {
        if (activeFeedsList.length == 0) {
            return (latestPrice.price, 0);
        }

        uint256 totalWeight = 0;
        uint256 weightedSum = 0;
        uint256 validSources = 0;

        for (uint256 i = 0; i < activeFeedsList.length; i++) {
            address feed = activeFeedsList[i];
            DataFeed memory feedData = dataFeeds[feed];
            
            if (feedData.isActive && 
                feedData.lastUpdate > 0 && 
                block.timestamp - feedData.lastUpdate <= updateInterval * 2) {
                
                // For simplicity, use the latest price. In production, you'd query each feed
                weightedSum += latestPrice.price * feedData.weight;
                totalWeight += feedData.weight;
                validSources++;
            }
        }

        if (totalWeight == 0) {
            return (latestPrice.price, 0);
        }

        aggregatedPrice = weightedSum / totalWeight;
        confidence = (validSources * 10000) / activeFeedsList.length; // Confidence as percentage * 100

        return (aggregatedPrice, confidence);
    }

    /**
     * @dev Add Chainlink price feed
     */
    function addChainlinkFeed(string calldata feedName, address feedAddress) external onlyRole(DATA_FEED_MANAGER_ROLE) {
        require(feedAddress != address(0), "SolChainOracle: invalid feed address");
        chainlinkFeeds[feedName] = AggregatorV3Interface(feedAddress);
    }

    /**
     * @dev Get price from Chainlink feed
     */
    function getChainlinkPrice(string calldata feedName) external view returns (int256 price, uint256 timestamp) {
        AggregatorV3Interface feed = chainlinkFeeds[feedName];
        require(address(feed) != address(0), "SolChainOracle: feed not found");

        (, int256 _price, , uint256 _timestamp, ) = feed.latestRoundData();
        return (_price, _timestamp);
    }

    /**
     * @dev Validate incoming data quality
     */
    function validateData(uint256 value, uint256 minValue, uint256 maxValue) public pure returns (bool) {
        return value >= minValue && value <= maxValue;
    }

    /**
     * @dev Get data quality metrics
     */
    function getDataQuality() external view returns (
        uint256 priceQuality,
        uint256 weatherQuality,
        uint256 gridQuality,
        uint256 overallQuality
    ) {
        // Simple quality calculation based on data freshness and source count
        uint256 currentTime = block.timestamp;
        
        // Price quality
        priceQuality = (currentTime - latestPrice.timestamp <= updateInterval) ? 10000 : 5000;
        
        // Weather quality
        weatherQuality = (currentTime - latestWeather.timestamp <= updateInterval * 2) ? 10000 : 5000;
        
        // Grid quality
        gridQuality = (currentTime - latestGridStatus.timestamp <= updateInterval) ? 10000 : 5000;
        
        // Overall quality (average)
        overallQuality = (priceQuality + weatherQuality + gridQuality) / 3;
        
        return (priceQuality, weatherQuality, gridQuality, overallQuality);
    }

    /**
     * @dev Internal function to validate price updates
     */
    function _isValidPriceUpdate(uint256 newPrice) internal view returns (bool) {
        if (latestPrice.price == 0) {
            return true; // First price update
        }

        uint256 deviation = newPrice > latestPrice.price 
            ? ((newPrice - latestPrice.price) * 10000) / latestPrice.price
            : ((latestPrice.price - newPrice) * 10000) / latestPrice.price;

        return deviation <= maxPriceDeviation;
    }

    /**
     * @dev Set update interval
     */
    function setUpdateInterval(uint256 _updateInterval) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_updateInterval >= 5 minutes, "SolChainOracle: interval too short");
        require(_updateInterval <= 24 hours, "SolChainOracle: interval too long");
        updateInterval = _updateInterval;
    }

    /**
     * @dev Set maximum price deviation
     */
    function setMaxPriceDeviation(uint256 _maxPriceDeviation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxPriceDeviation <= 5000, "SolChainOracle: deviation too high"); // Max 50%
        maxPriceDeviation = _maxPriceDeviation;
    }

    /**
     * @dev Add oracle operator
     */
    function addOracleOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ORACLE_OPERATOR_ROLE, operator);
        emit OracleOperatorAdded(operator);
    }

    /**
     * @dev Remove oracle operator
     */
    function removeOracleOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ORACLE_OPERATOR_ROLE, operator);
        emit OracleOperatorRemoved(operator);
    }

    /**
     * @dev Pause oracle operations
     */
    function pauseOracle() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Resume oracle operations
     */
    function resumeOracle() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get oracle statistics
     */
    function getOracleStats() external view returns (
        uint256 totalPriceUpdates,
        uint256 totalWeatherUpdates,
        uint256 totalGridUpdates,
        uint256 activeFeedsCount,
        uint256 lastUpdateTime
    ) {
        return (
            priceHistory.length,
            weatherHistory.length,
            gridStatusHistory.length,
            activeFeedsList.length,
            latestPrice.timestamp
        );
    }
}
