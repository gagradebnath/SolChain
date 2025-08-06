const mongoose = require('mongoose');
const config = require('../config/database');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Export the connection function
module.exports = {
    connectDB,
};