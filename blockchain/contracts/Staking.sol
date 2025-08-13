// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SolarToken.sol";

/**
 * @title Staking
 * @dev PoS staking contract for SolarToken validators with delegation support
 * @author Team GreyDevs
 */
contract Staking is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant VALIDATOR_MANAGER_ROLE = keccak256("VALIDATOR_MANAGER_ROLE");
    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    SolarToken public immutable solarToken;
    
    // Staking parameters
    uint256 public minimumStake = 1000 * 10**18; // 1000 SOLAR minimum
    uint256 public maximumValidators = 100; // Maximum number of validators
    uint256 public unbondingPeriod = 7 days; // Time to wait before unstaking
    uint256 public slashingRate = 500; // 5% slashing rate in basis points
    uint256 public rewardRate = 1000; // 10% annual reward rate in basis points
    uint256 public constant MAX_COMMISSION_RATE = 2000; // 20% maximum commission

    // Reward distribution
    uint256 public totalStaked;
    uint256 public rewardPool;
    uint256 public lastRewardDistribution;
    uint256 public accumulatedRewardPerShare;
    uint256 private constant PRECISION = 1e18;

    enum ValidatorStatus { INACTIVE, ACTIVE, JAILED, SLASHED }

    struct Validator {
        address validatorAddress;
        uint256 stakedAmount;
        uint256 delegatedAmount;
        uint256 totalStake; // stakedAmount + delegatedAmount
        uint256 commissionRate; // in basis points
        uint256 rewardDebt;
        ValidatorStatus status;
        uint256 jailUntil;
        uint256 slashCount;
        string moniker;
        string website;
        string details;
    }

    struct Delegation {
        address validator;
        uint256 amount;
        uint256 rewardDebt;
        uint256 unbondingAmount;
        uint256 unbondingTime;
    }

    struct UnbondingEntry {
        uint256 amount;
        uint256 unbondingTime;
    }

    // Storage mappings
    mapping(address => Validator) public validators;
    mapping(address => mapping(address => Delegation)) public delegations; // delegator => validator => delegation
    mapping(address => address[]) public delegatorValidators; // delegator => validator addresses
    mapping(address => UnbondingEntry[]) public unbondingEntries;
    mapping(address => uint256) public userRewardDebt;
    
    address[] public validatorList;
    uint256 public activeValidatorCount;

    // Events
    event TokensStaked(address indexed staker, address indexed validator, uint256 amount);
    event TokensUnstaked(address indexed staker, address indexed validator, uint256 amount);
    event TokensDelegated(address indexed delegator, address indexed validator, uint256 amount);
    event TokensUndelegated(address indexed delegator, address indexed validator, uint256 amount);
    event RewardsClaimed(address indexed claimer, uint256 amount);
    event ValidatorAdded(address indexed validator, string moniker);
    event ValidatorRemoved(address indexed validator);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event ValidatorJailed(address indexed validator, uint256 jailUntil);
    event DelegationAdded(address indexed delegator, address indexed validator, uint256 amount);
    event DelegationRemoved(address indexed delegator, address indexed validator, uint256 amount);
    event RewardsDistributed(uint256 totalAmount, uint256 timestamp);
    event UnbondingStarted(address indexed user, address indexed validator, uint256 amount, uint256 unbondingTime);

    modifier onlyActiveValidator(address validatorAddr) {
        require(validators[validatorAddr].status == ValidatorStatus.ACTIVE, "Staking: validator not active");
        _;
    }

    modifier validValidatorAddress(address validatorAddr) {
        require(validatorAddr != address(0), "Staking: invalid validator address");
        require(validators[validatorAddr].validatorAddress != address(0), "Staking: validator does not exist");
        _;
    }

    constructor(address payable _solarToken) {
        require(_solarToken != address(0), "Staking: invalid token address");
        
        solarToken = SolarToken(_solarToken);
        lastRewardDistribution = block.timestamp;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_MANAGER_ROLE, msg.sender);
        _grantRole(SLASHER_ROLE, msg.sender);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Add a new validator
     */
    function addValidator(
        address validatorAddr,
        uint256 commissionRate,
        string calldata moniker,
        string calldata website,
        string calldata details
    ) external onlyRole(VALIDATOR_MANAGER_ROLE) {
        require(validatorAddr != address(0), "Staking: invalid validator address");
        require(validators[validatorAddr].validatorAddress == address(0), "Staking: validator already exists");
        require(commissionRate <= MAX_COMMISSION_RATE, "Staking: commission rate too high");
        require(validatorList.length < maximumValidators, "Staking: maximum validators reached");

        validators[validatorAddr] = Validator({
            validatorAddress: validatorAddr,
            stakedAmount: 0,
            delegatedAmount: 0,
            totalStake: 0,
            commissionRate: commissionRate,
            rewardDebt: 0,
            status: ValidatorStatus.INACTIVE,
            jailUntil: 0,
            slashCount: 0,
            moniker: moniker,
            website: website,
            details: details
        });

        validatorList.push(validatorAddr);
        emit ValidatorAdded(validatorAddr, moniker);
    }

    /**
     * @dev Stake tokens to become or support a validator
     */
    function stake(address validatorAddr, uint256 amount) external whenNotPaused nonReentrant validValidatorAddress(validatorAddr) {
        require(amount >= minimumStake, "Staking: amount below minimum stake");
        require(solarToken.balanceOf(msg.sender) >= amount, "Staking: insufficient balance");

        _updateRewards();

        Validator storage validator = validators[validatorAddr];
        
        // Transfer tokens to this contract
        solarToken.transferFrom(msg.sender, address(this), amount);

        if (msg.sender == validatorAddr) {
            // Self-staking by validator
            validator.stakedAmount += amount;
            
            // Activate validator if minimum stake is met
            if (validator.stakedAmount >= minimumStake && validator.status == ValidatorStatus.INACTIVE) {
                validator.status = ValidatorStatus.ACTIVE;
                activeValidatorCount++;
            }
        } else {
            // Delegation to validator
            require(validator.status == ValidatorStatus.ACTIVE, "Staking: validator not active");
            
            Delegation storage delegation = delegations[msg.sender][validatorAddr];
            if (delegation.validator == address(0)) {
                delegation.validator = validatorAddr;
                delegatorValidators[msg.sender].push(validatorAddr);
            }
            
            delegation.amount += amount;
            validator.delegatedAmount += amount;
            
            emit TokensDelegated(msg.sender, validatorAddr, amount);
        }

        validator.totalStake = validator.stakedAmount + validator.delegatedAmount;
        totalStaked += amount;
        
        // Update reward debt
        validator.rewardDebt = (validator.totalStake * accumulatedRewardPerShare) / PRECISION;
        if (msg.sender != validatorAddr) {
            delegations[msg.sender][validatorAddr].rewardDebt = 
                (delegations[msg.sender][validatorAddr].amount * accumulatedRewardPerShare) / PRECISION;
        }

        emit TokensStaked(msg.sender, validatorAddr, amount);
    }

    /**
     * @dev Start unstaking process
     */
    function unstake(address validatorAddr, uint256 amount) external nonReentrant validValidatorAddress(validatorAddr) {
        require(amount > 0, "Staking: amount must be positive");

        _updateRewards();
        _claimRewards(msg.sender, validatorAddr);

        Validator storage validator = validators[validatorAddr];
        
        if (msg.sender == validatorAddr) {
            // Validator unstaking their own tokens
            require(validator.stakedAmount >= amount, "Staking: insufficient staked amount");
            
            validator.stakedAmount -= amount;
            
            // Deactivate validator if below minimum stake
            if (validator.stakedAmount < minimumStake && validator.status == ValidatorStatus.ACTIVE) {
                validator.status = ValidatorStatus.INACTIVE;
                activeValidatorCount--;
            }
        } else {
            // Delegator unstaking
            Delegation storage delegation = delegations[msg.sender][validatorAddr];
            require(delegation.amount >= amount, "Staking: insufficient delegated amount");
            
            delegation.amount -= amount;
            validator.delegatedAmount -= amount;
            
            emit TokensUndelegated(msg.sender, validatorAddr, amount);
        }

        validator.totalStake = validator.stakedAmount + validator.delegatedAmount;
        totalStaked -= amount;

        // Add to unbonding entries
        unbondingEntries[msg.sender].push(UnbondingEntry({
            amount: amount,
            unbondingTime: block.timestamp + unbondingPeriod
        }));

        emit UnbondingStarted(msg.sender, validatorAddr, amount, block.timestamp + unbondingPeriod);
        emit TokensUnstaked(msg.sender, validatorAddr, amount);
    }

    /**
     * @dev Withdraw unbonded tokens
     */
    function withdrawUnbonded() external nonReentrant {
        UnbondingEntry[] storage entries = unbondingEntries[msg.sender];
        uint256 totalWithdrawable = 0;
        uint256 i = 0;

        while (i < entries.length) {
            if (entries[i].unbondingTime <= block.timestamp) {
                totalWithdrawable += entries[i].amount;
                // Remove this entry by swapping with last element
                entries[i] = entries[entries.length - 1];
                entries.pop();
            } else {
                i++;
            }
        }

        require(totalWithdrawable > 0, "Staking: no unbonded tokens available");
        solarToken.transfer(msg.sender, totalWithdrawable);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards(address validatorAddr) external nonReentrant validValidatorAddress(validatorAddr) {
        _updateRewards();
        uint256 rewards = _claimRewards(msg.sender, validatorAddr);
        require(rewards > 0, "Staking: no rewards to claim");
    }

    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user, address validatorAddr) internal returns (uint256) {
        Validator storage validator = validators[validatorAddr];
        uint256 totalRewards = 0;

        if (user == validatorAddr) {
            // Validator claiming their own rewards
            uint256 validatorRewards = (validator.totalStake * accumulatedRewardPerShare) / PRECISION - validator.rewardDebt;
            if (validatorRewards > 0) {
                // Calculate commission
                uint256 delegatorRewards = (validator.delegatedAmount * accumulatedRewardPerShare) / PRECISION;
                uint256 commission = (delegatorRewards * validator.commissionRate) / 10000;
                
                totalRewards = validatorRewards + commission;
                validator.rewardDebt = (validator.totalStake * accumulatedRewardPerShare) / PRECISION;
            }
        } else {
            // Delegator claiming rewards
            Delegation storage delegation = delegations[user][validatorAddr];
            if (delegation.amount > 0) {
                uint256 delegatorRewards = (delegation.amount * accumulatedRewardPerShare) / PRECISION - delegation.rewardDebt;
                if (delegatorRewards > 0) {
                    // Subtract validator commission
                    uint256 commission = (delegatorRewards * validator.commissionRate) / 10000;
                    totalRewards = delegatorRewards - commission;
                    delegation.rewardDebt = (delegation.amount * accumulatedRewardPerShare) / PRECISION;
                }
            }
        }

        if (totalRewards > 0) {
            require(rewardPool >= totalRewards, "Staking: insufficient reward pool");
            rewardPool -= totalRewards;
            solarToken.transfer(user, totalRewards);
            emit RewardsClaimed(user, totalRewards);
        }

        return totalRewards;
    }

    /**
     * @dev Distribute rewards to all validators
     */
    function distributeRewards(uint256 amount) external onlyRole(REWARD_DISTRIBUTOR_ROLE) {
        require(amount > 0, "Staking: amount must be positive");
        require(totalStaked > 0, "Staking: no tokens staked");

        solarToken.transferFrom(msg.sender, address(this), amount);
        rewardPool += amount;

        _updateRewards();
        accumulatedRewardPerShare += (amount * PRECISION) / totalStaked;
        lastRewardDistribution = block.timestamp;

        emit RewardsDistributed(amount, block.timestamp);
    }

    /**
     * @dev Slash a validator for malicious behavior
     */
    function slash(address validatorAddr, uint256 slashAmount, string calldata reason) external onlyRole(SLASHER_ROLE) validValidatorAddress(validatorAddr) {
        Validator storage validator = validators[validatorAddr];
        require(validator.totalStake >= slashAmount, "Staking: insufficient stake to slash");

        // Update rewards before slashing
        _updateRewards();

        // Calculate slash amounts proportionally
        uint256 validatorSlash = (slashAmount * validator.stakedAmount) / validator.totalStake;
        uint256 delegatorSlash = slashAmount - validatorSlash;

        validator.stakedAmount -= validatorSlash;
        validator.delegatedAmount -= delegatorSlash;
        validator.totalStake = validator.stakedAmount + validator.delegatedAmount;
        validator.slashCount++;

        totalStaked -= slashAmount;

        // Jail validator
        validator.status = ValidatorStatus.JAILED;
        validator.jailUntil = block.timestamp + (unbondingPeriod * 2); // Jail for 2x unbonding period
        
        if (validator.status == ValidatorStatus.ACTIVE) {
            activeValidatorCount--;
        }

        // Add slashed tokens to reward pool
        rewardPool += slashAmount;

        emit ValidatorSlashed(validatorAddr, slashAmount, reason);
        emit ValidatorJailed(validatorAddr, validator.jailUntil);
    }

    /**
     * @dev Unjail a validator
     */
    function unjailValidator(address validatorAddr) external validValidatorAddress(validatorAddr) {
        Validator storage validator = validators[validatorAddr];
        require(validator.status == ValidatorStatus.JAILED, "Staking: validator not jailed");
        require(block.timestamp >= validator.jailUntil, "Staking: jail period not ended");
        require(msg.sender == validatorAddr || hasRole(VALIDATOR_MANAGER_ROLE, msg.sender), "Staking: unauthorized");

        if (validator.stakedAmount >= minimumStake) {
            validator.status = ValidatorStatus.ACTIVE;
            activeValidatorCount++;
        } else {
            validator.status = ValidatorStatus.INACTIVE;
        }
    }

    /**
     * @dev Update reward calculations
     */
    function _updateRewards() internal {
        if (totalStaked == 0) {
            lastRewardDistribution = block.timestamp;
            return;
        }

        // Auto-generate rewards based on time passed and reward rate
        uint256 timePassed = block.timestamp - lastRewardDistribution;
        if (timePassed > 0) {
            uint256 autoRewards = (totalStaked * rewardRate * timePassed) / (365 days * 10000);
            
            if (autoRewards > 0) {
                // Mint new tokens as rewards
                try solarToken.mint(address(this), autoRewards) {
                    rewardPool += autoRewards;
                    accumulatedRewardPerShare += (autoRewards * PRECISION) / totalStaked;
                } catch {
                    // If minting fails, continue without auto rewards
                }
            }
            
            lastRewardDistribution = block.timestamp;
        }
    }

    /**
     * @dev Get validator information
     */
    function getValidator(address validatorAddr) external view returns (Validator memory) {
        return validators[validatorAddr];
    }

    /**
     * @dev Get all active validators
     */
    function getActiveValidators() external view returns (address[] memory) {
        address[] memory activeValidators = new address[](activeValidatorCount);
        uint256 count = 0;

        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].status == ValidatorStatus.ACTIVE) {
                activeValidators[count] = validatorList[i];
                count++;
            }
        }

        return activeValidators;
    }

    /**
     * @dev Get user's delegations
     */
    function getUserDelegations(address user) external view returns (address[] memory) {
        return delegatorValidators[user];
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function calculatePendingRewards(address user, address validatorAddr) external view returns (uint256) {
        Validator memory validator = validators[validatorAddr];
        
        if (user == validatorAddr) {
            // Validator rewards + commission
            uint256 validatorRewards = (validator.totalStake * accumulatedRewardPerShare) / PRECISION - validator.rewardDebt;
            uint256 delegatorRewards = (validator.delegatedAmount * accumulatedRewardPerShare) / PRECISION;
            uint256 commission = (delegatorRewards * validator.commissionRate) / 10000;
            return validatorRewards + commission;
        } else {
            // Delegator rewards - commission
            Delegation memory delegation = delegations[user][validatorAddr];
            if (delegation.amount == 0) return 0;
            
            uint256 delegatorRewards = (delegation.amount * accumulatedRewardPerShare) / PRECISION - delegation.rewardDebt;
            uint256 commission = (delegatorRewards * validator.commissionRate) / 10000;
            return delegatorRewards - commission;
        }
    }

    /**
     * @dev Get unbonding entries for a user
     */
    function getUnbondingEntries(address user) external view returns (UnbondingEntry[] memory) {
        return unbondingEntries[user];
    }

    /**
     * @dev Set staking parameters (admin only)
     */
    function setStakingParameters(
        uint256 _minimumStake,
        uint256 _unbondingPeriod,
        uint256 _slashingRate,
        uint256 _rewardRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_minimumStake > 0, "Staking: invalid minimum stake");
        require(_slashingRate <= 5000, "Staking: slashing rate too high"); // Max 50%
        require(_rewardRate <= 5000, "Staking: reward rate too high"); // Max 50%

        minimumStake = _minimumStake;
        unbondingPeriod = _unbondingPeriod;
        slashingRate = _slashingRate;
        rewardRate = _rewardRate;
    }

    /**
     * @dev Pause staking operations
     */
    function pauseStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Resume staking operations
     */
    function resumeStaking() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get staking statistics
     */
    function getStakingStats() external view returns (
        uint256 _totalStaked,
        uint256 _rewardPool,
        uint256 _activeValidators,
        uint256 _totalValidators
    ) {
        return (totalStaked, rewardPool, activeValidatorCount, validatorList.length);
    }
}
