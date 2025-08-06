const EnergyTransaction = require('../models/EnergyTransaction');
const SmartMeter = require('../models/SmartMeter');

// Get energy data for a specific user
exports.getEnergyData = async (req, res) => {
    try {
        const userId = req.user.id;
        const energyData = await SmartMeter.find({ userId });

        if (!energyData) {
            return res.status(404).json({ message: 'No energy data found for this user.' });
        }

        res.status(200).json(energyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Record a new energy transaction
exports.recordTransaction = async (req, res) => {
    try {
        const { sellerId, buyerId, amount, price } = req.body;

        const newTransaction = new EnergyTransaction({
            sellerId,
            buyerId,
            amount,
            price,
            timestamp: new Date(),
        });

        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get transaction history for a specific user
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await EnergyTransaction.find({
            $or: [{ sellerId: userId }, { buyerId: userId }],
        });

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};