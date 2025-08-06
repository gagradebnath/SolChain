const blockchainService = require('../services/blockchainService');

// Function to get the current energy prices from the blockchain
exports.getCurrentEnergyPrices = async (req, res) => {
    try {
        const prices = await blockchainService.fetchCurrentPrices();
        res.status(200).json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current energy prices', error });
    }
};

// Function to initiate a peer-to-peer energy trade
exports.initiateTrade = async (req, res) => {
    const { sellerId, buyerId, amount } = req.body;

    try {
        const transaction = await blockchainService.executeTrade(sellerId, buyerId, amount);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error initiating trade', error });
    }
};

// Function to get transaction history for a user
exports.getTransactionHistory = async (req, res) => {
    const userId = req.params.id;

    try {
        const history = await blockchainService.fetchTransactionHistory(userId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction history', error });
    }
};