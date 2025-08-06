import React, { useEffect, useState } from 'react';
import { getSolarTokenBalance, transferSolarTokens } from '../../services/blockchain';
import './SolarTokenWallet.css';

const SolarTokenWallet = () => {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');

    useEffect(() => {
        const fetchBalance = async () => {
            const tokenBalance = await getSolarTokenBalance();
            setBalance(tokenBalance);
        };

        fetchBalance();
    }, []);

    const handleTransfer = async () => {
        if (!amount || !recipient) {
            setTransactionStatus('Please enter a valid amount and recipient address.');
            return;
        }

        try {
            const result = await transferSolarTokens(recipient, amount);
            setTransactionStatus(`Transfer successful: ${result}`);
            setAmount('');
            setRecipient('');
            // Refresh balance after transfer
            const tokenBalance = await getSolarTokenBalance();
            setBalance(tokenBalance);
        } catch (error) {
            setTransactionStatus(`Transfer failed: ${error.message}`);
        }
    };

    return (
        <div className="solar-token-wallet">
            <h2>SolarToken Wallet</h2>
            <p>Balance: {balance} SolarTokens</p>
            <div className="transfer-form">
                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={handleTransfer}>Transfer</button>
            </div>
            {transactionStatus && <p>{transactionStatus}</p>}
        </div>
    );
};

export default SolarTokenWallet;