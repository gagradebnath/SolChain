const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SolarToken", function () {
    let SolarToken;
    let solarToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        SolarToken = await ethers.getContractFactory("SolarToken");
        [owner, addr1, addr2] = await ethers.getSigners();
        solarToken = await SolarToken.deploy();
        await solarToken.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await solarToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await solarToken.balanceOf(owner.address);
            expect(await solarToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            await solarToken.transfer(addr1.address, 50);
            const addr1Balance = await solarToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await solarToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await solarToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await solarToken.balanceOf(owner.address);
            await expect(
                solarToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("Not enough tokens");

            // Owner balance shouldn't have changed
            expect(await solarToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await solarToken.balanceOf(owner.address);
            await solarToken.transfer(addr1.address, 100);
            await solarToken.transfer(addr2.address, 50);

            const finalOwnerBalance = await solarToken.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

            const addr1Balance = await solarToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await solarToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });
});