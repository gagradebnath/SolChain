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

class BlockchainService {
    constructor() {
        this.api = null;
        this.config = null;
        this.isInitialized = false;
        this.userWallets = new Map(); // Map userId to blockchain address
        
        this.initialize();
    }

    /**
     * Initialize the blockchain connection
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
     */
    checkInitialization() {
        if (!this.isInitialized || !this.api) {
            throw new Error('Blockchain service not initialized. Please try again in a few moments.');
        }
    }

    /**
     * Create a blockchain wallet for a new user
     * @param {string} userId - User ID from the database
     * @returns {Promise<Object>} Wallet creation result
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
     * @param {string} userId - User ID
     * @returns {string} Blockchain address
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
     * Get user's token balance and transaction history
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Wallet data including balance and transactions
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
     * Transfer tokens between users
     * @param {string} fromUserId - Sender user ID
     * @param {string} toAddress - Recipient address
     * @param {string} amount - Amount to transfer
     * @returns {Promise<Object>} Transfer result
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
     * Create a sell offer for energy
     * @param {string} userId - User ID of the seller
     * @param {Object} offerData - Offer details
     * @returns {Promise<Object>} Offer creation result
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
     * Create a buy offer for energy
     * @param {string} userId - User ID of the buyer
     * @param {Object} offerData - Offer details
     * @returns {Promise<Object>} Offer creation result
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
     * Get active energy offers from the blockchain
     * @param {number} offset - Pagination offset
     * @param {number} limit - Number of offers to fetch
     * @returns {Promise<Object>} Active offers
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
     * Accept an energy offer
     * @param {string} userId - User ID accepting the offer
     * @param {string} offerId - Offer ID to accept
     * @param {string} energyAmount - Amount of energy to purchase
     * @returns {Promise<Object>} Transaction result
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
     * Get system-wide statistics
     * @returns {Promise<Object>} System statistics
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
     * Generate mock transaction history for demo purposes
     * In production, this would query blockchain events
     * @param {string} address - User address
     * @returns {Array} Transaction history
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
     * Mint tokens for energy production (admin function)
     * @param {string} userId - User ID
     * @param {string} amount - Amount of tokens to mint
     * @returns {Promise<Object>} Minting result
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
     * Get current energy price from oracle
     * @returns {Promise<Object>} Current energy price
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

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
