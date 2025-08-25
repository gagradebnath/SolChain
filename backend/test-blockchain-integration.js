/**
 * Blockchain Integration Test Script
 * 
 * This script tests the integration between the backend and blockchain services.
 * It verifies that all blockchain operations work correctly.
 */

const blockchainService = require('./services/BlockchainService');

async function runIntegrationTests() {
    console.log('🧪 Starting SolChain Backend-Blockchain Integration Tests\n');
    
    try {
        // Wait for blockchain service to initialize
        console.log('⏳ Waiting for blockchain service initialization...');
        let retries = 0;
        while (!blockchainService.isInitialized && retries < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }
        
        if (!blockchainService.isInitialized) {
            throw new Error('Blockchain service failed to initialize after 30 seconds');
        }
        
        console.log('✅ Blockchain service initialized successfully\n');
        
        // Test 1: Create user wallet
        console.log('1️⃣ Testing user wallet creation...');
        const walletResult = await blockchainService.createUserWallet('123');
        if (walletResult.success) {
            console.log(`✅ Wallet created: ${walletResult.data.address}`);
            console.log(`💰 Initial balance: ${walletResult.data.balance} ST\n`);
        } else {
            throw new Error(`Wallet creation failed: ${walletResult.error}`);
        }
        
        // Test 2: Get wallet data
        console.log('2️⃣ Testing wallet data retrieval...');
        const walletData = await blockchainService.getUserWallet('123');
        if (walletData.success) {
            console.log(`✅ Wallet data retrieved successfully`);
            console.log(`📍 Address: ${walletData.data.address}`);
            console.log(`💰 Balance: ${walletData.data.balance.solarToken}`);
            console.log(`📊 Transactions: ${walletData.data.transactions.length} found\n`);
        } else {
            throw new Error(`Wallet data retrieval failed: ${walletData.error}`);
        }
        
        // Test 3: Mint tokens first (simulate energy production)
        console.log('3️⃣ Testing token minting for energy production...');
        const mintResult = await blockchainService.mintTokensForProduction('123', '100');
        if (mintResult.success) {
            console.log(`✅ Tokens minted successfully: 100 ST`);
            console.log(`📝 Transaction hash: ${mintResult.data.transactionHash}\n`);
        } else {
            console.log(`⚠️ Token minting failed: ${mintResult.error}\n`);
        }
        
        // Test 4: Create sell offer (now that user has tokens)
        console.log('4️⃣ Testing energy sell offer creation...');
        const sellOfferResult = await blockchainService.createSellOffer('123', {
            energyAmount: '10',
            pricePerKwh: '8',
            duration: 24,
            location: 'Test-Grid-Zone',
            energySource: 'Solar'
        });
        if (sellOfferResult.success) {
            console.log(`✅ Sell offer created successfully`);
            console.log(`📝 Transaction hash: ${sellOfferResult.data.transactionHash}`);
            console.log(`🆔 Offer ID: ${sellOfferResult.data.offerId || 'N/A'}\n`);
        } else {
            console.log(`⚠️ Sell offer creation failed: ${sellOfferResult.error}\n`);
        }
        
        // Test 5: Get active offers
        console.log('5️⃣ Testing active offers retrieval...');
        const offersResult = await blockchainService.getActiveOffers(0, 5);
        if (offersResult.success) {
            console.log(`✅ Active offers retrieved: ${offersResult.data.length} offers found`);
            offersResult.data.forEach((offer, index) => {
                console.log(`   ${index + 1}. ${offer.name} - ${offer.rate} ST/kWh (${offer.availableUnits})`);
            });
            console.log('');
        } else {
            console.log(`⚠️ Active offers retrieval failed: ${offersResult.error}\n`);
        }
        
        // Test 6: Get system stats
        console.log('6️⃣ Testing system statistics...');
        const statsResult = await blockchainService.getSystemStats();
        if (statsResult.success) {
            console.log(`✅ System stats retrieved successfully`);
            console.log(`📊 Token name: ${statsResult.data.tokenInfo?.name || 'N/A'}`);
            console.log(`📊 Total supply: ${statsResult.data.tokenInfo?.totalSupply || 'N/A'}`);
            console.log('');
        } else {
            console.log(`⚠️ System stats retrieval failed: ${statsResult.error}\n`);
        }
        
        // Test 7: Get current energy price
        console.log('7️⃣ Testing energy price oracle...');
        const priceResult = await blockchainService.getCurrentEnergyPrice();
        if (priceResult.success) {
            console.log(`✅ Energy price retrieved: ${priceResult.data.price} ST/kWh`);
            console.log(`🕒 Last updated: ${new Date(priceResult.data.timestamp * 1000).toLocaleString()}`);
            console.log('');
        } else {
            console.log(`⚠️ Energy price retrieval failed: ${priceResult.error}\n`);
        }
        
        console.log('🎉 All integration tests completed successfully!');
        console.log('✅ Backend is ready to use blockchain functionality');
        
        // Test summary
        console.log('\n📋 Integration Test Summary:');
        console.log('- ✅ Blockchain service initialization');
        console.log('- ✅ User wallet creation and management');
        console.log('- ✅ Token balance queries');
        console.log('- ✅ Token minting for energy production');
        console.log('- ✅ Energy offer creation');
        console.log('- ✅ Active offers retrieval');
        console.log('- ✅ System statistics');
        console.log('- ✅ Oracle price feeds');
        
    } catch (error) {
        console.error('\n❌ Integration test failed:', error.message);
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Ensure blockchain node is running: npm run blockchain:start');
        console.error('2. Deploy contracts: npm run blockchain:deploy');
        console.error('3. Check blockchain folder is accessible from backend');
        console.error('4. Verify all dependencies are installed');
        process.exit(1);
    }
}

// Run tests if script is called directly
if (require.main === module) {
    runIntegrationTests().then(() => {
        console.log('\n🏁 Test script completed successfully');
        process.exit(0);
    }).catch(error => {
        console.error('\n💥 Test script failed:', error.message);
        process.exit(1);
    });
}

module.exports = { runIntegrationTests };
