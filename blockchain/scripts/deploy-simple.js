const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Simplified deployment configuration
const DEPLOYMENT_CONFIG = {
  // Initial supply and fee configuration
  initialSupply: ethers.parseEther("1000000000"), // 1 billion tokens
  tradingFee: 25, // 0.25% in basis points
  
  // Staking configuration
  minimumStake: ethers.parseEther("1000"), // 1000 SOLAR minimum stake
  unbondingPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
  rewardRate: 1000, // 10% annual reward rate in basis points
  
  // Governance configuration
  votingPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
  proposalThreshold: ethers.parseEther("1000"), // 1000 SOLAR minimum for proposals
  
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
    const solarToken = await SolarToken.deploy(
      deployer.address // _feeCollector
    );
    await solarToken.waitForDeployment();
    
    const solarTokenAddress = await solarToken.getAddress();
    deployedContracts.solarToken = solarToken;
    deploymentInfo.addresses.solarToken = solarTokenAddress;
    
    console.log("✅ SolarToken deployed to:", solarTokenAddress);

    // ========================================
    // 2. Deploy Governance
    // ========================================
    console.log("\n2️⃣ Deploying Governance...");
    const Governance = await ethers.getContractFactory("SolChainGovernance");
    const governance = await Governance.deploy(
      solarTokenAddress, // _governanceToken
      deployer.address   // _treasury
    );
    await governance.waitForDeployment();
    
    const governanceAddress = await governance.getAddress();
    deployedContracts.governance = governance;
    deploymentInfo.addresses.governance = governanceAddress;
    
    console.log("✅ Governance deployed to:", governanceAddress);

    // ========================================
    // 3. Deploy Oracle
    // ========================================
    console.log("\n3️⃣ Deploying Oracle...");
    const Oracle = await ethers.getContractFactory("SolChainOracle");
    const oracle = await Oracle.deploy(); // No constructor parameters
    await oracle.waitForDeployment();
    
    const oracleAddress = await oracle.getAddress();
    deployedContracts.oracle = oracle;
    deploymentInfo.addresses.oracle = oracleAddress;
    
    console.log("✅ Oracle deployed to:", oracleAddress);

    // ========================================
    // 4. Deploy Staking
    // ========================================
    console.log("\n4️⃣ Deploying Staking...");
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
      solarTokenAddress // _solarToken
    );
    await staking.waitForDeployment();
    
    const stakingAddress = await staking.getAddress();
    deployedContracts.staking = staking;
    deploymentInfo.addresses.staking = stakingAddress;
    
    console.log("✅ Staking deployed to:", stakingAddress);

    // ========================================
    // 5. Deploy Energy Trading
    // ========================================
    console.log("\n5️⃣ Deploying Energy Trading...");
    const EnergyTrading = await ethers.getContractFactory("EnergyTrading");
    const energyTrading = await EnergyTrading.deploy(
      solarTokenAddress,  // _solarToken
      deployer.address    // _feeCollector
    );
    await energyTrading.waitForDeployment();
    
    const energyTradingAddress = await energyTrading.getAddress();
    deployedContracts.energyTrading = energyTrading;
    deploymentInfo.addresses.energyTrading = energyTradingAddress;
    
    console.log("✅ Energy Trading deployed to:", energyTradingAddress);

    // ========================================
    // 6. Post-Deployment Setup
    // ========================================
    console.log("\n6️⃣ Setting up contracts...");
    
    // Grant roles in governance
    console.log("🔑 Setting up governance roles...");
    await governance.grantRole(await governance.PROPOSER_ROLE(), deployer.address);
    await governance.grantRole(await governance.VOTER_ROLE(), deployer.address);
    await governance.grantRole(await governance.EXECUTOR_ROLE(), deployer.address);
    
    // Set oracle as price feed for energy trading (if needed)
    console.log("🔗 Connecting oracle to energy trading...");
    // This would depend on your specific contract implementations
    
    console.log("✅ Post-deployment setup complete!");

    // ========================================
    // 7. Save Deployment Info
    // ========================================
    const networkName = (await ethers.provider.getNetwork()).name || "localhost";
    const deploymentPath = path.join(__dirname, `../deployments/${networkName}.json`);
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n📄 Deployment Summary:");
    console.log("=".repeat(50));
    console.log("🌟 SolarToken:", solarTokenAddress);
    console.log("🏛️  Governance:", governanceAddress);
    console.log("🔮 Oracle:", oracleAddress);
    console.log("🎯 Staking:", stakingAddress);
    console.log("⚡ Energy Trading:", energyTradingAddress);
    console.log("=".repeat(50));
    console.log("💾 Deployment info saved to:", deploymentPath);
    
    return deployedContracts;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Helper function to get deployment gas
async function getDeploymentGas(contract) {
  const deployTx = contract.deploymentTransaction();
  if (deployTx && deployTx.gasUsed) {
    return deployTx.gasUsed;
  }
  return 0;
}

// Export for testing
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, DEPLOYMENT_CONFIG };
