/**
 * Blockchain Service - Connects Backend to SolChain Blockchain
 * 
 * This service provides easy blockchain integration for your backend.
 * It handles all the complexity and provides simple function calls.
 */

const { SolChainConfig } = require('../../blockchain/src/config');
const SolChainAPI = require('../../blockchain/src/solchain-api');

class BlockchainService {
    constructor() {
        this.solchain = null;
        this.isInitialized = false;
        this.config = null;
        
        // Initialize on creation
        this.init();
    }

    /**
     * Initialize the blockchain connection
     */
    async init() {
        try {
            console.log('🔗 Initializing blockchain connection...');
            
            // Create configuration
            this.config = new SolChainConfig();
            
            // Create API instance (connects to local Hardhat node by default)
            const result = await this.config.createAPIInstance('hardhat', 0);
            
            if (result.success) {
                this.solchain = result.api;
                this.isInitialized = true;
                console.log('✅ SolChain API initialized successfully');
                
                // Test connection
                await this.testConnection();
            } else {
                console.error('❌ Failed to initialize SolChain:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Blockchain initialization failed:', error.message);
            // Don't throw here - let the app start but log the error
        }
    }

    /**
     * Test the blockchain connection
     */
    async testConnection() {
        try {
            const tokenInfo = await this.solchain.getTokenInfo();
            if (tokenInfo.success) {
                console.log(`🪙 Connected to ${tokenInfo.data.name} (${tokenInfo.data.symbol})`);
                console.log(`📊 Total Supply: ${tokenInfo.data.totalSupply} tokens`);
            }
        } catch (error) {
            console.warn('⚠️ Blockchain connection test failed:', error.message);
        }
    }

    /**
     * Check if blockchain is ready
     */
    isReady() {
        return this.isInitialized && this.solchain !== null;
    }

    /**
     * Get standardized response format
     */
    formatResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error,
            timestamp: new Date().toISOString()
        };
    }

    // ========================================
    // USER & TOKEN OPERATIONS
    // ========================================

    /**
     * Create a new blockchain wallet for a user
     */
    async createUserWallet() {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.createWallet();
            return this.formatResponse(true, result);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Get user's token balance
     */
    async getUserBalance(walletAddress) {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.getTokenBalance(walletAddress);
            return this.formatResponse(true, result.data);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Mint tokens for energy production
     */
    async mintTokensForEnergyProduction(userAddress, energyAmount, allocationType = "Energy Production") {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.mintTokens(userAddress, energyAmount.toString(), allocationType);
            return this.formatResponse(true, {
                txHash: result.data.transactionHash,
                amount: energyAmount,
                to: userAddress,
                type: allocationType
            });
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Transfer tokens between users
     */
    async transferTokens(fromPrivateKey, toAddress, amount) {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            // Create a temporary API instance with the sender's private key
            const senderConfig = this.config.getAPIConfig('hardhat', 0, this.config.loadDeployedAddresses('hardhat'));
            senderConfig.privateKey = fromPrivateKey;
            
            const senderAPI = new SolChainAPI(senderConfig);
            await senderAPI.initializeContracts(senderConfig.contractAddresses);
            
            const result = await senderAPI.transferTokens(toAddress, amount.toString());
            return this.formatResponse(true, {
                txHash: result.data.transactionHash,
                from: result.data.from,
                to: toAddress,
                amount: amount
            });
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    // ========================================
    // ENERGY TRADING OPERATIONS
    // ========================================

    /**
     * Create a sell offer for energy
     */
    async createSellOffer(sellerPrivateKey, energyKwh, pricePerKwh, expiryHours = 24, location = "Unknown", energyType = "Solar") {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            // Create API instance with seller's private key
            const sellerConfig = this.config.getAPIConfig('hardhat', 0, this.config.loadDeployedAddresses('hardhat'));
            sellerConfig.privateKey = sellerPrivateKey;
            
            const sellerAPI = new SolChainAPI(sellerConfig);
            await sellerAPI.initializeContracts(sellerConfig.contractAddresses);
            
            const expiryDate = new Date(Date.now() + (expiryHours * 60 * 60 * 1000));
            
            const result = await sellerAPI.createSellOffer(
                energyKwh.toString(),
                pricePerKwh.toString(),
                expiryDate,
                location,
                energyType
            );

            return this.formatResponse(true, {
                offerId: result.data.offerId,
                txHash: result.data.transactionHash,
                energyAmount: energyKwh,
                pricePerKwh: pricePerKwh,
                expiryDate: expiryDate.toISOString(),
                location,
                energyType
            });
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Create a buy offer for energy
     */
    async createBuyOffer(buyerPrivateKey, energyKwh, pricePerKwh, expiryHours = 24, location = "Unknown", energyType = "Any") {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const buyerConfig = this.config.getAPIConfig('hardhat', 0, this.config.loadDeployedAddresses('hardhat'));
            buyerConfig.privateKey = buyerPrivateKey;
            
            const buyerAPI = new SolChainAPI(buyerConfig);
            await buyerAPI.initializeContracts(buyerConfig.contractAddresses);
            
            const expiryDate = new Date(Date.now() + (expiryHours * 60 * 60 * 1000));
            
            const result = await buyerAPI.createBuyOffer(
                energyKwh.toString(),
                pricePerKwh.toString(),
                expiryDate,
                location,
                energyType
            );

            return this.formatResponse(true, {
                offerId: result.data.offerId,
                txHash: result.data.transactionHash,
                energyAmount: energyKwh,
                pricePerKwh: pricePerKwh,
                expiryDate: expiryDate.toISOString(),
                location,
                energyType
            });
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Accept an energy trading offer
     */
    async acceptOffer(acceptorPrivateKey, offerId) {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const acceptorConfig = this.config.getAPIConfig('hardhat', 0, this.config.loadDeployedAddresses('hardhat'));
            acceptorConfig.privateKey = acceptorPrivateKey;
            
            const acceptorAPI = new SolChainAPI(acceptorConfig);
            await acceptorAPI.initializeContracts(acceptorConfig.contractAddresses);
            
            const result = await acceptorAPI.acceptOffer(offerId);

            return this.formatResponse(true, {
                tradeId: result.data.tradeId,
                txHash: result.data.transactionHash,
                offerId: offerId
            });
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Get all active trading offers
     */
    async getActiveOffers(offset = 0, limit = 10) {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.getActiveOffers(offset, limit);
            return this.formatResponse(true, result.data);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Get trading statistics
     */
    async getTradingStats() {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.getTradingStats();
            return this.formatResponse(true, result.data);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    // ========================================
    // SYSTEM INFORMATION
    // ========================================

    /**
     * Get blockchain system overview
     */
    async getSystemOverview() {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.getSystemOverview();
            return this.formatResponse(true, result.data);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }

    /**
     * Get account overview for a user
     */
    async getAccountOverview(walletAddress) {
        if (!this.isReady()) {
            return this.formatResponse(false, null, 'Blockchain not initialized');
        }

        try {
            const result = await this.solchain.getAccountOverview(walletAddress);
            return this.formatResponse(true, result.data);
        } catch (error) {
            return this.formatResponse(false, null, error.message);
        }
    }
}

// Export singleton instance
module.exports = new BlockchainService();
