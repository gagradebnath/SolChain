const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');

// Route to get all trading transactions
router.get('/transactions', tradingController.getAllTransactions);

// Route to create a new trade
router.post('/trade', tradingController.createTrade);

// Route to get a specific trade by ID
router.get('/trade/:id', tradingController.getTradeById);

// Route to update a trade
router.put('/trade/:id', tradingController.updateTrade);

// Route to delete a trade
router.delete('/trade/:id', tradingController.deleteTrade);

module.exports = router;