# SolChain Frontend Screens Documentation

This document describes the purpose and main features of each screen in `frontend/my-app/screens/`.  
Each screen is a React Native component that provides a specific part of the user experience for the SolChain platform.

---

## 1. `AuthScreen.js`
- **Purpose:** Handles user authentication (login and registration).
- **Features:**
  - User login form (email/ID and password).
  - Sends credentials to backend for authentication.
  - Displays error messages on failed login.
  - Navigates to the main app on successful login.

---

## 2. `BuyScreen.js`
- **Purpose:** Allows users to buy energy or tokens from the market or other users.
- **Features:**
  - Input for amount and price.
  - Fetches current market prices from backend.
  - Submits buy requests to backend.
  - Displays transaction status and updated balances.

---

## 3. `CommunityScreen.js`
- **Purpose:** Displays community features such as leaderboards, shared stats, or social interactions.
- **Features:**
  - Shows rankings or achievements of users.
  - Displays community energy statistics.
  - May include social or gamification elements.

---

## 4. `EnergyDashboard.js`
- **Purpose:** Provides a comprehensive dashboard for monitoring and analyzing energy metrics.
- **Features:**
  - Displays energy production, consumption, and savings.
  - Shows battery status and environmental impact.
  - Visualizes data with charts or graphs.
  - May include real-time updates.

---

## 5. `GoalScreen.js`
- **Purpose:** Manages and displays user goals related to energy usage or achievements.
- **Features:**
  - Lists current goals and progress.
  - Allows users to set or update goals.
  - Visual feedback on goal completion.

---

## 6. `HomeScreen.js`
- **Purpose:** The main landing/dashboard screen after login.
- **Features:**
  - Aggregates key data: energy overview, recent activity, weather, market prices, and goals.
  - Quick navigation to other features.
  - Personalized greeting and summary.

---

## 7. `NotificationScreen.js`
- **Purpose:** Displays notifications and alerts for the user.
- **Features:**
  - Lists recent notifications (system, transactions, reminders).
  - Marks notifications as read/unread.
  - May allow users to manage notification preferences.

---

## 8. `SellScreen.js`
- **Purpose:** Allows users to sell energy or tokens to the market or other users.
- **Features:**
  - Input for amount and price.
  - Fetches current market prices from backend.
  - Submits sell requests to backend.
  - Displays transaction status and updated balances.

---

## 9. `SettingsScreen.js`
- **Purpose:** Manages user settings and preferences.
- **Features:**
  - Allows users to update profile information.
  - Manages notification and privacy settings.
  - Option to log out or reset account.

---

## 10. `StatScreen.js`
- **Purpose:** Displays detailed statistics and analytics.
- **Features:**
  - Shows historical energy usage, production, and savings.
  - Visualizes trends with charts and graphs.
  - Allows filtering by date or category.

---

## 11. `TestScrollScreen.js`
- **Purpose:** Likely used for testing scroll behavior and UI layouts.
- **Features:**
  - Demonstrates or tests scrolling containers and components.
  - Not part of the main user flow.

---

## 12. `WalletScreen.js`
- **Purpose:** Manages and displays the user's wallet and balances.
- **Features:**
  - Shows wallet address, balance, and recent transactions.
  - Allows users to copy address or view QR code.
  - May include wallet management actions (e.g., backup, export).

---

**Note:**  
Each screen interacts with backend APIs (using services in `frontend/my-app/services/`) to fetch or update data as needed.  
UI styles are defined in the `styles/` directory, and reusable components are in `components/`.


---