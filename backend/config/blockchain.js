/**
 * Blockchain Configuration for Backend
 * 
 * This file contains configuration settings for connecting your backend to the blockchain.
 */

require('dotenv').config();

const BLOCKCHAIN_CONFIG = {
    // Network settings
    networks: {
        development: {
            rpcUrl: "http://127.0.0.1:8545",
            chainId: 1337,
            name: "Hardhat Local"
        },
        testnet: {
            rpcUrl: process.env.TESTNET_RPC_URL || "https://rpc.sepolia.org",
            chainId: 11155111,
            name: "Sepolia Testnet"
        },
        mainnet: {
            rpcUrl: process.env.MAINNET_RPC_URL,
            chainId: 1,
            name: "Ethereum Mainnet"
        }
    },

    // Current environment (change this based on your deployment)
    currentNetwork: process.env.BLOCKCHAIN_NETWORK || 'development',

    // Default gas settings
    gas: {
        limit: 3000000,
        price: "20000000000" // 20 gwei
    },

    // Contract deployment addresses (auto-loaded from blockchain/deployments/)
    contracts: {
        // These will be loaded automatically by BlockchainService
        SolarToken: null,
        EnergyTrading: null,
        Oracle: null,
        Staking: null,
        Governance: null
    },

    // Security settings
    security: {
        // In production, never store private keys in code!
        // Use environment variables or secure key management
        useEnvironmentKeys: true,
        
        // For development only - these are Hardhat's default accounts
        developmentKeys: [
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
            "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
        ]
    }
};

/**
 * Get the current network configuration
 */
function getCurrentNetworkConfig() {
    const network = BLOCKCHAIN_CONFIG.networks[BLOCKCHAIN_CONFIG.currentNetwork];
    if (!network) {
        throw new Error(`Network ${BLOCKCHAIN_CONFIG.currentNetwork} not found in configuration`);
    }
    return network;
}

/**
 * Check if we're in development mode
 */
function isDevelopment() {
    return BLOCKCHAIN_CONFIG.currentNetwork === 'development';
}

/**
 * Get a development private key (for testing only)
 */
function getDevelopmentKey(index = 0) {
    if (!isDevelopment()) {
        throw new Error('Development keys should only be used in development mode');
    }
    return BLOCKCHAIN_CONFIG.security.developmentKeys[index];
}

/**
 * Get environment variable safely
 */
function getEnvVar(name, defaultValue = null) {
    const value = process.env[name];
    if (!value && !defaultValue) {
        console.warn(`⚠️ Environment variable ${name} is not set`);
    }
    return value || defaultValue;
}

module.exports = {
    BLOCKCHAIN_CONFIG,
    getCurrentNetworkConfig,
    isDevelopment,
    getDevelopmentKey,
    getEnvVar
};
