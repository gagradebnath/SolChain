// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SolChainGovernance
 * @dev DAO governance contract for SolChain protocol
 * 
 * Features:
 * - Proposal creation and voting
 * - Quorum-based decision making
 * - Emergency pause mechanisms
 * - Protocol parameter updates
 * 
 * @author Team GreyDevs
 */
contract SolChainGovernance is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    AccessControl,
    ReentrancyGuard
{
    // Roles
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    // Governance parameters
    struct GovernanceConfig {
        uint256 votingDelay;      // Delay before voting starts
        uint256 votingPeriod;     // Duration of voting
        uint256 proposalThreshold; // Minimum tokens to create proposal
        uint256 quorumPercentage; // Percentage for quorum
    }

    GovernanceConfig public config;
    
    // Emergency state
    bool public emergencyPaused;
    mapping(address => bool) public emergencyExecutors;
    
    // Statistics
    uint256 public totalProposals;
    uint256 public executedProposals;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description
    );
    event EmergencyPauseToggled(bool paused, address indexed executor);
    event EmergencyExecutorUpdated(address indexed executor, bool status);
    event GovernanceConfigUpdated(address indexed admin);

    // Errors
    error EmergencyPaused();
    error NotEmergencyExecutor(address account);
    error InvalidConfiguration(string parameter);

    /**
     * @dev Constructor
     */
    constructor(
        IVotes _token,
        GovernanceConfig memory _config
    )
        Governor("SolChainGovernance")
        GovernorSettings(uint48(_config.votingDelay), uint32(_config.votingPeriod), _config.proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_config.quorumPercentage)
    {
        config = _config;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        
        emergencyExecutors[msg.sender] = true;
    }

    /**
     * @dev Create a proposal (restricted during emergency)
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        if (emergencyPaused) revert EmergencyPaused();
        
        uint256 proposalId = super.propose(targets, values, calldatas, description);
        totalProposals++;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }

    /**
     * @dev Emergency pause governance
     */
    function emergencyPause() external {
        if (!emergencyExecutors[msg.sender]) revert NotEmergencyExecutor(msg.sender);
        
        emergencyPaused = true;
        emit EmergencyPauseToggled(true, msg.sender);
    }

    /**
     * @dev Resume governance from emergency pause
     */
    function emergencyResume() external onlyRole(EMERGENCY_ROLE) {
        emergencyPaused = false;
        emit EmergencyPauseToggled(false, msg.sender);
    }

    /**
     * @dev Update emergency executor status
     */
    function setEmergencyExecutor(address _executor, bool _status) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        emergencyExecutors[_executor] = _status;
        emit EmergencyExecutorUpdated(_executor, _status);
    }

    /**
     * @dev Update governance configuration
     */
    function updateGovernanceConfig(GovernanceConfig memory _newConfig) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (_newConfig.votingDelay == 0) revert InvalidConfiguration("voting delay");
        if (_newConfig.votingPeriod == 0) revert InvalidConfiguration("voting period");
        if (_newConfig.quorumPercentage == 0 || _newConfig.quorumPercentage > 100) {
            revert InvalidConfiguration("quorum percentage");
        }
        
        config = _newConfig;
        emit GovernanceConfigUpdated(msg.sender);
    }

    // Override required functions

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
        executedProposals++;
    }

    /**
     * @dev Support required interfaces
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Get governance statistics
     */
    function getGovernanceStats() external view returns (
        uint256 total,
        uint256 executed,
        bool isPaused
    ) {
        return (
            totalProposals,
            executedProposals,
            emergencyPaused
        );
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
