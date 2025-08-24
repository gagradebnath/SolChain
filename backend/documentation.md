# SolChain Platform - Technical Documentation

This document details the functions, API endpoints, and data flows for both the backend (`solBend`) and frontend (`frontend/my-app`) of the SolChain platform.  
It is intended to support integration with machine learning and blockchain modules.

---

## Backend (`solBend`)

### Main Entry: `app.js`
- **Purpose:** Initializes Express app, sets up middleware, connects to DB, and mounts routes.
- **Key Functions:**
  - `app.use(express.json())` — Parses JSON request bodies.
  - `app.use('/api/users', userRoutes)` — Mounts user-related endpoints.
  - `app.use('/api/wallet', walletRoutes)` — Mounts wallet endpoints.
  - `app.use('/api/transactions', transactionRoutes)` — Mounts transaction endpoints.
- **Data Used:** None directly; acts as a router.

---

### Routes

#### 1. `routes/userRoutes.js`
- **Endpoints & Functions:**
  - `POST /api/users/register` → `registerUser(req, res)`
    - **Data Required:** `{ username, email, password }`
    - **Description:** Registers a new user, hashes password, stores in DB.
  - `POST /api/users/login` → `loginUser(req, res)`
    - **Data Required:** `{ email, password }`
    - **Description:** Authenticates user, returns JWT.
  - `GET /api/users/profile` → `getUserProfile(req, res)`
    - **Data Required:** JWT in headers.
    - **Description:** Returns user profile data.
- **Integration Points:** User data may be used for ML-based fraud detection or blockchain identity management.

#### 2. `routes/walletRoutes.js`
- **Endpoints & Functions:**
  - `GET /api/wallet/:userId` → `getWallet(req, res)`
    - **Data Required:** `userId` param, JWT.
    - **Description:** Fetches wallet info for user.
  - `POST /api/wallet/create` → `createWallet(req, res)`
    - **Data Required:** `{ userId }`
    - **Description:** Creates a new wallet, generates blockchain address.
- **Integration Points:** Wallet creation may interact with blockchain smart contracts.

#### 3. `routes/transactionRoutes.js`
- **Endpoints & Functions:**
  - `POST /api/transactions/send` → `sendTransaction(req, res)`
    - **Data Required:** `{ from, to, amount, token }`
    - **Description:** Initiates a blockchain transaction.
  - `GET /api/transactions/:userId` → `getTransactions(req, res)`
    - **Data Required:** `userId` param.
    - **Description:** Returns transaction history for user.
- **Integration Points:** Transaction data can be used for ML anomaly detection and blockchain ledger updates.

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