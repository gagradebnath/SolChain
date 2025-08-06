const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// Route to get blockchain data
router.get('/data', blockchainController.getBlockchainData);

// Route to initiate a transaction
router.post('/transaction', blockchainController.initiateTransaction);

// Route to get transaction history
router.get('/transactions/:userId', blockchainController.getTransactionHistory);

module.exports = router;