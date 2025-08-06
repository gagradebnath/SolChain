const { body, validationResult } = require('express-validator');

const validateEnergyTransaction = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .notEmpty()
        .withMessage('Amount is required'),
    body('from')
        .isString()
        .withMessage('From address must be a string')
        .notEmpty()
        .withMessage('From address is required'),
    body('to')
        .isString()
        .withMessage('To address must be a string')
        .notEmpty()
        .withMessage('To address is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateEnergyTransaction
};