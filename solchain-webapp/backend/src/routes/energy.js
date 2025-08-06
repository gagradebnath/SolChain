const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energyController');

// Route to get energy data
router.get('/data', energyController.getEnergyData);

// Route to create a new energy transaction
router.post('/transaction', energyController.createEnergyTransaction);

// Route to get transaction history
router.get('/transactions', energyController.getTransactionHistory);

// Route to update smart meter data
router.put('/smart-meter/:id', energyController.updateSmartMeterData);

module.exports = router;