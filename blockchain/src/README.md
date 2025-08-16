# SolChain API Documentation

A comprehensive JavaScript API for interacting with the SolChain blockchain ecosystem. This API provides easy-to-use functions for all smart contract operations including token management, energy trading, staking, oracle data, and governance.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd SolChain/blockchain

# Install dependencies
npm install

# Start local blockchain (in separate terminal)
npx hardhat node

# Deploy contracts
node src/config.js deploy hardhat

# Test the API
node src/test-api.js
```

### Basic Usage

```javascript
const SolChainAPI = require('./src/solchain-api');
const SolChainConfig = require('./src/config');

// Create API instance with auto-deployment
const config = new SolChainConfig();
const apiResult = await config.createAPIInstance("hardhat", 0);
const { api } = apiResult;

// Get token balance
const balance = await api.getTokenBalance("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
console.log("Balance:", balance.data.balance, "ST");

// Create energy offer
const offer = await api.createSellOffer(
    "50", // 50 kWh
    "8",  // 8 ST per kWh
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    "Solar Farm A",
    "Solar"
);
```

## 📋 API Reference

### Core Classes

#### `SolChainAPI`
Main API class for blockchain interactions.

```javascript
const api = new SolChainAPI({
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 1337,
    privateKey: "0x...",
    contractAddresses: { ... },
    gasLimit: 3000000,
    gasPrice: "20000000000"
});
```

#### `SolChainConfig`
Configuration and deployment helper.

```javascript
const config = new SolChainConfig();
const networkConfig = config.getNetworkConfig("hardhat");
const apiConfig = config.getAPIConfig("hardhat", 0, contractAddresses);
```

### Token Functions

#### `getTokenInfo()`
Get token metadata (name, symbol, total supply).

```javascript
const tokenInfo = await api.getTokenInfo();
// Returns: { success: true, data: { name, symbol, decimals, totalSupply } }
```

#### `getTokenBalance(address)`
Get token balance for an address.

```javascript
const balance = await api.getTokenBalance("0x...");
// Returns: { success: true, data: { address, balance, balanceWei } }
```

#### `transferTokens(toAddress, amount)`
Transfer tokens to another address.

```javascript
const result = await api.transferTokens("0x...", "100");
// Returns: { success: true, data: { transactionHash, gasUsed, ... } }
```

#### `approveTokens(spenderAddress, amount)`
Approve token spending allowance.

```javascript
const result = await api.approveTokens("0x...", "1000");
// Returns: { success: true, data: { transactionHash, spender, amount } }
```

#### `mintTokens(toAddress, amount)` *(Admin only)*
Mint new tokens.

```javascript
const result = await api.mintTokens("0x...", "500");
// Returns: { success: true, data: { transactionHash, to, amount } }
```

#### `burnTokens(amount)`
Burn tokens from caller's balance.

```javascript
const result = await api.burnTokens("100");
// Returns: { success: true, data: { transactionHash, amount } }
```

### Energy Trading Functions

#### `createSellOffer(energyAmount, pricePerKwh, deadline, location, energySource)`
Create an energy sell offer.

```javascript
const offer = await api.createSellOffer(
    "50",    // 50 kWh
    "8",     // 8 ST per kWh
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    "Solar Farm A",
    "Solar"
);
// Returns: { success: true, data: { transactionHash, energyAmount, ... } }
```

#### `createBuyOffer(energyAmount, pricePerKwh, deadline, location, energySource)`
Create an energy buy offer.

```javascript
const offer = await api.createBuyOffer(
    "30",    // 30 kWh
    "9",     // 9 ST per kWh
    new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    "Residential Area",
    "Any"
);
```

#### `acceptOffer(offerId, energyAmount)`
Accept an existing energy offer.

```javascript
const result = await api.acceptOffer("1", "25");
// Returns: { success: true, data: { transactionHash, offerId, energyAmount } }
```

#### `cancelOffer(offerId)`
Cancel an energy offer.

```javascript
const result = await api.cancelOffer("1");
// Returns: { success: true, data: { transactionHash, offerId } }
```

#### `getActiveOffers(offset, limit)`
Get list of active energy offers.

```javascript
const offers = await api.getActiveOffers(0, 10);
// Returns: { success: true, data: { offers: [...], offset, limit } }
```

#### `getUserOffers(userAddress)`
Get user's energy offers.

```javascript
const userOffers = await api.getUserOffers("0x...");
// Returns: { success: true, data: { userAddress, offerIds: [...] } }
```

#### `getTradingStats()`
Get trading statistics.

```javascript
const stats = await api.getTradingStats();
// Returns: { success: true, data: { totalTrades, totalVolume, totalFees, activeOffers } }
```

### Oracle Functions

#### `getEnergyPrice()`
Get current energy price.

```javascript
const price = await api.getEnergyPrice();
// Returns: { success: true, data: { price, timestamp, confidence, source, isValid } }
```

#### `updateEnergyPrice(price, confidence)` *(Data feed only)*
Update energy price.

```javascript
const result = await api.updateEnergyPrice("0.009", 95);
// Returns: { success: true, data: { transactionHash, price, confidence } }
```

#### `getGridStatus(region)`
Get grid status for a region.

```javascript
const status = await api.getGridStatus("Dhaka");
// Returns: { success: true, data: { region, isOnline, capacity, currentLoad, lastUpdate } }
```

#### `updateGridStatus(region, isOnline, capacity, currentLoad)` *(Data feed only)*
Update grid status.

```javascript
const result = await api.updateGridStatus("Dhaka", true, "2000", "1500");
// Returns: { success: true, data: { transactionHash, region, ... } }
```

### Staking Functions

#### `stakeTokens(amount)`
Stake tokens to become a validator.

```javascript
const result = await api.stakeTokens("1000");
// Returns: { success: true, data: { transactionHash, amount } }
```

#### `unstakeTokens(amount)`
Unstake tokens.

```javascript
const result = await api.unstakeTokens("500");
// Returns: { success: true, data: { transactionHash, amount } }
```

#### `claimRewards()`
Claim staking rewards.

```javascript
const result = await api.claimRewards();
// Returns: { success: true, data: { transactionHash } }
```

#### `getValidatorInfo(validatorAddress)`
Get validator information.

```javascript
const info = await api.getValidatorInfo("0x...");
// Returns: { success: true, data: { stakedAmount, rewardDebt, lastStakeTime, isActive } }
```

#### `getStakingStats()`
Get staking statistics.

```javascript
const stats = await api.getStakingStats();
// Returns: { success: true, data: { totalValidators, activeValidators, totalStakedAmount, ... } }
```

#### `getActiveValidators()`
Get list of active validators.

```javascript
const validators = await api.getActiveValidators();
// Returns: { success: true, data: { validators: [...], count } }
```

### Governance Functions

#### `createProposal(targets, values, calldatas, description)`
Create a governance proposal.

```javascript
const result = await api.createProposal(
    ["0x..."], // target contracts
    ["0"],      // values (ETH amounts)
    ["0x..."],  // function call data
    "Proposal description"
);
```

#### `voteOnProposal(proposalId, support, reason)`
Vote on a proposal.

```javascript
const result = await api.voteOnProposal(
    "1",     // proposal ID
    1,       // 0=Against, 1=For, 2=Abstain
    "I support this proposal because..."
);
```

#### `getProposalState(proposalId)`
Get proposal state.

```javascript
const state = await api.getProposalState("1");
// Returns: { success: true, data: { proposalId, state, stateName } }
```

### Utility Functions

#### `getAccountBalance(address)`
Get ETH balance for an address.

```javascript
const balance = await api.getAccountBalance("0x...");
// Returns: { success: true, data: { address, balance, balanceWei } }
```

#### `getGasPrice()`
Get current gas price.

```javascript
const gasPrice = await api.getGasPrice();
// Returns: { success: true, data: { gasPrice, maxFeePerGas, ... } }
```

#### `getAccountOverview(address)`
Get comprehensive account information.

```javascript
const overview = await api.getAccountOverview("0x...");
// Returns: { success: true, data: { ethBalance, tokenBalance, validatorInfo } }
```

#### `getSystemOverview()`
Get system-wide statistics.

```javascript
const overview = await api.getSystemOverview();
// Returns: { success: true, data: { tokenInfo, tradingStats, stakingStats, energyPrice } }
```

### Event Listening

#### `startEventListening(eventHandlers)`
Start listening to contract events.

```javascript
const eventHandlers = {
    tokenTransfer: (from, to, amount) => {
        console.log(`Transfer: ${from} → ${to} (${amount})`);
    },
    offerCreated: (offerId, creator, offerType, energyAmount, price) => {
        console.log(`New Offer: ${offerId} by ${creator}`);
    },
    // ... more handlers
};

api.startEventListening(eventHandlers);
```

#### `stopEventListening()`
Stop listening to events.

```javascript
api.stopEventListening();
```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file:

```bash
# Generate example
node src/config.js env

# Edit .env file
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...
CHAIN_ID=1337
```

### Network Configuration

Supported networks:
- `hardhat` - Local development
- `localhost` - Local node
- `sepolia` - Ethereum testnet
- `bscTestnet` - BSC testnet
- `polygon` - Polygon mainnet

```javascript
const config = new SolChainConfig();
const networkConfig = config.getNetworkConfig("sepolia");
```

### Contract Deployment

```bash
# Deploy to hardhat
node src/config.js deploy hardhat

# Deploy to sepolia
node src/config.js deploy sepolia

# Check deployed addresses
node src/config.js addresses hardhat
```

## 🧪 Testing

### Run All Tests

```bash
node src/test-api.js
```

### Run Specific Tests

```bash
# API functionality tests
node src/test-api.js api

# Performance tests
node src/test-api.js performance

# Integration tests
node src/test-api.js integration

# Error handling tests
node src/test-api.js error
```

### Example Output

```
🧪 SolChain API Complete Test Suite
==================================================

1️⃣ Creating API instance...
✅ API instance created successfully

2️⃣ Testing token information...
📄 Token Info: ✅ PASS
   Token: SolarToken (ST)
   Total Supply: 1000000.0 tokens

...

🎯 Overall Result: 4/4 test suites passed
🎉 All tests passed! SolChain API is ready for production!
```

## 🌐 Backend Integration

### Express.js Example

```javascript
const express = require('express');
const SolChainAPI = require('./src/solchain-api');
const SolChainConfig = require('./src/config');

const app = express();
app.use(express.json());

// Initialize API
let api;
const config = new SolChainConfig();

async function initializeAPI() {
    const apiResult = await config.createAPIInstance("hardhat", 0);
    if (apiResult.success) {
        api = apiResult.api;
        console.log("✅ SolChain API initialized");
    } else {
        console.error("❌ Failed to initialize API:", apiResult.error);
    }
}

// Routes
app.get('/api/token/balance/:address', async (req, res) => {
    try {
        const result = await api.getTokenBalance(req.params.address);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/token/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        const result = await api.transferTokens(to, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/trading/sell-offer', async (req, res) => {
    try {
        const { energyAmount, pricePerKwh, deadline, location, energySource } = req.body;
        const result = await api.createSellOffer(energyAmount, pricePerKwh, new Date(deadline), location, energySource);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/system/overview', async (req, res) => {
    try {
        const result = await api.getSystemOverview();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
initializeAPI().then(() => {
    app.listen(3000, () => {
        console.log('🚀 SolChain API server running on port 3000');
    });
});
```

### Frontend Integration

```javascript
// React example
import axios from 'axios';

class SolChainService {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.api = axios.create({ baseURL });
    }

    async getTokenBalance(address) {
        const response = await this.api.get(`/token/balance/${address}`);
        return response.data;
    }

    async transferTokens(to, amount) {
        const response = await this.api.post('/token/transfer', { to, amount });
        return response.data;
    }

    async createSellOffer(energyAmount, pricePerKwh, deadline, location, energySource) {
        const response = await this.api.post('/trading/sell-offer', {
            energyAmount, pricePerKwh, deadline, location, energySource
        });
        return response.data;
    }

    async getSystemOverview() {
        const response = await this.api.get('/system/overview');
        return response.data;
    }
}

export default SolChainService;
```

## 🔧 Error Handling

All API functions return a standardized response format:

```javascript
// Success response
{
    success: true,
    data: { ... }
}

// Error response
{
    success: false,
    error: "Error message"
}
```

### Common Error Types

1. **Contract Not Initialized**: Contract instance not set up
2. **Network Connection**: RPC node unreachable
3. **Transaction Reverted**: Smart contract validation failed
4. **Insufficient Gas**: Gas limit too low
5. **Invalid Parameters**: Malformed input data

### Best Practices

```javascript
async function safeApiCall() {
    try {
        const result = await api.transferTokens("0x...", "100");
        
        if (result.success) {
            console.log("Transfer successful:", result.data.transactionHash);
            return result.data;
        } else {
            console.error("Transfer failed:", result.error);
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
```

## 📚 Advanced Usage

### Custom Network Configuration

```javascript
const customConfig = {
    rpcUrl: "https://your-rpc-endpoint.com",
    chainId: 1337,
    privateKey: process.env.PRIVATE_KEY,
    contractAddresses: {
        SolarToken: "0x...",
        EnergyTrading: "0x...",
        // ... other contracts
    },
    gasLimit: 5000000,
    gasPrice: "30000000000"
};

const api = new SolChainAPI(customConfig);
await api.initializeContracts(customConfig.contractAddresses);
```

### Batch Operations

```javascript
// Get multiple data points simultaneously
const [tokenInfo, energyPrice, tradingStats] = await Promise.all([
    api.getTokenInfo(),
    api.getEnergyPrice(),
    api.getTradingStats()
]);
```

### Event Monitoring

```javascript
// Monitor specific events
const eventHandlers = {
    tokenTransfer: (from, to, amount) => {
        // Update database
        database.recordTransfer({ from, to, amount });
    },
    offerCreated: (offerId, creator, offerType, energyAmount, price) => {
        // Send notification
        notificationService.sendOfferAlert({ offerId, creator });
    }
};

api.startEventListening(eventHandlers);
```

## 🆘 Troubleshooting

### Common Issues

1. **"Contract not initialized"**
   - Ensure contracts are deployed and addresses are correct
   - Call `initializeContracts()` before using API functions

2. **"Transaction reverted"**
   - Check account has sufficient token balance
   - Verify contract permissions and roles
   - Increase gas limit if needed

3. **"Connection refused"**
   - Ensure blockchain node is running
   - Check RPC URL and network configuration

4. **"Insufficient funds"**
   - Account needs ETH for gas fees
   - Check token allowances for trading operations

### Debug Mode

```javascript
// Enable detailed logging
const api = new SolChainAPI({
    ...config,
    debug: true
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/your-repo/solchain)
- [Documentation](https://docs.solchain.com)
- [API Reference](https://api.solchain.com)
- [Support](mailto:support@solchain.com)

---

**Built with ❤️ for the SolChain Ecosystem**
