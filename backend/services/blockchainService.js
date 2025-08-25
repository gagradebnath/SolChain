/**
 * Blockchain Service for SolChain Backend
 * 
 * This service integrates the SolChain blockchain API with the backend routes.
 * It handles all blockchain operations including transactions, wallet management,
 * energy trading, and token operations.
 * 
 * @author SolChain Team
 * @version 1.0.0
 */

const path = require('path');

// Import SolChain blockchain modules
const SolChainAPI = require('../../blockchain/src/solchain-api');
const SolChainConfig = require('../../blockchain/src/config');

/**
 * BlockchainService - Comprehensive blockchain integration service for SolChain
 * 
 * This service acts as the primary interface between the SolChain backend and
 * the blockchain layer. It provides high-level methods for all blockchain
 * operations including wallet management, token operations, energy trading,
 * and system monitoring.
 * 
 * Key Features:
 * - User wallet creation and management
 * - SolarToken (ST) operations (transfer, mint, balance queries)
 * - P2P energy trading marketplace integration
 * - Blockchain transaction monitoring
 * - Oracle data feeds for energy pricing
 * - Smart contract interaction abstraction
 * 
 * Architecture:
 * - Uses SolChainAPI for direct smart contract interaction
 * - Maintains user wallet mappings for consistent address assignment
 * - Provides standardized response formats for frontend consumption
 * - Handles error cases and provides meaningful error messages
 * 
 * @class BlockchainService
 * @author SolChain Team
 * @version 1.0.0
 * 
 * @example
 * // Service is automatically initialized as singleton
 * const blockchainService = require('./services/blockchainService');
 * 
 * // Create user wallet
 * const wallet = await blockchainService.createUserWallet('user123');
 * 
 * // Create energy sell offer
 * const offer = await blockchainService.createSellOffer('user123', {
 *   energyAmount: '100',
 *   pricePerKwh: '0.08'
 * });
 * 
 * @requires ../../blockchain/src/solchain-api - Core blockchain API
 * @requires ../../blockchain/src/config - Blockchain configuration
 */
class BlockchainService {
    /**
     * Create a new BlockchainService instance
     * 
     * Initializes the service with default values and starts the blockchain
     * connection process. The service will automatically connect to the
     * blockchain network and initialize all required smart contracts.
     * 
     * @constructor
     * @memberof BlockchainService
     * 
     * Properties initialized:
     * @property {SolChainAPI|null} api - The blockchain API instance
     * @property {SolChainConfig|null} config - The blockchain configuration
     * @property {boolean} isInitialized - Service initialization status
     * @property {Map<string, string>} userWallets - User ID to address mapping
     * 
     * @example
     * // Service is created as singleton
     * const service = new BlockchainService();
     * // Initialization happens automatically
     */
    constructor() {
        this.api = null;
        this.config = null;
        this.isInitialized = false;
        this.userWallets = new Map(); // Map userId to blockchain address
        
        this.initialize();
    }

    /**
     * Initialize the blockchain connection and deploy contracts if needed
     * 
     * This method sets up the connection to the blockchain network, initializes
     * the SolChain API, and ensures all smart contracts are deployed and accessible.
     * It automatically deploys contracts if they haven't been deployed yet.
     * 
     * @async
     * @returns {Promise<void>} Resolves when initialization is complete
     * @throws {Error} If blockchain initialization fails
     * 
     * @example
     * // Called automatically in constructor
     * await blockchainService.initialize();
     */
    async initialize() {
        try {
            console.log('🔗 Initializing SolChain Blockchain Service...');
            
            this.config = new SolChainConfig();
            
            // Create API instance with automatic contract deployment
            const apiResult = await this.config.createAPIInstance("hardhat", 0);
            
            if (apiResult.success) {
                this.api = apiResult.api;
                this.isInitialized = true;
                console.log('✅ SolChain API initialized successfully');
                console.log('📋 Contract addresses:', apiResult.contractAddresses);
            } else {
                console.error('❌ Failed to initialize SolChain API:', apiResult.error);
                throw new Error(apiResult.error);
            }
        } catch (error) {
            console.error('❌ Blockchain service initialization failed:', error.message);
            this.isInitialized = false;
        }
    }

    /**
     * Ensure the service is initialized before operations
     * 
     * This internal method validates that the blockchain service has been properly
     * initialized and the API connection is available before performing any operations.
     * 
     * @throws {Error} If service is not initialized or API is not available
     * 
     * @example
     * this.checkInitialization(); // Called before blockchain operations
     */
    checkInitialization() {
        if (!this.isInitialized || !this.api) {
            throw new Error('Blockchain service not initialized. Please try again in a few moments.');
        }
    }

    /**
     * Create a blockchain wallet for a new user
     * 
     * Creates a new blockchain wallet by assigning a deterministic address based on
     * the user ID. In this implementation, we use predefined Hardhat accounts for
     * demonstration purposes. In production, this would generate new private keys
     * and store them securely.
     * 
     * @async
     * @param {string} userId - Unique user identifier from the database
     * @returns {Promise<Object>} Wallet creation result object
     * @returns {boolean} returns.success - Whether the operation succeeded
     * @returns {Object} returns.data - Wallet data (if successful)
     * @returns {string} returns.data.address - The blockchain address
     * @returns {string} returns.data.balance - Initial token balance
     * @returns {number} returns.data.walletIndex - Index of the assigned wallet
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const result = await blockchainService.createUserWallet('user123');
     * if (result.success) {
     *   console.log('Wallet created:', result.data.address);
     *   console.log('Initial balance:', result.data.balance);
     * }
     */
    async createUserWallet(userId) {
        this.checkInitialization();
        
        try {
            // For simplicity, we'll use predefined hardhat accounts
            // In production, you'd generate new wallets and manage private keys securely
            const accounts = await this.api.provider.listAccounts();
            const walletIndex = parseInt(userId) % accounts.length;
            const address = accounts[walletIndex];
            
            // Store the mapping
            this.userWallets.set(userId, address);
            
            // Get initial balance
            const balanceResult = await this.api.getTokenBalance(address);
            
            return {
                success: true,
                data: {
                    address: address,
                    balance: balanceResult.success ? balanceResult.data.balance : '0',
                    walletIndex: walletIndex
                }
            };
        } catch (error) {
            console.error('❌ Error creating user wallet:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's blockchain address
     * 
     * Retrieves the blockchain address associated with a user ID. First checks
     * the internal cache, then generates a deterministic address if not found.
     * This ensures consistent address assignment for each user.
     * 
     * @param {string} userId - Unique user identifier
     * @returns {string} The blockchain address (Ethereum-style 0x... address)
     * 
     * @example
     * const address = blockchainService.getUserAddress('user123');
     * console.log('User address:', address); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
     */
    getUserAddress(userId) {
        // Check cache first
        if (this.userWallets.has(userId)) {
            return this.userWallets.get(userId);
        }
        
        // Generate deterministic address for demo purposes
        const accounts = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 
                         "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                         "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"];
        const walletIndex = parseInt(userId) % accounts.length;
        const address = accounts[walletIndex];
        
        this.userWallets.set(userId, address);
        return address;
    }

    /**
     * Get user's comprehensive wallet information
     * 
     * Retrieves complete wallet data including token balances, ETH balance,
     * and transaction history. This provides a full overview of the user's
     * blockchain assets and activity.
     * 
     * @async
     * @param {string} userId - Unique user identifier
     * @returns {Promise<Object>} Wallet data result object
     * @returns {boolean} returns.success - Whether the operation succeeded
     * @returns {Object} returns.data - Wallet information (if successful)
     * @returns {string} returns.data.address - The blockchain address
     * @returns {Object} returns.data.balance - Balance information
     * @returns {string} returns.data.balance.solarToken - SolarToken (ST) balance
     * @returns {string} returns.data.balance.energyCredits - Energy credits balance
     * @returns {string} returns.data.balance.eth - ETH balance
     * @returns {Array} returns.data.transactions - Array of transaction objects
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const wallet = await blockchainService.getUserWallet('user123');
     * if (wallet.success) {
     *   console.log('ST Balance:', wallet.data.balance.solarToken);
     *   console.log('Recent transactions:', wallet.data.transactions.length);
     * }
     */
    async getUserWallet(userId) {
        this.checkInitialization();
        
        try {
            const address = this.getUserAddress(userId);
            
            // Get token balance
            const balanceResult = await this.api.getTokenBalance(address);
            if (!balanceResult.success) {
                throw new Error(balanceResult.error);
            }

            // Get ETH balance
            const ethBalanceResult = await this.api.getAccountBalance(address);
            
            // For demo purposes, we'll simulate transaction history
            // In a real implementation, you'd query blockchain events
            const transactions = await this.generateTransactionHistory(address);

            return {
                success: true,
                data: {
                    address: address,
                    balance: {
                        solarToken: `${balanceResult.data.balance} ST`,
                        energyCredits: '250', // Mock data
                        eth: ethBalanceResult.success ? ethBalanceResult.data.balance : '0'
                    },
                    transactions: transactions
                }
            };
        } catch (error) {
            console.error('❌ Error fetching user wallet:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Transfer SolarTokens between blockchain addresses
     * 
     * Executes a blockchain transaction to transfer SolarTokens from one address
     * to another. This creates a permanent, immutable record on the blockchain.
     * 
     * @async
     * @param {string} fromUserId - User ID of the sender
     * @param {string} toAddress - Recipient's blockchain address (0x...)
     * @param {string} amount - Amount of tokens to transfer (in ST units)
     * @returns {Promise<Object>} Transfer operation result
     * @returns {boolean} returns.success - Whether the transfer succeeded
     * @returns {Object} returns.data - Transaction data (if successful)
     * @returns {string} returns.data.transactionHash - Blockchain transaction hash
     * @returns {string} returns.data.blockNumber - Block number where transaction was mined
     * @returns {string} returns.data.gasUsed - Amount of gas consumed
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const result = await blockchainService.transferTokens(
     *   'user123', 
     *   '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 
     *   '50'
     * );
     * if (result.success) {
     *   console.log('Transfer completed:', result.data.transactionHash);
     * }
     */
    async transferTokens(fromUserId, toAddress, amount) {
        this.checkInitialization();
        
        try {
            const fromAddress = this.getUserAddress(fromUserId);
            
            // Execute the transfer on blockchain
            const result = await this.api.transferTokens(toAddress, amount);
            
            if (result.success) {
                console.log(`✅ Token transfer successful: ${amount} ST from ${fromAddress} to ${toAddress}`);
                console.log(`📝 Transaction hash: ${result.data.transactionHash}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error transferring tokens:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a sell offer for energy on the blockchain marketplace
     * 
     * Creates a new energy sell offer by executing smart contract transactions.
     * This includes token approval for the trading contract and creating the
     * offer record on-chain. The offer becomes immediately available for other
     * users to purchase.
     * 
     * @async
     * @param {string} userId - User ID of the energy seller
     * @param {Object} offerData - Complete offer specification
     * @param {string} offerData.energyAmount - Amount of energy to sell (in kWh)
     * @param {string} offerData.pricePerKwh - Price per kilowatt-hour (in ST tokens)
     * @param {number} [offerData.duration=24] - Offer validity duration in hours
     * @param {string} [offerData.location="Grid-Zone-A"] - Grid location identifier
     * @param {string} [offerData.energySource="Solar"] - Energy source type
     * @returns {Promise<Object>} Offer creation result
     * @returns {boolean} returns.success - Whether the offer was created successfully
     * @returns {Object} returns.data - Offer data (if successful)
     * @returns {string} returns.data.transactionHash - Blockchain transaction hash
     * @returns {string} returns.data.blockNumber - Block number where transaction was mined
     * @returns {string} returns.data.offerId - Unique offer identifier
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const offer = await blockchainService.createSellOffer('user123', {
     *   energyAmount: '100',
     *   pricePerKwh: '0.08',
     *   duration: 48,
     *   location: 'Solar-Farm-A',
     *   energySource: 'Solar'
     * });
     * if (offer.success) {
     *   console.log('Offer created with hash:', offer.data.transactionHash);
     * }
     */
    async createSellOffer(userId, offerData) {
        this.checkInitialization();
        
        try {
            const { energyAmount, pricePerKwh, duration, location, energySource } = offerData;
            
            // First, check if user has enough tokens
            const userAddress = this.getUserAddress(userId);
            const balanceResult = await this.api.getTokenBalance(userAddress);
            
            if (!balanceResult.success) {
                throw new Error("Could not check user balance");
            }
            
            const userBalance = parseFloat(balanceResult.data.balance);
            const requiredAmount = parseFloat(energyAmount);
            
            if (userBalance < requiredAmount) {
                throw new Error(`Insufficient balance. You have ${userBalance} ST but need ${requiredAmount} ST`);
            }
            
            // Approve tokens for energy trading contract if needed
            console.log(`🔐 Approving ${energyAmount} ST for energy trading...`);
            const energyTradingAddress = this.api.config.contractAddresses.EnergyTrading;
            const approveResult = await this.api.approveTokens(
                energyTradingAddress,
                energyAmount.toString()
            );
            
            if (!approveResult.success) {
                throw new Error("Token approval failed: " + approveResult.error);
            }
            
            console.log(`✅ Tokens approved for trading`);
            
            // Calculate deadline (duration in hours)
            const deadline = new Date(Date.now() + (duration || 24) * 60 * 60 * 1000);
            
            const result = await this.api.createSellOffer(
                energyAmount.toString(),
                pricePerKwh.toString(),
                deadline,
                location || "Grid-Zone-A",
                energySource || "Solar"
            );
            
            if (result.success) {
                console.log(`✅ Sell offer created: ${energyAmount} kWh at ${pricePerKwh} ST/kWh`);
                console.log(`📝 Transaction hash: ${result.data.transactionHash}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error creating sell offer:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a buy offer for energy on the blockchain marketplace
     * 
     * Creates a new energy buy offer (bid) on the blockchain. This allows users
     * to specify the energy they want to purchase and the maximum price they're
     * willing to pay, creating a marketplace for energy trading.
     * 
     * @async
     * @param {string} userId - User ID of the energy buyer
     * @param {Object} offerData - Complete buy offer specification
     * @param {string} offerData.energyAmount - Amount of energy to buy (in kWh)
     * @param {string} offerData.pricePerKwh - Maximum price per kilowatt-hour (in ST tokens)
     * @param {number} [offerData.duration=24] - Offer validity duration in hours
     * @param {string} [offerData.location="Grid-Zone-A"] - Preferred grid location
     * @param {string} [offerData.energySource="Any"] - Preferred energy source type
     * @returns {Promise<Object>} Buy offer creation result
     * @returns {boolean} returns.success - Whether the offer was created successfully
     * @returns {Object} returns.data - Offer data (if successful)
     * @returns {string} returns.data.transactionHash - Blockchain transaction hash
     * @returns {string} returns.data.blockNumber - Block number where transaction was mined
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const buyOffer = await blockchainService.createBuyOffer('user456', {
     *   energyAmount: '50',
     *   pricePerKwh: '0.10',
     *   duration: 24,
     *   location: 'Industrial-Zone-B',
     *   energySource: 'Wind'
     * });
     */
    async createBuyOffer(userId, offerData) {
        this.checkInitialization();
        
        try {
            const { energyAmount, pricePerKwh, duration, location, energySource } = offerData;
            
            const deadline = new Date(Date.now() + (duration || 24) * 60 * 60 * 1000);
            
            const result = await this.api.createBuyOffer(
                energyAmount.toString(),
                pricePerKwh.toString(),
                deadline,
                location || "Grid-Zone-A",
                energySource || "Any"
            );
            
            if (result.success) {
                console.log(`✅ Buy offer created: ${energyAmount} kWh at ${pricePerKwh} ST/kWh`);
                console.log(`📝 Transaction hash: ${result.data.transactionHash}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error creating buy offer:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Retrieve active energy offers from the blockchain marketplace
     * 
     * Fetches all currently active energy offers (both buy and sell) from the
     * smart contract. The data is transformed to match the frontend format
     * for easy consumption by the user interface.
     * 
     * @async
     * @param {number} [offset=0] - Pagination offset for large result sets
     * @param {number} [limit=10] - Maximum number of offers to return
     * @returns {Promise<Object>} Active offers result
     * @returns {boolean} returns.success - Whether the operation succeeded
     * @returns {Array} returns.data - Array of active offer objects (if successful)
     * @returns {string} returns.data[].id - Unique offer identifier
     * @returns {string} returns.data[].name - Human-readable offer name
     * @returns {string} returns.data[].rate - Price per kWh
     * @returns {string} returns.data[].availableUnits - Available energy amount
     * @returns {string} returns.data[].trustScore - Seller trust score (mock)
     * @returns {string} returns.data[].type - Offer type ('sell' or 'buy')
     * @returns {string} returns.data[].energySource - Source of energy
     * @returns {string} returns.data[].deadline - Offer expiration date
     * @returns {string} returns.data[].creator - Address of offer creator
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const offers = await blockchainService.getActiveOffers(0, 20);
     * if (offers.success) {
     *   offers.data.forEach(offer => {
     *     console.log(`${offer.name}: ${offer.rate} ST/kWh`);
     *   });
     * }
     */
    async getActiveOffers(offset = 0, limit = 10) {
        this.checkInitialization();
        
        try {
            const result = await this.api.getActiveOffers(offset, limit);
            
            if (result.success) {
                // Transform the offers to match frontend format
                const transformedOffers = result.data.offers.map(offer => ({
                    id: offer.id,
                    name: `${offer.offerType} - ${offer.location}`,
                    rate: offer.pricePerKwh,
                    availableUnits: `${offer.energyAmount} kWh`,
                    trustScore: '95%', // Mock trust score
                    type: offer.offerType.toLowerCase(),
                    energySource: offer.energySource,
                    deadline: offer.deadline,
                    creator: offer.creator
                }));
                
                return {
                    success: true,
                    data: transformedOffers
                };
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error fetching active offers:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Accept and execute an energy offer from the marketplace
     * 
     * Allows a user to accept an existing energy offer, executing the trade
     * on the blockchain. This transfers tokens and completes the energy
     * transaction between buyer and seller.
     * 
     * @async
     * @param {string} userId - User ID accepting the offer
     * @param {string} offerId - Unique identifier of the offer to accept
     * @param {string} energyAmount - Amount of energy to purchase (in kWh)
     * @returns {Promise<Object>} Transaction execution result
     * @returns {boolean} returns.success - Whether the transaction succeeded
     * @returns {Object} returns.data - Transaction data (if successful)
     * @returns {string} returns.data.transactionHash - Blockchain transaction hash
     * @returns {string} returns.data.blockNumber - Block number where transaction was mined
     * @returns {string} returns.data.gasUsed - Amount of gas consumed
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const result = await blockchainService.acceptOffer('user789', 'offer123', '25');
     * if (result.success) {
     *   console.log('Trade executed:', result.data.transactionHash);
     * }
     */
    async acceptOffer(userId, offerId, energyAmount) {
        this.checkInitialization();
        
        try {
            const result = await this.api.acceptOffer(offerId, energyAmount);
            
            if (result.success) {
                console.log(`✅ Offer accepted: ${energyAmount} kWh from offer ${offerId}`);
                console.log(`📝 Transaction hash: ${result.data.transactionHash}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error accepting offer:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get comprehensive system-wide blockchain statistics
     * 
     * Retrieves overall system metrics including token information, trading
     * statistics, and platform health data. This provides insights into the
     * overall state of the SolChain ecosystem.
     * 
     * @async
     * @returns {Promise<Object>} System statistics result
     * @returns {boolean} returns.success - Whether the operation succeeded
     * @returns {Object} returns.data - System data (if successful)
     * @returns {Object} returns.data.tokenInfo - Token contract information
     * @returns {string} returns.data.tokenInfo.name - Token name
     * @returns {string} returns.data.tokenInfo.symbol - Token symbol
     * @returns {string} returns.data.tokenInfo.totalSupply - Total token supply
     * @returns {string} returns.data.tokenInfo.decimals - Token decimal places
     * @returns {Object} returns.data.tradingStats - Trading platform statistics
     * @returns {Object} returns.data.networkInfo - Blockchain network information
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const stats = await blockchainService.getSystemStats();
     * if (stats.success) {
     *   console.log('Total Supply:', stats.data.tokenInfo.totalSupply);
     *   console.log('Token Name:', stats.data.tokenInfo.name);
     * }
     */
    async getSystemStats() {
        this.checkInitialization();
        
        try {
            const result = await this.api.getSystemOverview();
            return result;
        } catch (error) {
            console.error('❌ Error fetching system stats:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate mock transaction history for demonstration purposes
     * 
     * Creates a sample transaction history for testing and demo purposes.
     * In a production environment, this would query actual blockchain events
     * and transaction logs to build a real transaction history.
     * 
     * @async
     * @param {string} address - Blockchain address to generate history for
     * @returns {Promise<Array>} Array of transaction objects
     * @returns {string} returns[].id - Unique transaction identifier
     * @returns {string} returns[].type - Transaction type ('sell', 'buy', 'transfer')
     * @returns {string} returns[].description - Human-readable description
     * @returns {string} returns[].amount - Energy amount with units
     * @returns {string} returns[].value - Token value with currency
     * @returns {string} returns[].timestamp - Relative time description
     * @returns {string} returns[].txHash - Blockchain transaction hash
     * 
     * @example
     * const history = await blockchainService.generateTransactionHistory(address);
     * console.log(`Found ${history.length} transactions`);
     * 
     * @note This is a placeholder implementation for demo purposes.
     * Production version should query blockchain events and transaction logs.
     */
    async generateTransactionHistory(address) {
        // This is mock data - in production you'd query blockchain events
        return [
            {
                id: Date.now().toString(),
                type: 'sell',
                description: 'Energy sale via smart contract',
                amount: '+5.0 kWh',
                value: '+40.0 ST',
                timestamp: '15m ago',
                txHash: '0x123...abc'
            },
            {
                id: (Date.now() - 3600000).toString(),
                type: 'buy',
                description: 'Energy purchase via smart contract',
                amount: '-2.5 kWh',
                value: '-20.0 ST',
                timestamp: '1h ago',
                txHash: '0x456...def'
            }
        ];
    }

    /**
     * Mint new SolarTokens for energy production rewards
     * 
     * Creates new SolarTokens and assigns them to a user's address as a reward
     * for energy production. This is typically called when IoT devices report
     * verified energy generation. Only authorized accounts can mint tokens.
     * 
     * @async
     * @param {string} userId - User ID to receive the minted tokens
     * @param {string} amount - Amount of tokens to mint (in ST units)
     * @returns {Promise<Object>} Token minting result
     * @returns {boolean} returns.success - Whether the minting succeeded
     * @returns {Object} returns.data - Minting data (if successful)
     * @returns {string} returns.data.transactionHash - Blockchain transaction hash
     * @returns {string} returns.data.blockNumber - Block number where transaction was mined
     * @returns {string} returns.data.gasUsed - Amount of gas consumed
     * @returns {string} returns.data.to - Recipient address
     * @returns {string} returns.data.amount - Amount minted
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const result = await blockchainService.mintTokensForProduction('user123', '50');
     * if (result.success) {
     *   console.log('Minted 50 ST for energy production');
     *   console.log('Transaction:', result.data.transactionHash);
     * }
     * 
     * @note Requires MINTER_ROLE in the SolarToken smart contract.
     */
    async mintTokensForProduction(userId, amount) {
        this.checkInitialization();
        
        try {
            const address = this.getUserAddress(userId);
            const result = await this.api.mintTokens(address, amount);
            
            if (result.success) {
                console.log(`✅ Tokens minted for energy production: ${amount} ST to ${address}`);
                console.log(`📝 Transaction hash: ${result.data.transactionHash}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error minting tokens:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current energy price from the blockchain oracle
     * 
     * Retrieves the latest energy price data from the SolChain Oracle smart contract.
     * The oracle aggregates real-world energy pricing data and makes it available
     * on-chain for use by smart contracts and applications.
     * 
     * @async
     * @returns {Promise<Object>} Current energy price result
     * @returns {boolean} returns.success - Whether the operation succeeded
     * @returns {Object} returns.data - Price data (if successful)
     * @returns {string} returns.data.price - Current price per kWh in ST tokens
     * @returns {number} returns.data.timestamp - Unix timestamp of last update
     * @returns {string} returns.data.confidence - Confidence level of the price data
     * @returns {string} returns.error - Error message (if failed)
     * 
     * @example
     * const price = await blockchainService.getCurrentEnergyPrice();
     * if (price.success) {
     *   console.log('Current energy price:', price.data.price, 'ST/kWh');
     *   console.log('Last updated:', new Date(price.data.timestamp * 1000));
     * }
     * 
     * @note Price data is updated by authorized oracle feeds and reflects
     * real-world energy market conditions.
     */
    async getCurrentEnergyPrice() {
        this.checkInitialization();
        
        try {
            const result = await this.api.getEnergyPrice();
            return result;
        } catch (error) {
            console.error('❌ Error fetching energy price:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Create and export singleton instance of BlockchainService
 * 
 * This ensures that only one instance of the blockchain service exists
 * throughout the application, maintaining consistent state and connections.
 * 
 * @type {BlockchainService} The singleton blockchain service instance
 * 
 * @example
 * // Import and use the service
 * const blockchainService = require('./services/blockchainService');
 * 
 * // All operations use the same instance
 * const wallet = await blockchainService.createUserWallet('user123');
 * const balance = await blockchainService.getUserWallet('user123');
 */
const blockchainService = new BlockchainService();

module.exports = blockchainService;
