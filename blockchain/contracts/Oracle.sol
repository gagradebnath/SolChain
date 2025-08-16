// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SolChainOracle
 * @dev Oracle contract for external data feeds in the SolChain ecosystem
 * 
 * Features:
 * - Energy price feeds
 * - Weather data feeds
 * - Grid status monitoring
 * - Multi-source data aggregation
 * - Data quality validation
 * - Emergency price updates
 * - Historical data storage
 * 
 * @author Team GreyDevs
 */
contract SolChainOracle is AccessControl, ReentrancyGuard, Pausable {
    
    // Roles
    bytes32 public constant ORACLE_OPERATOR_ROLE = keccak256("ORACLE_OPERATOR_ROLE");
    bytes32 public constant DATA_FEED_ROLE = keccak256("DATA_FEED_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Structs
    struct PriceData {
        uint256 price;          // Price per kWh in wei
        uint256 timestamp;
        uint256 confidence;     // Confidence level (0-100)
        address source;
        bool isValid;
    }

    struct WeatherData {
        int256 temperature;     // Temperature in Celsius * 100 (for decimals)
        uint256 solarIrradiance; // Solar irradiance in W/m²
        uint256 humidity;       // Humidity percentage
        uint256 windSpeed;      // Wind speed in m/s * 100
        uint256 timestamp;
        address source;
        bool isValid;
    }

    struct GridStatus {
        bool isOnline;
        uint256 capacity;       // Grid capacity in kW
        uint256 currentLoad;    // Current load in kW
        uint256 timestamp;
        address source;
        string region;
    }

    struct DataFeed {
        address feedAddress;
        uint256 weight;         // Weight for aggregation (0-100)
        bool isActive;
        uint256 lastUpdate;
        uint256 reliability;    // Historical reliability score
        string description;
    }

    // State variables
    mapping(address => DataFeed) public dataFeeds;
    address[] public feedAddresses;
    
    // Price data
    PriceData public latestPrice;
    mapping(uint256 => PriceData) public historicalPrices; // timestamp => PriceData
    uint256[] public priceTimestamps;
    
    // Weather data
    WeatherData public latestWeather;
    mapping(uint256 => WeatherData) public historicalWeather;
    uint256[] public weatherTimestamps;
    
    // Grid status
    mapping(string => GridStatus) public gridStatus; // region => GridStatus
    string[] public regions;
    
    // Oracle parameters
    uint256 public minUpdateInterval = 5 minutes;
    uint256 public maxPriceDeviation = 1000; // 10% in basis points
    uint256 public minConfidenceLevel = 70;
    uint256 public emergencyPriceThreshold = 2000; // 20% deviation for emergency
    
    // Statistics
    uint256 public totalPriceUpdates;
    uint256 public totalWeatherUpdates;
    uint256 public totalGridUpdates;

    // Events
    event PriceUpdated(
        uint256 indexed timestamp, 
        uint256 price, 
        uint256 confidence, 
        address indexed source
    );
    event WeatherDataUpdated(
        uint256 indexed timestamp, 
        int256 temperature, 
        uint256 solarIrradiance,
        address indexed source
    );
    event GridStatusUpdated(
        uint256 indexed timestamp, 
        string indexed region,
        bool isOnline, 
        uint256 capacity,
        address indexed source
    );
    event DataFeedAdded(address indexed feed, uint256 weight, string description);
    event DataFeedRemoved(address indexed feed);
    event DataFeedUpdated(address indexed feed, uint256 newWeight);
    event EmergencyPriceUpdate(uint256 oldPrice, uint256 newPrice, address indexed operator);
    event ParametersUpdated(address indexed admin);

    // Errors
    error UnauthorizedDataFeed(address feed);
    error InvalidPriceData(uint256 price, uint256 confidence);
    error InvalidWeatherData();
    error UpdateTooFrequent(uint256 lastUpdate, uint256 interval);
    error PriceDeviationTooHigh(uint256 deviation, uint256 maxDeviation);
    error InsufficientConfidence(uint256 confidence, uint256 required);
    error DataFeedNotFound(address feed);
    error InvalidParameter(string parameter);
    error RegionNotFound(string region);

    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_OPERATOR_ROLE, msg.sender);
        _grantRole(DATA_FEED_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize with default price
        latestPrice = PriceData({
            price: 8 * 10**15, // 0.008 ETH per kWh (example)
            timestamp: block.timestamp,
            confidence: 100,
            source: msg.sender,
            isValid: true
        });
    }

    /**
     * @dev Update energy price data
     * @param _price New price per kWh in wei
     * @param _confidence Confidence level (0-100)
     */
    function updatePrice(uint256 _price, uint256 _confidence) 
        external 
        onlyRole(DATA_FEED_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        if (_price == 0 || _confidence == 0 || _confidence > 100) {
            revert InvalidPriceData(_price, _confidence);
        }
        if (_confidence < minConfidenceLevel) {
            revert InsufficientConfidence(_confidence, minConfidenceLevel);
        }
        
        DataFeed storage feed = dataFeeds[msg.sender];
        if (!feed.isActive) revert UnauthorizedDataFeed(msg.sender);
        
        if (block.timestamp - feed.lastUpdate < minUpdateInterval) {
            revert UpdateTooFrequent(feed.lastUpdate, minUpdateInterval);
        }

        // Check price deviation for non-emergency updates
        if (latestPrice.isValid) {
            uint256 deviation = _calculateDeviation(latestPrice.price, _price);
            if (deviation > maxPriceDeviation) {
                revert PriceDeviationTooHigh(deviation, maxPriceDeviation);
            }
        }

        // Update price data
        PriceData memory newPrice = PriceData({
            price: _price,
            timestamp: block.timestamp,
            confidence: _confidence,
            source: msg.sender,
            isValid: true
        });

        latestPrice = newPrice;
        historicalPrices[block.timestamp] = newPrice;
        priceTimestamps.push(block.timestamp);
        
        feed.lastUpdate = block.timestamp;
        totalPriceUpdates++;

        emit PriceUpdated(block.timestamp, _price, _confidence, msg.sender);
    }

    /**
     * @dev Update weather data
     * @param _temperature Temperature in Celsius * 100
     * @param _solarIrradiance Solar irradiance in W/m²
     * @param _humidity Humidity percentage
     * @param _windSpeed Wind speed in m/s * 100
     */
    function updateWeatherData(
        int256 _temperature,
        uint256 _solarIrradiance,
        uint256 _humidity,
        uint256 _windSpeed
    ) external onlyRole(DATA_FEED_ROLE) whenNotPaused nonReentrant {
        
        if (_humidity > 100 || _solarIrradiance > 2000) {
            revert InvalidWeatherData();
        }

        DataFeed storage feed = dataFeeds[msg.sender];
        if (!feed.isActive) revert UnauthorizedDataFeed(msg.sender);

        WeatherData memory newWeather = WeatherData({
            temperature: _temperature,
            solarIrradiance: _solarIrradiance,
            humidity: _humidity,
            windSpeed: _windSpeed,
            timestamp: block.timestamp,
            source: msg.sender,
            isValid: true
        });

        latestWeather = newWeather;
        historicalWeather[block.timestamp] = newWeather;
        weatherTimestamps.push(block.timestamp);
        
        feed.lastUpdate = block.timestamp;
        totalWeatherUpdates++;

        emit WeatherDataUpdated(block.timestamp, _temperature, _solarIrradiance, msg.sender);
    }

    /**
     * @dev Update grid status for a region
     * @param _region Grid region identifier
     * @param _isOnline Whether grid is online
     * @param _capacity Grid capacity in kW
     * @param _currentLoad Current load in kW
     */
    function updateGridStatus(
        string calldata _region,
        bool _isOnline,
        uint256 _capacity,
        uint256 _currentLoad
    ) external onlyRole(DATA_FEED_ROLE) whenNotPaused nonReentrant {
        
        if (_currentLoad > _capacity) revert InvalidParameter("load exceeds capacity");

        DataFeed storage feed = dataFeeds[msg.sender];
        if (!feed.isActive) revert UnauthorizedDataFeed(msg.sender);

        // Add region if new
        if (gridStatus[_region].timestamp == 0) {
            regions.push(_region);
        }

        gridStatus[_region] = GridStatus({
            isOnline: _isOnline,
            capacity: _capacity,
            currentLoad: _currentLoad,
            timestamp: block.timestamp,
            source: msg.sender,
            region: _region
        });

        feed.lastUpdate = block.timestamp;
        totalGridUpdates++;

        emit GridStatusUpdated(block.timestamp, _region, _isOnline, _capacity, msg.sender);
    }

    /**
     * @dev Emergency price update (bypasses normal restrictions)
     * @param _price Emergency price
     * @param _reason Reason for emergency update
     */
    function emergencyUpdatePrice(uint256 _price, string calldata _reason) 
        external 
        onlyRole(EMERGENCY_ROLE) 
        nonReentrant 
    {
        if (_price == 0) revert InvalidPriceData(_price, 0);
        
        uint256 oldPrice = latestPrice.price;
        
        PriceData memory emergencyPrice = PriceData({
            price: _price,
            timestamp: block.timestamp,
            confidence: 100,
            source: msg.sender,
            isValid: true
        });

        latestPrice = emergencyPrice;
        historicalPrices[block.timestamp] = emergencyPrice;
        priceTimestamps.push(block.timestamp);
        
        totalPriceUpdates++;

        emit EmergencyPriceUpdate(oldPrice, _price, msg.sender);
        emit PriceUpdated(block.timestamp, _price, 100, msg.sender);
    }

    /**
     * @dev Add new data feed
     * @param _feedAddress Address of the data feed
     * @param _weight Weight for aggregation (0-100)
     * @param _description Description of the feed
     */
    function addDataFeed(
        address _feedAddress,
        uint256 _weight,
        string calldata _description
    ) external onlyRole(ORACLE_OPERATOR_ROLE) {
        require(_feedAddress != address(0), "Invalid feed address");
        require(_weight <= 100, "Weight must be <= 100");
        require(!dataFeeds[_feedAddress].isActive, "Feed already exists");

        dataFeeds[_feedAddress] = DataFeed({
            feedAddress: _feedAddress,
            weight: _weight,
            isActive: true,
            lastUpdate: 0,
            reliability: 100,
            description: _description
        });

        feedAddresses.push(_feedAddress);
        _grantRole(DATA_FEED_ROLE, _feedAddress);

        emit DataFeedAdded(_feedAddress, _weight, _description);
    }

    /**
     * @dev Remove data feed
     * @param _feedAddress Address of the feed to remove
     */
    function removeDataFeed(address _feedAddress) 
        external 
        onlyRole(ORACLE_OPERATOR_ROLE) 
    {
        if (!dataFeeds[_feedAddress].isActive) revert DataFeedNotFound(_feedAddress);

        dataFeeds[_feedAddress].isActive = false;
        _revokeRole(DATA_FEED_ROLE, _feedAddress);

        // Remove from array
        for (uint256 i = 0; i < feedAddresses.length; i++) {
            if (feedAddresses[i] == _feedAddress) {
                feedAddresses[i] = feedAddresses[feedAddresses.length - 1];
                feedAddresses.pop();
                break;
            }
        }

        emit DataFeedRemoved(_feedAddress);
    }

    /**
     * @dev Update data feed weight
     * @param _feedAddress Address of the feed
     * @param _newWeight New weight value
     */
    function updateDataFeedWeight(address _feedAddress, uint256 _newWeight) 
        external 
        onlyRole(ORACLE_OPERATOR_ROLE) 
    {
        if (!dataFeeds[_feedAddress].isActive) revert DataFeedNotFound(_feedAddress);
        require(_newWeight <= 100, "Weight must be <= 100");

        dataFeeds[_feedAddress].weight = _newWeight;

        emit DataFeedUpdated(_feedAddress, _newWeight);
    }

    /**
     * @dev Set oracle parameters
     */
    function setOracleParameters(
        uint256 _minUpdateInterval,
        uint256 _maxPriceDeviation,
        uint256 _minConfidenceLevel,
        uint256 _emergencyThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_minUpdateInterval > 1 hours) revert InvalidParameter("update interval too long");
        if (_maxPriceDeviation > 5000) revert InvalidParameter("price deviation too high");
        if (_minConfidenceLevel > 100) revert InvalidParameter("confidence level invalid");
        if (_emergencyThreshold > 10000) revert InvalidParameter("emergency threshold too high");

        minUpdateInterval = _minUpdateInterval;
        maxPriceDeviation = _maxPriceDeviation;
        minConfidenceLevel = _minConfidenceLevel;
        emergencyPriceThreshold = _emergencyThreshold;

        emit ParametersUpdated(msg.sender);
    }

    /**
     * @dev Pause oracle operations
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause oracle operations
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // View functions

    /**
     * @dev Get latest price data
     */
    function getLatestPrice() external view returns (PriceData memory) {
        return latestPrice;
    }

    /**
     * @dev Get historical price data
     * @param _timestamp Timestamp to query
     */
    function getHistoricalPrice(uint256 _timestamp) external view returns (PriceData memory) {
        return historicalPrices[_timestamp];
    }

    /**
     * @dev Get latest weather data
     */
    function getWeatherData() external view returns (WeatherData memory) {
        return latestWeather;
    }

    /**
     * @dev Get grid status for region
     * @param _region Region to query
     */
    function getGridStatus(string calldata _region) external view returns (GridStatus memory) {
        return gridStatus[_region];
    }

    /**
     * @dev Get all active regions
     */
    function getRegions() external view returns (string[] memory) {
        return regions;
    }

    /**
     * @dev Get data feed information
     * @param _feedAddress Feed address to query
     */
    function getDataFeed(address _feedAddress) external view returns (DataFeed memory) {
        return dataFeeds[_feedAddress];
    }

    /**
     * @dev Get all active data feeds
     */
    function getActiveDataFeeds() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < feedAddresses.length; i++) {
            if (dataFeeds[feedAddresses[i]].isActive) {
                activeCount++;
            }
        }

        address[] memory activeFeeds = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < feedAddresses.length; i++) {
            if (dataFeeds[feedAddresses[i]].isActive) {
                activeFeeds[index] = feedAddresses[i];
                index++;
            }
        }

        return activeFeeds;
    }

    /**
     * @dev Get oracle statistics
     */
    function getOracleStats() external view returns (
        uint256 priceUpdates,
        uint256 weatherUpdates,
        uint256 gridUpdates,
        uint256 activeFeedsCount,
        uint256 totalRegions
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < feedAddresses.length; i++) {
            if (dataFeeds[feedAddresses[i]].isActive) {
                activeCount++;
            }
        }

        return (
            totalPriceUpdates,
            totalWeatherUpdates,
            totalGridUpdates,
            activeCount,
            regions.length
        );
    }

    /**
     * @dev Get recent price history
     * @param _count Number of recent prices to return
     */
    function getRecentPrices(uint256 _count) external view returns (PriceData[] memory) {
        uint256 length = priceTimestamps.length;
        uint256 resultLength = _count > length ? length : _count;
        
        PriceData[] memory recentPrices = new PriceData[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            uint256 timestamp = priceTimestamps[length - 1 - i];
            recentPrices[i] = historicalPrices[timestamp];
        }
        
        return recentPrices;
    }

    // Internal functions

    /**
     * @dev Calculate percentage deviation between two prices
     */
    function _calculateDeviation(uint256 _oldPrice, uint256 _newPrice) 
        internal 
        pure 
        returns (uint256) 
    {
        if (_oldPrice == 0) return 0;
        
        uint256 diff = _newPrice > _oldPrice ? _newPrice - _oldPrice : _oldPrice - _newPrice;
        return (diff * 10000) / _oldPrice; // Return in basis points
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
            IERC20(_token).transfer(msg.sender, _amount);
        }
    }
}
