# SolChain ETH Transfer Integration

## Overview

The SolChain blockchain now supports automatic ETH transfers alongside SolarToken transfers. When a buy offer is created, the system automatically deposits an equivalent amount of ETH based on the energy amount being purchased.

## Key Features

### 1. Automatic ETH Deposit on Buy Offers
- When creating a buy offer, the system automatically calculates the equivalent ETH amount
- Deposits the calculated ETH to the SolarToken contract
- Both transactions (ETH deposit + offer creation) are executed sequentially

### 2. ETH-to-Token Ratio
- Configurable ratio in the SolarToken contract (`ethToTokenRatio`)
- Default: 1000 wei per 1 SolarToken (adjustable)
- Can be updated by contract administrators

### 3. Manual ETH Management
- Users can manually deposit ETH
- Users can withdraw their ETH deposits
- Users can check their ETH deposit balance

## API Functions

### Buy Offer with Automatic ETH Deposit

```javascript
const api = new SolChainAPI(config);

const result = await api.createBuyOffer(
    10,              // 10 kWh of energy
    0.01,           // 0.01 ETH per kWh
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours deadline
    "Solar Farm A", // location
    "Solar"         // energy source
);

if (result.success) {
    console.log('ETH deposited:', result.data.ethDeposited);
    console.log('Offer transaction:', result.data.transactionHash);
    console.log('Deposit transaction:', result.data.depositTransactionHash);
}
```

### Manual ETH Deposit

```javascript
// Deposit 1 ETH
const result = await api.depositETH(1.0);
```

### Check ETH Deposit Balance

```javascript
const userAddress = await api.signer.getAddress();
const balance = await api.getETHDepositBalance(userAddress);
console.log('ETH deposit balance:', balance.data.balance);
```

### Calculate ETH Equivalent

```javascript
const equivalent = await api.calculateETHEquivalent(5.0); // For 5 tokens
console.log('ETH equivalent:', equivalent.data.ethEquivalent);
```

### Withdraw ETH Deposit

```javascript
const result = await api.withdrawETHDeposit(0.5); // Withdraw 0.5 ETH
```

## Smart Contract Functions

### SolarToken Contract

#### `depositETH()`
- Payable function to deposit ETH
- Emits `ETHDeposited` event

#### `calculateETHAmount(uint256 tokenAmount)`
- Calculate equivalent ETH amount for given token amount
- Returns ETH amount in wei

#### `getETHDeposit(address user)`
- Get ETH deposit balance for a user
- Returns balance in wei

#### `withdrawETH(uint256 amount)`
- Withdraw ETH deposit
- Emits `ETHWithdrawn` event

## Events

### ETH-Related Events

```solidity
event ETHDeposited(address indexed user, uint256 amount);
event ETHWithdrawn(address indexed user, uint256 amount);
event ETHTransferred(address indexed from, address indexed to, uint256 tokenAmount, uint256 ethAmount);
```

## Event Listening

```javascript
api.startEventListening({
    ethDeposited: (user, amount, event) => {
        console.log(`ETH Deposited: ${ethers.formatEther(amount)} ETH by ${user}`);
    },
    ethWithdrawn: (user, amount, event) => {
        console.log(`ETH Withdrawn: ${ethers.formatEther(amount)} ETH by ${user}`);
    },
    ethTransferred: (from, to, tokenAmount, ethAmount, event) => {
        console.log(`ETH Transfer: ${ethers.formatEther(ethAmount)} ETH from ${from} to ${to}`);
    }
});
```

## Testing

### Run Buy Offer Test

```bash
npm run test:buy-offer
```

### Run Complete Demo

```bash
npm run demo:buy-offer
```

## Configuration

### Setting Contract Addresses

```javascript
const api = new SolChainAPI({
    rpcUrl: "http://127.0.0.1:8545",
    privateKey: "your-private-key",
    contractAddresses: {
        SolarToken: "0x...",
        EnergyTrading: "0x...",
        Oracle: "0x...",
        // ... other contracts
    }
});
```

### Gas Configuration

```javascript
const api = new SolChainAPI({
    gasLimit: 3000000,
    gasPrice: "20000000000", // 20 gwei
    // ... other config
});
```

## Example Transaction Flow

1. **User creates buy offer for 10 kWh**
   - System calculates ETH equivalent (e.g., 0.01 ETH)
   - Calls `SolarToken.depositETH()` with 0.01 ETH
   - Calls `EnergyTrading.createOffer()` to create buy offer

2. **ETH is now available for transfers**
   - When tokens are transferred, equivalent ETH is also transferred
   - ETH moves between user deposit balances in the SolarToken contract

3. **User can withdraw unused ETH**
   - Call `withdrawETH()` to get ETH back to wallet

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Role-based permissions
- **Pausable**: Can be paused in emergencies
- **Validation**: Amount and address validation

## Error Handling

The API provides comprehensive error handling:

```javascript
const result = await api.createBuyOffer(/* params */);

if (!result.success) {
    console.error('Error:', result.error);
    // Handle error appropriately
}
```

## Gas Optimization

- Batch operations where possible
- Efficient event emission
- Optimized storage usage
- Minimal external calls

## Future Enhancements

- Dynamic ETH-to-token ratio based on market conditions
- Multi-asset support (USDC, DAI, etc.)
- Cross-chain ETH transfers
- Advanced pricing mechanisms

## Support

For technical support or questions about the ETH transfer functionality, please refer to the main documentation or contact the development team.
