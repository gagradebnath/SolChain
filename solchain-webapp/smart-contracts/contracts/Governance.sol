// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Governance {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        mapping(address => bool) voters;
        bool executed;
    }

    mapping(uint => Proposal) public proposals;
    uint public proposalCount;
    address public owner;

    event ProposalCreated(uint id, string description);
    event Voted(uint proposalId, address voter);
    event ProposalExecuted(uint proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string memory _description) public onlyOwner {
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.description = _description;
        newProposal.voteCount = 0;
        newProposal.executed = false;

        emit ProposalCreated(proposalCount, _description);
    }

    function vote(uint _proposalId) public {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.voters[msg.sender], "You have already voted");
        require(!proposal.executed, "Proposal has already been executed");

        proposal.voters[msg.sender] = true;
        proposal.voteCount++;

        emit Voted(_proposalId, msg.sender);
    }

    function executeProposal(uint _proposalId) public onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.voteCount > 0, "No votes for this proposal");
        require(!proposal.executed, "Proposal has already been executed");

        proposal.executed = true;

        emit ProposalExecuted(_proposalId);
    }
}