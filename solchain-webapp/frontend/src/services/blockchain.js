/**
 * Blockchain Service for SolChain
 * BCOLBD 2025 - Team GreyDevs
 * Handles smart contract interactions and blockchain operations
 */

// Contract ABIs (Application Binary Interface)
// These would normally be imported from compiled contract artifacts
const SOLAR_TOKEN_ABI = [
  // ERC-20 Standard functions
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Custom SolarToken functions
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getEnergyStats",
    "outputs": [
      {"internalType": "uint256", "name": "currentBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "totalProduced", "type": "uint256"},
      {"internalType": "uint256", "name": "totalConsumed", "type": "uint256"},
      {"internalType": "uint256", "name": "netProduction", "type": "uint256"},
      {"internalType": "uint256", "name": "carbonCreditsEarned", "type": "uint256"},
      {"internalType": "uint256", "name": "lastProduction", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const ENERGY_TRADING_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_energyAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_pricePerKWh", "type": "uint256"},
      {"internalType": "uint256", "name": "_durationHours", "type": "uint256"}
    ],
    "name": "listEnergy",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_listingId", "type": "uint256"},
      {"internalType": "uint256", "name": "_energyAmount", "type": "uint256"}
    ],
    "name": "purchaseEnergy",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlatformStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalTrades", "type": "uint256"},
      {"internalType": "uint256", "name": "totalListings", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEnergyTradedAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "totalFeesCollectedAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses (these would be set after deployment)
const CONTRACT_ADDRESSES = {
  development: {
    SOLAR_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    ENERGY_TRADING: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  }
};

let web3;
let solarToken;
let energyTrading;

/**
 * Initialize Web3 and smart contracts
 */
const initWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize contracts
        const addresses = CONTRACT_ADDRESSES.development;
        solarToken = new web3.eth.Contract(SOLAR_TOKEN_ABI, addresses.SOLAR_TOKEN);
        energyTrading = new web3.eth.Contract(ENERGY_TRADING_ABI, addresses.ENERGY_TRADING);
        
        console.log('Web3 and contracts initialized successfully');
    } else {
        console.error('Please install MetaMask or another Ethereum wallet.');
        throw new Error('MetaMask not detected');
    }
};

/**
 * Connect to blockchain and return contract instances
 */
export const connectToBlockchain = async (web3Instance) => {
    try {
        web3 = web3Instance;
        const addresses = CONTRACT_ADDRESSES.development;
        
        solarToken = new web3.eth.Contract(SOLAR_TOKEN_ABI, addresses.SOLAR_TOKEN);
        energyTrading = new web3.eth.Contract(ENERGY_TRADING_ABI, addresses.ENERGY_TRADING);
        
        return {
            solarToken,
            energyTrading,
            web3
        };
    } catch (error) {
        console.error('Blockchain connection error:', error);
        throw error;
    }
};

/**
 * Get SolarToken balance for an address
 */
const getBalance = async (address) => {
    if (!solarToken) {
        await initWeb3();
    }
    const balance = await solarToken.methods.balanceOf(address).call();
    return web3.utils.fromWei(balance, 'ether');
};

/**
 * Get energy statistics for a user
 */
export const getEnergyStats = async (address) => {
    try {
        if (!solarToken) {
            await initWeb3();
        }
        
        const stats = await solarToken.methods.getEnergyStats(address).call();
        return {
            currentBalance: web3.utils.fromWei(stats.currentBalance, 'ether'),
            totalProduced: web3.utils.fromWei(stats.totalProduced, 'ether'),
            totalConsumed: web3.utils.fromWei(stats.totalConsumed, 'ether'),
            netProduction: web3.utils.fromWei(stats.netProduction, 'ether'),
            carbonCreditsEarned: stats.carbonCreditsEarned,
            lastProduction: new Date(Number(stats.lastProduction) * 1000)
        };
    } catch (error) {
        console.error('Get energy stats error:', error);
        return {
            currentBalance: '0',
            totalProduced: '0',
            totalConsumed: '0',
            netProduction: '0',
            carbonCreditsEarned: '0',
            lastProduction: new Date()
        };
    }
};

/**
 * Transfer SolarTokens to another address
 */
const transferTokens = async (to, amount) => {
    if (!solarToken) {
        await initWeb3();
    }
    const accounts = await web3.eth.getAccounts();
    const amountWei = web3.utils.toWei(amount, 'ether');
    return await solarToken.methods.transfer(to, amountWei).send({ from: accounts[0] });
};

/**
 * List energy for sale
 */
export const listEnergyForSale = async (energyAmount, pricePerKWh, durationHours) => {
    try {
        if (!energyTrading) {
            await initWeb3();
        }
        
        const accounts = await web3.eth.getAccounts();
        const energyAmountWei = web3.utils.toWei(energyAmount, 'ether');
        const pricePerKWhWei = web3.utils.toWei(pricePerKWh, 'ether');
        
        const result = await energyTrading.methods
            .listEnergy(energyAmountWei, pricePerKWhWei, durationHours)
            .send({ from: accounts[0] });
            
        return {
            success: true,
            transactionHash: result.transactionHash
        };
    } catch (error) {
        console.error('List energy for sale error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Purchase energy from a listing
 */
export const purchaseEnergy = async (listingId, energyAmount, totalPrice) => {
    try {
        if (!energyTrading) {
            await initWeb3();
        }
        
        const accounts = await web3.eth.getAccounts();
        const energyAmountWei = web3.utils.toWei(energyAmount, 'ether');
        const totalPriceWei = web3.utils.toWei(totalPrice, 'ether');
        
        const result = await energyTrading.methods
            .purchaseEnergy(listingId, energyAmountWei)
            .send({ 
                from: accounts[0],
                value: totalPriceWei
            });
            
        return {
            success: true,
            transactionHash: result.transactionHash
        };
    } catch (error) {
        console.error('Purchase energy error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
    try {
        if (!energyTrading) {
            await initWeb3();
        }
        
        const stats = await energyTrading.methods.getPlatformStats().call();
        return {
            totalTrades: Number(stats.totalTrades),
            totalListings: Number(stats.totalListings),
            totalEnergyTraded: web3.utils.fromWei(stats.totalEnergyTradedAmount, 'ether'),
            totalFeesCollected: web3.utils.fromWei(stats.totalFeesCollectedAmount, 'ether')
        };
    } catch (error) {
        console.error('Get platform stats error:', error);
        return {
            totalTrades: 0,
            totalListings: 0,
            totalEnergyTraded: '0',
            totalFeesCollected: '0'
        };
    }
};

/**
 * Legacy function - Create a trade (deprecated in favor of listEnergyForSale)
 */
const createTrade = async (amount, price) => {
    return await listEnergyForSale(amount, price, 24); // Default 24 hours
};

/**
 * Get trade history for an address (simplified)
 */
const getTradeHistory = async (address) => {
    try {
        // This would need to be implemented by fetching events
        // For now, return empty array
        return [];
    } catch (error) {
        console.error('Get trade history error:', error);
        return [];
    }
};

export { 
    initWeb3, 
    getBalance, 
    transferTokens, 
    createTrade, 
    getTradeHistory 
};