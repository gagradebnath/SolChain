/**
 * SolChain API - Comprehensive blockchain functionality wrapper
 * 
 * This module provides easy-to-use functions for all SolChain smart contract interactions.
 * Each function handles the complexity of blockchain interactions and returns standardized responses.
 * 
 * @author SolChain Team
 * @version 1.0.0
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class SolChainAPI {
    constructor(config = {}) {
        this.config = {
            rpcUrl: config.rpcUrl || "http://127.0.0.1:8545",
            chainId: config.chainId || 1337,
            privateKey: config.privateKey,
            contractAddresses: config.contractAddresses || {},
            gasPrice: config.gasPrice || "20000000000", // 20 gwei
            ...config,
        };
        
        // Ensure gasLimit is always a number (must be done after spread to override any config.gasLimit)
        this.config.gasLimit = Number(this.config.gasLimit) || 3000000;

        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.abis = {};
        this.currentNonce = null; // Track nonce for proper transaction ordering
        
        this.initializeProvider();
        this.loadContractABIs();
    }

    /**
     * Initialize Web3 Provider and Signer
     */
    initializeProvider() {
        try {
            this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
            
            if (this.config.privateKey) {
                this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
            } else {
                // For development - use first hardhat account
                this.provider.getSigner(0).then(signer => {
                    this.signer = signer;
                });
            }
        } catch (error) {
            throw new Error(`Failed to initialize provider: ${error.message}`);
        }
    }

    /**
     * Load contract ABIs from artifacts
     */
    loadContractABIs() {
        try {
            const artifactsPath = path.join(__dirname, "../artifacts/contracts");
            
            // Load SolarToken ABI
            const solarTokenABI = JSON.parse(
                fs.readFileSync(path.join(artifactsPath, "SolarToken.sol/SolarToken.json"), "utf8")
            ).abi;
            
            // Load EnergyTrading ABI
            const energyTradingABI = JSON.parse(
                fs.readFileSync(path.join(artifactsPath, "EnergyTrading.sol/EnergyTrading.json"), "utf8")
            ).abi;
            
            // Load Oracle ABI
            const oracleABI = JSON.parse(
                fs.readFileSync(path.join(artifactsPath, "Oracle.sol/SolChainOracle.json"), "utf8")
            ).abi;
            
            // Load Staking ABI
            const stakingABI = JSON.parse(
                fs.readFileSync(path.join(artifactsPath, "Staking.sol/SolChainStaking.json"), "utf8")
            ).abi;
            
            // Load Governance ABI
            const governanceABI = JSON.parse(
                fs.readFileSync(path.join(artifactsPath, "Governance.sol/SolChainGovernance.json"), "utf8")
            ).abi;

            this.abis = {
                SolarToken: solarTokenABI,
                EnergyTrading: energyTradingABI,
                Oracle: oracleABI,
                Staking: stakingABI,
                Governance: governanceABI
            };
        } catch (error) {
            console.warn(`Failed to load ABIs: ${error.message}`);
        }
    }

    /**
     * Initialize contracts with deployed addresses
     */
    async initializeContracts(addresses) {
        try {
            this.config.contractAddresses = { ...this.config.contractAddresses, ...addresses };

            if (addresses.SolarToken && this.abis.SolarToken) {
                this.contracts.SolarToken = new ethers.Contract(
                    addresses.SolarToken,
                    this.abis.SolarToken,
                    this.signer
                );
            }

            if (addresses.EnergyTrading && this.abis.EnergyTrading) {
                this.contracts.EnergyTrading = new ethers.Contract(
                    addresses.EnergyTrading,
                    this.abis.EnergyTrading,
                    this.signer
                );
            }

            if (addresses.Oracle && this.abis.Oracle) {
                this.contracts.Oracle = new ethers.Contract(
                    addresses.Oracle,
                    this.abis.Oracle,
                    this.signer
                );
            }

            if (addresses.Staking && this.abis.Staking) {
                this.contracts.Staking = new ethers.Contract(
                    addresses.Staking,
                    this.abis.Staking,
                    this.signer
                );
            }

            if (addresses.Governance && this.abis.Governance) {
                this.contracts.Governance = new ethers.Contract(
                    addresses.Governance,
                    this.abis.Governance,
                    this.signer
                );
            }

            return { success: true, message: "Contracts initialized successfully" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Get account balance (ETH)
     */
    async getAccountBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            return {
                success: true,
                data: {
                    address,
                    balance: ethers.formatEther(balance),
                    balanceWei: balance.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current gas price
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.provider.getFeeData();
            return {
                success: true,
                data: {
                    gasPrice: gasPrice.gasPrice.toString(),
                    maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
                    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get next nonce for transactions
     */
    async getNextNonce() {
        try {
            if (!this.signer) {
                throw new Error("Signer not initialized");
            }
            
            const address = await this.signer.getAddress();
            // Always get fresh nonce from network to avoid conflicts
            const networkNonce = await this.provider.getTransactionCount(address, "pending");
            
            // Use the higher of network nonce or our tracked nonce
            if (this.currentNonce === null || networkNonce > this.currentNonce) {
                this.currentNonce = networkNonce;
            }
            
            const nonceToUse = this.currentNonce;
            this.currentNonce++;
            
            console.log(`🔢 Using nonce: ${nonceToUse} (network: ${networkNonce}, tracked: ${this.currentNonce})`);
            
            return nonceToUse;
        } catch (error) {
            throw new Error(`Failed to get nonce: ${error.message}`);
        }
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(to, data, value = "0") {
        try {
            const gasEstimate = await this.provider.estimateGas({
                to,
                data,
                value: ethers.parseEther(value)
            });
            return {
                success: true,
                data: {
                    gasEstimate: gasEstimate.toString(),
                    gasEstimateEth: ethers.formatEther(gasEstimate)
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // SOLAR TOKEN FUNCTIONS
    // ============================================================================

    /**
     * Get token balance for an address
     */
    async getTokenBalance(address) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const balance = await this.contracts.SolarToken.balanceOf(address);
            return {
                success: true,
                data: {
                    address,
                    balance: ethers.formatEther(balance),
                    balanceWei: balance.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get token metadata
     */
    async getTokenInfo() {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.contracts.SolarToken.name(),
                this.contracts.SolarToken.symbol(),
                this.contracts.SolarToken.decimals(),
                this.contracts.SolarToken.totalSupply()
            ]);

            return {
                success: true,
                data: {
                    name,
                    symbol,
                    decimals: decimals.toString(),
                    totalSupply: ethers.formatEther(totalSupply),
                    totalSupplyWei: totalSupply.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Transfer tokens
     */
    async transferTokens(toAddress, amount) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const amountWei = ethers.parseEther(amount.toString());
            const nonce = await this.getNextNonce();
            
            const tx = await this.contracts.SolarToken.transfer(toAddress, amountWei, {
                gasLimit: this.config.gasLimit,
                nonce: nonce
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    to: toAddress,
                    amount: amount.toString(),
                    nonce: nonce
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Approve token spending
     */
    async approveTokens(spenderAddress, amount) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const amountWei = ethers.parseEther(amount.toString());
            const nonce = await this.getNextNonce();
            
            const tx = await this.contracts.SolarToken.approve(spenderAddress, amountWei, {
                gasLimit: this.config.gasLimit,
                nonce: nonce
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    spender: spenderAddress,
                    amount: amount.toString(),
                    nonce: nonce
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get token allowance
     */
    async getTokenAllowance(ownerAddress, spenderAddress) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const allowance = await this.contracts.SolarToken.allowance(ownerAddress, spenderAddress);
            
            return {
                success: true,
                data: {
                    owner: ownerAddress,
                    spender: spenderAddress,
                    allowance: ethers.formatEther(allowance),
                    allowanceWei: allowance.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Mint new tokens (admin only)
     */
    async mintTokens(toAddress, amount) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            console.log("🔍 Debug - mintTokens config:", {
                gasLimit: this.config.gasLimit,
                gasLimitType: typeof this.config.gasLimit,
                fullConfig: JSON.stringify(this.config, null, 2)
            });

            const amountWei = ethers.parseEther(amount.toString());
            const nonce = await this.getNextNonce();
            
            const tx = await this.contracts.SolarToken.mint(
                toAddress, 
                amountWei, 
                "Energy production reward", // Add required reason parameter
                {
                    gasLimit: this.config.gasLimit,
                    nonce: nonce
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    to: toAddress,
                    amount: amount.toString(),
                    nonce: nonce
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Burn tokens
     */
    async burnTokens(amount) {
        try {
            if (!this.contracts.SolarToken) {
                throw new Error("SolarToken contract not initialized");
            }

            const amountWei = ethers.parseEther(amount.toString());
            const tx = await this.contracts.SolarToken.burn(amountWei, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    amount: amount.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // ENERGY TRADING FUNCTIONS
    // ============================================================================

    /**
     * Create energy sell offer
     */
    async createSellOffer(energyAmount, pricePerKwh, deadline, location, energySource) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const energyAmountWei = ethers.parseEther(energyAmount.toString());
            const priceWei = ethers.parseEther(pricePerKwh.toString());
            const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
            const nonce = await this.getNextNonce();

            const tx = await this.contracts.EnergyTrading.createOffer(
                0, // OfferType.SELL
                energyAmountWei,
                priceWei,
                deadlineTimestamp,
                location,
                energySource,
                {
                    gasLimit: this.config.gasLimit,
                    nonce: nonce
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    energyAmount: energyAmount.toString(),
                    pricePerKwh: pricePerKwh.toString(),
                    deadline,
                    location,
                    energySource,
                    nonce: nonce
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Create energy buy offer
     */
    async createBuyOffer(energyAmount, pricePerKwh, deadline, location, energySource) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const energyAmountWei = ethers.parseEther(energyAmount.toString());
            const priceWei = ethers.parseEther(pricePerKwh.toString());
            const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

            const tx = await this.contracts.EnergyTrading.createOffer(
                1, // OfferType.BUY
                energyAmountWei,
                priceWei,
                deadlineTimestamp,
                location,
                energySource,
                {
                    gasLimit: this.config.gasLimit
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    energyAmount: energyAmount.toString(),
                    pricePerKwh: pricePerKwh.toString(),
                    deadline,
                    location,
                    energySource
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Accept an energy offer
     */
    async acceptOffer(offerId, energyAmount) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const energyAmountWei = ethers.parseEther(energyAmount.toString());

            const tx = await this.contracts.EnergyTrading.acceptOffer(offerId, energyAmountWei, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    offerId: offerId.toString(),
                    energyAmount: energyAmount.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel an energy offer
     */
    async cancelOffer(offerId) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const tx = await this.contracts.EnergyTrading.cancelOffer(offerId, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    offerId: offerId.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get active energy offers
     */
    async getActiveOffers(offset = 0, limit = 10) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const offers = await this.contracts.EnergyTrading.getActiveOffers(offset, limit);
            
            console.log(`🔍 Retrieved ${offers.length} active offers from blockchain`);
            
            if (offers.length === 0) {
                return {
                    success: true,
                    data: {
                        offers: [],
                        offset,
                        limit,
                        count: 0
                    }
                };
            }
            
            const formattedOffers = offers.map((offer, index) => {
                try {
                    return {
                        offerId: offer.id.toString(),
                        offerType: offer.offerType === 0 ? "SELL" : "BUY",
                        creator: offer.creator,
                        energyAmount: ethers.formatEther(offer.energyAmount),
                        pricePerKwh: ethers.formatEther(offer.pricePerKwh),
                        totalPrice: ethers.formatEther(offer.totalPrice),
                        deadline: new Date(Number(offer.deadline) * 1000).toISOString(),
                        location: offer.location,
                        energySource: offer.energySource,
                        status: offer.status === 0 ? "ACTIVE" : offer.status === 1 ? "CANCELLED" : offer.status === 2 ? "EXECUTED" : "DISPUTED",
                        createdAt: new Date(Number(offer.createdAt) * 1000).toISOString()
                    };
                } catch (error) {
                    console.error(`❌ Error formatting offer ${index}:`, error.message);
                    console.error('Offer data:', offer);
                    throw error;
                }
            });

            return {
                success: true,
                data: {
                    offers: formattedOffers,
                    offset,
                    limit,
                    count: formattedOffers.length
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's energy offers
     */
    async getUserOffers(userAddress) {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const offerIds = await this.contracts.EnergyTrading.getUserOffers(userAddress);
            
            return {
                success: true,
                data: {
                    userAddress,
                    offerIds: offerIds.map(id => id.toString())
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get trading statistics
     */
    async getTradingStats() {
        try {
            if (!this.contracts.EnergyTrading) {
                throw new Error("EnergyTrading contract not initialized");
            }

            const [totalTrades, totalVolume, totalFees, activeOffers] = await this.contracts.EnergyTrading.getTradingStats();
            
            return {
                success: true,
                data: {
                    totalTrades: totalTrades.toString(),
                    totalVolume: ethers.formatEther(totalVolume),
                    totalFees: ethers.formatEther(totalFees),
                    activeOffers: activeOffers.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // ORACLE FUNCTIONS
    // ============================================================================

    /**
     * Get current energy price
     */
    async getEnergyPrice() {
        try {
            if (!this.contracts.Oracle) {
                throw new Error("Oracle contract not initialized");
            }

            const priceData = await this.contracts.Oracle.getLatestPrice();
            
            return {
                success: true,
                data: {
                    price: ethers.formatEther(priceData.price),
                    priceWei: priceData.price.toString(),
                    timestamp: new Date(Number(priceData.timestamp) * 1000).toISOString(),
                    confidence: priceData.confidence.toString(),
                    source: priceData.source,
                    isValid: priceData.isValid
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update energy price (data feed only)
     */
    async updateEnergyPrice(price, confidence) {
        try {
            if (!this.contracts.Oracle) {
                throw new Error("Oracle contract not initialized");
            }

            const priceWei = ethers.parseEther(price.toString());

            const tx = await this.contracts.Oracle.updatePrice(priceWei, confidence, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    price: price.toString(),
                    confidence: confidence.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get grid status for a region
     */
    async getGridStatus(region) {
        try {
            if (!this.contracts.Oracle) {
                throw new Error("Oracle contract not initialized");
            }

            const gridStatus = await this.contracts.Oracle.getGridStatus(region);
            
            return {
                success: true,
                data: {
                    region,
                    isOnline: gridStatus.isOnline,
                    capacity: ethers.formatEther(gridStatus.capacity),
                    currentLoad: ethers.formatEther(gridStatus.currentLoad),
                    lastUpdate: new Date(Number(gridStatus.lastUpdate) * 1000).toISOString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update grid status (data feed only)
     */
    async updateGridStatus(region, isOnline, capacity, currentLoad) {
        try {
            if (!this.contracts.Oracle) {
                throw new Error("Oracle contract not initialized");
            }

            const capacityWei = ethers.parseEther(capacity.toString());
            const currentLoadWei = ethers.parseEther(currentLoad.toString());

            const tx = await this.contracts.Oracle.updateGridStatus(
                region,
                isOnline,
                capacityWei,
                currentLoadWei,
                {
                    gasLimit: this.config.gasLimit
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    region,
                    isOnline,
                    capacity: capacity.toString(),
                    currentLoad: currentLoad.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // STAKING FUNCTIONS
    // ============================================================================

    /**
     * Stake tokens to become a validator
     */
    async stakeTokens(amount) {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const amountWei = ethers.parseEther(amount.toString());

            const tx = await this.contracts.Staking.stake(amountWei, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    amount: amount.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Unstake tokens
     */
    async unstakeTokens(amount) {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const amountWei = ethers.parseEther(amount.toString());

            const tx = await this.contracts.Staking.unstake(amountWei, {
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    amount: amount.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Claim staking rewards
     */
    async claimRewards() {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const tx = await this.contracts.Staking.claimRewards({
                gasLimit: this.config.gasLimit
            });

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get validator information
     */
    async getValidatorInfo(validatorAddress) {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const validatorInfo = await this.contracts.Staking.getValidatorInfo(validatorAddress);
            
            return {
                success: true,
                data: {
                    validatorAddress,
                    stakedAmount: ethers.formatEther(validatorInfo.stakedAmount),
                    rewardDebt: ethers.formatEther(validatorInfo.rewardDebt),
                    lastStakeTime: new Date(Number(validatorInfo.lastStakeTime) * 1000).toISOString(),
                    isActive: validatorInfo.isActive
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get staking statistics
     */
    async getStakingStats() {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const [totalValidators, activeValidators, totalStakedAmount, totalRewards, currentRewardRate] = 
                await this.contracts.Staking.getStakingStats();
            
            return {
                success: true,
                data: {
                    totalValidators: totalValidators.toString(),
                    activeValidators: activeValidators.toString(),
                    totalStakedAmount: ethers.formatEther(totalStakedAmount),
                    totalRewards: ethers.formatEther(totalRewards),
                    currentRewardRate: currentRewardRate.toString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get list of active validators
     */
    async getActiveValidators() {
        try {
            if (!this.contracts.Staking) {
                throw new Error("Staking contract not initialized");
            }

            const validators = await this.contracts.Staking.getActiveValidators();
            
            return {
                success: true,
                data: {
                    validators: validators,
                    count: validators.length
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // GOVERNANCE FUNCTIONS
    // ============================================================================

    /**
     * Create a governance proposal
     */
    async createProposal(targets, values, calldatas, description) {
        try {
            if (!this.contracts.Governance) {
                throw new Error("Governance contract not initialized");
            }

            const tx = await this.contracts.Governance.propose(
                targets,
                values,
                calldatas,
                description,
                {
                    gasLimit: this.config.gasLimit
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    description
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Vote on a proposal
     */
    async voteOnProposal(proposalId, support, reason = "") {
        try {
            if (!this.contracts.Governance) {
                throw new Error("Governance contract not initialized");
            }

            const tx = await this.contracts.Governance.castVoteWithReason(
                proposalId,
                support,
                reason,
                {
                    gasLimit: this.config.gasLimit
                }
            );

            const receipt = await tx.wait();
            
            return {
                success: true,
                data: {
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    proposalId: proposalId.toString(),
                    support: support.toString(),
                    reason
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get proposal state
     */
    async getProposalState(proposalId) {
        try {
            if (!this.contracts.Governance) {
                throw new Error("Governance contract not initialized");
            }

            const state = await this.contracts.Governance.state(proposalId);
            
            const stateNames = [
                "Pending", "Active", "Canceled", "Defeated", 
                "Succeeded", "Queued", "Expired", "Executed"
            ];

            return {
                success: true,
                data: {
                    proposalId: proposalId.toString(),
                    state: state.toString(),
                    stateName: stateNames[state] || "Unknown"
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // BATCH OPERATIONS
    // ============================================================================

    /**
     * Get comprehensive account overview
     */
    async getAccountOverview(address) {
        try {
            const [ethBalance, tokenBalance, validatorInfo] = await Promise.allSettled([
                this.getAccountBalance(address),
                this.getTokenBalance(address),
                this.getValidatorInfo(address)
            ]);

            return {
                success: true,
                data: {
                    address,
                    ethBalance: ethBalance.status === 'fulfilled' ? ethBalance.value.data : null,
                    tokenBalance: tokenBalance.status === 'fulfilled' ? tokenBalance.value.data : null,
                    validatorInfo: validatorInfo.status === 'fulfilled' ? validatorInfo.value.data : null
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get system overview
     */
    async getSystemOverview() {
        try {
            const [tokenInfo, tradingStats, stakingStats, energyPrice] = await Promise.allSettled([
                this.getTokenInfo(),
                this.getTradingStats(),
                this.getStakingStats(),
                this.getEnergyPrice()
            ]);

            return {
                success: true,
                data: {
                    tokenInfo: tokenInfo.status === 'fulfilled' ? tokenInfo.value.data : null,
                    tradingStats: tradingStats.status === 'fulfilled' ? tradingStats.value.data : null,
                    stakingStats: stakingStats.status === 'fulfilled' ? stakingStats.value.data : null,
                    energyPrice: energyPrice.status === 'fulfilled' ? energyPrice.value.data : null,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // EVENT LISTENING
    // ============================================================================

    /**
     * Listen to contract events
     */
    startEventListening(eventHandlers = {}) {
        try {
            // Token events
            if (this.contracts.SolarToken && eventHandlers.tokenTransfer) {
                this.contracts.SolarToken.on("Transfer", eventHandlers.tokenTransfer);
            }

            // Trading events
            if (this.contracts.EnergyTrading && eventHandlers.offerCreated) {
                this.contracts.EnergyTrading.on("OfferCreated", eventHandlers.offerCreated);
            }

            if (this.contracts.EnergyTrading && eventHandlers.tradeExecuted) {
                this.contracts.EnergyTrading.on("TradeExecuted", eventHandlers.tradeExecuted);
            }

            // Oracle events
            if (this.contracts.Oracle && eventHandlers.priceUpdated) {
                this.contracts.Oracle.on("PriceUpdated", eventHandlers.priceUpdated);
            }

            // Staking events
            if (this.contracts.Staking && eventHandlers.tokenStaked) {
                this.contracts.Staking.on("TokensStaked", eventHandlers.tokenStaked);
            }

            return { success: true, message: "Event listening started" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Stop event listening
     */
    stopEventListening() {
        try {
            Object.values(this.contracts).forEach(contract => {
                contract.removeAllListeners();
            });
            
            return { success: true, message: "Event listening stopped" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = SolChainAPI;
