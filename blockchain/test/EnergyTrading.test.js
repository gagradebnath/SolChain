const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EnergyTrading", function () {
  // Test fixture to deploy contracts
  async function deployEnergyTradingFixture() {
    const [owner, feeCollector, seller, buyer, user1, user2] = await ethers.getSigners();
    
    // Deploy SolarToken first
    const SolarToken = await ethers.getContractFactory("SolarToken");
    const solarToken = await SolarToken.deploy(feeCollector.address);
    
    // Deploy EnergyTrading
    const EnergyTrading = await ethers.getContractFactory("EnergyTrading");
    const energyTrading = await EnergyTrading.deploy(
      await solarToken.getAddress(),
      feeCollector.address
    );
    
    // Set energy trading contract in SolarToken
    await solarToken.setEnergyTradingContract(await energyTrading.getAddress());
    
    // Mint tokens to seller and buyer for testing
    const mintAmount = ethers.parseEther("10000");
    await solarToken.mint(seller.address, mintAmount);
    await solarToken.mint(buyer.address, mintAmount);
    
    return { solarToken, energyTrading, owner, feeCollector, seller, buyer, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      const { solarToken, energyTrading, feeCollector } = await loadFixture(deployEnergyTradingFixture);
      
      expect(await energyTrading.solarToken()).to.equal(await solarToken.getAddress());
      expect(await energyTrading.feeCollector()).to.equal(feeCollector.address);
      expect(await energyTrading.nextOfferId()).to.equal(1);
      expect(await energyTrading.nextTradeId()).to.equal(1);
    });

    it("Should set correct initial parameters", async function () {
      const { energyTrading } = await loadFixture(deployEnergyTradingFixture);
      
      expect(await energyTrading.tradingFeeBasisPoints()).to.equal(25); // 0.25%
      expect(await energyTrading.minimumTradeAmount()).to.equal(ethers.parseEther("1"));
      expect(await energyTrading.maximumTradeAmount()).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("Offer Creation", function () {
    it("Should create a sell offer", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400; // 1 day
      
      await expect(energyTrading.connect(seller).createOffer(
        0, // SELL
        energyAmount,
        pricePerKWh,
        expirationTime,
        "Grid-A",
        "Solar energy from rooftop panels"
      )).to.emit(energyTrading, "OfferCreated")
        .withArgs(1, seller.address, 0, energyAmount, pricePerKWh);
      
      const offer = await energyTrading.getOffer(1);
      expect(offer.creator).to.equal(seller.address);
      expect(offer.energyAmount).to.equal(energyAmount);
      expect(offer.pricePerKWh).to.equal(pricePerKWh);
      expect(offer.status).to.equal(0); // ACTIVE
    });

    it("Should create a buy offer", async function () {
      const { energyTrading, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      const energyAmount = ethers.parseEther("50");
      const pricePerKWh = ethers.parseEther("0.06");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(buyer).createOffer(
        1, // BUY
        energyAmount,
        pricePerKWh,
        expirationTime,
        "Grid-B",
        "Need energy for factory operations"
      )).to.emit(energyTrading, "OfferCreated")
        .withArgs(1, buyer.address, 1, energyAmount, pricePerKWh);
    });

    it("Should reject offers below minimum amount", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      const energyAmount = ethers.parseEther("0.5"); // Below minimum
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(seller).createOffer(
        0, // SELL
        energyAmount,
        pricePerKWh,
        expirationTime,
        "Grid-A",
        "Test offer"
      )).to.be.revertedWith("EnergyTrading: amount too small");
    });

    it("Should reject offers above maximum amount", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      const energyAmount = ethers.parseEther("20000"); // Above maximum
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(seller).createOffer(
        0, // SELL
        energyAmount,
        pricePerKWh,
        expirationTime,
        "Grid-A",
        "Test offer"
      )).to.be.revertedWith("EnergyTrading: amount too large");
    });

    it("Should reject sell offer if seller has insufficient tokens", async function () {
      const { energyTrading, user1 } = await loadFixture(deployEnergyTradingFixture);
      
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(user1).createOffer(
        0, // SELL
        energyAmount,
        pricePerKWh,
        expirationTime,
        "Grid-A",
        "Test offer"
      )).to.be.revertedWith("EnergyTrading: insufficient token balance");
    });
  });

  describe("Offer Management", function () {
    it("Should allow offer creator to cancel offer", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Create offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test offer"
      );
      
      // Cancel offer
      await expect(energyTrading.connect(seller).cancelOffer(1))
        .to.emit(energyTrading, "OfferCancelled")
        .withArgs(1, seller.address);
      
      const offer = await energyTrading.getOffer(1);
      expect(offer.status).to.equal(1); // CANCELLED
    });

    it("Should not allow non-creator to cancel offer", async function () {
      const { energyTrading, seller, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      // Create offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test offer"
      );
      
      // Try to cancel from different account
      await expect(energyTrading.connect(buyer).cancelOffer(1))
        .to.be.revertedWith("EnergyTrading: not offer creator");
    });

    it("Should allow offer creator to update offer", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Create offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test offer"
      );
      
      // Update offer
      const newPricePerKWh = ethers.parseEther("0.06");
      const newExpirationTime = (await time.latest()) + 172800; // 2 days
      
      await expect(energyTrading.connect(seller).updateOffer(1, newPricePerKWh, newExpirationTime))
        .to.emit(energyTrading, "OfferUpdated")
        .withArgs(1, newPricePerKWh, newExpirationTime);
      
      const offer = await energyTrading.getOffer(1);
      expect(offer.pricePerKWh).to.equal(newPricePerKWh);
      expect(offer.expirationTime).to.equal(newExpirationTime);
    });
  });

  describe("Trade Execution", function () {
    it("Should execute a sell offer trade", async function () {
      const { solarToken, energyTrading, seller, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      // Create sell offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const totalPrice = energyAmount * pricePerKWh / ethers.parseEther("1");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Solar energy"
      );
      
      // Approve tokens for trading contract
      await solarToken.connect(seller).approve(await energyTrading.getAddress(), energyAmount);
      
      // Accept offer with sufficient ETH
      await expect(energyTrading.connect(buyer).acceptOffer(1, { value: totalPrice }))
        .to.emit(energyTrading, "TradeExecuted")
        .withArgs(1, 1, buyer.address, seller.address, energyAmount, totalPrice);
      
      // Check offer status
      const offer = await energyTrading.getOffer(1);
      expect(offer.status).to.equal(2); // COMPLETED
      
      // Check trade was created
      const trade = await energyTrading.trades(1);
      expect(trade.buyer).to.equal(buyer.address);
      expect(trade.seller).to.equal(seller.address);
      expect(trade.energyAmount).to.equal(energyAmount);
      expect(trade.status).to.equal(0); // PENDING
    });

    it("Should execute a buy offer trade", async function () {
      const { solarToken, energyTrading, seller, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      // Create buy offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(buyer).createOffer(
        1, energyAmount, pricePerKWh, expirationTime, "Grid-B", "Need energy"
      );
      
      // Approve tokens for trading contract
      await solarToken.connect(seller).approve(await energyTrading.getAddress(), energyAmount);
      
      // Accept offer (seller has tokens)
      await expect(energyTrading.connect(seller).acceptOffer(1))
        .to.emit(energyTrading, "TradeExecuted");
      
      const trade = await energyTrading.trades(1);
      expect(trade.buyer).to.equal(buyer.address);
      expect(trade.seller).to.equal(seller.address);
    });

    it("Should not allow accepting own offer", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Create sell offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Solar energy"
      );
      
      // Try to accept own offer
      await expect(energyTrading.connect(seller).acceptOffer(1))
        .to.be.revertedWith("EnergyTrading: cannot accept own offer");
    });

    it("Should reject trade with insufficient payment for sell offer", async function () {
      const { energyTrading, seller, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      // Create sell offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const totalPrice = energyAmount * pricePerKWh / ethers.parseEther("1");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Solar energy"
      );
      
      // Try to accept with insufficient payment
      const insufficientPayment = totalPrice / 2n;
      await expect(energyTrading.connect(buyer).acceptOffer(1, { value: insufficientPayment }))
        .to.be.revertedWith("EnergyTrading: insufficient payment");
    });
  });

  describe("Trade Completion", function () {
    async function createAndAcceptTrade() {
      const { solarToken, energyTrading, seller, buyer } = await loadFixture(deployEnergyTradingFixture);
      
      // Create and accept sell offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const totalPrice = energyAmount * pricePerKWh / ethers.parseEther("1");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Solar energy"
      );
      
      await solarToken.connect(seller).approve(await energyTrading.getAddress(), energyAmount);
      await energyTrading.connect(buyer).acceptOffer(1, { value: totalPrice });
      
      return { solarToken, energyTrading, seller, buyer, energyAmount, totalPrice };
    }

    it("Should complete trade and distribute funds correctly", async function () {
      const { solarToken, energyTrading, seller, buyer, energyAmount, totalPrice } = await createAndAcceptTrade();
      
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialBuyerTokenBalance = await solarToken.balanceOf(buyer.address);
      
      // Complete trade
      await expect(energyTrading.connect(buyer).completeTrade(1))
        .to.emit(energyTrading, "TradeCompleted")
        .withArgs(1, buyer.address, seller.address);
      
      // Check tokens transferred to buyer
      expect(await solarToken.balanceOf(buyer.address)).to.equal(initialBuyerTokenBalance + energyAmount);
      
      // Check ETH transferred to seller (minus platform fee)
      const platformFee = totalPrice * 25n / 10000n; // 0.25% fee
      const sellerPayment = totalPrice - platformFee;
      
      const trade = await energyTrading.trades(1);
      expect(trade.status).to.equal(1); // COMPLETED
    });

    it("Should allow seller to complete trade", async function () {
      const { energyTrading, seller } = await createAndAcceptTrade();
      
      await expect(energyTrading.connect(seller).completeTrade(1))
        .to.emit(energyTrading, "TradeCompleted");
    });

    it("Should not allow non-participants to complete trade", async function () {
      const { energyTrading, user1 } = await createAndAcceptTrade();
      
      await expect(energyTrading.connect(user1).completeTrade(1))
        .to.be.revertedWith("EnergyTrading: not trade participant");
    });
  });

  describe("Dispute Management", function () {
    async function createTradeForDispute() {
      const fixture = await createAndAcceptTrade();
      return fixture;
    }

    it("Should allow trade participants to initiate dispute", async function () {
      const { energyTrading, buyer } = await createTradeForDispute();
      
      const reason = "Product not as described";
      await expect(energyTrading.connect(buyer).initiateDispute(1, reason))
        .to.emit(energyTrading, "DisputeInitiated")
        .withArgs(1, buyer.address, reason);
      
      const trade = await energyTrading.trades(1);
      expect(trade.status).to.equal(2); // DISPUTED
      expect(trade.disputeInitiator).to.equal(buyer.address);
      expect(trade.disputeReason).to.equal(reason);
    });

    it("Should not allow non-participants to initiate dispute", async function () {
      const { energyTrading, user1 } = await createTradeForDispute();
      
      await expect(energyTrading.connect(user1).initiateDispute(1, "Some reason"))
        .to.be.revertedWith("EnergyTrading: not trade participant");
    });

    it("Should allow dispute resolver to resolve dispute in favor of seller", async function () {
      const { solarToken, energyTrading, owner, seller, buyer, energyAmount } = await createTradeForDispute();
      
      // Initiate dispute
      await energyTrading.connect(buyer).initiateDispute(1, "Quality issue");
      
      const initialBuyerTokenBalance = await solarToken.balanceOf(buyer.address);
      
      // Resolve in favor of seller
      await expect(energyTrading.connect(owner).resolveDispute(1, seller.address))
        .to.emit(energyTrading, "DisputeResolved")
        .withArgs(1, seller.address, owner.address);
      
      // Check tokens transferred to buyer (seller wins, trade proceeds)
      expect(await solarToken.balanceOf(buyer.address)).to.equal(initialBuyerTokenBalance + energyAmount);
      
      const trade = await energyTrading.trades(1);
      expect(trade.status).to.equal(3); // RESOLVED
    });

    it("Should allow dispute resolver to resolve dispute in favor of buyer", async function () {
      const { solarToken, energyTrading, owner, seller, buyer, energyAmount, totalPrice } = await createTradeForDispute();
      
      // Initiate dispute
      await energyTrading.connect(buyer).initiateDispute(1, "Quality issue");
      
      const initialSellerTokenBalance = await solarToken.balanceOf(seller.address);
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      
      // Resolve in favor of buyer
      await energyTrading.connect(owner).resolveDispute(1, buyer.address);
      
      // Check tokens returned to seller
      expect(await solarToken.balanceOf(seller.address)).to.equal(initialSellerTokenBalance + energyAmount);
      
      const trade = await energyTrading.trades(1);
      expect(trade.status).to.equal(3); // RESOLVED
    });
  });

  describe("Escrow Timeout", function () {
    it("Should allow refund after timeout", async function () {
      const { solarToken, energyTrading, seller, buyer, energyAmount, totalPrice } = await createAndAcceptTrade();
      
      // Fast forward past timeout
      await time.increase(25 * 60 * 60); // 25 hours
      
      const initialSellerTokenBalance = await solarToken.balanceOf(seller.address);
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      
      // Refund expired trade
      await expect(energyTrading.refundExpiredTrade(1))
        .to.emit(energyTrading, "EscrowRefunded")
        .withArgs(1, buyer.address, totalPrice);
      
      // Check tokens returned to seller
      expect(await solarToken.balanceOf(seller.address)).to.equal(initialSellerTokenBalance + energyAmount);
      
      const trade = await energyTrading.trades(1);
      expect(trade.status).to.equal(4); // REFUNDED
    });

    it("Should not allow refund before timeout", async function () {
      const { energyTrading } = await createAndAcceptTrade();
      
      await expect(energyTrading.refundExpiredTrade(1))
        .to.be.revertedWith("EnergyTrading: trade not expired");
    });
  });

  describe("Administrative Functions", function () {
    it("Should allow admin to set trading limits", async function () {
      const { energyTrading, owner } = await loadFixture(deployEnergyTradingFixture);
      
      const newMinAmount = ethers.parseEther("5");
      const newMaxAmount = ethers.parseEther("50000");
      
      await expect(energyTrading.connect(owner).setTradingLimits(newMinAmount, newMaxAmount))
        .to.emit(energyTrading, "TradingParametersUpdated")
        .withArgs(25, newMinAmount, newMaxAmount);
      
      expect(await energyTrading.minimumTradeAmount()).to.equal(newMinAmount);
      expect(await energyTrading.maximumTradeAmount()).to.equal(newMaxAmount);
    });

    it("Should allow admin to blacklist user", async function () {
      const { energyTrading, owner, user1 } = await loadFixture(deployEnergyTradingFixture);
      
      await expect(energyTrading.connect(owner).blacklistUser(user1.address))
        .to.emit(energyTrading, "UserBlacklisted")
        .withArgs(user1.address);
      
      expect(await energyTrading.blacklistedUsers(user1.address)).to.be.true;
    });

    it("Should prevent blacklisted user from creating offers", async function () {
      const { energyTrading, owner, user1 } = await loadFixture(deployEnergyTradingFixture);
      
      await energyTrading.connect(owner).blacklistUser(user1.address);
      
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(user1).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test"
      )).to.be.revertedWith("EnergyTrading: user is blacklisted");
    });

    it("Should allow admin to pause and unpause trading", async function () {
      const { energyTrading, owner, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Pause trading
      await energyTrading.connect(owner).pauseTrading();
      expect(await energyTrading.paused()).to.be.true;
      
      // Creating offers should fail when paused
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await expect(energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test"
      )).to.be.revertedWith("Pausable: paused");
      
      // Resume trading
      await energyTrading.connect(owner).resumeTrading();
      expect(await energyTrading.paused()).to.be.false;
      
      // Creating offers should work again
      await expect(energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test"
      )).to.not.be.reverted;
    });
  });

  describe("Data Retrieval", function () {
    it("Should return active offers with pagination", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Create multiple offers
      for (let i = 0; i < 5; i++) {
        const energyAmount = ethers.parseEther("100");
        const pricePerKWh = ethers.parseEther("0.05");
        const expirationTime = (await time.latest()) + 86400;
        
        await energyTrading.connect(seller).createOffer(
          0, energyAmount, pricePerKWh, expirationTime, "Grid-A", `Offer ${i}`
        );
      }
      
      // Get active offers with pagination
      const activeOffers = await energyTrading.getActiveOffers(0, 3);
      expect(activeOffers.length).to.equal(3);
      
      // Check first offer
      expect(activeOffers[0].creator).to.equal(seller.address);
      expect(activeOffers[0].status).to.equal(0); // ACTIVE
    });

    it("Should return user offers", async function () {
      const { energyTrading, seller } = await loadFixture(deployEnergyTradingFixture);
      
      // Create offer
      const energyAmount = ethers.parseEther("100");
      const pricePerKWh = ethers.parseEther("0.05");
      const expirationTime = (await time.latest()) + 86400;
      
      await energyTrading.connect(seller).createOffer(
        0, energyAmount, pricePerKWh, expirationTime, "Grid-A", "Test offer"
      );
      
      const userOffers = await energyTrading.getUserOffers(seller.address);
      expect(userOffers.length).to.equal(1);
      expect(userOffers[0]).to.equal(1);
    });

    it("Should return trading statistics", async function () {
      const { energyTrading } = await loadFixture(deployEnergyTradingFixture);
      
      const stats = await energyTrading.getTradingStats();
      expect(stats[0]).to.equal(0); // totalOffers
      expect(stats[1]).to.equal(0); // totalTrades
      expect(stats[2]).to.equal(0); // activeOffers
      expect(stats[3]).to.equal(25); // platformFeeRate
    });
  });
});
