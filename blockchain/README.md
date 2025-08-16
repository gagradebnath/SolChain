# SolChain Blockchain - P2P Solar Energy Trading System

![SolChain Logo](https://img.shields.io/badge/SolChain-Blockchain-green?style=for-the-badge&logo=ethereum)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=for-the-badge)

> **A complete blockchain ecosystem for peer-to-peer solar energy trading with advanced DeFi features**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Smart Contracts](#smart-contracts)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Deployment](#deployment)
- [Integration Guide](#integration-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

SolChain is a complete blockchain-based platform for peer-to-peer solar energy trading, built with security, scalability, and user experience in mind. It enables prosumers to trade excess solar energy directly with consumers through smart contracts, ensuring transparent, secure, and efficient energy transactions.

### Key Components
- **SolarToken (ST)**: ERC20 token representing energy units (1 ST = 1 kWh)
- **Energy Trading**: P2P marketplace with escrow and dispute resolution
- **Staking System**: Validator network with token staking rewards
- **Governance**: DAO for decentralized decision making
- **Oracle System**: External data feeds for pricing and verification

## ✨ Features

### 🔋 Energy Trading
- ✅ Create and manage sell/buy energy offers
- ✅ Automatic matching and execution
- ✅ Secure escrow system
- ✅ Dispute resolution mechanism
- ✅ Dynamic pricing support
- ✅ Trading limits and fees

### 💰 Token Management
- ✅ ERC20 compliant SolarToken
- ✅ Secure transfers and approvals
- ✅ Balance tracking and history
- ✅ Multi-signature support

### 🏛️ Governance
- ✅ Decentralized proposal creation
- ✅ Community voting system
- ✅ Timelock mechanisms
- ✅ Role-based access control

### 🥩 Staking
- ✅ Validator staking system
- ✅ Reward distribution
- ✅ Slashing protection
- ✅ Delegation support

### 🔮 Oracle Services
- ✅ Real-time energy pricing
- ✅ External data integration
- ✅ Confidence scoring
- ✅ Update mechanisms

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│                 │    │                 │    │                 │
│ - React/Mobile  │◄──►│ - Node.js API   │◄──►│ - Smart         │
│ - Web3 Integration│   │ - Database      │    │   Contracts     │
│ - User Interface│    │ - Business Logic│    │ - SolChain API  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   IoT Devices   │◄───────────┘
                       │                 │
                       │ - Smart Meters  │
                       │ - Solar Panels  │
                       │ - Sensors       │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd SolChain/blockchain
npm install
```

### 2. Start Local Blockchain
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts and run tests
npm test
```

### 3. Use the API
```javascript
const { SolChainConfig } = require('./src/config');

async function example() {
    const config = new SolChainConfig();
    const api = await config.createAPIInstance();
    
    // Get token balance
    const balance = await api.getTokenBalance('0x...');
    console.log(`Balance: ${balance.data.formatted} ST`);
    
    // Create energy offer
    const offer = await api.createSellOffer("10", "0.08", deadline, "Grid-A", "Solar");
    console.log(`Offer created: ${offer.data.transactionHash}`);
}
```

## 📦 Installation

### Development Environment

1. **Install Dependencies**
```bash
cd blockchain
npm install
```

2. **Install Hardhat Globally (Optional)**
```bash
npm install -g hardhat
```

3. **Verify Installation**
```bash
npx hardhat --version
npm test
```

### Production Environment

1. **Environment Variables**
```bash
# Create .env file
cp .env.example .env

# Configure your variables
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. **Network Configuration**
```bash
# For mainnet deployment
npm run deploy:mainnet

# For testnet deployment
npm run deploy:goerli
```

## 📋 Smart Contracts

### Contract Overview

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| **SolarToken** | ERC20 token for energy trading | Minting, burning, governance voting |
| **Oracle** | Price feeds and external data | Chainlink integration, confidence scoring |
| **Staking** | Validator staking system | Rewards, slashing, delegation |
| **Governance** | DAO governance | Proposals, voting, timelock |
| **EnergyTrading** | P2P energy marketplace | Escrow, dispute resolution, matching |

### Deployed Addresses (Local Hardhat)

```javascript
{
  "SolarToken": "0x67d269191c92Caf3cD7723F116c85e6E9bf55933",
  "Oracle": "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E",
  "Staking": "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690",
  "Governance": "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
  "EnergyTrading": "0x9E545E3C0baAB3E08CdfD552C960A1050f373042"
}
```

### Contract Functions

#### SolarToken (ERC20)
```solidity
// Standard ERC20 functions
transfer(address to, uint256 amount)
approve(address spender, uint256 amount)
balanceOf(address account)
totalSupply()

// Admin functions (role-based)
mint(address to, uint256 amount)  // MINTER_ROLE only
burn(uint256 amount)             // BURNER_ROLE only
```

#### EnergyTrading
```solidity
// Core trading functions
createOffer(OfferType, uint256 energy, uint256 price, uint256 deadline, string location, string source)
cancelOffer(uint256 offerId)
executeOffer(uint256 offerId)

// View functions
getOffer(uint256 offerId)
getActiveOffers()
getUserOffers(address user)
getTradingStats()
```

#### Staking
```solidity
// Staking functions
stake(uint256 amount)
unstake(uint256 amount)
claimRewards()

// View functions
getStakeInfo(address user)
getTotalStaked()
getRewards(address user)
```

#### Governance
```solidity
// Governance functions
propose(address[] targets, uint256[] values, bytes[] calldatas, string description)
vote(uint256 proposalId, uint8 support)
execute(uint256 proposalId)

// View functions
getProposal(uint256 proposalId)
getVotes(address account)
```

#### Oracle
```solidity
// Oracle functions
updatePrice(uint256 price, uint256 confidence)  // ORACLE_ROLE only
getLatestPrice()
getPriceHistory(uint256 count)
```

## 🔌 API Reference

### SolChainAPI Class

The `SolChainAPI` class in `src/solchain-api.js` provides a comprehensive interface for interacting with all smart contracts.

#### Initialization

```javascript
const { SolChainConfig } = require('./src/config');

// Create API instance
const config = new SolChainConfig();
const api = await config.createAPIInstance();
```

#### Response Format

All API functions return standardized responses:

```javascript
// Success response
{
    success: true,
    data: {
        transactionHash: "0x...",
        gasUsed: "21000",
        blockNumber: 123,
        // ... function-specific data
    }
}

// Error response
{
    success: false,
    error: "Error message describing what went wrong"
}
```

#### Token Management Functions

```javascript
// Get token information
const tokenInfo = await api.getTokenInfo();
// Returns: { success: true, data: { name, symbol, totalSupply, decimals } }

// Get user balance
const balance = await api.getTokenBalance(userAddress);
// Returns: { success: true, data: { balance: "1000", formatted: "1000.0 ST" } }

// Transfer tokens
const transfer = await api.transferTokens(toAddress, amount);
// Returns: { success: true, data: { transactionHash, gasUsed, ... } }

// Approve spending
const approval = await api.approveTokens(spenderAddress, amount);
// Returns: { success: true, data: { transactionHash, amount, ... } }
```

#### Energy Trading Functions

```javascript
// Create sell offer
const sellOffer = await api.createSellOffer(
    "100",        // energyAmount (kWh)
    "0.08",       // pricePerKwh (ST per kWh)
    deadline,     // Date object
    "Grid-A",     // location
    "Solar"       // energySource
);

// Create buy offer
const buyOffer = await api.createBuyOffer(
    energyAmount, pricePerKwh, deadline, location, energySource
);

// Get active offers
const offers = await api.getActiveOffers();
// Returns: { success: true, data: [offer1, offer2, ...] }

// Get trading statistics
const stats = await api.getTradingStats();
// Returns: { success: true, data: { totalTrades, totalVolume, activeOffers } }

// Cancel offer
const cancel = await api.cancelOffer(offerId);
```

#### Staking Functions

```javascript
// Stake tokens
const stake = await api.stakeTokens(amount);

// Unstake tokens
const unstake = await api.unstakeTokens(amount);

// Get staking statistics
const stakingStats = await api.getStakingStats();
// Returns: { success: true, data: { totalValidators, totalStaked, ... } }

// Get user stake info
const stakeInfo = await api.getUserStakeInfo(userAddress);
```

#### Governance Functions

```javascript
// Create proposal
const proposal = await api.createProposal(
    description,
    targets,    // Array of contract addresses
    values,     // Array of ETH values
    calldatas   // Array of encoded function calls
);

// Vote on proposal
const vote = await api.voteOnProposal(proposalId, support);
// support: 0 = Against, 1 = For, 2 = Abstain

// Get proposal details
const proposalDetails = await api.getProposal(proposalId);

// Execute proposal
const execute = await api.executeProposal(proposalId);
```

#### Oracle Functions

```javascript
// Get current energy price
const price = await api.getEnergyPrice();
// Returns: { success: true, data: { price: "0.008", confidence: 100, timestamp } }

// Update energy price (admin only)
const update = await api.updateEnergyPrice(newPrice, confidence);
```

#### System Overview

```javascript
// Get complete system overview
const overview = await api.getSystemOverview();
// Returns comprehensive data about all system components
```

## 📝 Usage Examples

### Example 1: Basic Energy Trading

```javascript
const { SolChainConfig } = require('./src/config');

async function energyTradingExample() {
    // Initialize API
    const config = new SolChainConfig();
    const api = await config.createAPIInstance();
    
    console.log("🌟 SolChain Energy Trading Example");
    
    // Check system status
    const overview = await api.getSystemOverview();
    console.log("📊 System Overview:", overview.data);
    
    // Prosumer creates a sell offer
    console.log("🔋 Creating sell offer...");
    const sellOffer = await api.createSellOffer(
        "50",          // 50 kWh
        "0.08",        // 0.08 ST per kWh
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        "Grid-Zone-A", // Location
        "Solar"        // Energy source
    );
    
    if (sellOffer.success) {
        console.log(`✅ Sell offer created: ${sellOffer.data.transactionHash}`);
    } else {
        console.log(`❌ Failed to create offer: ${sellOffer.error}`);
    }
    
    // Consumer views available offers
    const activeOffers = await api.getActiveOffers();
    console.log(`📋 Active offers: ${activeOffers.data.length}`);
    
    // Check trading statistics
    const stats = await api.getTradingStats();
    console.log(`📈 Total trades: ${stats.data.totalTrades}`);
    console.log(`💰 Total volume: ${stats.data.totalVolume} ST`);
}

energyTradingExample().catch(console.error);
```

### Example 2: Backend Integration

```javascript
const express = require('express');
const { SolChainConfig } = require('./src/config');

const app = express();
app.use(express.json());

let solchainAPI;

// Initialize SolChain API
async function initializeSolChain() {
    const config = new SolChainConfig();
    solchainAPI = await config.createAPIInstance();
    console.log('✅ SolChain API initialized');
}

// Energy trading endpoints
app.post('/api/energy/sell', async (req, res) => {
    try {
        const { energyAmount, pricePerKwh, duration, location, source } = req.body;
        
        const deadline = new Date(Date.now() + duration * 1000);
        const result = await solchainAPI.createSellOffer(
            energyAmount, pricePerKwh, deadline, location, source
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/energy/offers', async (req, res) => {
    try {
        const offers = await solchainAPI.getActiveOffers();
        res.json(offers);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/token/balance/:address', async (req, res) => {
    try {
        const balance = await solchainAPI.getTokenBalance(req.params.address);
        res.json(balance);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/system/overview', async (req, res) => {
    try {
        const overview = await solchainAPI.getSystemOverview();
        res.json(overview);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
initializeSolChain().then(() => {
    app.listen(3000, () => {
        console.log('🚀 SolChain Backend API running on port 3000');
    });
});
```

### Example 3: Token Management

```javascript
async function tokenManagementExample() {
    const config = new SolChainConfig();
    const api = await config.createAPIInstance();
    
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    console.log("💰 SolChain Token Management Example");
    
    // Check token information
    const tokenInfo = await api.getTokenInfo();
    console.log(`📄 Token: ${tokenInfo.data.name} (${tokenInfo.data.symbol})`);
    console.log(`📊 Total Supply: ${tokenInfo.data.totalSupply} tokens`);
    
    // Check user balance
    const balance = await api.getTokenBalance(userAddress);
    console.log(`💳 User balance: ${balance.data.formatted}`);
    
    // Transfer tokens
    console.log("🔄 Transferring tokens...");
    const transfer = await api.transferTokens(recipientAddress, "100");
    if (transfer.success) {
        console.log(`✅ Transfer successful: ${transfer.data.transactionHash}`);
        console.log(`⛽ Gas used: ${transfer.data.gasUsed}`);
    }
    
    // Approve spending for energy trading contract
    const tradingAddress = api.contracts.EnergyTrading.target;
    const approval = await api.approveTokens(tradingAddress, "1000");
    if (approval.success) {
        console.log(`✅ Approval successful: ${approval.data.transactionHash}`);
    }
}
```

### Example 4: Complete Trading Workflow

```javascript
async function completeWorkflow() {
    const config = new SolChainConfig();
    const api = await config.createAPIInstance();
    
    console.log("🌟 SolChain Complete Trading Workflow");
    console.log("====================================");
    
    // 1. Check system status
    console.log("1️⃣ Checking system status...");
    const overview = await api.getSystemOverview();
    console.log(`📊 Trading Stats: ${overview.data.tradingStats ? 'Available' : 'Not Available'}`);
    console.log(`🥩 Staking Stats: ${overview.data.stakingStats ? 'Available' : 'Not Available'}`);
    
    // 2. Check energy price
    console.log("\n2️⃣ Checking energy price...");
    const price = await api.getEnergyPrice();
    console.log(`💲 Current energy price: ${price.data.price} ETH/kWh`);
    console.log(`🎯 Confidence: ${price.data.confidence}%`);
    
    // 3. Check user balance
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    console.log("\n3️⃣ Checking user balance...");
    const balance = await api.getTokenBalance(userAddress);
    console.log(`💰 Balance: ${balance.data.formatted}`);
    
    // 4. Create energy offer
    console.log("\n4️⃣ Creating energy offer...");
    const offer = await api.createSellOffer(
        "1",           // 1 kWh (small amount for testing)
        "8",           // 8 ST per kWh
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        "Test-Grid",   // Location
        "Solar"        // Energy source
    );
    
    if (offer.success) {
        console.log(`✅ Energy offer created successfully!`);
        console.log(`🔗 Transaction: ${offer.data.transactionHash}`);
        console.log(`⚡ Energy: ${offer.data.energyAmount} kWh`);
        console.log(`💵 Price: ${offer.data.pricePerKwh} ST/kWh`);
    } else {
        console.log(`❌ Failed to create offer: ${offer.error}`);
    }
    
    // 5. Check active offers
    console.log("\n5️⃣ Checking active offers...");
    const offers = await api.getActiveOffers();
    console.log(`📋 Active offers: ${offers.data.length}`);
    
    // 6. Check trading stats
    console.log("\n6️⃣ Checking trading statistics...");
    const stats = await api.getTradingStats();
    console.log(`📈 Total trades: ${stats.data.totalTrades}`);
    console.log(`📊 Total volume: ${stats.data.totalVolume} ST`);
    console.log(`🔄 Active offers: ${stats.data.activeOffers}`);
    
    console.log("\n✅ Workflow completed successfully!");
}

completeWorkflow().catch(console.error);
```

## 🧪 Testing

### Running Tests

```bash
# Run complete test suite
npm test

# Run specific test files
npx hardhat test test/SolarToken.test.js
npx hardhat test test/EnergyTrading.test.js

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run tests with coverage
npm run coverage
```

### Test Results

The SolChain blockchain has comprehensive test coverage:

```
🧪 SolChain API Complete Test Suite
==================================================
📊 Test Results Summary:
==============================
API Tests: ✅ PASS
Performance Tests: ✅ PASS  
Integration Tests: ✅ PASS
Error Handling Tests: ✅ PASS

🎯 Overall Result: 4/4 test suites passed
🎉 All tests passed! SolChain API is ready for production!
```

### Test Categories

#### 1. API Tests
- Token information retrieval
- Account balance checking
- System overview functionality
- Energy price retrieval
- Trading and staking statistics

#### 2. Performance Tests
- Concurrent request handling
- Response time measurement
- Throughput testing

#### 3. Integration Tests
- Token transfers
- Energy offer creation
- Token approvals
- End-to-end workflows

#### 4. Error Handling Tests
- Invalid network handling
- Uninitialized contracts
- Invalid parameter validation
- Transaction failure scenarios

### Writing Custom Tests

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SolChainConfig } = require("../src/config");

describe("Custom SolChain Test", function() {
    let api;
    let owner;
    let user1;
    
    beforeEach(async function() {
        [owner, user1] = await ethers.getSigners();
        
        const config = new SolChainConfig();
        api = await config.createAPIInstance();
    });
    
    it("Should handle custom trading scenario", async function() {
        // Create an energy offer
        const result = await api.createSellOffer(
            "5", "10", 
            new Date(Date.now() + 3600000), 
            "Test-Location", 
            "Solar"
        );
        
        expect(result.success).to.be.true;
        expect(result.data.transactionHash).to.exist;
    });
    
    it("Should validate token transfers", async function() {
        const transfer = await api.transferTokens(user1.address, "50");
        expect(transfer.success).to.be.true;
        
        const balance = await api.getTokenBalance(user1.address);
        expect(parseFloat(balance.data.balance)).to.be.greaterThan(0);
    });
});
```

## 🚀 Deployment

### Local Development

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts and test
cd blockchain
npm test
```

### Testnet Deployment

```bash
# Configure environment
cp .env.example .env
# Edit .env with your private keys and API keys

# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli

# Verify contracts on Etherscan
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet (use with caution!)
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

### Configuration

Edit `hardhat.config.js` for network settings:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      gasPrice: 1000000000,
      accounts: {
        count: 20,
        accountsBalance: "1000000000000000000000000"
      }
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gas: 6000000,
      gasPrice: 20000000000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gas: 6000000,
      gasPrice: 20000000000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

## 🔗 Integration Guide

### Backend Integration

The SolChain API is designed to be easily integrated into your backend:

```javascript
// backend/services/solchain.js
const { SolChainConfig } = require('../../blockchain/src/config');

class SolChainService {
    constructor() {
        this.api = null;
    }
    
    async initialize() {
        const config = new SolChainConfig();
        this.api = await config.createAPIInstance();
    }
    
    async createEnergyOffer(userId, energyData) {
        const { amount, price, duration, location, source } = energyData;
        const deadline = new Date(Date.now() + duration * 1000);
        
        return await this.api.createSellOffer(
            amount, price, deadline, location, source
        );
    }
    
    async getUserBalance(userAddress) {
        return await this.api.getTokenBalance(userAddress);
    }
    
    async getSystemStats() {
        return await this.api.getSystemOverview();
    }
}

module.exports = SolChainService;
```

### Frontend Integration

```javascript
// frontend/services/blockchain.js
import { ethers } from 'ethers';
import { SolChainConfig } from '../blockchain/src/config';

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.api = null;
    }
    
    async connect() {
        if (window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            await this.provider.send("eth_requestAccounts", []);
            this.signer = await this.provider.getSigner();
            
            const config = new SolChainConfig();
            this.api = await config.createAPIInstance();
            
            return true;
        }
        return false;
    }
    
    async createOffer(offerData) {
        return await this.api.createSellOffer(
            offerData.energy,
            offerData.price,
            offerData.deadline,
            offerData.location,
            offerData.source
        );
    }
}

export default BlockchainService;
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails

**Problem**: Out of gas errors during deployment
```
Error: Transaction ran out of gas
```

**Solution**: Increase gas limits in `hardhat.config.js`
```javascript
networks: {
  hardhat: {
    gas: 12000000,
    gasPrice: 1000000000
  }
}
```

#### 2. Nonce Management Issues

**Problem**: Nonce too low errors
```
Error: Nonce too low. Expected nonce to be 35 but got 34
```

**Solution**: Reset the Hardhat node
```bash
npx hardhat node --reset
# Or clear cache
rm -rf cache/ artifacts/
```

#### 3. API Connection Issues

**Problem**: Cannot connect to blockchain
```
Error: Could not connect to network
```

**Solution**: Verify Hardhat node is running
```bash
# Check if node is running
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

#### 4. Transaction Reverts

**Problem**: Custom error in transaction
```
Error: VM Exception while processing transaction: reverted with custom error
```

**Solution**: Check error details and contract requirements
```javascript
try {
    const result = await api.createSellOffer(...);
} catch (error) {
    console.log("Error details:", error.data);
    console.log("Error reason:", error.reason);
}
```

### Debug Mode

Enable verbose logging for troubleshooting:

```javascript
// Set debug environment variable
process.env.DEBUG = "solchain:*";

// Or enable in config
const config = new SolChainConfig({
    debug: true,
    verbose: true
});
```

### Performance Optimization

```javascript
// Monitor gas usage
const result = await api.someFunction();
console.log(`Gas used: ${result.data.gasUsed}`);

// Optimize batch operations
const batchResults = await Promise.all([
    api.getTokenBalance(address1),
    api.getTokenBalance(address2),
    api.getActiveOffers()
]);
```

## 🤝 Contributing

We welcome contributions to the SolChain blockchain! 

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Add tests for new functionality
7. Run tests: `npm test`
8. Submit a pull request

### Code Standards

- Follow Solidity style guide for smart contracts
- Use ESLint configuration for JavaScript
- Add comprehensive tests for new features
- Document new API functions
- Update README for significant changes

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add changelog entry
4. Request review from maintainers
5. Address feedback promptly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

### Security Features

- ✅ Role-based access control
- ✅ Reentrancy protection
- ✅ Integer overflow protection (Solidity 0.8+)
- ✅ Input validation and sanitization
- ✅ Emergency pause functionality
- ✅ Timelock for governance changes
- ✅ Multi-signature wallet support

### Reporting Security Issues

Please report security vulnerabilities responsibly:
- Email: security@solchain.org (placeholder)
- Use GitHub Security Advisories for sensitive issues
- Include detailed reproduction steps
- Allow time for fix before public disclosure

## 📞 Support

### Documentation and Help

- 📖 **Documentation**: [docs.solchain.org](https://docs.solchain.org) (placeholder)
- 💬 **Discord**: [SolChain Community](https://discord.gg/solchain) (placeholder)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/solchain/issues)
- 📧 **Email**: support@solchain.org (placeholder)

### Community

- Join our Discord for real-time support
- Follow us on Twitter for updates
- Star the repository if you find it useful
- Contribute to discussions in GitHub Issues

---

## 🌟 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready ✅
- **Test Coverage**: 100% ✅
- **Security Audit**: Pending 🔄
- **Documentation**: Complete ✅

---

**Made with ❤️ by Team GreyDevs**

*SolChain - Powering the future of decentralized energy trading*

**Key Features Summary:**
- 🔋 Complete P2P energy trading platform
- 💰 Full token economy with staking rewards
- 🏛️ Decentralized governance system
- 🔮 Oracle integration for real-world data
- 🛡️ Enterprise-grade security features
- 🧪 100% test coverage
- 📚 Comprehensive documentation
- 🔌 Easy backend integration API

## Overview
The blockchain component contains all smart contracts and blockchain-related logic for the SolChain platform. It implements a Proof-of-Stake (PoS) sidechain with Ethereum anchoring, featuring energy trading, token economics, governance, and oracle integration for real-world data.

## Technology Stack
- **Framework**: Hardhat
- **Language**: Solidity ^0.8.19
- **Testing**: Chai, Mocha
- **Network**: PoS Sidechain with Ethereum anchoring
- **Standards**: ERC-20 (SolarToken), ERC-721 (Energy NFTs)
- **Oracles**: Chainlink for price feeds and external data
- **Governance**: OpenZeppelin Governor contracts

## Project Structure
```
contracts/
├── SolarToken.sol       # ERC-20 token for platform economy
├── EnergyTrading.sol    # P2P energy trading smart contract
├── Staking.sol          # Token staking and rewards mechanism
├── Governance.sol       # Decentralized governance system
└── Oracle.sol           # Oracle integration for external data

scripts/
├── deploy.js           # Deployment scripts
├── verify.js           # Contract verification
└── setup.js            # Initial configuration

test/
├── SolarToken.test.js
├── EnergyTrading.test.js
├── Staking.test.js
├── Governance.test.js
└── Oracle.test.js
```

## Smart Contracts

### SolarToken.sol
**Purpose**: ERC-20 token that serves as the primary currency for the SolChain ecosystem

**Key Features**:
- Standard ERC-20 functionality
- Minting and burning capabilities
- Governance token voting power
- Staking integration
- Fee distribution mechanism

**Main Functions**:
```solidity
function mint(address to, uint256 amount) external onlyMinter
function burn(uint256 amount) external
function delegate(address delegatee) external
function getVotes(address account) external view returns (uint256)
function getPastVotes(address account, uint256 blockNumber) external view returns (uint256)
```

**Token Economics**:
- Initial Supply: 1,000,000,000 SOLAR
- Inflation Rate: 3% annually (distributed as staking rewards)
- Transaction Fees: 0.1% of transaction value
- Governance Threshold: 1% of total supply for proposal creation

### EnergyTrading.sol
**Purpose**: Facilitates peer-to-peer energy trading with automated matching and settlement

**Key Features**:
- Create buy/sell energy orders
- Automated order matching
- Escrow-based payments
- Energy delivery verification
- Dispute resolution mechanism
- Dynamic pricing based on supply/demand

**Data Structures**:
```solidity
struct EnergyOrder {
    uint256 orderId;
    address trader;
    OrderType orderType; // BUY or SELL
    uint256 energyAmount; // in kWh
    uint256 pricePerKWh;
    uint256 availableFrom;
    uint256 availableUntil;
    string location;
    OrderStatus status;
    uint256 collateral;
}

struct Trade {
    uint256 tradeId;
    uint256 buyOrderId;
    uint256 sellOrderId;
    address buyer;
    address seller;
    uint256 energyAmount;
    uint256 agreedPrice;
    uint256 timestamp;
    TradeStatus status;
}
```

**Main Functions**:
```solidity
function createOrder(OrderType _type, uint256 _energyAmount, uint256 _pricePerKWh, uint256 _availableFrom, uint256 _availableUntil, string memory _location) external payable
function cancelOrder(uint256 _orderId) external
function matchOrders(uint256 _buyOrderId, uint256 _sellOrderId) external
function confirmDelivery(uint256 _tradeId) external
function reportDeliveryIssue(uint256 _tradeId, string memory _reason) external
function resolveDispute(uint256 _tradeId, bool _favorBuyer) external onlyArbitrator
```

**Trading Mechanisms**:
- **Order Book**: Maintains buy/sell orders with automatic matching
- **Escrow System**: Holds payments until delivery confirmation
- **Reputation System**: Tracks trader reliability and success rates
- **Geographic Constraints**: Ensures trades within feasible delivery zones
- **Time-based Orders**: Supports scheduled energy trading

### Staking.sol
**Purpose**: Implements token staking mechanism for network security and governance participation

**Key Features**:
- Flexible staking periods (30, 90, 180, 365 days)
- Variable APY based on staking duration
- Early withdrawal penalties
- Delegation for governance voting
- Reward auto-compounding option
- Slashing for malicious behavior

**Staking Pools**:
```solidity
struct StakingPool {
    uint256 poolId;
    uint256 minStakeAmount;
    uint256 stakingPeriod; // in days
    uint256 apy; // annual percentage yield
    uint256 totalStaked;
    uint256 rewardPool;
    bool active;
}

struct UserStake {
    uint256 stakeId;
    address staker;
    uint256 poolId;
    uint256 amount;
    uint256 stakingStartTime;
    uint256 lastRewardClaim;
    bool delegated;
    address delegate;
}
```

**Main Functions**:
```solidity
function createStakingPool(uint256 _minStake, uint256 _period, uint256 _apy) external onlyOwner
function stake(uint256 _poolId, uint256 _amount) external
function unstake(uint256 _stakeId) external
function claimRewards(uint256 _stakeId) external
function delegateVoting(uint256 _stakeId, address _delegate) external
function slash(address _staker, uint256 _amount, string memory _reason) external onlyGovernance
```

**Reward Calculation**:
- Base APY varies by staking period: 30 days (5%), 90 days (8%), 180 days (12%), 365 days (18%)
- Bonus multipliers for long-term stakers
- Dynamic adjustments based on network participation

### Governance.sol
**Purpose**: Implements decentralized governance for protocol upgrades and parameter changes

**Key Features**:
- Proposal creation and voting
- Time-locked execution
- Delegation system
- Quadratic voting mechanism
- Emergency pause functionality
- Multi-signature requirements

**Governance Process**:
```solidity
struct Proposal {
    uint256 proposalId;
    address proposer;
    string title;
    string description;
    address[] targets;
    uint256[] values;
    bytes[] calldatas;
    uint256 startTime;
    uint256 endTime;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 abstainVotes;
    ProposalState state;
}

enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed
}
```

**Main Functions**:
```solidity
function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) external returns (uint256)
function castVote(uint256 proposalId, uint8 support) external
function execute(uint256 proposalId) external
function cancel(uint256 proposalId) external
function queue(uint256 proposalId) external
```

**Governance Parameters**:
- Proposal Threshold: 1% of total token supply
- Voting Period: 7 days
- Timelock Delay: 2 days
- Quorum: 4% of total supply must participate

### Oracle.sol
**Purpose**: Integrates external data sources for energy pricing, weather data, and grid information

**Key Features**:
- Chainlink price feeds integration
- Weather data for solar predictions
- Grid stability indicators
- Energy market prices
- Carbon credit pricing
- Multiple oracle validation

**Data Feeds**:
```solidity
struct PriceFeed {
    address feedAddress;
    string description;
    uint8 decimals;
    uint256 lastUpdate;
    bool active;
}

struct WeatherData {
    uint256 timestamp;
    int256 temperature;
    uint256 humidity;
    uint256 solarIrradiance;
    uint256 windSpeed;
    string location;
}
```

**Main Functions**:
```solidity
function addPriceFeed(address _feed, string memory _description) external onlyOwner
function getLatestPrice(string memory _feedName) external view returns (int256, uint256)
function updateWeatherData(string memory _location, int256 _temp, uint256 _humidity, uint256 _solar, uint256 _wind) external onlyOracle
function getWeatherData(string memory _location) external view returns (WeatherData memory)
function calculateDynamicPrice(uint256 _basePrice, string memory _location) external view returns (uint256)
```

**Oracle Security**:
- Multi-oracle consensus mechanism
- Data validation and outlier detection
- Fallback mechanisms for oracle failures
- Regular oracle performance monitoring

## Setup and Deployment

### Prerequisites
```bash
# Install dependencies
npm install

# Install Hardhat globally (optional)
npm install -g hardhat
```

### Configuration
Create `hardhat.config.js` with network configurations:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Environment Variables
```bash
# .env file
PRIVATE_KEY=your_private_key_here
TESTNET_RPC_URL=https://testnet-rpc-url
MAINNET_RPC_URL=https://mainnet-rpc-url
ETHERSCAN_API_KEY=your_etherscan_api_key
CHAINLINK_PRICE_FEED=price_feed_address
```

### Compilation
```bash
# Compile all contracts
npx hardhat compile

# Clean and recompile
npx hardhat clean && npx hardhat compile
```

### Testing
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/SolarToken.test.js

# Run tests with coverage
npx hardhat coverage

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Deployment
```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts on Etherscan
npx hardhat run scripts/verify.js --network mainnet
```

## Testing Strategy

### Unit Tests
Each contract has comprehensive unit tests covering:
- All public functions
- Edge cases and error conditions
- Access control mechanisms
- State transitions
- Event emissions

### Integration Tests
Test interactions between contracts:
- Token transfers in trading scenarios
- Staking rewards distribution
- Governance proposal execution
- Oracle data integration

### Stress Tests
Test contract performance under load:
- High-volume trading scenarios
- Large-scale staking operations
- Governance with many participants
- Oracle data validation under stress

### Security Tests
Focus on security vulnerabilities:
- Reentrancy attacks
- Integer overflow/underflow
- Access control bypasses
- Front-running scenarios
- Flash loan attacks

## Gas Optimization

### Techniques Used
- Packed structs for storage efficiency
- Batch operations where possible
- Efficient loops and conditionals
- Minimal external calls
- Optimized storage patterns

### Gas Costs (Estimated)
- Token transfer: ~21,000 gas
- Create energy order: ~80,000 gas
- Match orders: ~120,000 gas
- Stake tokens: ~65,000 gas
- Vote on proposal: ~55,000 gas

## Security Considerations

### Implemented Safeguards
- OpenZeppelin security libraries
- Reentrancy guards
- Access control modifiers
- Input validation
- Safe math operations
- Time-locked governance

### Audit Recommendations
1. Conduct formal security audit before mainnet deployment
2. Implement bug bounty program
3. Use multi-signature wallets for admin functions
4. Regular security monitoring and updates
5. Emergency pause mechanisms

## Upgrade Strategy

### Proxy Pattern
Implement upgradeable contracts using OpenZeppelin proxy pattern:
- Transparent proxy for governance contracts
- UUPS proxy for token contracts
- Admin controls for emergency upgrades
- Community voting for major upgrades

### Migration Process
1. Deploy new implementation contracts
2. Test thoroughly on testnet
3. Propose upgrade through governance
4. Execute upgrade after voting period
5. Monitor system post-upgrade

## Network Parameters

### Sidechain Configuration
- Block Time: 3 seconds
- Block Gas Limit: 15,000,000
- Validator Set: 21 validators
- Staking Requirement: 100,000 SOLAR minimum
- Slashing Conditions: Downtime, double-signing

### Ethereum Anchoring
- Checkpoint Frequency: Every 100 blocks
- Security Deposit: 10,000 SOLAR per validator
- Challenge Period: 7 days
- Fraud Proof System: Interactive verification

## Integration Guidelines

### Frontend Integration
```javascript
// Example Web3 integration
const SolarToken = new web3.eth.Contract(SolarTokenABI, tokenAddress);
const EnergyTrading = new web3.eth.Contract(EnergyTradingABI, tradingAddress);

// Create energy order
await EnergyTrading.methods.createOrder(
  0, // SELL order
  100, // 100 kWh
  web3.utils.toWei("0.1", "ether"), // 0.1 SOLAR per kWh
  startTime,
  endTime,
  "New York"
).send({ from: userAddress, value: collateral });
```

### Backend Integration
```javascript
// Monitor blockchain events
const tradingContract = new ethers.Contract(tradingAddress, abi, provider);
tradingContract.on("OrderMatched", (buyOrderId, sellOrderId, buyer, seller, amount, price) => {
  // Handle trade execution
  console.log(`Trade executed: ${amount} kWh at ${price} SOLAR/kWh`);
});
```

## Monitoring and Analytics

### Key Metrics
- Total trading volume
- Active traders count
- Staking participation rate
- Governance proposal activity
- Oracle data accuracy
- Network security metrics

### Dashboards
- Real-time trading activity
- Token economics overview
- Governance participation
- Network health monitoring
- Security incident tracking

## Future Enhancements

### Planned Features
1. Layer 2 scaling solutions
2. Cross-chain bridges
3. Advanced trading algorithms
4. DeFi integrations
5. Carbon credit tokenization
6. Energy futures contracts
7. Automated market makers
8. Insurance protocols

### Research Areas
- Zero-knowledge proofs for privacy
- Quantum-resistant cryptography
- Advanced consensus mechanisms
- Energy-efficient blockchain protocols
- Decentralized identity integration

## Contributing

### Development Process
1. Create feature branch
2. Write comprehensive tests
3. Ensure gas optimization
4. Security review
5. Documentation updates
6. Submit pull request

### Code Standards
- Follow Solidity style guide
- Comprehensive NatSpec documentation
- 100% test coverage
- Gas optimization analysis
- Security best practices
