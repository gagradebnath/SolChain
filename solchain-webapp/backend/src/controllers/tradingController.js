const EnergyTransaction = require('../models/EnergyTransaction');

// Function to execute a trade between two users
exports.executeTrade = async (req, res) => {
    const { sellerId, buyerId, amount, price } = req.body;

    try {
        // Create a new transaction record
        const transaction = new EnergyTransaction({
            seller: sellerId,
            buyer: buyerId,
            amount,
            price,
            timestamp: new Date()
        });

        // Save the transaction to the database
        await transaction.save();

        // Respond with the transaction details
        res.status(201).json({
            message: 'Trade executed successfully',
            transaction
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error executing trade',
            error: error.message
        });
    }
};

// Function to get transaction history for a user
exports.getTransactionHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        // Retrieve transactions for the user
        const transactions = await EnergyTransaction.find({
            $or: [{ seller: userId }, { buyer: userId }]
        }).sort({ timestamp: -1 });

        // Respond with the transaction history
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving transaction history',
            error: error.message
        });
    }
};