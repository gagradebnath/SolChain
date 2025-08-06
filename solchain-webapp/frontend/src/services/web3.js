import Web3 from 'web3';

/**
 * Web3 Service for SolChain
 * BCOLBD 2025 - Team GreyDevs
 * Handles Web3 initialization and wallet interactions
 */

let web3Instance = null;

// Network configurations
const NETWORKS = {
  // Local development (Hardhat/Ganache)
  31337: {
    name: 'Localhost',
    rpc: 'http://127.0.0.1:8545',
    chainId: 31337,
  },
  // Polygon Mumbai Testnet
  80001: {
    name: 'Polygon Mumbai',
    rpc: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
  },
  // Polygon Mainnet
  137: {
    name: 'Polygon Mainnet',
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
  },
  // Ethereum Sepolia Testnet
  11155111: {
    name: 'Sepolia Testnet',
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
  },
};

/**
 * Initialize Web3 instance
 * @returns {Web3} Web3 instance
 */
export const initializeWeb3 = async () => {
  try {
    // Check if MetaMask is available
    if (typeof window.ethereum !== 'undefined') {
      // Use MetaMask provider
      web3Instance = new Web3(window.ethereum);
      
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log('Web3 initialized with MetaMask');
      return web3Instance;
    } else if (typeof window.web3 !== 'undefined') {
      // Legacy web3 browser
      web3Instance = new Web3(window.web3.currentProvider);
      console.log('Web3 initialized with legacy provider');
      return web3Instance;
    } else {
      // Fallback to local provider for development
      const localProvider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3Instance = new Web3(localProvider);
      console.log('Web3 initialized with local provider');
      return web3Instance;
    }
  } catch (error) {
    console.error('Web3 initialization error:', error);
    throw new Error('Failed to initialize Web3');
  }
};

/**
 * Get Web3 instance
 * @returns {Web3|null} Current Web3 instance
 */
export const getWeb3 = () => {
  return web3Instance;
};

/**
 * Get current account
 * @returns {string|null} Current account address
 */
export const getAccount = async () => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    const accounts = await web3Instance.eth.getAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Get account error:', error);
    return null;
  }
};

/**
 * Get multiple accounts
 * @returns {Array} Array of account addresses
 */
export const getAccounts = async () => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.getAccounts();
  } catch (error) {
    console.error('Get accounts error:', error);
    return [];
  }
};

/**
 * Get network information
 * @returns {Object} Network details
 */
export const getNetwork = async () => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    const chainId = await web3Instance.eth.getChainId();
    const networkInfo = NETWORKS[chainId] || {
      name: 'Unknown Network',
      chainId: chainId,
    };

    return {
      ...networkInfo,
      chainId: Number(chainId),
    };
  } catch (error) {
    console.error('Get network error:', error);
    return { name: 'Unknown', chainId: 0 };
  }
};

/**
 * Get account balance in ETH
 * @param {string} address - Account address
 * @returns {string} Balance in ETH
 */
export const getBalance = async (address) => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    const balanceWei = await web3Instance.eth.getBalance(address);
    return web3Instance.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    console.error('Get balance error:', error);
    return '0';
  }
};

/**
 * Send transaction
 * @param {Object} transactionObject - Transaction details
 * @returns {Object} Transaction receipt
 */
export const sendTransaction = async (transactionObject) => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    const accounts = await getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts available');
    }

    const transaction = {
      from: accounts[0],
      ...transactionObject,
    };

    const receipt = await web3Instance.eth.sendTransaction(transaction);
    return receipt;
  } catch (error) {
    console.error('Send transaction error:', error);
    throw error;
  }
};

/**
 * Convert Wei to Ether
 * @param {string|number} wei - Amount in Wei
 * @returns {string} Amount in Ether
 */
export const fromWei = (wei) => {
  if (!web3Instance) {
    return '0';
  }
  return web3Instance.utils.fromWei(wei.toString(), 'ether');
};

/**
 * Convert Ether to Wei
 * @param {string|number} ether - Amount in Ether
 * @returns {string} Amount in Wei
 */
export const toWei = (ether) => {
  if (!web3Instance) {
    return '0';
  }
  return web3Instance.utils.toWei(ether.toString(), 'ether');
};

/**
 * Check if address is valid
 * @param {string} address - Ethereum address
 * @returns {boolean} True if valid
 */
export const isValidAddress = (address) => {
  if (!web3Instance) {
    return false;
  }
  return web3Instance.utils.isAddress(address);
};

/**
 * Get gas price
 * @returns {string} Current gas price in wei
 */
export const getGasPrice = async () => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.getGasPrice();
  } catch (error) {
    console.error('Get gas price error:', error);
    return '20000000000'; // Default 20 gwei
  }
};

/**
 * Estimate gas for transaction
 * @param {Object} transactionObject - Transaction details
 * @returns {number} Estimated gas
 */
export const estimateGas = async (transactionObject) => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.estimateGas(transactionObject);
  } catch (error) {
    console.error('Estimate gas error:', error);
    return 21000; // Default gas limit
  }
};

/**
 * Switch to specific network
 * @param {number} chainId - Target chain ID
 * @returns {boolean} Success status
 */
export const switchNetwork = async (chainId) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    return true;
  } catch (error) {
    // If network doesn't exist, try to add it
    if (error.code === 4902) {
      return await addNetwork(chainId);
    }
    console.error('Switch network error:', error);
    return false;
  }
};

/**
 * Add new network to MetaMask
 * @param {number} chainId - Chain ID to add
 * @returns {boolean} Success status
 */
export const addNetwork = async (chainId) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const network = NETWORKS[chainId];
    if (!network) {
      throw new Error('Network configuration not found');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: network.name,
          rpcUrls: [network.rpc],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Add network error:', error);
    return false;
  }
};

/**
 * Sign message
 * @param {string} message - Message to sign
 * @param {string} account - Account to sign with
 * @returns {string} Signature
 */
export const signMessage = async (message, account) => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.personal.sign(message, account);
  } catch (error) {
    console.error('Sign message error:', error);
    throw error;
  }
};

/**
 * Get block information
 * @param {string|number} blockNumber - Block number or 'latest'
 * @returns {Object} Block information
 */
export const getBlock = async (blockNumber = 'latest') => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.getBlock(blockNumber);
  } catch (error) {
    console.error('Get block error:', error);
    return null;
  }
};

/**
 * Get transaction receipt
 * @param {string} txHash - Transaction hash
 * @returns {Object} Transaction receipt
 */
export const getTransactionReceipt = async (txHash) => {
  try {
    if (!web3Instance) {
      throw new Error('Web3 not initialized');
    }

    return await web3Instance.eth.getTransactionReceipt(txHash);
  } catch (error) {
    console.error('Get transaction receipt error:', error);
    return null;
  }
};

/**
 * Format address for display
 * @param {string} address - Full address
 * @param {number} prefixLength - Characters to show at start
 * @param {number} suffixLength - Characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, prefixLength = 6, suffixLength = 4) => {
  if (!address || address.length < 10) {
    return address;
  }

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

// Export network configurations for use in other components
export { NETWORKS };

export default {
  initializeWeb3,
  getWeb3,
  getAccount,
  getAccounts,
  getNetwork,
  getBalance,
  sendTransaction,
  fromWei,
  toWei,
  isValidAddress,
  getGasPrice,
  estimateGas,
  switchNetwork,
  addNetwork,
  signMessage,
  getBlock,
  getTransactionReceipt,
  formatAddress,
  NETWORKS,
};