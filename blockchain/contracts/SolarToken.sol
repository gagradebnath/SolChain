// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SolarToken
 * @dev ERC20 token for the SolChain ecosystem with governance, staking, and fee mechanisms
 * Native token for SolChain representing energy units (1 ST = 1 kWh)
 * @author Team GreyDevs
 */
contract SolarToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Fee structure (in basis points, 1 basis point = 0.01%)
    uint256 public transferFeeBasisPoints = 0; // 0% default transfer fee
    uint256 public tradingFeeBasisPoints = 10; // 0.1% trading fee
    uint256 public constant MAX_FEE_BASIS_POINTS = 1000; // 10% maximum fee
    
    address public feeCollector;
    address public energyTradingContract;
    
    // Mapping to track fee exemptions and blacklisted addresses
    mapping(address => bool) public feeExempt;
    mapping(address => bool) public blacklisted;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event AddressBlacklisted(address indexed account);
    event AddressWhitelisted(address indexed account);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);
    event FeeExemptionUpdated(address indexed account, bool exempt);
    event EnergyTradingContractUpdated(address indexed oldContract, address indexed newContract);

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "SolarToken: account is blacklisted");
        _;
    }

    constructor(
        address _feeCollector
    ) ERC20("SolarToken", "SOLAR") ERC20Permit("SolarToken") {
        require(_feeCollector != address(0), "SolarToken: fee collector cannot be zero address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        
        feeCollector = _feeCollector;
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        emit TokensMinted(msg.sender, INITIAL_SUPPLY);
        
        // Exempt fee collector and deployer from fees
        feeExempt[_feeCollector] = true;
        feeExempt[msg.sender] = true;
    }

    /**
     * @dev Mint tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) notBlacklisted(to) {
        require(totalSupply() + amount <= MAX_SUPPLY, "SolarToken: exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external notBlacklisted(msg.sender) {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific address (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyRole(BURNER_ROLE) notBlacklisted(from) {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    /**
     * @dev Add an address to the minter role
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove an address from the minter role
     * @param minter Address to remove from minter role
     */
    function removeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
        emit MinterRemoved(minter);
    }

    /**
     * @dev Blacklist an address
     * @param account Address to blacklist
     */
    function blacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        blacklisted[account] = true;
        emit AddressBlacklisted(account);
    }

    /**
     * @dev Remove an address from blacklist
     * @param account Address to remove from blacklist
     */
    function removeFromBlacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        blacklisted[account] = false;
        emit AddressWhitelisted(account);
    }

    /**
     * @dev Pause all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Set the fee collector address
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) external onlyRole(FEE_MANAGER_ROLE) {
        require(_feeCollector != address(0), "SolarToken: fee collector cannot be zero address");
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        
        // Update fee exemption
        feeExempt[oldCollector] = false;
        feeExempt[_feeCollector] = true;
        
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }

    /**
     * @dev Set transfer fee basis points
     * @param _transferFeeBasisPoints New transfer fee in basis points
     */
    function setTransferFee(uint256 _transferFeeBasisPoints) external onlyRole(FEE_MANAGER_ROLE) {
        require(_transferFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "SolarToken: fee too high");
        uint256 oldFee = transferFeeBasisPoints;
        transferFeeBasisPoints = _transferFeeBasisPoints;
        emit FeeUpdated("transfer", oldFee, _transferFeeBasisPoints);
    }

    /**
     * @dev Set trading fee basis points
     * @param _tradingFeeBasisPoints New trading fee in basis points
     */
    function setTradingFee(uint256 _tradingFeeBasisPoints) external onlyRole(FEE_MANAGER_ROLE) {
        require(_tradingFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "SolarToken: fee too high");
        uint256 oldFee = tradingFeeBasisPoints;
        tradingFeeBasisPoints = _tradingFeeBasisPoints;
        emit FeeUpdated("trading", oldFee, _tradingFeeBasisPoints);
    }

    /**
     * @dev Set fee exemption status for an address
     * @param account Address to update exemption status
     * @param exempt Whether the address should be exempt from fees
     */
    function setFeeExemption(address account, bool exempt) external onlyRole(FEE_MANAGER_ROLE) {
        feeExempt[account] = exempt;
        emit FeeExemptionUpdated(account, exempt);
    }

    /**
     * @dev Set the energy trading contract address
     * @param _energyTradingContract Address of the energy trading contract
     */
    function setEnergyTradingContract(address _energyTradingContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldContract = energyTradingContract;
        energyTradingContract = _energyTradingContract;
        
        // Grant minter role to energy trading contract for rewards
        if (_energyTradingContract != address(0)) {
            _grantRole(MINTER_ROLE, _energyTradingContract);
            feeExempt[_energyTradingContract] = true;
        }
        
        // Revoke role from old contract
        if (oldContract != address(0)) {
            _revokeRole(MINTER_ROLE, oldContract);
            feeExempt[oldContract] = false;
        }
        
        emit EnergyTradingContractUpdated(oldContract, _energyTradingContract);
    }

    /**
     * @dev Calculate fee amount for a transfer
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     * @return feeAmount Fee to be collected
     */
    function calculateFee(address from, address to, uint256 amount) public view returns (uint256 feeAmount) {
        // No fee if either party is exempt
        if (feeExempt[from] || feeExempt[to]) {
            return 0;
        }
        
        // Use trading fee if interacting with energy trading contract
        uint256 feeRate = (from == energyTradingContract || to == energyTradingContract) 
            ? tradingFeeBasisPoints 
            : transferFeeBasisPoints;
        
        return (amount * feeRate) / 10000;
    }

    /**
     * @dev Override to handle voting checkpoints with fees
     */
    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20, ERC20Votes) 
        whenNotPaused 
        notBlacklisted(from) 
        notBlacklisted(to) 
    {
        if (from != address(0) && to != address(0)) {
            uint256 feeAmount = calculateFee(from, to, value);
            
            if (feeAmount > 0) {
                // Transfer fee to fee collector
                super._update(from, feeCollector, feeAmount);
                // Transfer remaining amount to recipient
                super._update(from, to, value - feeAmount);
                return;
            }
        }
        
        super._update(from, to, value);
    }

    /**
     * @dev Override to ensure consistency across inheritance
     */
    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    /**
     * @dev Create a snapshot of token balances
     * @return Current block number as snapshot ID
     */
    function snapshot() external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        return block.number;
    }

    /**
     * @dev Emergency function to recover accidentally sent tokens
     * @param token Address of the token to recover
     * @param amount Amount to recover
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(token != address(this), "SolarToken: cannot recover SOLAR tokens");
        if (token == address(0)) {
            // Recover ETH
            payable(msg.sender).transfer(amount);
        } else {
            // Recover ERC20 tokens
            IERC20(token).transfer(msg.sender, amount);
        }
    }

    /**
     * @dev Update token metadata (if needed for future upgrades)
     * @dev This is a placeholder for potential metadata updates
     */
    function updateMetadata() external view onlyRole(DEFAULT_ADMIN_ROLE) {
        // Placeholder for future metadata updates
        // Current implementation doesn't require dynamic metadata
    }

    /**
     * @dev Get comprehensive token information
     */
    function getTokenInfo() external view returns (
        uint256 _totalSupply,
        uint256 _maxSupply,
        uint256 _transferFee,
        uint256 _tradingFee,
        address _feeCollector,
        address _energyTradingContract,
        bool _paused
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            transferFeeBasisPoints,
            tradingFeeBasisPoints,
            feeCollector,
            energyTradingContract,
            paused()
        );
    }

    /**
     * @dev Check if the contract supports an interface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Allow contract to receive ETH for emergency recovery
     */
    receive() external payable {}
}
