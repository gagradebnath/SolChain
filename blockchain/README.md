# Blockchain - SolChain Smart Contracts

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
