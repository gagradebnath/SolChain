const PaymentService = require('../utils/paymentGateway'); // Import payment gateway utility

class PaymentService {
    constructor() {
        this.paymentGateway = new PaymentService();
    }

    async processPayment(userId, amount, token) {
        try {
            // Validate payment details
            if (!userId || !amount || !token) {
                throw new Error('Invalid payment details');
            }

            // Call payment gateway to process the payment
            const response = await this.paymentGateway.processPayment(userId, amount, token);

            // Handle response from payment gateway
            if (response.success) {
                return {
                    success: true,
                    message: 'Payment processed successfully',
                    transactionId: response.transactionId,
                };
            } else {
                throw new Error(response.message || 'Payment processing failed');
            }
        } catch (error) {
            // Log error and return failure response
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: error.message || 'An error occurred during payment processing',
            };
        }
    }

    async refundPayment(transactionId) {
        try {
            // Validate transaction ID
            if (!transactionId) {
                throw new Error('Invalid transaction ID');
            }

            // Call payment gateway to process the refund
            const response = await this.paymentGateway.refundPayment(transactionId);

            // Handle response from payment gateway
            if (response.success) {
                return {
                    success: true,
                    message: 'Refund processed successfully',
                };
            } else {
                throw new Error(response.message || 'Refund processing failed');
            }
        } catch (error) {
            // Log error and return failure response
            console.error('Refund processing error:', error);
            return {
                success: false,
                message: error.message || 'An error occurred during refund processing',
            };
        }
    }
}

module.exports = new PaymentService();