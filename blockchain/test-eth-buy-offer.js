/**
 * Test script for ETH deposit functionality with buy offers
 */

const SolChainAPI = require('./src/solchain-api');

async function testETHBuyOffer() {
    console.log('🚀 Testing ETH Buy Offer Functionality\n');

    try {
        // Initialize API with a test private key
        const api = new SolChainAPI({
            rpcUrl: "http://127.0.0.1:8545",
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // First Hardhat account
        });

        await api.initialize();
        console.log('✅ API initialized');

        // Load latest deployment addresses
        const deploymentFiles = require('fs').readdirSync('./deployments')
            .filter(file => file.startsWith('deployment-'))
            .sort((a, b) => b.localeCompare(a));

        if (deploymentFiles.length === 0) {
            throw new Error('No deployment files found. Please run deployment first.');
        }

        const latestDeployment = require(`./deployments/${deploymentFiles[0]}`);
        console.log('📄 Using deployment:', deploymentFiles[0]);

        // Set contract addresses
        await api.setContractAddresses(latestDeployment.addresses);
        console.log('🔗 Contract addresses set');

        // Get user address
        const userAddress = await api.signer.getAddress();
        console.log('👤 User address:', userAddress);

        // Check initial ETH balance
        const ethBalance = await api.getAccountBalance();
        console.log('💰 Initial ETH balance:', ethBalance.data.balance, 'ETH');

        // Check initial ETH deposit balance
        const ethDepositBalance = await api.getETHDepositBalance(userAddress);
        console.log('🏦 Initial ETH deposit balance:', ethDepositBalance.data.balance, 'ETH');

        // Test calculating ETH equivalent
        const energyAmount = 5; // 5 kWh
        const ethEquivalent = await api.calculateETHEquivalent(energyAmount);
        console.log(`🔢 ETH equivalent for ${energyAmount} tokens:`, ethEquivalent.data.ethEquivalent, 'ETH');

        // Create a buy offer (this will automatically deposit ETH)
        console.log('\n🛒 Creating buy offer...');
        const buyOfferResult = await api.createBuyOffer(
            energyAmount,        // 5 kWh
            0.01,               // 0.01 ETH per kWh
            new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            "Test Location",
            "Solar"
        );

        if (buyOfferResult.success) {
            console.log('✅ Buy offer created successfully!');
            console.log('📝 Transaction hash:', buyOfferResult.data.transactionHash);
            console.log('💰 ETH deposited:', buyOfferResult.data.ethDeposited, 'ETH');
            console.log('🧾 Deposit transaction hash:', buyOfferResult.data.depositTransactionHash);
        } else {
            console.log('❌ Buy offer failed:', buyOfferResult.error);
        }

        // Check ETH deposit balance after buy offer
        const finalETHDepositBalance = await api.getETHDepositBalance(userAddress);
        console.log('🏦 Final ETH deposit balance:', finalETHDepositBalance.data.balance, 'ETH');

        // Check final ETH balance
        const finalEthBalance = await api.getAccountBalance();
        console.log('💰 Final ETH balance:', finalEthBalance.data.balance, 'ETH');

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
if (require.main === module) {
    testETHBuyOffer();
}

module.exports = testETHBuyOffer;
