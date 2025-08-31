// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SolarToken (ST)
 * @dev ERC20 Token representing energy units in the SolChain ecosystem
 * 1 ST = 1 kWh of energy
 * 
 * Features:
 * - Mintable by authorized minters (energy producers)
 * - Burnable for energy consumption
 * - Pausable for emergency situations
 * - Role-based access control
 * - Transfer fees for platform sustainability
 * - Blacklist functionality for security
 * - Permit functionality for gasless transactions
 * 
 * @author Team GreyDevs
 */
contract SolarToken is 
    ERC20, 
    ERC20Permit, 
    ERC20Pausable, 
    ERC20Burnable, 
    AccessControl, 
    ReentrancyGuard 
{
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // State variables
    uint256 public transferFeePercentage; // Fee in basis points (100 = 1%)
    address public feeCollector;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted; // Exempt from fees
    
    // ETH transfer functionality
    uint256 public ethToTokenRatio = 1000; // 1000 wei per 1 ST token (adjustable)
    bool public ethTransferEnabled = true;
    mapping(address => uint256) public ethBalance; // Track ETH balance per user
    
    // Maximum supply cap (100 million tokens)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event MinterAdded(address indexed minter, address indexed admin);
    event MinterRemoved(address indexed minter, address indexed admin);
    event AddressBlacklisted(address indexed account, address indexed admin);
    event AddressWhitelisted(address indexed account, address indexed admin);
    event TransferFeeUpdated(uint256 oldFee, uint256 newFee, address indexed admin);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event FeesCollected(address indexed from, address indexed to, uint256 amount);
    event ETHTransferred(address indexed from, address indexed to, uint256 amount);
    event ETHDeposited(address indexed depositor, uint256 amount);
    event ETHRatioUpdated(uint256 oldRatio, uint256 newRatio, address indexed admin);
    event ETHTransferToggled(bool enabled, address indexed admin);

    // Errors
    error AddressIsBlacklisted(address account);
    error InsufficientBalance(uint256 required, uint256 available);
    error ExceedsMaxSupply(uint256 requested, uint256 maxSupply);
    error InvalidFeePercentage(uint256 fee);
    error ZeroAddress();
    error InvalidAmount(uint256 amount);
    error InsufficientETHBalance(uint256 required, uint256 available);
    error ETHTransferFailed();
    error ETHTransferDisabled();

    /**
     * @dev Constructor
     * @param _initialSupply Initial token supply
     * @param _feeCollector Address to collect transfer fees
     */
    constructor(
        uint256 _initialSupply,
        address _feeCollector
    ) 
        ERC20("SolarToken", "ST") 
        ERC20Permit("SolarToken")
    {
        if (_feeCollector == address(0)) revert ZeroAddress();
        if (_initialSupply > MAX_SUPPLY) revert ExceedsMaxSupply(_initialSupply, MAX_SUPPLY);

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLIST_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);

        // Initialize state
        feeCollector = _feeCollector;
        transferFeePercentage = 25; // 0.25% default fee
        whitelisted[msg.sender] = true;
        whitelisted[_feeCollector] = true;

        // Mint initial supply
        if (_initialSupply > 0) {
            _mint(msg.sender, _initialSupply);
            emit TokensMinted(msg.sender, _initialSupply, "Initial supply");
        }
    }

    /**
     * @dev Set ETH to token ratio
     * @param _ethToTokenRatio New ratio (wei per 1 ST token)
     */
    function setETHToTokenRatio(uint256 _ethToTokenRatio) external onlyRole(FEE_MANAGER_ROLE) {
        if (_ethToTokenRatio == 0) revert InvalidAmount(_ethToTokenRatio);
        
        uint256 oldRatio = ethToTokenRatio;
        ethToTokenRatio = _ethToTokenRatio;
        emit ETHRatioUpdated(oldRatio, _ethToTokenRatio, msg.sender);
    }

    /**
     * @dev Toggle ETH transfer functionality
     * @param _enabled Whether ETH transfers are enabled
     */
    function setETHTransferEnabled(bool _enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ethTransferEnabled = _enabled;
        emit ETHTransferToggled(_enabled, msg.sender);
    }

    /**
     * @dev Deposit ETH to the contract
     */
    function depositETH() external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount(msg.value);
        
        ethBalance[msg.sender] += msg.value;
        emit ETHDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Calculate equivalent ETH amount for token transfer
     * @param tokenAmount Amount of tokens
     * @return ethAmount Equivalent ETH amount in wei
     */
    function calculateETHAmount(uint256 tokenAmount) public view returns (uint256) {
        return (tokenAmount * ethToTokenRatio) / 10**18;
    }

    /**
     * @dev Transfer equivalent ETH along with tokens
     * @param from Sender address
     * @param to Recipient address
     * @param tokenAmount Amount of tokens being transferred
     */
    function _transferEquivalentETH(address from, address to, uint256 tokenAmount) internal {
        if (!ethTransferEnabled || from == address(0) || to == address(0)) {
            return; // Skip ETH transfer for minting/burning or if disabled
        }

        uint256 ethAmount = calculateETHAmount(tokenAmount);
        if (ethAmount == 0) return;

        // Check if contract has enough ETH balance for the sender
        if (ethBalance[from] < ethAmount) {
            // If sender doesn't have enough ETH balance, try to use contract's ETH
            if (address(this).balance < ethAmount) {
                return; // Skip ETH transfer if not enough funds
            }
            // Transfer from contract's balance
            ethBalance[to] += ethAmount;
        } else {
            // Transfer from sender's ETH balance to recipient
            ethBalance[from] -= ethAmount;
            ethBalance[to] += ethAmount;
        }

        emit ETHTransferred(from, to, ethAmount);
    }

    /**
     * @dev Withdraw ETH balance
     * @param amount Amount to withdraw in wei
     */
    function withdrawETH(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount(amount);
        if (ethBalance[msg.sender] < amount) revert InsufficientETHBalance(amount, ethBalance[msg.sender]);
        if (address(this).balance < amount) revert InsufficientETHBalance(amount, address(this).balance);

        ethBalance[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert ETHTransferFailed();

        emit ETHTransferred(address(this), msg.sender, amount);
    }

    /**
     * @dev Get ETH balance for an address
     * @param account Address to check
     * @return ETH balance in wei
     */
    function getETHBalance(address account) external view returns (uint256) {
        return ethBalance[account];
    }

    /**
     * @dev Mint tokens to an account
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting
     */
    function mint(
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount(amount);
        if (blacklisted[to]) revert AddressIsBlacklisted(to);
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply(amount, MAX_SUPPLY);

        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Burn tokens with reason
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnWithReason(uint256 amount, string calldata reason) external {
        if (amount == 0) revert InvalidAmount(amount);
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance(amount, balanceOf(msg.sender));

        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }

    /**
     * @dev Pause token transfers
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
     * @dev Add address to blacklist
     * @param account Address to blacklist
     */
    function blacklistAddress(address account) external onlyRole(BLACKLIST_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        blacklisted[account] = true;
        emit AddressBlacklisted(account, msg.sender);
    }

    /**
     * @dev Remove address from blacklist
     * @param account Address to whitelist
     */
    function removeFromBlacklist(address account) external onlyRole(BLACKLIST_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        blacklisted[account] = false;
        emit AddressWhitelisted(account, msg.sender);
    }

    /**
     * @dev Set transfer fee percentage
     * @param _feePercentage Fee in basis points (100 = 1%)
     */
    function setTransferFee(uint256 _feePercentage) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feePercentage > 1000) revert InvalidFeePercentage(_feePercentage); // Max 10%
        
        uint256 oldFee = transferFeePercentage;
        transferFeePercentage = _feePercentage;
        emit TransferFeeUpdated(oldFee, _feePercentage, msg.sender);
    }

    /**
     * @dev Set fee collector address
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feeCollector == address(0)) revert ZeroAddress();
        
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }

    /**
     * @dev Add address to whitelist (exempt from fees)
     * @param account Address to whitelist
     */
    function addToWhitelist(address account) external onlyRole(FEE_MANAGER_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        whitelisted[account] = true;
    }

    /**
     * @dev Remove address from whitelist
     * @param account Address to remove from whitelist
     */
    function removeFromWhitelist(address account) external onlyRole(FEE_MANAGER_ROLE) {
        whitelisted[account] = false;
    }

    /**
     * @dev Override transfer to include fees, blacklist checks, and ETH transfers
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        // Check blacklist
        if (blacklisted[from] || blacklisted[to]) {
            revert AddressIsBlacklisted(blacklisted[from] ? from : to);
        }

        uint256 originalValue = value;

        // Handle fees for non-whitelisted transfers
        if (from != address(0) && to != address(0) && !whitelisted[from] && !whitelisted[to]) {
            uint256 fee = (value * transferFeePercentage) / 10000;
            if (fee > 0) {
                super._update(from, feeCollector, fee);
                emit FeesCollected(from, feeCollector, fee);
                value -= fee;
            }
        }

        // Execute token transfer
        super._update(from, to, value);

        // Transfer equivalent ETH (use original value before fees for ETH calculation)
        _transferEquivalentETH(from, to, originalValue);
    }

    /**
     * @dev Get circulating supply (total supply minus burned tokens)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Check if address is minter
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    /**
     * @dev Emergency withdraw function (only admin)
     */
    function emergencyWithdraw(address token, address to, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        if (to == address(0)) revert ZeroAddress();
        
        if (token == address(0)) {
            // Withdraw ETH
            if (address(this).balance < amount) revert InsufficientETHBalance(amount, address(this).balance);
            (bool success, ) = payable(to).call{value: amount}("");
            if (!success) revert ETHTransferFailed();
            emit ETHTransferred(address(this), to, amount);
        } else {
            // Withdraw ERC20 tokens
            IERC20(token).transfer(to, amount);
        }
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
