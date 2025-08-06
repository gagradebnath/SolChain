const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyMarketplace", function () {
    let EnergyMarketplace;
    let energyMarketplace;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        EnergyMarketplace = await ethers.getContractFactory("EnergyMarketplace");
        [owner, addr1, addr2] = await ethers.getSigners();
        energyMarketplace = await EnergyMarketplace.deploy();
        await energyMarketplace.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await energyMarketplace.owner()).to.equal(owner.address);
        });

        it("Should initialize with zero energy offers", async function () {
            const offers = await energyMarketplace.getEnergyOffers();
            expect(offers.length).to.equal(0);
        });
    });

    describe("Energy Trading", function () {
        it("Should allow users to create energy offers", async function () {
            await energyMarketplace.connect(addr1).createEnergyOffer(100, ethers.utils.parseEther("0.01"));
            const offers = await energyMarketplace.getEnergyOffers();
            expect(offers.length).to.equal(1);
            expect(offers[0].amount).to.equal(100);
            expect(offers[0].price).to.equal(ethers.utils.parseEther("0.01"));
        });

        it("Should allow users to purchase energy", async function () {
            await energyMarketplace.connect(addr1).createEnergyOffer(100, ethers.utils.parseEther("0.01"));
            await energyMarketplace.connect(addr2).purchaseEnergy(0, { value: ethers.utils.parseEther("0.01") });
            const offers = await energyMarketplace.getEnergyOffers();
            expect(offers[0].amount).to.equal(99);
        });

        it("Should revert if not enough Ether is sent", async function () {
            await energyMarketplace.connect(addr1).createEnergyOffer(100, ethers.utils.parseEther("0.01"));
            await expect(
                energyMarketplace.connect(addr2).purchaseEnergy(0, { value: ethers.utils.parseEther("0.005") })
            ).to.be.revertedWith("Not enough Ether sent");
        });
    });
});