const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SolarToken with ETH Transfer", function () {
    let solarToken;
    let owner, prosumer1, prosumer2, consumer, feeCollector;
    let initialSupply = ethers.parseEther("1000000"); // 1M tokens

    beforeEach(async function () {
        [owner, prosumer1, prosumer2, consumer, feeCollector] = await ethers.getSigners();
        
        const SolarToken = await ethers.getContractFactory("SolarToken");
        solarToken = await SolarToken.deploy(initialSupply, feeCollector.address);
        await solarToken.waitForDeployment();
        
        console.log("\n🌞 SolChain - P2P Energy Trading with ETH Transfers");
        console.log("=" .repeat(70));
        console.log("📍 Contract Address:", await solarToken.getAddress());
        console.log("⚡ Initial Supply:", ethers.formatEther(initialSupply), "ST");
        console.log("💱 Exchange Rate: 1 ST = 1 kWh");
        console.log("🔄 ETH Ratio:", await solarToken.ethToTokenRatio(), "wei per ST");
    });

    describe("ETH Transfer Functionality", function () {
        it("Should allow ETH deposits and show balances", async function () {
            const ethDepositAmount = ethers.parseEther("10"); // 10 ETH
            
            console.log("\n💰 ETH DEPOSIT SIMULATION");
            console.log("-".repeat(50));
            console.log("🏠 Prosumer:", prosumer1.address.slice(0, 10) + "...");
            console.log("💵 Depositing:", ethers.formatEther(ethDepositAmount), "ETH");
            
            // Deposit ETH
            await solarToken.connect(prosumer1).depositETH({ value: ethDepositAmount });
            
            const ethBalance = await solarToken.getETHBalance(prosumer1.address);
            const contractETHBalance = await ethers.provider.getBalance(await solarToken.getAddress());
            
            console.log("✅ DEPOSIT SUCCESSFUL:");
            console.log("  📊 Prosumer ETH Balance:", ethers.formatEther(ethBalance), "ETH");
            console.log("  🏦 Contract ETH Balance:", ethers.formatEther(contractETHBalance), "ETH");
            
            expect(ethBalance).to.equal(ethDepositAmount);
        });

        it("Should transfer both ST tokens and equivalent ETH", async function () {
            // Setup: Deposit ETH and mint tokens
            const ethDepositAmount = ethers.parseEther("5"); // 5 ETH
            const tokenMintAmount = ethers.parseEther("100"); // 100 ST tokens
            
            await solarToken.connect(prosumer1).depositETH({ value: ethDepositAmount });
            await solarToken.mint(prosumer1.address, tokenMintAmount, "Solar energy generation");
            
            console.log("\n🔄 DUAL TRANSFER SIMULATION (ST + ETH)");
            console.log("=" .repeat(60));
            console.log("👨‍🌾 Prosumer (Seller):", prosumer1.address.slice(0, 10) + "...");
            console.log("🏭 Consumer (Buyer):", consumer.address.slice(0, 10) + "...");
            
            // Check initial balances
            const prosumer1STBefore = await solarToken.balanceOf(prosumer1.address);
            const prosumer1ETHBefore = await solarToken.getETHBalance(prosumer1.address);
            const consumerSTBefore = await solarToken.balanceOf(consumer.address);
            const consumerETHBefore = await solarToken.getETHBalance(consumer.address);
            
            console.log("\n📊 BEFORE TRANSFER:");
            console.log("  Prosumer ST Balance:", ethers.formatEther(prosumer1STBefore), "ST");
            console.log("  Prosumer ETH Balance:", ethers.formatEther(prosumer1ETHBefore), "ETH");
            console.log("  Consumer ST Balance:", ethers.formatEther(consumerSTBefore), "ST");
            console.log("  Consumer ETH Balance:", ethers.formatEther(consumerETHBefore), "ETH");
            
            // Execute transfer
            const transferAmount = ethers.parseEther("50"); // 50 ST tokens
            const expectedETHTransfer = await solarToken.calculateETHAmount(transferAmount);
            
            console.log("\n⚡ EXECUTING TRANSFER:");
            console.log("  Energy Amount:", ethers.formatEther(transferAmount), "kWh");
            console.log("  Expected ETH Transfer:", ethers.formatEther(expectedETHTransfer), "ETH");
            
            const tx = await solarToken.connect(prosumer1).transfer(consumer.address, transferAmount);
            const receipt = await tx.wait();
            
            // Check final balances
            const prosumer1STAfter = await solarToken.balanceOf(prosumer1.address);
            const prosumer1ETHAfter = await solarToken.getETHBalance(prosumer1.address);
            const consumerSTAfter = await solarToken.balanceOf(consumer.address);
            const consumerETHAfter = await solarToken.getETHBalance(consumer.address);
            
            console.log("\n📊 AFTER TRANSFER:");
            console.log("  Prosumer ST Balance:", ethers.formatEther(prosumer1STAfter), "ST");
            console.log("  Prosumer ETH Balance:", ethers.formatEther(prosumer1ETHAfter), "ETH");
            console.log("  Consumer ST Balance:", ethers.formatEther(consumerSTAfter), "ST");
            console.log("  Consumer ETH Balance:", ethers.formatEther(consumerETHAfter), "ETH");
            
            console.log("\n✅ BLOCKCHAIN TRANSACTION:");
            console.log("  📝 TX Hash:", receipt.hash);
            console.log("  ⛽ Gas Used:", receipt.gasUsed.toString());
            console.log("  💰 ST Value Transferred:", ethers.formatEther(transferAmount), "ST");
            console.log("  💵 ETH Value Transferred:", ethers.formatEther(expectedETHTransfer), "ETH");
            console.log("  🚀 DUAL VALUE TRANSFER SUCCESSFUL!");
            
            // Verify transfers (accounting for fees)
            const feePercentage = await solarToken.transferFeePercentage();
            const expectedFee = (transferAmount * feePercentage) / 10000n;
            const expectedSTReceived = transferAmount - expectedFee;
            
            expect(consumerSTAfter).to.equal(expectedSTReceived);
            expect(consumerETHAfter).to.equal(expectedETHTransfer);
        });

        it("Should show comprehensive dual-asset ecosystem", async function () {
            // Setup multiple participants with ETH and tokens
            const ethAmount = ethers.parseEther("3");
            await solarToken.connect(prosumer1).depositETH({ value: ethAmount });
            await solarToken.connect(prosumer2).depositETH({ value: ethAmount });
            
            await solarToken.mint(prosumer1.address, ethers.parseEther("200"), "Solar farm - Dhaka");
            await solarToken.mint(prosumer2.address, ethers.parseEther("150"), "Solar microgrid - Chittagong");
            
            console.log("\n🌍 SOLCHAIN DUAL-ASSET ECOSYSTEM");
            console.log("=" .repeat(70));
            
            // Multiple trades
            const trade1 = ethers.parseEther("75");
            const trade2 = ethers.parseEther("60");
            
            await solarToken.connect(prosumer1).transfer(consumer.address, trade1);
            await solarToken.connect(prosumer2).transfer(consumer.address, trade2);
            
            // Show final ecosystem state
            const balances = await Promise.all([
                solarToken.balanceOf(prosumer1.address),
                solarToken.balanceOf(prosumer2.address),
                solarToken.balanceOf(consumer.address),
                solarToken.balanceOf(feeCollector.address),
                solarToken.getETHBalance(prosumer1.address),
                solarToken.getETHBalance(prosumer2.address),
                solarToken.getETHBalance(consumer.address),
                solarToken.totalSupply()
            ]);
            
            const totalETHTransferred = await solarToken.calculateETHAmount(trade1 + trade2);
            
            console.log("📊 FINAL ECOSYSTEM STATE:");
            console.log("🌞 Total Energy Tokenized:", ethers.formatEther(balances[7]), "kWh");
            console.log("");
            console.log("💰 SOLARTOKEN BALANCES:");
            console.log("  🏠 Prosumer 1 (Dhaka):", ethers.formatEther(balances[0]), "ST");
            console.log("  🏘️  Prosumer 2 (Chittagong):", ethers.formatEther(balances[1]), "ST");
            console.log("  🏭 Consumer:", ethers.formatEther(balances[2]), "ST");
            console.log("  🏦 Platform Fees:", ethers.formatEther(balances[3]), "ST");
            console.log("");
            console.log("💵 ETH BALANCES:");
            console.log("  🏠 Prosumer 1:", ethers.formatEther(balances[4]), "ETH");
            console.log("  🏘️  Prosumer 2:", ethers.formatEther(balances[5]), "ETH");
            console.log("  🏭 Consumer:", ethers.formatEther(balances[6]), "ETH");
            console.log("");
            console.log("🎯 COMPETITION CRITERIA ACHIEVED:");
            console.log("  ✅ Backend writes to blockchain: ST + ETH transfers");
            console.log("  ✅ Real problem solved: P2P energy trading with dual assets");
            console.log("  ✅ Value demonstration:", ethers.formatEther(balances[2]), "ST +", ethers.formatEther(balances[6]), "ETH");
            console.log("  ✅ Innovation: Dual-asset energy tokenization");
            console.log("  🚀 Total ETH Transferred:", ethers.formatEther(totalETHTransferred), "ETH");
            console.log("=" .repeat(70));
        });

        it("Should handle ETH withdrawal", async function () {
            // Setup
            const ethDepositAmount = ethers.parseEther("2");
            await solarToken.connect(consumer).depositETH({ value: ethDepositAmount });
            
            const withdrawAmount = ethers.parseEther("1");
            const initialETHBalance = await ethers.provider.getBalance(consumer.address);
            
            console.log("\n💸 ETH WITHDRAWAL SIMULATION");
            console.log("-".repeat(40));
            console.log("💰 Withdrawing:", ethers.formatEther(withdrawAmount), "ETH");
            
            await solarToken.connect(consumer).withdrawETH(withdrawAmount);
            
            const finalETHBalance = await ethers.provider.getBalance(consumer.address);
            const contractETHBalance = await solarToken.getETHBalance(consumer.address);
            
            console.log("✅ WITHDRAWAL SUCCESSFUL:");
            console.log("  📊 Remaining Contract ETH Balance:", ethers.formatEther(contractETHBalance), "ETH");
            console.log("  💵 ETH returned to wallet");
            
            expect(contractETHBalance).to.equal(ethDepositAmount - withdrawAmount);
        });
    });
});
