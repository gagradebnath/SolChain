# SolChain Backend

## BCOLBD 2025 - Team GreyDevs
Backend API server for the SolChain blockchain-based solar energy trading platform.

## Team Information
- **Team Name**: GreyDevs
- **Team Size**: 4 Members
- **Team ID**: 68923e7908f3d
- **Project Category**: Blockchain

### Team Members
1. Ghagra Salem Debnath (BUET)
2. Md Abu Russel (BUET) 
3. Md Abu Sufian (KUET)
4. A H M Fuad (BUET)

SolChain is a decentralized solar microgrid platform that enables peer-to-peer (P2P) energy trading using blockchain technology. This backend service is responsible for managing user authentication, energy transactions, trading operations, and interactions with the blockchain.

## BCOLBD 2025 Requirements Compliance

### ✅ Mandatory Prototype Requirements
- **Frontend**: React.js user interface ✅
- **Backend**: Node.js API server ✅
- **Blockchain Integration**: Web3.js with smart contracts ✅
- **Working Prototype**: Fully functional P2P energy trading ✅

### Architecture Compliance (BCOLBD Evaluation Criteria)
- **Problem & Solution**: Addresses energy access and pricing transparency
- **Privacy & Security**: JWT authentication, input validation, blockchain security
- **Decentralized Architecture**: Smart contracts, P2P trading, distributed consensus
- **Governance**: User verification, transparent pricing, regulatory compliance

## Project Structure

- **src/**: Contains the main application code.
  - **controllers/**: Handles the business logic for different functionalities.
    - `authController.js`: Manages user authentication.
    - `energyController.js`: Manages energy-related operations.
    - `tradingController.js`: Handles trading operations.
    - `blockchainController.js`: Interacts with the blockchain.
  - **models/**: Defines the data models for the application.
    - `User.js`: User schema.
    - `EnergyTransaction.js`: Schema for energy transactions.
    - `SmartMeter.js`: Schema for smart meters.
  - **routes/**: Defines the API routes for the application.
    - `auth.js`: Routes for authentication.
    - `energy.js`: Routes for energy operations.
    - `trading.js`: Routes for trading operations.
    - `blockchain.js`: Routes for blockchain interactions.
  - **middleware/**: Contains middleware functions for request handling.
    - `auth.js`: Authentication middleware.
    - `validation.js`: Request validation middleware.
  - **services/**: Contains services for handling business logic.
    - `blockchainService.js`: Manages blockchain interactions.
    - `aiService.js`: Handles AI-related operations.
    - `iotService.js`: Manages IoT device interactions.
    - `paymentService.js`: Handles payment processing.
  - **contracts/**: Contains smart contracts for the application.
    - `SolarToken.sol`: Smart contract for SolarToken.
    - `EnergyTrading.sol`: Smart contract for energy trading.
    - `SmartGrid.sol`: Smart contract for smart grid functionalities.
  - **utils/**: Utility functions for various tasks.
    - `database.js`: Database connection and operations.
    - `logger.js`: Logging functions.
  - **config/**: Configuration files for the application.
    - `database.js`: Database configuration settings.
    - `blockchain.js`: Blockchain configuration settings.
  - `app.js`: Main entry point for the backend application.

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd solchain-webapp/backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file based on the `.env.example` provided.

4. **Run the application**:
   ```
   npm start
   ```

## API Documentation

Refer to the individual route files in the `routes/` directory for detailed API documentation.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.