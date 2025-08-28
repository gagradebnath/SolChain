# SolChain Backend Routes Documentation

This document describes how each route in `backend/routes/` interacts with the JSON-based database (`database/jsons/`) and how data is sent to the frontend.

---

## General Architecture

- **Database:**  
  The backend uses JSON files in `database/jsons/` as its data store. Each route reads from and writes to these files using Node.js `fs` module.
- **API:**  
  Each route exposes RESTful endpoints that the frontend calls to fetch or update data. Data is sent as JSON responses.

---

## Route-by-Route Overview

### 1. `AuthRoutes.js`
- **Purpose:** Handles user authentication (login).
- **Database Interaction:**  
  - Reads `users.json` to find and verify user credentials.
  - Uses bcrypt to compare password hashes.
- **Frontend Data:**  
  - On successful login, sends `{ token, user: { email, id, name } }`.
  - On failure, sends `{ error: "Invalid email/ID or password" }`.

---

### 2. `HomeScreen.js`
- **Purpose:** Serves the main dashboard data for authenticated users.
- **Database Interaction:**  
  - Reads from multiple JSONs:  
    - `energyOverview.json` for energy stats  
    - `recentActivity.json` for activity feed  
    - `weather.json` for weather info  
    - `market.json` for market prices  
    - `users.json` for user goals
- **Frontend Data:**  
  - Sends a combined JSON object with all dashboard data:
    ```json
    {
      "energyOverview": { ... },
      "recentActivity": [ ... ],
      "weather": { ... },
      "marketPrices": { ... },
      "goals": [ ... ]
    }
    ```

---

### 3. `WalletRoutes.js`
- **Purpose:** Manages user wallets.
- **Database Interaction:**  
  - Reads and writes to `wallets.json` for wallet info and balances.
- **Frontend Data:**  
  - Sends wallet details, balance, and transaction status.

---

### 4. `EnergyRoutes.js`
- **Purpose:** Handles energy production, consumption, and related stats.
- **Database Interaction:**  
  - Reads/writes `energyData.json` for user/device energy metrics.
- **Frontend Data:**  
  - Sends energy stats, trends, and analytics.

---

### 5. `goalsRoutes.js`
- **Purpose:** Manages user goals.
- **Database Interaction:**  
  - Reads/writes `users.json` (goals are stored as a field in each user object).
- **Frontend Data:**  
  - Sends user goals and progress.

---

### 6. `CommunityScreenRoutes.js`
- **Purpose:** Handles community features (e.g., leaderboards, shared stats).
- **Database Interaction:**  
  - Reads from `users.json`, `energyData.json`, or other relevant files.
- **Frontend Data:**  
  - Sends aggregated community data.

---

### 7. `notificationRoutes.js`
- **Purpose:** Manages notifications for users.
- **Database Interaction:**  
  - Reads/writes `activity.json` or a dedicated notifications JSON.
- **Frontend Data:**  
  - Sends notification lists and statuses.

---

### 8. `buyRoutes.js` and `SellRoutes.js`

#### Purpose
These routes handle the buying and selling of energy or tokens between users and/or the grid. They facilitate peer-to-peer energy trading and update user balances, transaction records, and market data accordingly.

---

#### Database Interaction

- **Reads from:**
  - `market.json`: To get the current buy/sell prices for energy or tokens.
  - `users.json`: To verify user identity and update user-related data if needed.
  - `wallets.json`: To check and update user wallet balances.
  - `transactions.json`: To record each buy/sell transaction for history and analytics.

- **Writes to:**
  - `wallets.json`: Updates the buyer's and seller's balances after a transaction.
  - `transactions.json`: Appends a new transaction record with details (amount, from, to, price, timestamp, etc.).
  - Optionally, `market.json`: If the transaction affects market prices (e.g., dynamic pricing).

---

#### Typical Data Flow

1. **Frontend Request:**  
   The frontend sends a POST request to `/api/buy` or `/api/sell` with:
   ```json
   {
     "userId": "user1",
     "amount": 5,
     "unit": "kWh",
     "price": 0.25
   }
   ```
2. **Backend Processing:**
   - Authenticates the user.
   - Reads `market.json` to validate the price.
   - Reads `wallets.json` to check balances (buyer must have enough tokens, seller must have enough energy).
   - Updates balances in `wallets.json`.
   - Appends a new record to `transactions.json`:
     ```json
     {
       "id": "tx123",
       "from": "user1",
       "to": "user2",
       "amount": 5,
       "unit": "kWh",
       "price": 0.25,
       "timestamp": "2024-08-25T12:00:00Z",
       "type": "buy"
     }
     ```
   - Optionally updates `market.json` if prices are dynamic.

3. **Backend Response:**
   - Returns a JSON response with transaction status, updated balances, and possibly updated market prices:
     ```json
     {
       "success": true,
       "transaction": { ... },
       "buyerWallet": { ... },
       "sellerWallet": { ... },
       "marketPrices": { ... }
     }
     ```

---

#### Example Use Cases

- **Buy Route (`buyRoutes.js`):**
  - User A wants to buy 5 kWh from the grid or another user.
  - Backend checks if User A has enough tokens, deducts tokens, credits energy, records the transaction.

- **Sell Route (`SellRoutes.js`):**
  - User B wants to sell 3 kWh to the grid or another user.
  - Backend checks if User B has enough energy, deducts energy, credits tokens, records the transaction.

---

#### Error Handling

- If the user does not have enough balance (tokens or energy), the backend responds with an error message.
- If the price is not valid or market is closed, an appropriate error is returned.

---

#### Security

- All buy/sell requests should be authenticated (JWT token).
- All balance updates and transaction records should be atomic to prevent inconsistencies.

---

#### Summary Table

| File              | Read | Write | Purpose                                  |
|-------------------|------|-------|------------------------------------------|
| `market.json`     | ✔️   | ✔️    | Get/update current market prices         |
| `users.json`      | ✔️   | ✔️    | Verify user, update user data if needed  |
| `wallets.json`    | ✔️   | ✔️    | Check/update user balances               |
| `transactions.json`| ✔️   | ✔️    | Record transaction history               |

---

---

### 9. `settingRoutes.js`
- **Purpose:** Manages user settings and preferences.
- **Database Interaction:**  
  - Reads/writes `users.json` for user-specific settings.
- **Frontend Data:**  
  - Sends current settings and confirmation of updates.

---

### 10. `statsRoutes.js`
- **Purpose:** Provides statistical summaries and analytics.
- **Database Interaction:**  
  - Reads from multiple JSONs (e.g., `energyData.json`, `transactions.json`).
- **Frontend Data:**  
  - Sends aggregated stats and analytics.

---

## How Data Flows

1. **Frontend makes an HTTP request** to a backend route (e.g., `/api/home`).
2. **Backend route authenticates** the user (if required).
3. **Backend reads relevant JSON files** using `fs.readFileSync` or similar.
4. **Backend processes and formats the data** as needed.
5. **Backend sends a JSON response** to the frontend.
6. **Frontend displays the data** in the UI.

---

## Example: Fetching User Dashboard

- **Frontend:**  
  Sends `GET /api/home` with JWT token.
- **Backend:**  
  - Authenticates token.
  - Reads user-specific data from multiple JSONs.
  - Sends combined dashboard data as JSON.

---

## Notes

- All data is exchanged in JSON format.
- For production, consider migrating from JSON files to a real database for scalability and concurrency.

---