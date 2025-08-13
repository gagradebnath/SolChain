const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SolarToken", function () {
  // Test fixture to deploy contract
  async function deploySolarTokenFixture() {
    const [owner, feeCollector, user1, user2] = await ethers.getSigners();
    
    const SolarToken = await ethers.getContractFactory("SolarToken");
    const solarToken = await SolarToken.deploy(feeCollector.address);
    
    return { solarToken, owner, feeCollector, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      const { solarToken, owner, feeCollector } = await loadFixture(deploySolarTokenFixture);
      
      expect(await solarToken.name()).to.equal("SolarToken");
      expect(await solarToken.symbol()).to.equal("SOLAR");
      expect(await solarToken.decimals()).to.equal(18);
      expect(await solarToken.feeCollector()).to.equal(feeCollector.address);
      
      // Check initial supply minted to owner
      const initialSupply = ethers.parseEther("1000000000"); // 1 billion
      expect(await solarToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should grant correct roles to deployer", async function () {
      const { solarToken, owner } = await loadFixture(deploySolarTokenFixture);
      
      const DEFAULT_ADMIN_ROLE = await solarToken.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await solarToken.MINTER_ROLE();
      const PAUSER_ROLE = await solarToken.PAUSER_ROLE();
      
      expect(await solarToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await solarToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await solarToken.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minting by MINTER_ROLE", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      const mintAmount = ethers.parseEther("1000");
      await expect(solarToken.mint(user1.address, mintAmount))
        .to.emit(solarToken, "TokensMinted")
        .withArgs(user1.address, mintAmount);
      
      expect(await solarToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not exceed max supply", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      const maxSupply = await solarToken.MAX_SUPPLY();
      const currentSupply = await solarToken.totalSupply();
      const excessAmount = maxSupply - currentSupply + ethers.parseEther("1");
      
      await expect(solarToken.mint(user1.address, excessAmount))
        .to.be.revertedWith("SolarToken: exceeds max supply");
    });

    it("Should not allow minting to blacklisted address", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Blacklist user1
      await solarToken.blacklist(user1.address);
      
      const mintAmount = ethers.parseEther("1000");
      await expect(solarToken.mint(user1.address, mintAmount))
        .to.be.revertedWith("SolarToken: account is blacklisted");
    });
  });

  describe("Fee Mechanism", function () {
    it("Should calculate fees correctly", async function () {
      const { solarToken, owner, user1, user2 } = await loadFixture(deploySolarTokenFixture);
      
      // Set 1% transfer fee
      await solarToken.setTransferFee(100); // 1% in basis points
      
      const transferAmount = ethers.parseEther("1000");
      const expectedFee = transferAmount * 100n / 10000n; // 1%
      
      const calculatedFee = await solarToken.calculateFee(owner.address, user1.address, transferAmount);
      expect(calculatedFee).to.equal(expectedFee);
    });

    it("Should apply fees on transfers", async function () {
      const { solarToken, owner, feeCollector, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Set 1% transfer fee
      await solarToken.setTransferFee(100);
      
      const transferAmount = ethers.parseEther("1000");
      const expectedFee = transferAmount * 100n / 10000n;
      const expectedReceived = transferAmount - expectedFee;
      
      const initialFeeCollectorBalance = await solarToken.balanceOf(feeCollector.address);
      
      await solarToken.transfer(user1.address, transferAmount);
      
      expect(await solarToken.balanceOf(user1.address)).to.equal(expectedReceived);
      expect(await solarToken.balanceOf(feeCollector.address)).to.equal(initialFeeCollectorBalance + expectedFee);
    });

    it("Should not charge fees for exempt addresses", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Set fee exemption for owner
      await solarToken.setFeeExemption(owner.address, true);
      await solarToken.setTransferFee(100); // 1%
      
      const transferAmount = ethers.parseEther("1000");
      
      await solarToken.transfer(user1.address, transferAmount);
      expect(await solarToken.balanceOf(user1.address)).to.equal(transferAmount);
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const { solarToken, owner } = await loadFixture(deploySolarTokenFixture);
      
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await solarToken.balanceOf(owner.address);
      
      await expect(solarToken.burn(burnAmount))
        .to.emit(solarToken, "TokensBurned")
        .withArgs(owner.address, burnAmount);
      
      expect(await solarToken.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
    });

    it("Should allow BURNER_ROLE to burn from specific address", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Mint tokens to user1
      const mintAmount = ethers.parseEther("1000");
      await solarToken.mint(user1.address, mintAmount);
      
      const burnAmount = ethers.parseEther("500");
      
      await expect(solarToken.burnFrom(user1.address, burnAmount))
        .to.emit(solarToken, "TokensBurned")
        .withArgs(user1.address, burnAmount);
      
      expect(await solarToken.balanceOf(user1.address)).to.equal(mintAmount - burnAmount);
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause transfers", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Pause the contract
      await solarToken.pause();
      expect(await solarToken.paused()).to.be.true;
      
      // Transfers should fail when paused
      await expect(solarToken.transfer(user1.address, ethers.parseEther("100")))
        .to.be.revertedWith("Pausable: paused");
      
      // Unpause the contract
      await solarToken.unpause();
      expect(await solarToken.paused()).to.be.false;
      
      // Transfers should work again
      await expect(solarToken.transfer(user1.address, ethers.parseEther("100")))
        .to.not.be.reverted;
    });
  });

  describe("Blacklist Functionality", function () {
    it("Should blacklist and whitelist addresses", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Blacklist user1
      await expect(solarToken.blacklist(user1.address))
        .to.emit(solarToken, "AddressBlacklisted")
        .withArgs(user1.address);
      
      expect(await solarToken.blacklisted(user1.address)).to.be.true;
      
      // Transfers to/from blacklisted address should fail
      await expect(solarToken.transfer(user1.address, ethers.parseEther("100")))
        .to.be.revertedWith("SolarToken: account is blacklisted");
      
      // Remove from blacklist
      await expect(solarToken.removeFromBlacklist(user1.address))
        .to.emit(solarToken, "AddressWhitelisted")
        .withArgs(user1.address);
      
      expect(await solarToken.blacklisted(user1.address)).to.be.false;
      
      // Transfers should work again
      await expect(solarToken.transfer(user1.address, ethers.parseEther("100")))
        .to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should not allow unauthorized minting", async function () {
      const { solarToken, user1, user2 } = await loadFixture(deploySolarTokenFixture);
      
      await expect(solarToken.connect(user1).mint(user2.address, ethers.parseEther("1000")))
        .to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should not allow unauthorized pausing", async function () {
      const { solarToken, user1 } = await loadFixture(deploySolarTokenFixture);
      
      await expect(solarToken.connect(user1).pause())
        .to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should not allow unauthorized fee changes", async function () {
      const { solarToken, user1 } = await loadFixture(deploySolarTokenFixture);
      
      await expect(solarToken.connect(user1).setTransferFee(100))
        .to.be.revertedWith(/AccessControl: account .* is missing role/);
    });
  });

  describe("ERC20 Permit", function () {
    it("Should support ERC20 permit functionality", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      const domain = {
        name: await solarToken.name(),
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await solarToken.getAddress()
      };
      
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };
      
      const value = ethers.parseEther("1000");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const nonce = await solarToken.nonces(owner.address);
      
      const permitData = {
        owner: owner.address,
        spender: user1.address,
        value: value,
        nonce: nonce,
        deadline: deadline
      };
      
      const signature = await owner.signTypedData(domain, types, permitData);
      const { v, r, s } = ethers.Signature.from(signature);
      
      // Execute permit
      await solarToken.permit(
        owner.address,
        user1.address,
        value,
        deadline,
        v,
        r,
        s
      );
      
      // Check allowance was set
      expect(await solarToken.allowance(owner.address, user1.address)).to.equal(value);
    });
  });

  describe("Governance Token Features", function () {
    it("Should support voting delegation", async function () {
      const { solarToken, owner, user1 } = await loadFixture(deploySolarTokenFixture);
      
      // Delegate voting power to user1
      await solarToken.delegate(user1.address);
      
      // Check voting power
      const ownerBalance = await solarToken.balanceOf(owner.address);
      expect(await solarToken.getVotes(user1.address)).to.equal(ownerBalance);
      expect(await solarToken.getVotes(owner.address)).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency token recovery", async function () {
      const { solarToken, owner } = await loadFixture(deploySolarTokenFixture);
      
      // Deploy a mock ERC20 token
      const MockToken = await ethers.getContractFactory("SolarToken");
      const mockToken = await MockToken.deploy(owner.address);
      
      // Send some mock tokens to the SolarToken contract
      const amount = ethers.parseEther("100");
      await mockToken.transfer(await solarToken.getAddress(), amount);
      
      // Recover the tokens
      const initialBalance = await mockToken.balanceOf(owner.address);
      await solarToken.emergencyWithdraw(await mockToken.getAddress(), amount);
      
      expect(await mockToken.balanceOf(owner.address)).to.equal(initialBalance + amount);
    });

    it("Should not allow recovery of SOLAR tokens", async function () {
      const { solarToken, owner } = await loadFixture(deploySolarTokenFixture);
      
      await expect(solarToken.emergencyWithdraw(await solarToken.getAddress(), ethers.parseEther("100")))
        .to.be.revertedWith("SolarToken: cannot recover SOLAR tokens");
    });
  });

  describe("Token Information", function () {
    it("Should return correct token information", async function () {
      const { solarToken, feeCollector } = await loadFixture(deploySolarTokenFixture);
      
      const tokenInfo = await solarToken.getTokenInfo();
      
      expect(tokenInfo[0]).to.equal(await solarToken.totalSupply()); // totalSupply
      expect(tokenInfo[1]).to.equal(await solarToken.MAX_SUPPLY()); // maxSupply
      expect(tokenInfo[2]).to.equal(await solarToken.transferFeeBasisPoints()); // transferFee
      expect(tokenInfo[3]).to.equal(await solarToken.tradingFeeBasisPoints()); // tradingFee
      expect(tokenInfo[4]).to.equal(feeCollector.address); // feeCollector
      expect(tokenInfo[6]).to.equal(await solarToken.paused()); // paused
    });
  });
});
