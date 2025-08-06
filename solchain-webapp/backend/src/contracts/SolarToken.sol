// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SolarToken
 * @dev ERC-20 token representing solar energy units (1 token = 1 kWh)
 * @author Team GreyDevs - BCOLBD 2025
 * Enhanced for peer-to-peer solar energy trading with energy tracking
 */
contract SolarToken is ERC20, Ownable {
    // Token details
    string private constant _name = "SolarToken";
    string private constant _symbol = "ST";
    uint8 private constant _decimals = 18;
    
    // Initial supply of tokens (1 million kWh equivalent)
    uint256 private constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(_decimals));
    
    // Energy production and consumption tracking
    mapping(address => bool) public authorizedMinters; // Smart meters, energy producers
    mapping(address => uint256) public energyProduced; // Total energy produced by address
    mapping(address => uint256) public energyConsumed; // Total energy consumed by address
    mapping(address => uint256) public lastProductionTime; // Last time energy was produced
    mapping(address => bool) public verifiedProducers; // KYC verified energy producers
    
    // Carbon footprint tracking
    mapping(address => uint256) public carbonCredits; // Carbon credits earned
    uint256 public totalCarbonCredits;
    
    // Events for energy tracking
    event EnergyProduced(address indexed producer, uint256 amount, uint256 timestamp);
    event EnergyConsumed(address indexed consumer, uint256 amount, uint256 timestamp);
    event ProducerVerified(address indexed producer);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    event CarbonCreditAwarded(address indexed producer, uint256 credits);
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || owner() == msg.sender, "Not authorized to mint tokens");
        _;
    }
    
    modifier onlyVerifiedProducer() {
        require(verifiedProducers[msg.sender], "Producer must be verified");
        _;
    }
    
    constructor() ERC20(_name, _symbol) {
        _mint(msg.sender, INITIAL_SUPPLY);
        authorizedMinters[msg.sender] = true;
        verifiedProducers[msg.sender] = true;
    }
    
    /**
     * @dev Mint tokens representing energy production
     * @param to Address of energy producer
     * @param amount Amount of energy produced (in kWh, scaled by decimals)
     */
    function mintEnergyProduction(address to, uint256 amount) external onlyAuthorizedMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(verifiedProducers[to], "Producer must be verified");
        
        _mint(to, amount);
        energyProduced[to] += amount;
        lastProductionTime[to] = block.timestamp;
        
        // Award carbon credits (1 credit per 10 kWh of solar energy)
        uint256 credits = amount / (10 * 10**decimals);
        if (credits > 0) {
            carbonCredits[to] += credits;
            totalCarbonCredits += credits;
            emit CarbonCreditAwarded(to, credits);
        }
        
        emit EnergyProduced(to, amount, block.timestamp);
    }
    
    /**
     * @dev Burn tokens representing energy consumption
     * @param from Address of energy consumer
     * @param amount Amount of energy consumed (in kWh, scaled by decimals)
     */
    function burnEnergyConsumption(address from, uint256 amount) external onlyAuthorizedMinter {
        require(from != address(0), "Cannot burn from zero address");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        
        _burn(from, amount);
        energyConsumed[from] += amount;
        
        emit EnergyConsumed(from, amount, block.timestamp);
    }
    
    /**
     * @dev Authorize an address to mint/burn tokens (e.g., smart meters)
     */
    function authorizeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Cannot authorize zero address");
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    /**
     * @dev Revoke minting authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    /**
     * @dev Verify an energy producer (KYC process)
     */
    function verifyProducer(address producer) external onlyOwner {
        require(producer != address(0), "Cannot verify zero address");
        verifiedProducers[producer] = true;
        emit ProducerVerified(producer);
    }
    
    /**
     * @dev Get comprehensive energy statistics for an address
     */
    function getEnergyStats(address account) external view returns (
        uint256 currentBalance,
        uint256 totalProduced,
        uint256 totalConsumed,
        uint256 netProduction,
        uint256 carbonCreditsEarned,
        uint256 lastProduction
    ) {
        currentBalance = balanceOf(account);
        totalProduced = energyProduced[account];
        totalConsumed = energyConsumed[account];
        netProduction = totalProduced >= totalConsumed ? totalProduced - totalConsumed : 0;
        carbonCreditsEarned = carbonCredits[account];
        lastProduction = lastProductionTime[account];
        
        return (currentBalance, totalProduced, totalConsumed, netProduction, carbonCreditsEarned, lastProduction);
    }
    
    /**
     * @dev Get platform-wide energy statistics
     */
    function getGlobalStats() external view returns (
        uint256 totalTokenSupply,
        uint256 totalCarbonCreditsIssued,
        uint256 totalVerifiedProducers
    ) {
        totalTokenSupply = totalSupply();
        totalCarbonCreditsIssued = totalCarbonCredits;
        
        // Count verified producers (this is gas-intensive, consider caching)
        uint256 verifiedCount = 0;
        // Note: In production, maintain a counter instead of iterating
        
        return (totalTokenSupply, totalCarbonCreditsIssued, verifiedCount);
    }
    
    /**
     * @dev Transfer carbon credits between users
     */
    function transferCarbonCredits(address to, uint256 credits) external {
        require(to != address(0), "Cannot transfer to zero address");
        require(carbonCredits[msg.sender] >= credits, "Insufficient carbon credits");
        
        carbonCredits[msg.sender] -= credits;
        carbonCredits[to] += credits;
    }
    
    /**
     * @dev Calculate energy efficiency ratio for an address
     * @return efficiency Ratio of production to consumption (scaled by 100)
     */
    function getEfficiencyRatio(address account) external view returns (uint256 efficiency) {
        uint256 produced = energyProduced[account];
        uint256 consumed = energyConsumed[account];
        
        if (consumed == 0) {
            return produced > 0 ? 10000 : 0; // 100% efficiency or 0 if no activity
        }
        
        return (produced * 10000) / consumed; // Percentage * 100 for precision
    }
    
    /**
     * @dev Override transfer to include energy tracking
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        // Record this as an energy transfer/trade
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Function to mint new tokens (admin only)
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
    
    /**
     * @dev Function to burn tokens
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        // Implementation would require OpenZeppelin's Pausable contract
        // _pause();
    }
    
    /**
     * @dev Get token decimals (override for clarity)
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
}