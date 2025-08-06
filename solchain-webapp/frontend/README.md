# SolChain Frontend Documentation

## Overview
SolChain is a decentralized solar microgrid platform that enables peer-to-peer (P2P) energy trading. This frontend application serves as the user interface for interacting with the SolChain ecosystem, allowing users to monitor their energy production, engage in trading activities, and manage their SolarToken wallet.

## Project Structure
The frontend application is structured as follows:

- **src/**: Contains the source code for the application.
  - **components/**: Reusable components used throughout the application.
    - **Dashboard/**: Components related to energy metrics and trading performance.
    - **Trading/**: Components for facilitating energy trading.
    - **Wallet/**: Components for managing the user's SolarToken wallet.
    - **common/**: Common components like Header and Sidebar.
  - **pages/**: Main pages of the application.
  - **services/**: Functions for API calls and blockchain interactions.
  - **utils/**: Utility functions and constants.
  - **hooks/**: Custom hooks for managing state and side effects.
  - **styles/**: Global styles for the application.
  - **App.jsx**: Main application component.
  - **index.js**: Entry point of the application.

## Getting Started
To run the frontend application, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd solchain-webapp/frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Features
- **Energy Dashboard**: View energy production and consumption metrics.
- **Trading Dashboard**: Monitor trading activities and market trends.
- **P2P Trading**: Engage in peer-to-peer energy trading with other users.
- **Energy Marketplace**: Browse available energy offers and make transactions.
- **Wallet Management**: View SolarToken balance and transaction history.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.