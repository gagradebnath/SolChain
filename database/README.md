# SolChain Database JSONs Documentation

This document describes the structure and purpose of each JSON file inside `database/jsons/` for the SolChain backend.  
These files are used to store and retrieve persistent data for users, energy metrics, transactions, predictions, and more.

---
## Password Policy

- **All users in the sample data have the password:** `1234`
- The `passwordHash` in `users.json` is a bcrypt hash of `1234`.

## JSON Files and Their Data

### 1. `activity.json`
- **Purpose:** Logs recent activities for each user, such as transactions, notifications, or system events.
- **Typical Fields:**  
  - `id`: Unique activity identifier  
  - `userId`: User associated with the activity  
  - `type`: Activity type (e.g., "transaction", "notification")  
  - `description`: Description of the activity  
  - `timestamp`: When the activity occurred  
  - `value`: Value or amount involved (if applicable)
- **Usage:**  
  - Display user activity feeds or notifications in the frontend.

---

### 2. `battery.json`
- **Purpose:** Stores battery status and metrics for users or devices.
- **Typical Fields:**  
  - `userId` or `deviceId`: Owner or device reference  
  - `chargeLevel`: Current battery charge (percentage or kWh)  
  - `status`: Charging/discharging/idle  
  - `lastUpdated`: Timestamp of last update
- **Usage:**  
  - Monitor battery health and status in dashboards.

---

### 3. `carbon.json`
- **Purpose:** Tracks carbon emissions or savings for users or the system.
- **Typical Fields:**  
  - `userId`: User reference  
  - `emissions`: Amount of carbon emitted (kg CO₂)  
  - `savings`: Amount of carbon saved (kg CO₂)  
  - `timestamp` or `date`: When the data was recorded
- **Usage:**  
  - Display environmental impact and sustainability metrics.

---

### 4. `energyData.json`
- **Purpose:** Stores energy production, consumption, and savings per user or device, often per day.
- **Typical Fields:**  
  - `userId` or `deviceId`  
  - `date`  
  - `production`: Energy produced (kWh)  
  - `consumption`: Energy consumed (kWh)  
  - `savings`: Money or energy saved
- **Usage:**  
  - Power dashboards and analytics for energy usage.

---

### 5. `grid.json`
- **Purpose:** Contains data about grid status, grid transactions, or grid-level energy flows.
- **Typical Fields:**  
  - `gridId`  
  - `status`: Online/offline/maintenance  
  - `energyIn`: Energy supplied to grid  
  - `energyOut`: Energy drawn from grid  
  - `timestamp`
- **Usage:**  
  - Monitor and analyze grid interactions.

---

### 6. `market.json`
- **Purpose:** Stores current and historical buy/sell prices for energy tokens or units.
- **Typical Fields:**  
  - `date`  
  - `buy`: Buy price (e.g., SOL/kWh)  
  - `sell`: Sell price  
  - `unit`: Unit of trade
- **Usage:**  
  - Display market prices and trends in the frontend.

---

### 7. `predictions.json`
- **Purpose:** Contains ML or statistical predictions, such as future energy usage, prices, or production.
- **Typical Fields:**  
  - `userId` or `deviceId`  
  - `date` or `timestamp`  
  - `predictedConsumption`  
  - `predictedProduction`  
  - `predictedPrice`
- **Usage:**  
  - Show forecasts and recommendations to users.

---

### 8. `realtime.json`
- **Purpose:** Stores real-time sensor or device data, such as live energy flows or IoT readings.
- **Typical Fields:**  
  - `deviceId` or `userId`  
  - `timestamp`  
  - `currentProduction`  
  - `currentConsumption`  
  - `voltage`, `current`, etc.
- **Usage:**  
  - Power live dashboards and alerts.

---

### 9. `transactions.json`
- **Purpose:** Records all energy and token transactions between users, devices, or the grid.
- **Typical Fields:**  
  - `id`: Transaction ID  
  - `from`: Sender (userId or walletId)  
  - `to`: Receiver  
  - `amount`: Amount transferred  
  - `unit`: kWh, SOL, etc.  
  - `timestamp`  
  - `type`: Transaction type (buy/sell/transfer)
- **Usage:**  
  - Display transaction history and analytics.

---

### 10. `usage.json`
- **Purpose:** Tracks detailed energy usage data, possibly at a finer granularity than `energyData.json`.
- **Typical Fields:**  
  - `userId` or `deviceId`  
  - `timestamp` or `interval`  
  - `usage`: Energy used (kWh)
- **Usage:**  
  - Detailed usage analytics and reporting.

---

### 11. `users.json`
- **Purpose:** Stores user authentication, profile information, and user-specific data such as goals.
- **Typical Fields:**  
  - `id`: User ID  
  - `username`  
  - `email`  
  - `passwordHash`: bcrypt hash of the password (all users use password `1234` in sample data)  
  - `goals`: Array of user goals (see dashboard)
- **Usage:**  
  - User authentication, profile management, and dashboard personalization.

---

### 12. `wallets.json`
- **Purpose:** Stores wallet addresses, balances, and related info for each user.
- **Typical Fields:**  
  - `id`: Wallet ID  
  - `userId`: Owner  
  - `address`: Blockchain address  
  - `balance`: Current balance  
  - `currency`: e.g., SOL
- **Usage:**  
  - Manage and display user wallets and balances.

---

## How to Use These JSONs

- **Reading Data:**  
  Use Node.js `fs` module to read and parse JSON files in your backend routes.
  ```js
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'database/jsons/energyData.json')));
  ```
- **Writing Data:**  
  Update the JS object and write back to the file.
  ```js
  fs.writeFileSync(path.join(__dirname, 'database/jsons/energyData.json'), JSON.stringify(data, null, 2));
  ```
- **Best Practices:**  
  - Always read the latest data before responding to API requests.
  - Validate data before saving.
  - For production, consider migrating to a real database for scalability and concurrency.

---

## Password Policy

- **All users in the sample data have the password:** `1234`
- The `passwordHash` in `users.json` is a bcrypt hash of `1234`.

---

**This documentation covers all JSON files in `database/jsons/` as of the current repository structure.**
