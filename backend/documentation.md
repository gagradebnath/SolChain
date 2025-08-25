# SolChain Platform - Technical Documentation

This document details the functions, API endpoints, and data flows for both the backend (`solBend`) and frontend (`frontend/my-app`) of the SolChain platform.  
It includes comprehensive blockchain integration using the SolChain smart contracts for real energy trading and token management.

---

## Backend (`solBend`)

### Main Entry: `app.js`
- **Purpose:** Initializes Express app, sets up middleware, connects to DB, and mounts routes.
- **Key Functions:**
  - `app.use(express.json())` — Parses JSON request bodies.
  - `app.use('/api/users', userRoutes)` — Mounts user-related endpoints.
  - `app.use('/api/wallet', walletRoutes)` — Mounts wallet endpoints with blockchain integration.
  - `app.use('/api/transactions', transactionRoutes)` — Mounts transaction endpoints for blockchain operations.
  - `app.use('/api/energy', energyRoutes)` — Mounts energy trading endpoints.
  - `app.use('/api/buy', buyRoutes)` — Mounts energy purchase endpoints.
- **Data Used:** None directly; acts as a router.

---

## Blockchain Integration

### `services/blockchainService.js`
- **Purpose:** Central service for all blockchain operations using SolChain smart contracts.
- **Key Features:**
  - Automatic connection to SolChain blockchain
  - User wallet management with blockchain addresses
  - Real token transfers and balance queries
  - Energy trading through smart contracts
  - Oracle price feeds integration
- **Dependencies:** 
  - `../blockchain/src/solchain-api.js` - Main blockchain API
  - `../blockchain/src/config.js` - Configuration and deployment

---

### Routes

#### 1. `routes/userRoutes.js` (Auth Routes)
- **Endpoints & Functions:**
  - `POST /api/auth/login` → `loginUser(req, res)`
    - **Data Required:** `{ email, password }`
    - **Description:** Authenticates user, returns JWT. Creates blockchain wallet mapping.
  - **Integration Points:** User authentication triggers blockchain wallet association.

#### 2. `routes/WalletRoutes.js` 🔗 **BLOCKCHAIN INTEGRATED**
- **Endpoints & Functions:**
  - `GET /api/wallet/` → `getUserWallet(req, res)`
    - **Data Required:** JWT in headers.
    - **Description:** Fetches real blockchain wallet info including ST token balance and transaction history.
    - **Blockchain Operations:** 
      - `blockchainService.getUserWallet()` - Gets token balance from smart contract
      - Returns real blockchain address and transaction history
  
  - `POST /api/wallet/create` → `createUserWallet(req, res)`
    - **Data Required:** JWT.
    - **Description:** Creates a new blockchain wallet and associates with user.
    - **Blockchain Operations:**
      - `blockchainService.createUserWallet()` - Generates wallet with blockchain address
  
  - `POST /api/wallet/transfer` → `transferTokens(req, res)`
    - **Data Required:** `{ toAddress, amount }`, JWT.
    - **Description:** Transfers ST tokens to another blockchain address.
    - **Blockchain Operations:**
      - `blockchainService.transferTokens()` - Executes ERC-20 token transfer on blockchain

#### 3. `routes/transactionRoutes.js` 🔗 **BLOCKCHAIN INTEGRATED**
- **Endpoints & Functions:**
  - `POST /api/transactions/send` → `sendTransaction(req, res)`
    - **Data Required:** `{ to, amount, token }`, JWT.
    - **Description:** Initiates a real blockchain transaction using SolChain smart contracts.
    - **Blockchain Operations:**
      - `blockchainService.transferTokens()` - Executes transaction on blockchain
      - Returns transaction hash and gas usage
  
  - `GET /api/transactions/:userId` → `getTransactions(req, res)`
    - **Data Required:** `userId` param, JWT.
    - **Description:** Returns real blockchain transaction history from smart contract events.
    - **Blockchain Operations:**
      - Queries blockchain for user's transaction history
  
  - `POST /api/transactions/energy` → `createEnergyTransaction(req, res)`
    - **Data Required:** `{ type, energyAmount, pricePerKwh, location, energySource }`, JWT.
    - **Description:** Creates energy buy/sell offers on blockchain.
    - **Blockchain Operations:**
      - `blockchainService.createSellOffer()` or `createBuyOffer()` - Creates energy trading contracts

#### 4. `routes/EnergyRoutes.js` 🔗 **BLOCKCHAIN INTEGRATED**
- **Endpoints & Functions:**
  - `GET /api/energy/` → `getEnergyData(req, res)`
    - **Data Required:** JWT.
    - **Description:** Returns energy data including real blockchain prices from oracle.
    - **Blockchain Operations:**
      - `blockchainService.getCurrentEnergyPrice()` - Gets price from SolChain oracle
  
  - `POST /api/energy/production` → `recordProduction(req, res)`
    - **Data Required:** `{ energyProduced, timestamp }`, JWT.
    - **Description:** Records energy production and mints ST tokens as reward.
    - **Blockchain Operations:**
      - `blockchainService.mintTokensForProduction()` - Mints tokens on blockchain
  
  - `POST /api/energy/sell` → `createSellOffer(req, res)`
    - **Data Required:** `{ energyAmount, pricePerKwh, duration, location, energySource }`, JWT.
    - **Description:** Creates energy sell offer on blockchain smart contract.
    - **Blockchain Operations:**
      - `blockchainService.createSellOffer()` - Creates offer in EnergyTrading contract
  
  - `GET /api/energy/stats` → `getSystemStats(req, res)`
    - **Description:** Returns system-wide blockchain statistics.
    - **Blockchain Operations:**
      - `blockchainService.getSystemStats()` - Aggregates data from all smart contracts

#### 5. `routes/buyRoutes.js` 🔗 **BLOCKCHAIN INTEGRATED**
- **Endpoints & Functions:**
  - `GET /api/buy/` → `getActiveOffers(req, res)`
    - **Data Required:** JWT.
    - **Description:** Fetches real active energy offers from blockchain.
    - **Blockchain Operations:**
      - `blockchainService.getActiveOffers()` - Queries EnergyTrading contract for active offers
  
  - `POST /api/buy/offer` → `createBuyOffer(req, res)`
    - **Data Required:** `{ energyAmount, pricePerKwh, duration, location, energySource }`, JWT.
    - **Description:** Creates energy buy offer on blockchain.
    - **Blockchain Operations:**
      - `blockchainService.createBuyOffer()` - Creates offer in smart contract
  
  - `POST /api/buy/accept` → `acceptOffer(req, res)`
    - **Data Required:** `{ offerId, energyAmount }`, JWT.
    - **Description:** Accepts an energy offer and executes trade on blockchain.
    - **Blockchain Operations:**
      - `blockchainService.acceptOffer()` - Executes energy trade via smart contract

---

## Blockchain Data Flow Examples

### 1. **User Registration & Wallet Creation:**
   - `AuthRoutes` → `loginUser()` → Creates JWT
   - `WalletRoutes` → `createUserWallet()` → `blockchainService.createUserWallet()`
   - **Blockchain:** Generates wallet address, associates with user ID

### 2. **Energy Production Recording:**
   - IoT device reports production → `EnergyRoutes` → `recordProduction()`
   - `blockchainService.mintTokensForProduction()` → **SolarToken.mint()**
   - **Blockchain:** Mints ST tokens equal to kWh produced

### 3. **Energy Trading:**
   - Seller: `EnergyRoutes` → `createSellOffer()` → **EnergyTrading.createSellOffer()**
   - Buyer: `BuyRoutes` → `acceptOffer()` → **EnergyTrading.acceptOffer()**
   - **Blockchain:** Transfers tokens, records energy trade, updates balances

### 4. **Token Transfer:**
   - `TransactionRoutes` → `sendTransaction()` → `blockchainService.transferTokens()`
   - **Blockchain:** Executes ERC-20 transfer via **SolarToken.transfer()**

---

## Smart Contracts Integration

### 1. **SolarToken (ST)**
- ERC-20 token representing energy credits
- **Functions Used:**
  - `balanceOf()` - Get user token balance
  - `transfer()` - Transfer tokens between users
  - `mint()` - Create new tokens for energy production
  - `burn()` - Remove tokens from circulation

### 2. **EnergyTrading**
- Peer-to-peer energy marketplace
- **Functions Used:**
  - `createSellOffer()` - List energy for sale
  - `createBuyOffer()` - Create energy purchase request
  - `acceptOffer()` - Execute energy trade
  - `getActiveOffers()` - Query available energy offers

### 3. **SolChainOracle**
- Real-time energy price feeds
- **Functions Used:**
  - `getEnergyPrice()` - Current market price
  - `updateEnergyPrice()` - Price updates from data feeds

### 4. **SolChainStaking**
- Validator staking system
- **Functions Used:**
  - `stakeTokens()` - Become network validator
  - `claimRewards()` - Collect staking rewards

### 5. **SolChainGovernance**
- Decentralized governance
- **Functions Used:**
  - `createProposal()` - Propose system changes
  - `vote()` - Vote on proposals

---

## Setup Instructions

### Prerequisites
1. **Blockchain node running:**
   ```bash
   cd blockchain
   npx hardhat node
   ```

2. **Contracts deployed:**
   ```bash
   cd blockchain
   npm run deploy:local
   ```

3. **Backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

### Running the System
1. **Start blockchain (Terminal 1):**
   ```bash
   npm run blockchain:start
   ```

2. **Deploy contracts (Terminal 2):**
   ```bash
   npm run blockchain:deploy
   ```

3. **Start backend (Terminal 3):**
   ```bash
   npm run dev
   ```

4. **Test integration:**
   ```bash
   npm test
   ```

---

## Error Handling

### Blockchain Connection Errors
- **Issue:** "Blockchain service not initialized"
- **Solution:** Ensure blockchain node is running and contracts are deployed

### Transaction Failures
- **Issue:** "Transaction reverted"
- **Solution:** Check user has sufficient tokens and gas

### Network Issues
- **Issue:** "Connection refused"
- **Solution:** Verify blockchain node is accessible at configured RPC URL

---

## Integration Notes

- **Real Blockchain Operations:** All wallet, transaction, and energy trading operations use actual smart contracts
- **Token Economics:** ST tokens are minted for energy production and used for energy purchases
- **Decentralized Trading:** Energy offers are stored on blockchain, enabling peer-to-peer trading
- **Oracle Integration:** Real-time energy prices from blockchain oracles
- **Transaction Verification:** All operations return blockchain transaction hashes for verification

---

## Frontend Integration Points

- **Wallet Screen:** Displays real blockchain balances and transaction history
- **Energy Trading:** Uses actual smart contract offers and trades
- **Transaction Confirmation:** Shows real blockchain transaction hashes
- **Price Discovery:** Uses oracle-fed energy prices
- **User Authentication:** Integrates with blockchain wallet generation

---

## Security Features

- **JWT Authentication:** All endpoints require valid JWT tokens
- **User Isolation:** Users can only access their own blockchain data
- **Smart Contract Security:** Audited contracts with proper access controls
- **Private Key Management:** Secure handling of blockchain credentials

---

## License

MIT

---

**Powered by SolChain Blockchain Technology** 🌞⛓️

---

## Frontend (`frontend/my-app`)

### API Configuration
- **File:** `assets/config.js`
  - `API_BASE_URL` — Used for all API calls.

---

### Screens

#### 1. `screens/HomeScreen.js`
- **Functions Used:**
  - `fetchUserData()` — Calls `/api/users/profile` to get user info.
  - `fetchWalletData()` — Calls `/api/wallet/:userId` for wallet balance.
- **Data Required:** JWT token, userId.
- **Data Displayed:** User name, wallet balance, recent transactions.

#### 2. `screens/WalletScreen.js`
- **Functions Used:**
  - `fetchWalletData()` — Gets wallet details.
  - `createWallet()` — Calls `/api/wallet/create` to create a new wallet.
- **Data Required:** userId, JWT.
- **Data Displayed:** Wallet address, balance, QR code.

#### 3. `screens/SendScreen.js`
- **Functions Used:**
  - `sendTransaction()` — Calls `/api/transactions/send` to send tokens.
- **Data Required:** `{ from, to, amount, token }`, JWT.
- **Data Displayed:** Transaction status, confirmation.

#### 4. `screens/TransactionsScreen.js`
- **Functions Used:**
  - `fetchTransactions()` — Calls `/api/transactions/:userId` for history.
- **Data Required:** userId, JWT.
- **Data Displayed:** List of transactions (date, amount, status).

#### 5. `screens/ProfileScreen.js`
- **Functions Used:**
  - `fetchUserProfile()` — Gets user profile.
  - `updateProfile()` — Updates user info.
- **Data Required:** JWT, profile fields.
- **Data Displayed:** Username, email, preferences.

#### 6. `screens/LoginScreen.js` / `screens/RegisterScreen.js`
- **Functions Used:**
  - `loginUser()` — Calls `/api/users/login`.
  - `registerUser()` — Calls `/api/users/register`.
- **Data Required:** Email, password, username.
- **Data Displayed:** Login/register status, error messages.

---

## Data Flow Example

1. **User logs in:**  
   - `LoginScreen` → `loginUser()` → `/api/users/login`  
   - Receives JWT, stored locally.

2. **User views wallet:**  
   - `HomeScreen` or `WalletScreen` → `fetchWalletData()` → `/api/wallet/:userId`  
   - Displays balance and address.

3. **User sends tokens:**  
   - `SendScreen` → `sendTransaction()` → `/api/transactions/send`  
   - Shows confirmation.

---

## Integration Notes

- **ML Integration:**  
  - User and transaction data can be sent to ML modules for fraud detection, recommendations, etc.
- **Blockchain Integration:**  
  - Wallet and transaction endpoints interact with blockchain nodes or smart contracts.

---

## How to Extend

- Add new endpoints in `backend/routes/` and corresponding controllers.
- Add new screens in `frontend/my-app/screens/` and connect to backend via `config.js`.

---

## License

MIT

---

**For a complete and precise documentation, please provide the actual code for each route