// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SolChainStaking
 * @dev Staking contract for SolarToken holders to become validators
 * 
 * Features:
 * - Stake SolarTokens to become a validator
 * - Earn rewards from transaction fees
 * - Slashing mechanism for malicious behavior
 * - Validator rotation based on stake
 * - Withdrawal delay for security
 * - Emergency pause functionality
 * 
 * @author Team GreyDevs
 */
contract SolChainStaking is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    // Structs
    struct Validator {
        uint256 stakedAmount;
        uint256 rewardsEarned;
        uint256 lastRewardTime;
        uint256 stakingStartTime;
        uint256 unstakeRequestTime;
        bool isActive;
        bool isSlashed;
        uint256 slashedAmount;
        string metadata; // IPFS hash or JSON metadata
    }

    struct StakingPool {
        uint256 totalStaked;
        uint256 totalRewards;
        uint256 rewardRate; // Rewards per second per token
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
    }

    // State variables
    IERC20 public immutable solarToken;
    
    mapping(address => Validator) public validators;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;
    
    address[] public validatorList;
    mapping(address => uint256) public validatorIndex;
    
    StakingPool public stakingPool;
    
    // Staking parameters
    uint256 public minimumStake = 1000 * 10**18; // 1000 ST minimum
    uint256 public maximumValidators = 100;
    uint256 public unstakingDelay = 7 days;
    uint256 public slashingPercentage = 1000; // 10% in basis points
    uint256 public rewardsDuration = 365 days;
    
    // Reward distribution
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    // Statistics
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public totalSlashed;

    // Events
    event Staked(address indexed validator, uint256 amount, string metadata);
    event Unstaked(address indexed validator, uint256 amount);
    event UnstakeRequested(address indexed validator, uint256 unstakeTime);
    event RewardsClaimed(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event ValidatorActivated(address indexed validator);
    event ValidatorDeactivated(address indexed validator);
    event RewardsAdded(uint256 amount, uint256 duration);
    event ParametersUpdated(address indexed admin);

    // Errors
    error InsufficientStake(uint256 provided, uint256 required);
    error ValidatorNotFound(address validator);
    error ValidatorAlreadyExists(address validator);
    error UnstakingPeriodNotComplete(uint256 remainingTime);
    error MaxValidatorsReached(uint256 current, uint256 maximum);
    error ValidatorIsSlashed(address validator);
    error InvalidAmount(uint256 amount);
    error InvalidParameter(string parameter);
    error NoRewardsToClaim(address validator);

    /**
     * @dev Constructor
     * @param _solarToken Address of the SolarToken contract
     */
    constructor(address _solarToken) {
        require(_solarToken != address(0), "Invalid token address");
        
        solarToken = IERC20(_solarToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(SLASHER_ROLE, msg.sender);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, msg.sender);
        
        stakingPool.lastUpdateTime = block.timestamp;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Modifier to update rewards before function execution
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        
        if (account != address(0)) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Stake tokens to become a validator
     * @param _amount Amount of tokens to stake
     * @param _metadata Validator metadata (IPFS hash)
     */
    function stake(uint256 _amount, string calldata _metadata) 
        external 
        whenNotPaused 
        nonReentrant 
        updateReward(msg.sender)
    {
        if (_amount < minimumStake) revert InsufficientStake(_amount, minimumStake);
        if (validators[msg.sender].isActive) revert ValidatorAlreadyExists(msg.sender);
        if (validatorList.length >= maximumValidators) {
            revert MaxValidatorsReached(validatorList.length, maximumValidators);
        }

        // Transfer tokens
        solarToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Create validator
        validators[msg.sender] = Validator({
            stakedAmount: _amount,
            rewardsEarned: 0,
            lastRewardTime: block.timestamp,
            stakingStartTime: block.timestamp,
            unstakeRequestTime: 0,
            isActive: true,
            isSlashed: false,
            slashedAmount: 0,
            metadata: _metadata
        });

        // Add to validator list
        validatorIndex[msg.sender] = validatorList.length;
        validatorList.push(msg.sender);

        // Update totals
        totalStaked += _amount;
        stakingPool.totalStaked += _amount;

        emit Staked(msg.sender, _amount, _metadata);
        emit ValidatorActivated(msg.sender);
    }

    /**
     * @dev Add more stake to existing validator position
     * @param _amount Additional amount to stake
     */
    function addStake(uint256 _amount) 
        external 
        whenNotPaused 
        nonReentrant 
        updateReward(msg.sender)
    {
        if (!validators[msg.sender].isActive) revert ValidatorNotFound(msg.sender);
        if (validators[msg.sender].isSlashed) revert ValidatorIsSlashed(msg.sender);
        if (_amount == 0) revert InvalidAmount(_amount);

        solarToken.safeTransferFrom(msg.sender, address(this), _amount);

        validators[msg.sender].stakedAmount += _amount;
        totalStaked += _amount;
        stakingPool.totalStaked += _amount;

        emit Staked(msg.sender, _amount, validators[msg.sender].metadata);
    }

    /**
     * @dev Request to unstake tokens (starts withdrawal delay)
     */
    function requestUnstake() external nonReentrant updateReward(msg.sender) {
        if (!validators[msg.sender].isActive) revert ValidatorNotFound(msg.sender);

        validators[msg.sender].unstakeRequestTime = block.timestamp;
        validators[msg.sender].isActive = false;

        emit UnstakeRequested(msg.sender, block.timestamp + unstakingDelay);
        emit ValidatorDeactivated(msg.sender);
    }

    /**
     * @dev Complete unstaking after delay period
     */
    function unstake() external nonReentrant updateReward(msg.sender) {
        Validator storage validator = validators[msg.sender];
        
        if (validator.unstakeRequestTime == 0) revert ValidatorNotFound(msg.sender);
        
        uint256 timePassed = block.timestamp - validator.unstakeRequestTime;
        if (timePassed < unstakingDelay) {
            revert UnstakingPeriodNotComplete(unstakingDelay - timePassed);
        }

        uint256 stakeAmount = validator.stakedAmount;
        uint256 rewardAmount = pendingRewards[msg.sender];

        // Remove from validator list
        _removeValidator(msg.sender);

        // Update totals
        totalStaked -= stakeAmount;
        stakingPool.totalStaked -= stakeAmount;

        // Clear validator data
        delete validators[msg.sender];
        delete pendingRewards[msg.sender];
        delete userRewardPerTokenPaid[msg.sender];

        // Transfer tokens
        if (stakeAmount > 0) {
            solarToken.safeTransfer(msg.sender, stakeAmount);
        }
        if (rewardAmount > 0) {
            solarToken.safeTransfer(msg.sender, rewardAmount);
            totalRewardsDistributed += rewardAmount;
        }

        emit Unstaked(msg.sender, stakeAmount);
        if (rewardAmount > 0) {
            emit RewardsClaimed(msg.sender, rewardAmount);
        }
    }

    /**
     * @dev Claim earned rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward == 0) revert NoRewardsToClaim(msg.sender);

        pendingRewards[msg.sender] = 0;
        validators[msg.sender].rewardsEarned += reward;
        totalRewardsDistributed += reward;

        solarToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @dev Slash a validator for malicious behavior
     * @param _validator Address of validator to slash
     * @param _reason Reason for slashing
     */
    function slashValidator(address _validator, string calldata _reason) 
        external 
        onlyRole(SLASHER_ROLE) 
        updateReward(_validator)
    {
        Validator storage validator = validators[_validator];
        if (!validator.isActive && validator.unstakeRequestTime == 0) {
            revert ValidatorNotFound(_validator);
        }

        uint256 slashAmount = (validator.stakedAmount * slashingPercentage) / 10000;
        
        validator.isSlashed = true;
        validator.slashedAmount = slashAmount;
        validator.stakedAmount -= slashAmount;
        validator.isActive = false;

        totalStaked -= slashAmount;
        stakingPool.totalStaked -= slashAmount;
        totalSlashed += slashAmount;

        // Remove from active validators
        if (validator.unstakeRequestTime == 0) {
            _removeValidator(_validator);
        }

        emit ValidatorSlashed(_validator, slashAmount, _reason);
        emit ValidatorDeactivated(_validator);
    }

    /**
     * @dev Add rewards to the staking pool
     * @param _amount Amount of rewards to add
     * @param _duration Duration for reward distribution
     */
    function addRewards(uint256 _amount, uint256 _duration) 
        external 
        onlyRole(REWARD_DISTRIBUTOR_ROLE) 
        updateReward(address(0))
    {
        if (_amount == 0) revert InvalidAmount(_amount);
        if (_duration == 0) revert InvalidParameter("duration");

        solarToken.safeTransferFrom(msg.sender, address(this), _amount);

        if (block.timestamp >= periodFinish) {
            rewardRate = _amount / _duration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (_amount + leftover) / _duration;
        }

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + _duration;
        stakingPool.totalRewards += _amount;

        emit RewardsAdded(_amount, _duration);
    }

    /**
     * @dev Set staking parameters
     */
    function setStakingParameters(
        uint256 _minimumStake,
        uint256 _maximumValidators,
        uint256 _unstakingDelay,
        uint256 _slashingPercentage
    ) external onlyRole(ADMIN_ROLE) {
        if (_minimumStake == 0) revert InvalidParameter("minimum stake");
        if (_maximumValidators == 0) revert InvalidParameter("maximum validators");
        if (_unstakingDelay > 30 days) revert InvalidParameter("unstaking delay too long");
        if (_slashingPercentage > 5000) revert InvalidParameter("slashing percentage too high"); // Max 50%

        minimumStake = _minimumStake;
        maximumValidators = _maximumValidators;
        unstakingDelay = _unstakingDelay;
        slashingPercentage = _slashingPercentage;

        emit ParametersUpdated(msg.sender);
    }

    /**
     * @dev Pause staking
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause staking
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // View functions

    /**
     * @dev Get last time reward is applicable
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + 
            (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }

    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return (validators[account].stakedAmount * 
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + 
            pendingRewards[account];
    }

    /**
     * @dev Get active validators
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeCount++;
            }
        }

        address[] memory activeValidators = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeValidators[index] = validatorList[i];
                index++;
            }
        }

        return activeValidators;
    }

    /**
     * @dev Get validator info
     */
    function getValidatorInfo(address _validator) external view returns (
        uint256 stakedAmount,
        uint256 rewardsEarned,
        uint256 pendingReward,
        bool isActive,
        bool isSlashed,
        string memory metadata
    ) {
        Validator storage validator = validators[_validator];
        return (
            validator.stakedAmount,
            validator.rewardsEarned,
            earned(_validator),
            validator.isActive,
            validator.isSlashed,
            validator.metadata
        );
    }

    /**
     * @dev Get staking statistics
     */
    function getStakingStats() external view returns (
        uint256 totalValidators,
        uint256 activeValidators,
        uint256 totalStakedAmount,
        uint256 totalRewards,
        uint256 currentRewardRate
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeCount++;
            }
        }

        return (
            validatorList.length,
            activeCount,
            totalStaked,
            totalRewardsDistributed,
            rewardRate
        );
    }

    // Internal functions

    /**
     * @dev Remove validator from list
     */
    function _removeValidator(address _validator) internal {
        uint256 index = validatorIndex[_validator];
        uint256 lastIndex = validatorList.length - 1;

        if (index != lastIndex) {
            address lastValidator = validatorList[lastIndex];
            validatorList[index] = lastValidator;
            validatorIndex[lastValidator] = index;
        }

        validatorList.pop();
        delete validatorIndex[_validator];
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
