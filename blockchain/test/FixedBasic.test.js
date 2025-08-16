const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fixed Basic Tests", function () {
    let solarToken, owner, user1, feeCollector;

    beforeEach(async function () {
        [owner, user1, feeCollector] = await ethers.getSigners();
        
        const SolarToken = await ethers.getContractFactory("SolarToken");
        const initialSupply = ethers.parseEther("1000000");
        
        solarToken = await SolarToken.deploy(
            initialSupply,
            feeCollector.address
        );
        await solarToken.waitForDeployment();
    });

    describe("Basic Token Functions", function () {
        it("Should deploy with correct parameters - FIXED", async function () {
            expect(await solarToken.name()).to.equal("SolarToken");
            expect(await solarToken.symbol()).to.equal("ST");
            expect(await solarToken.decimals()).to.equal(18n); // Fixed: Using BigInt
            expect(await solarToken.totalSupply()).to.equal(ethers.parseEther("1000000"));
        });

        it("Should allow emergency withdraw - FIXED", async function () {
            // Send some ETH to the contract
            await owner.sendTransaction({
                to: await solarToken.getAddress(),
                value: ethers.parseEther("1")
            });
            
            const amount = ethers.parseEther("1");
            // Fixed: Using correct function signature (token, to, amount)
            await solarToken.emergencyWithdraw(ethers.ZeroAddress, owner.address, amount);
        });

        it("Should handle BigInt comparisons properly", async function () {
            const balance = await solarToken.balanceOf(owner.address);
            expect(balance).to.equal(ethers.parseEther("1000000"));
            
            // Test that this is indeed a BigInt
            expect(typeof balance).to.equal("bigint");
        });
    });
});
