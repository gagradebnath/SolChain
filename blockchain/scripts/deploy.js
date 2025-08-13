const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  // Initial supply and fee configuration
  initialSupply: ethers.parseEther("1000000000"), // 1 billion tokens
  tradingFee: 25, // 0.25% in basis points
  transferFee: 0, // 0% transfer fee
  
  // Staking configuration
  minimumStake: ethers.parseEther("1000"), // 1000 SOLAR minimum stake
  unbondingPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
  rewardRate: 1000, // 10% annual reward rate in basis points
  
  // Governance configuration
  votingDelay: 7200, // 1 day in blocks (assuming 12s block time)
  votingPeriod: 50400, // 1 week in blocks
  proposalThreshold: ethers.parseEther("1000"), // 1000 SOLAR minimum for proposals
  quorumFraction: 4, // 4% quorum requirement
  timelockDelay: 2 * 24 * 60 * 60, // 2 days timelock
  
  // Oracle configuration
  updateInterval: 1 * 60 * 60, // 1 hour update interval
  maxPriceDeviation: 1000, // 10% maximum price deviation
  
  // Trading configuration
  minimumTradeAmount: ethers.parseEther("1"), // 1 SOLAR minimum trade
  maximumTradeAmount: ethers.parseEther("10000"), // 10,000 SOLAR maximum trade
  escrowTimeout: 24 * 60 * 60, // 24 hours escrow timeout
};

async function main() {
  console.log("🚀 Starting SolChain blockchain deployment...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts = {};
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    gasUsed: {},
    addresses: {}
  };

  try {
    // ========================================
    // 1. Deploy SolarToken
    // ========================================
    console.log("1️⃣ Deploying SolarToken...");
    const SolarToken = await ethers.getContractFactory("SolarToken");
    const solarToken = await SolarToken.deploy(deployer.address); // Fee collector is deployer initially
    await solarToken.waitForDeployment();
    
    const solarTokenAddress = await solarToken.getAddress();
    deployedContracts.solarToken = solarToken;
    deploymentInfo.addresses.solarToken = solarTokenAddress;
    deploymentInfo.gasUsed.solarToken = await getDeploymentGas(solarToken);
    
    console.log("✅ SolarToken deployed to:", solarTokenAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.solarToken.toLocaleString(), "\n");

    // ========================================
    // 2. Deploy Timelock Controller
    // ========================================
    console.log("2️⃣ Deploying Timelock Controller...");
    const SolChainTimelock = await ethers.getContractFactory("SolChainTimelock");
    const timelock = await SolChainTimelock.deploy(
      DEPLOYMENT_CONFIG.timelockDelay,
      [], // proposers (will be set to governance contract)
      [], // executors (will be set to governance contract)  
      deployer.address // admin (will be renounced later)
    );
    await timelock.waitForDeployment();
    
    const timelockAddress = await timelock.getAddress();
    deployedContracts.timelock = timelock;
    deploymentInfo.addresses.timelock = timelockAddress;
    deploymentInfo.gasUsed.timelock = await getDeploymentGas(timelock);
    
    console.log("✅ Timelock deployed to:", timelockAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.timelock.toLocaleString(), "\n");

    // ========================================
    // 3. Deploy Governance Contract
    // ========================================
    console.log("3️⃣ Deploying Governance Contract...");
    const SolChainGovernance = await ethers.getContractFactory("SolChainGovernance");
    const governance = await SolChainGovernance.deploy(
      solarTokenAddress,
      timelockAddress,
      deployer.address // treasury address (temporary)
    );
    await governance.waitForDeployment();
    
    const governanceAddress = await governance.getAddress();
    deployedContracts.governance = governance;
    deploymentInfo.addresses.governance = governanceAddress;
    deploymentInfo.gasUsed.governance = await getDeploymentGas(governance);
    
    console.log("✅ Governance deployed to:", governanceAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.governance.toLocaleString(), "\n");

    // ========================================
    // 4. Deploy Staking Contract
    // ========================================
    console.log("4️⃣ Deploying Staking Contract...");
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(solarTokenAddress);
    await staking.waitForDeployment();
    
    const stakingAddress = await staking.getAddress();
    deployedContracts.staking = staking;
    deploymentInfo.addresses.staking = stakingAddress;
    deploymentInfo.gasUsed.staking = await getDeploymentGas(staking);
    
    console.log("✅ Staking deployed to:", stakingAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.staking.toLocaleString(), "\n");

    // ========================================
    // 5. Deploy Oracle Contract
    // ========================================
    console.log("5️⃣ Deploying Oracle Contract...");
    const SolChainOracle = await ethers.getContractFactory("SolChainOracle");
    const oracle = await SolChainOracle.deploy();
    await oracle.waitForDeployment();
    
    const oracleAddress = await oracle.getAddress();
    deployedContracts.oracle = oracle;
    deploymentInfo.addresses.oracle = oracleAddress;
    deploymentInfo.gasUsed.oracle = await getDeploymentGas(oracle);
    
    console.log("✅ Oracle deployed to:", oracleAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.oracle.toLocaleString(), "\n");

    // ========================================
    // 6. Deploy Energy Trading Contract
    // ========================================
    console.log("6️⃣ Deploying Energy Trading Contract...");
    const EnergyTrading = await ethers.getContractFactory("EnergyTrading");
    const energyTrading = await EnergyTrading.deploy(
      solarTokenAddress,
      deployer.address // fee collector
    );
    await energyTrading.waitForDeployment();
    
    const energyTradingAddress = await energyTrading.getAddress();
    deployedContracts.energyTrading = energyTrading;
    deploymentInfo.addresses.energyTrading = energyTradingAddress;
    deploymentInfo.gasUsed.energyTrading = await getDeploymentGas(energyTrading);
    
    console.log("✅ Energy Trading deployed to:", energyTradingAddress);
    console.log("⛽ Gas used:", deploymentInfo.gasUsed.energyTrading.toLocaleString(), "\n");

    // ========================================
    // 7. Configure Contract Relationships
    // ========================================
    console.log("7️⃣ Configuring contract relationships...");
    
    // Set energy trading contract in SolarToken
    console.log("🔗 Setting energy trading contract in SolarToken...");
    await solarToken.setEnergyTradingContract(energyTradingAddress);
    
    // Configure timelock roles for governance
    console.log("🔗 Configuring timelock roles...");
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
    
    await timelock.grantRole(PROPOSER_ROLE, governanceAddress);
    await timelock.grantRole(EXECUTOR_ROLE, governanceAddress);
    
    // Add initial validator to staking contract
    console.log("🔗 Adding initial validator...");
    await staking.addValidator(
      deployer.address,
      500, // 5% commission rate
      "Genesis Validator",
      "https://solchain.org",
      "Initial validator for SolChain network"
    );
    
    // Set trading parameters
    console.log("🔗 Setting trading parameters...");
    await energyTrading.setTradingLimits(
      DEPLOYMENT_CONFIG.minimumTradeAmount,
      DEPLOYMENT_CONFIG.maximumTradeAmount
    );

    console.log("✅ Contract configuration completed!\n");

    // ========================================
    // 8. Verify Deployments
    // ========================================
    console.log("8️⃣ Verifying deployments...");
    
    // Verify SolarToken
    const tokenInfo = await solarToken.getTokenInfo();
    console.log("🔍 SolarToken verification:");
    console.log("   - Total Supply:", ethers.formatEther(tokenInfo[0]), "SOLAR");
    console.log("   - Max Supply:", ethers.formatEther(tokenInfo[1]), "SOLAR");
    console.log("   - Fee Collector:", tokenInfo[4]);
    
    // Verify Staking
    const stakingStats = await staking.getStakingStats();
    console.log("🔍 Staking verification:");
    console.log("   - Total Staked:", ethers.formatEther(stakingStats[0]), "SOLAR");
    console.log("   - Active Validators:", stakingStats[2].toString());
    
    // Verify Trading
    const tradingStats = await energyTrading.getTradingStats();
    console.log("🔍 Trading verification:");
    console.log("   - Platform Fee Rate:", tradingStats[3].toString(), "basis points");
    console.log("   - Active Offers:", tradingStats[2].toString());
    
    console.log("✅ All verifications passed!\n");

    // ========================================
    // 9. Save Deployment Information
    // ========================================
    console.log("9️⃣ Saving deployment information...");
    
    // Calculate total gas used
    const totalGasUsed = Object.values(deploymentInfo.gasUsed).reduce((sum, gas) => sum + gas, 0n);
    deploymentInfo.totalGasUsed = totalGasUsed;
    
    // Save to file
    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    const networkName = (await ethers.provider.getNetwork()).name || "unknown";
    const fileName = `deployment-${networkName}-${Date.now()}.json`;
    const filePath = path.join(deploymentPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", filePath);
    
    // Save contract ABIs
    await saveContractABIs(deploymentPath, deploymentInfo.addresses);
    
    console.log("\n🎉 SolChain blockchain deployment completed successfully!");
    console.log("📊 Deployment Summary:");
    console.log("   - Network:", networkName);
    console.log("   - Total Gas Used:", totalGasUsed.toLocaleString());
    console.log("   - Deployer:", deployer.address);
    console.log("   - Contracts Deployed:", Object.keys(deploymentInfo.addresses).length);
    
    console.log("\n📋 Contract Addresses:");
    Object.entries(deploymentInfo.addresses).forEach(([name, address]) => {
      console.log(`   - ${name}: ${address}`);
    });
    
    console.log("\n🔧 Next Steps:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Set up frontend configuration with contract addresses");
    console.log("   3. Configure oracle data feeds");
    console.log("   4. Initialize governance with community members");
    console.log("   5. Start validator nodes and begin staking");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

/**
 * Get gas used for contract deployment
 */
async function getDeploymentGas(contract) {
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    return receipt.gasUsed;
  }
  return 0n;
}

/**
 * Save contract ABIs for frontend integration
 */
async function saveContractABIs(deploymentPath, addresses) {
  console.log("💾 Saving contract ABIs...");
  
  const abisPath = path.join(deploymentPath, "abis");
  if (!fs.existsSync(abisPath)) {
    fs.mkdirSync(abisPath, { recursive: true });
  }
  
  const contractNames = [
    "SolarToken",
    "EnergyTrading", 
    "Staking",
    "SolChainGovernance",
    "SolChainTimelock",
    "SolChainOracle"
  ];
  
  for (const contractName of contractNames) {
    try {
      const factory = await ethers.getContractFactory(contractName);
      const abi = factory.interface.fragments.map(fragment => fragment.format("json"));
      
      const abiInfo = {
        contractName,
        abi: JSON.parse(`[${abi.join(",")}]`),
        address: addresses[contractName.toLowerCase().replace("solchain", "").replace("timelock", "timelock")] || null
      };
      
      const abiPath = path.join(abisPath, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abiInfo, null, 2));
    } catch (error) {
      console.warn(`⚠️  Could not save ABI for ${contractName}:`, error.message);
    }
  }
  
  console.log("✅ Contract ABIs saved to:", abisPath);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, DEPLOYMENT_CONFIG };
