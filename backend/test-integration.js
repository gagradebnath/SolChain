/**
 * Backend-Blockchain Integration Test Script
 * 
 * This script demonstrates how to test your backend's blockchain integration.
 * Run this after starting both blockchain and backend servers.
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const TEST_USER = {
    username: 'testuser',
    password: 'testpass123'
};

class IntegrationTester {
    constructor() {
        this.authToken = null;
        this.testWallet = null;
    }

    /**
     * Login to get auth token (you'll need to implement user registration first)
     */
    async login() {
        try {
            console.log('🔐 Logging in...');
            
            // Note: You'll need to create this endpoint in your auth routes
            const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_USER);
            
            if (response.data.success) {
                this.authToken = response.data.token;
                console.log('✅ Login successful');
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.log('⚠️ Login failed (expected if auth not implemented)');
            console.log('   Using dummy token for testing...');
            // For testing without auth, create a dummy token
            this.authToken = 'dummy-token-for-testing';
        }
    }

    /**
     * Get request headers with auth token
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Test blockchain connection status
     */
    async testBlockchainStatus() {
        try {
            console.log('\n📡 Testing blockchain connection...');
            
            const response = await axios.get(`${BACKEND_URL}/api/energy/blockchain/status`, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Blockchain connected successfully');
                console.log('   Contract addresses:', response.data.data.contracts);
                console.log('   Network:', response.data.data.network);
                return true;
            } else {
                console.log('❌ Blockchain not connected:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to check blockchain status:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Test wallet creation
     */
    async testWalletCreation() {
        try {
            console.log('\n👛 Creating new blockchain wallet...');
            
            const response = await axios.post(`${BACKEND_URL}/api/energy/wallet/create`, {}, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                this.testWallet = response.data.data;
                console.log('✅ Wallet created successfully');
                console.log('   Address:', this.testWallet.address);
                return true;
            } else {
                console.log('❌ Wallet creation failed:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to create wallet:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Test getting wallet balance
     */
    async testGetBalance() {
        if (!this.testWallet) {
            console.log('⚠️ No wallet available for balance test');
            return false;
        }

        try {
            console.log('\n💰 Getting wallet balance...');
            
            const response = await axios.get(`${BACKEND_URL}/api/energy/balance/${this.testWallet.address}`, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Balance retrieved successfully');
                console.log('   Balance:', response.data.data.balanceFormatted);
                return true;
            } else {
                console.log('❌ Failed to get balance:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to get balance:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Test recording energy production (minting tokens)
     */
    async testEnergyProduction() {
        if (!this.testWallet) {
            console.log('⚠️ No wallet available for production test');
            return false;
        }

        try {
            console.log('\n⚡ Recording energy production...');
            
            const energyProduced = 10; // 10 kWh
            
            const response = await axios.post(`${BACKEND_URL}/api/energy/production/record`, {
                walletAddress: this.testWallet.address,
                energyProduced: energyProduced
            }, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Energy production recorded successfully');
                console.log('   Energy produced:', energyProduced, 'kWh');
                console.log('   Tokens earned:', response.data.data.tokensEarned);
                console.log('   Transaction hash:', response.data.data.txHash);
                return true;
            } else {
                console.log('❌ Failed to record production:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to record production:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Test getting trading offers
     */
    async testGetTradingOffers() {
        try {
            console.log('\n📋 Getting active trading offers...');
            
            const response = await axios.get(`${BACKEND_URL}/api/energy/trading/offers?limit=5`, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Trading offers retrieved successfully');
                console.log('   Number of offers:', response.data.data.offers?.length || 0);
                return true;
            } else {
                console.log('❌ Failed to get offers:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to get offers:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Test getting trading statistics
     */
    async testTradingStats() {
        try {
            console.log('\n📊 Getting trading statistics...');
            
            const response = await axios.get(`${BACKEND_URL}/api/energy/trading/stats`, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Trading stats retrieved successfully');
                console.log('   Total trades:', response.data.data.totalTrades || 0);
                console.log('   Total volume:', response.data.data.totalVolume || 0, 'kWh');
                return true;
            } else {
                console.log('❌ Failed to get trading stats:', response.data.error);
                return false;
            }
        } catch (error) {
            console.log('❌ Failed to get trading stats:', error.response?.data?.error || error.message);
            return false;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🚀 Starting Backend-Blockchain Integration Tests\n');
        console.log('Make sure you have:');
        console.log('1. ✅ Blockchain server running (npx hardhat node)');
        console.log('2. ✅ Contracts deployed (npm run deploy:local)');
        console.log('3. ✅ Backend server running (npm start)');
        console.log('=' * 50);

        // await this.login();
        
        const tests = [
            this.testBlockchainStatus,
            this.testWalletCreation,
            this.testGetBalance,
            this.testEnergyProduction,
            this.testGetBalance, // Check balance again after production
            this.testGetTradingOffers,
            this.testTradingStats
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            const result = await test.call(this);
            if (result) {
                passed++;
            } else {
                failed++;
            }
        }

        console.log('\n' + '=' * 50);
        console.log('🏁 Test Results:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${passed + failed}`);

        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Your integration is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the blockchain and backend servers.');
        }
    }
}

// Run the tests
async function main() {
    const tester = new IntegrationTester();
    await tester.runAllTests();
}

// Handle command line execution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = IntegrationTester;
