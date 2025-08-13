// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SolarToken.sol";

/**
 * @title SolChainGovernance  
 * @dev Simplified DAO governance for SolChain protocol decisions
 * @author Team GreyDevs
 */
contract SolChainGovernance is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    SolarToken public immutable governanceToken;
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public executionDelay = 2 days;
    uint256 public proposalThreshold = 1000 * 10**18; // 1000 SOLAR
    uint256 public quorumVotes = 4; // 4% of total supply

    enum ProposalState { 
        PENDING, 
        ACTIVE, 
        CANCELED, 
        DEFEATED, 
        SUCCEEDED, 
        QUEUED, 
        EXPIRED, 
        EXECUTED 
    }

    enum ProposalCategory { 
        PARAMETER_CHANGE, 
        TREASURY_SPEND, 
        EMERGENCY_ACTION, 
        VALIDATOR_MANAGEMENT, 
        PROTOCOL_UPGRADE 
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalCategory category;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
        mapping(address => uint8) votes; // 0 = against, 1 = for, 2 = abstain
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public latestProposalIds;
    
    address public treasury;

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, ProposalCategory category);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, string reason);
    event ProposalQueued(uint256 indexed proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);

    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "SolChainGovernance: invalid proposal");
        _;
    }

    constructor(
        address payable _governanceToken,
        address _treasury
    ) {
        require(_governanceToken != address(0), "SolChainGovernance: invalid token address");
        require(_treasury != address(0), "SolChainGovernance: invalid treasury address");
        
        governanceToken = SolarToken(payable(_governanceToken));
        treasury = _treasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Create a new proposal
     */
    function propose(
        string memory title,
        string memory description,
        ProposalCategory category
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        require(bytes(title).length > 0, "SolChainGovernance: title cannot be empty");
        require(bytes(description).length > 0, "SolChainGovernance: description cannot be empty");
        
        // Check proposer has enough tokens
        uint256 proposerVotes = governanceToken.getVotes(msg.sender);
        require(proposerVotes >= proposalThreshold, "SolChainGovernance: proposer votes below threshold");

        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.category = category;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.executionTime = 0;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.abstainVotes = 0;
        proposal.executed = false;
        proposal.canceled = false;

        latestProposalIds[msg.sender] = proposalId;

        emit ProposalCreated(proposalId, msg.sender, title, category);
        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     */
    function castVote(uint256 proposalId, uint8 support) external validProposal(proposalId) {
        _castVote(proposalId, msg.sender, support, "");
    }

    /**
     * @dev Cast a vote with reason
     */
    function castVoteWithReason(
        uint256 proposalId, 
        uint8 support, 
        string calldata reason
    ) external validProposal(proposalId) {
        _castVote(proposalId, msg.sender, support, reason);
    }

    /**
     * @dev Internal function to cast vote
     */
    function _castVote(
        uint256 proposalId,
        address voter,
        uint8 support,
        string memory reason
    ) internal {
        require(support <= 2, "SolChainGovernance: invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        require(getProposalState(proposalId) == ProposalState.ACTIVE, "SolChainGovernance: voting is closed");
        require(!proposal.hasVoted[voter], "SolChainGovernance: voter already voted");

        uint256 weight = governanceToken.getPastVotes(voter, proposal.startTime);
        require(weight > 0, "SolChainGovernance: voter has no voting power");

        proposal.hasVoted[voter] = true;
        proposal.votes[voter] = support;

        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(voter, proposalId, support, weight, reason);
    }

    /**
     * @dev Queue a successful proposal for execution
     */
    function queue(uint256 proposalId) external validProposal(proposalId) {
        require(getProposalState(proposalId) == ProposalState.SUCCEEDED, "SolChainGovernance: proposal not succeeded");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executionTime = block.timestamp + executionDelay;
        
        emit ProposalQueued(proposalId, proposal.executionTime);
    }

    /**
     * @dev Execute a queued proposal
     */
    function execute(uint256 proposalId) external payable validProposal(proposalId) onlyRole(EXECUTOR_ROLE) {
        require(getProposalState(proposalId) == ProposalState.QUEUED, "SolChainGovernance: proposal not queued");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.executionTime, "SolChainGovernance: proposal not ready for execution");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal
     */
    function cancel(uint256 proposalId) external validProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "SolChainGovernance: unauthorized"
        );
        require(getProposalState(proposalId) != ProposalState.EXECUTED, "SolChainGovernance: cannot cancel executed proposal");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Get proposal state
     */
    function getProposalState(uint256 proposalId) public view validProposal(proposalId) returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.CANCELED;
        } else if (proposal.executed) {
            return ProposalState.EXECUTED;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.ACTIVE;
        } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumReached(proposalId)) {
            return ProposalState.DEFEATED;
        } else if (proposal.executionTime == 0) {
            return ProposalState.SUCCEEDED;
        } else if (block.timestamp >= proposal.executionTime) {
            return ProposalState.QUEUED;
        } else {
            return ProposalState.PENDING;
        }
    }

    /**
     * @dev Check if quorum is reached for a proposal
     */
    function quorumReached(uint256 proposalId) public view validProposal(proposalId) returns (uint256) {
        uint256 totalSupply = governanceToken.getPastTotalSupply(proposals[proposalId].startTime);
        return (totalSupply * quorumVotes) / 100;
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view validProposal(proposalId) returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        ProposalCategory category,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.category,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    /**
     * @dev Update governance parameters
     */
    function updateVotingPeriod(uint256 newVotingPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVotingPeriod >= 1 days && newVotingPeriod <= 30 days, "SolChainGovernance: invalid voting period");
        votingPeriod = newVotingPeriod;
    }

    function updateExecutionDelay(uint256 newExecutionDelay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newExecutionDelay >= 1 hours && newExecutionDelay <= 30 days, "SolChainGovernance: invalid execution delay");
        executionDelay = newExecutionDelay;
    }

    function updateProposalThreshold(uint256 newProposalThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newProposalThreshold >= 100 * 10**18, "SolChainGovernance: threshold too low");
        proposalThreshold = newProposalThreshold;
    }

    function updateQuorumVotes(uint256 newQuorumVotes) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newQuorumVotes >= 1 && newQuorumVotes <= 20, "SolChainGovernance: invalid quorum percentage");
        quorumVotes = newQuorumVotes;
    }

    /**
     * @dev Pause governance
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause governance
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
