// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SolarToken.sol";
import "./EnergyTrading.sol";

contract SmartGrid {
    struct User {
        address userAddress;
        uint256 solarTokenBalance;
        uint256 energyProduced;
        uint256 energyConsumed;
    }

    mapping(address => User) public users;
    SolarToken public solarToken;
    EnergyTrading public energyTrading;

    event UserRegistered(address indexed user);
    event EnergyProduced(address indexed user, uint256 amount);
    event EnergyConsumed(address indexed user, uint256 amount);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);

    constructor(address _solarTokenAddress, address _energyTradingAddress) {
        solarToken = SolarToken(_solarTokenAddress);
        energyTrading = EnergyTrading(_energyTradingAddress);
    }

    function registerUser() external {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        users[msg.sender] = User(msg.sender, 0, 0, 0);
        emit UserRegistered(msg.sender);
    }

    function produceEnergy(uint256 amount) external {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        users[msg.sender].energyProduced += amount;
        emit EnergyProduced(msg.sender, amount);
    }

    function consumeEnergy(uint256 amount) external {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        users[msg.sender].energyConsumed += amount;
        emit EnergyConsumed(msg.sender, amount);
    }

    function transferTokens(address to, uint256 amount) external {
        require(users[msg.sender].solarTokenBalance >= amount, "Insufficient token balance");
        solarToken.transfer(to, amount);
        users[msg.sender].solarTokenBalance -= amount;
        emit TokensTransferred(msg.sender, to, amount);
    }

    function updateTokenBalance(address user, uint256 amount) external {
        require(msg.sender == address(solarToken), "Only SolarToken contract can update balance");
        users[user].solarTokenBalance += amount;
    }
}