
 * =============================================================================
 * Project Documentation: ShoktiHaat Energy Management App
 * =============================================================================
 *
 * Author: Team GreyDevs
 * Project: ShoktiHaat - Peer-to-Peer Solar Energy Microgrid App
 * Purpose: Manage solar energy production, trading, wallet, gamification, and stats
 *
 * =============================================================================
 * Table of Contents
 * =============================================================================
 * 1. GamificationScreen
 * 2. NotificationScreen
 * 3. SellEnergyScreen
 * 4. StatScreen
 * 5. WalletScreen
 *
 * =============================================================================
 * 1. GamificationScreen
 * -----------------------------------------------------------------------------
 * - Purpose: Display user’s personal energy goals, badges, and community leaderboard.
 * - Features:
 *   * Goals Section:
 *     - Shows individual energy or trading goals.
 *     - Displays current progress, target, unit, and progress bar.
 *   * Badges Section:
 *     - Displays badges earned with icon, name, and description.
 *   * Leaderboard Section:
 *     - Shows community leaderboard with rank, name, and points.
 * - Data Source: GET /goals API endpoint.
 * - State:
 *   * language (en/bn)
 *   * BADGES, LEADERBOARD, GOALS
 *   * isLoaded
 * - Components Used:
 *   * FlatList for lists
 *   * react-native-progress for progress bars
 *   * UniversalSafeArea & UniversalScrollContainer for consistent layout
 *
 * =============================================================================
 * 2. NotificationScreen
 * -----------------------------------------------------------------------------
 * - Purpose: Display user notifications separated into unread and read categories.
 * - Features:
 *   * Unread notifications show a "mark all as read" option.
 *   * Notification cards show icon, title, message, timestamp.
 *   * Tap on unread notifications marks them as read.
 * - Data Source: GET /notifications API endpoint.
 * - State:
 *   * language (en/bn)
 *   * notifications (array)
 *   * isLoaded
 * - Components Used:
 *   * FlatList for rendering notifications
 *   * TouchableOpacity for marking notifications as read
 *   * Feather icons for notification type
 *
 * =============================================================================
 * 3. SellEnergyScreen
 * -----------------------------------------------------------------------------
 * - Purpose: Allow users to sell surplus energy either at market rate or custom price.
 * - Features:
 *   * Live Demand Section:
 *     - Shows current demand and active buyers.
 *   * Sell Mode Toggle:
 *     - User can enable/disable sell mode.
 *     - Updates sellMode via POST /sell/mode.
 *   * Your Listing Section:
 *     - Input for amount (kWh) and price (SOL/kWh).
 *     - Option to use market rate.
 *     - Displays available and on-market quantities.
 *   * Sell Now Button:
 *     - POST /sell/onMarket to list energy for sale.
 * - State:
 *   * language (en/bn)
 *   * price, amount
 *   * useMarketRate, sellMode
 *   * demand, marketRate, available, onMarket
 *   * isBuying, isLoaded
 * - Components Used:
 *   * TextInput for amount and price
 *   * Switch for toggles
 *   * TouchableOpacity for action buttons
 *
 * =============================================================================
 * 4. StatScreen
 * -----------------------------------------------------------------------------
 * - Purpose: Display energy usage, generation, savings, carbon offset, and P2P trading stats.
 * - Features:
 *   * Overview Section: total savings, energy saved (P2P), carbon offset.
 *   * LineChart: weekly usage & generation trends.
 *   * PieChart: P2P trading breakdown.
 *   * BarChart: monthly P2P earnings in SOL.
 *   * P2P Stats Section: total trades, energy traded, earnings.
 *   * Recent Transactions Section: list of individual peer-to-peer trades.
 * - Data Source: GET /stats API endpoint.
 * - State:
 *   * language (en/bn)
 *   * DATA_STATS
 * - Components Used:
 *   * react-native-chart-kit for charts (LineChart, PieChart, BarChart)
 *   * FlatList for recent transactions
 *
 * =============================================================================
 * 5. WalletScreen
 * -----------------------------------------------------------------------------
 * - Purpose: Manage SolarToken wallet, balance, transactions, and security features.
 * - Features:
 *   * Wallet Overview:
 *     - Shows SolarToken balance and energy credits.
 *   * Action Buttons:
 *     - Send, Receive, Swap tokens.
 *   * Fiat Gateway:
 *     - Integration placeholder for buying with bKash/Nagad.
 *   * Transaction History:
 *     - Displays recent buy/sell/staking/carbon credit transactions.
 *   * Settings & Advanced Options:
 *     - Staking
 *     - Security settings (biometric/transaction signing)
 *     - Hardware Wallet connection
 *     - Recovery Phrase
 *     - Export Wallet
 * - Data Source: GET /wallet API endpoint.
 * - State:
 *   * language (en/bn)
 *   * walletData
 *   * transactionHistory
 *   * balance
 * - Components Used:
 *   * FlatList for transaction history
 *   * TouchableOpacity for buttons
 *   * Feather icons for transactions and settings
 *
 * =============================================================================
 * Notes:
 * -----------------------------------------------------------------------------
 * - All screens support bilingual UI: English (en) and Bengali (bn).
 * - Common components: UniversalSafeArea and UniversalScrollContainer for consistent layout.
 * - AsyncStorage is used for storing JWT tokens to authenticate API calls.
 * - All network requests include Authorization header: Bearer <token>.
 * - Error handling includes console logging and Alert messages for network/API failures.
 * - Styles are modularized in respective screen style files (e.g., GamificationStyles.js, WalletStyles.js).
 *
 * =============================================================================
 * End of Documentation
 * =============================================================================

