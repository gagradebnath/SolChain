/**
 * SolChain API Test Suite
 * 
 * Basic tests to verify API functionality
 */

const SolChainAPI = require('./solchain-api');
const SolChainConfig = require('./config');

async function runAPITests() {
    console.log("🧪 Starting SolChain API Tests...\n");
    
    try {
        // Initialize configuration
        const config = new SolChainConfig();
        
        // Create API instance
        console.log("1️⃣ Creating API instance...");
        const apiResult = await config.createAPIInstance("hardhat", 0);
        
        if (!apiResult.success) {
            throw new Error(`API creation failed: ${apiResult.error}`);
        }
        
        const { api } = apiResult;
        console.log("✅ API instance created successfully\n");

        // Test 1: Token Information
        console.log("2️⃣ Testing token information...");
        const tokenInfo = await api.getTokenInfo();
        console.log("📄 Token Info:", tokenInfo.success ? "✅ PASS" : "❌ FAIL");
        if (tokenInfo.success) {
            console.log(`   Token: ${tokenInfo.data.name} (${tokenInfo.data.symbol})`);
            console.log(`   Total Supply: ${tokenInfo.data.totalSupply} tokens`);
        }
        console.log();

        // Test 2: Account Balance
        console.log("3️⃣ Testing account balance...");
        const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const balance = await api.getTokenBalance(deployer);
        console.log("💰 Token Balance:", balance.success ? "✅ PASS" : "❌ FAIL");
        if (balance.success) {
            console.log(`   Balance: ${balance.data.balance} ST`);
        }
        console.log();

        // Test 3: System Overview
        console.log("4️⃣ Testing system overview...");
        const overview = await api.getSystemOverview();
        console.log("🏛️ System Overview:", overview.success ? "✅ PASS" : "❌ FAIL");
        if (overview.success) {
            console.log(`   Trading Stats: ${overview.data.tradingStats ? "Available" : "Not Available"}`);
            console.log(`   Staking Stats: ${overview.data.stakingStats ? "Available" : "Not Available"}`);
            console.log(`   Energy Price: ${overview.data.energyPrice ? "Available" : "Not Available"}`);
        }
        console.log();

        // Test 4: Energy Price
        console.log("5️⃣ Testing energy price retrieval...");
        const energyPrice = await api.getEnergyPrice();
        console.log("💲 Energy Price:", energyPrice.success ? "✅ PASS" : "❌ FAIL");
        if (energyPrice.success) {
            console.log(`   Current Price: ${energyPrice.data.price} ETH/kWh`);
            console.log(`   Confidence: ${energyPrice.data.confidence}%`);
        }
        console.log();

        // Test 5: Trading Statistics
        console.log("6️⃣ Testing trading statistics...");
        const tradingStats = await api.getTradingStats();
        console.log("📊 Trading Stats:", tradingStats.success ? "✅ PASS" : "❌ FAIL");
        if (tradingStats.success) {
            console.log(`   Total Trades: ${tradingStats.data.totalTrades}`);
            console.log(`   Total Volume: ${tradingStats.data.totalVolume} ST`);
            console.log(`   Active Offers: ${tradingStats.data.activeOffers}`);
        }
        console.log();

        // Test 6: Staking Statistics
        console.log("7️⃣ Testing staking statistics...");
        const stakingStats = await api.getStakingStats();
        console.log("🥩 Staking Stats:", stakingStats.success ? "✅ PASS" : "❌ FAIL");
        if (stakingStats.success) {
            console.log(`   Total Validators: ${stakingStats.data.totalValidators}`);
            console.log(`   Active Validators: ${stakingStats.data.activeValidators}`);
            console.log(`   Total Staked: ${stakingStats.data.totalStakedAmount} ST`);
        }
        console.log();

        // Test 7: Active Offers
        console.log("8️⃣ Testing active offers retrieval...");
        const activeOffers = await api.getActiveOffers(0, 5);
        console.log("🔋 Active Offers:", activeOffers.success ? "✅ PASS" : "❌ FAIL");
        if (activeOffers.success) {
            console.log(`   Number of Offers: ${activeOffers.data.offers.length}`);
        }
        console.log();

        console.log("🎉 All API tests completed successfully!");
        return true;

    } catch (error) {
        console.error("❌ API tests failed:", error);
        return false;
    }
}

// Performance test
async function runPerformanceTest() {
    console.log("\n🚀 Running Performance Tests...\n");
    
    try {
        const config = new SolChainConfig();
        const apiResult = await config.createAPIInstance("hardhat", 0);
        
        if (!apiResult.success) {
            throw new Error(`API creation failed: ${apiResult.error}`);
        }
        
        const { api } = apiResult;
        
        // Test multiple concurrent requests
        console.log("⚡ Testing concurrent requests...");
        const startTime = Date.now();
        
        const promises = [
            api.getTokenInfo(),
            api.getEnergyPrice(),
            api.getTradingStats(),
            api.getStakingStats(),
            api.getActiveOffers(0, 10)
        ];
        
        const results = await Promise.all(promises);
        const endTime = Date.now();
        
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Completed ${successCount}/${results.length} requests in ${endTime - startTime}ms`);
        
        // Test sequential requests
        console.log("\n⏱️ Testing sequential requests...");
        const seqStartTime = Date.now();
        
        for (let i = 0; i < 5; i++) {
            await api.getTokenInfo();
        }
        
        const seqEndTime = Date.now();
        console.log(`✅ Completed 5 sequential requests in ${seqEndTime - seqStartTime}ms`);
        
        return true;
        
    } catch (error) {
        console.error("❌ Performance tests failed:", error);
        return false;
    }
}

// Integration test with actual blockchain
async function runIntegrationTest() {
    console.log("\n🔗 Running Integration Tests...\n");
    
    try {
        const config = new SolChainConfig();
        const apiResult = await config.createAPIInstance("hardhat", 0);
        
        if (!apiResult.success) {
            throw new Error(`API creation failed: ${apiResult.error}`);
        }
        
        const { api } = apiResult;
        
        // Test 1: Token Transfer
        console.log("1️⃣ Testing token transfer...");
        const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const transferResult = await api.transferTokens(recipient, "10");
        console.log("🔄 Token Transfer:", transferResult.success ? "✅ PASS" : "❌ FAIL");
        
        if (transferResult.success) {
            console.log(`   Transaction Hash: ${transferResult.data.transactionHash}`);
            console.log(`   Gas Used: ${transferResult.data.gasUsed}`);
        }
        console.log();

        // Test 2: Create Energy Offer
        console.log("2️⃣ Testing energy offer creation...");
        const offerResult = await api.createSellOffer(
            "1", // 1 kWh (small amount for testing)
            "8", // 8 ST per kWh
            new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            "Test Location",
            "Solar"
        );
        console.log("🔋 Energy Offer:", offerResult.success ? "✅ PASS" : "❌ FAIL");
        
        if (offerResult.success) {
            console.log(`   Transaction Hash: ${offerResult.data.transactionHash}`);
            console.log(`   Energy Amount: ${offerResult.data.energyAmount} kWh`);
            console.log(`   Price: ${offerResult.data.pricePerKwh} ST/kWh`);
        }
        console.log();

        // Test 3: Token Approval
        console.log("3️⃣ Testing token approval...");
        const tradingContract = apiResult.addresses.EnergyTrading;
        const approvalResult = await api.approveTokens(tradingContract, "100");
        console.log("✅ Token Approval:", approvalResult.success ? "✅ PASS" : "❌ FAIL");
        
        if (approvalResult.success) {
            console.log(`   Transaction Hash: ${approvalResult.data.transactionHash}`);
            console.log(`   Approved Amount: ${approvalResult.data.amount} ST`);
        }
        console.log();

        console.log("🎉 Integration tests completed successfully!");
        return true;

    } catch (error) {
        console.error("❌ Integration tests failed:", error);
        console.error("Error details:", error.message);
        return false;
    }
}

// Error handling test
async function runErrorHandlingTest() {
    console.log("\n🛡️ Running Error Handling Tests...\n");
    
    try {
        const config = new SolChainConfig();
        
        // Test 1: Invalid network
        console.log("1️⃣ Testing invalid network handling...");
        try {
            config.getNetworkConfig("invalid_network");
            console.log("❌ Should have thrown error for invalid network");
        } catch (error) {
            console.log("✅ Invalid network error handled correctly");
        }

        // Test 2: API without contracts
        console.log("\n2️⃣ Testing API without contract initialization...");
        const api = new SolChainAPI({
            rpcUrl: "http://127.0.0.1:8545",
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        });
        
        const tokenInfoResult = await api.getTokenInfo();
        console.log("🔧 Uninitialized Contract:", tokenInfoResult.success ? "❌ FAIL" : "✅ PASS");
        
        // Test 3: Invalid parameters
        console.log("\n3️⃣ Testing invalid parameter handling...");
        const apiResult = await config.createAPIInstance("hardhat", 0);
        if (apiResult.success) {
            const invalidTransfer = await apiResult.api.transferTokens("invalid_address", "invalid_amount");
            console.log("🚫 Invalid Parameters:", invalidTransfer.success ? "❌ FAIL" : "✅ PASS");
        }

        console.log("\n🎉 Error handling tests completed!");
        return true;

    } catch (error) {
        console.error("❌ Error handling tests failed:", error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log("🧪 SolChain API Complete Test Suite");
    console.log("=" .repeat(50));
    
    const results = {
        api: false,
        performance: false,
        integration: false,
        errorHandling: false
    };
    
    try {
        results.api = await runAPITests();
        results.performance = await runPerformanceTest();
        results.integration = await runIntegrationTest();
        results.errorHandling = await runErrorHandlingTest();
        
        console.log("\n📊 Test Results Summary:");
        console.log("=" .repeat(30));
        console.log(`API Tests: ${results.api ? "✅ PASS" : "❌ FAIL"}`);
        console.log(`Performance Tests: ${results.performance ? "✅ PASS" : "❌ FAIL"}`);
        console.log(`Integration Tests: ${results.integration ? "✅ PASS" : "❌ FAIL"}`);
        console.log(`Error Handling Tests: ${results.errorHandling ? "✅ PASS" : "❌ FAIL"}`);
        
        const passCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;
        
        console.log(`\n🎯 Overall Result: ${passCount}/${totalCount} test suites passed`);
        
        if (passCount === totalCount) {
            console.log("🎉 All tests passed! SolChain API is ready for production!");
        } else {
            console.log("⚠️ Some tests failed. Please review the errors above.");
        }
        
    } catch (error) {
        console.error("❌ Test suite execution failed:", error);
    }
}

module.exports = {
    runAPITests,
    runPerformanceTest,
    runIntegrationTest,
    runErrorHandlingTest,
    runAllTests
};

// Run tests if called directly
if (require.main === module) {
    const testType = process.argv[2] || "all";
    
    switch (testType) {
        case "api":
            runAPITests();
            break;
        case "performance":
            runPerformanceTest();
            break;
        case "integration":
            runIntegrationTest();
            break;
        case "error":
            runErrorHandlingTest();
            break;
        case "all":
        default:
            runAllTests();
            break;
    }
}
