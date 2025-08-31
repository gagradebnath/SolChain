/**
 * Example usage of SolChain API with ETH deposit functionality
 */

const SolChainAPI = require('./src/solchain-api');

async function example() {
    // Initialize the API
    const api = new SolChainAPI({
        rpcUrl: "http://127.0.0.1:8545",
        privateKey: "your-private-key-here",
        contractAddresses: {
            SolarToken: "0x...",
            EnergyTrading: "0x...",
            Oracle: "0x...",
            Staking: "0x...",
            Governance: "0x..."
        }
    });

    await api.initialize();

    // Example 1: Create a buy offer with automatic ETH deposit
    console.log('Creating buy offer with automatic ETH deposit...');
    const buyOffer = await api.createBuyOffer(
        10,              // 10 kWh of energy
        0.01,           // 0.01 ETH per kWh
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours deadline
        "Solar Farm A", // location
        "Solar"         // energy source
    );

    if (buyOffer.success) {
        console.log('✅ Buy offer created!');
        console.log('💰 ETH deposited:', buyOffer.data.ethDeposited, 'ETH');
        console.log('📝 Transaction hash:', buyOffer.data.transactionHash);
        console.log('🧾 Deposit transaction:', buyOffer.data.depositTransactionHash);
    }

    // Example 2: Manual ETH deposit
    console.log('\\nManually depositing ETH...');
    const deposit = await api.depositETH(1.0); // Deposit 1 ETH

    if (deposit.success) {
        console.log('✅ ETH deposited!');
        console.log('📝 Transaction hash:', deposit.data.transactionHash);
    }

    // Example 3: Check ETH deposit balance
    const userAddress = await api.signer.getAddress();
    const balance = await api.getETHDepositBalance(userAddress);
    
    if (balance.success) {
        console.log('🏦 ETH deposit balance:', balance.data.balance, 'ETH');
    }

    // Example 4: Calculate ETH equivalent for tokens
    const equivalent = await api.calculateETHEquivalent(5.0); // For 5 tokens
    
    if (equivalent.success) {
        console.log('🔢 ETH equivalent for 5 tokens:', equivalent.data.ethEquivalent, 'ETH');
    }

    // Example 5: Withdraw ETH deposit
    const withdrawal = await api.withdrawETHDeposit(0.5); // Withdraw 0.5 ETH
    
    if (withdrawal.success) {
        console.log('✅ ETH withdrawn!');
        console.log('📝 Transaction hash:', withdrawal.data.transactionHash);
    }

    // Example 6: Listen to ETH-related events
    api.startEventListening({
        ethDeposited: (user, amount, event) => {
            console.log(`💰 ETH Deposited: ${ethers.formatEther(amount)} ETH by ${user}`);
        },
        ethWithdrawn: (user, amount, event) => {
            console.log(`🏧 ETH Withdrawn: ${ethers.formatEther(amount)} ETH by ${user}`);
        },
        ethTransferred: (from, to, tokenAmount, ethAmount, event) => {
            console.log(`↔️ ETH Transfer: ${ethers.formatEther(ethAmount)} ETH (${ethers.formatEther(tokenAmount)} tokens) from ${from} to ${to}`);
        },
        offerCreated: (offerId, creator, offerType, amount, price, event) => {
            console.log(`📋 Offer Created: ${offerType === 0 ? 'SELL' : 'BUY'} ${ethers.formatEther(amount)} kWh at ${ethers.formatEther(price)} ETH/kWh`);
        }
    });
}

// Note: This is an example. Replace with actual values and run appropriately.
module.exports = example;
