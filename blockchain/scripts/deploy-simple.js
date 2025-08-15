const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting SolChain Smart Contract Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deployment configuration
    const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens

    const deployedContracts = {};

    try {
        // 1. Deploy SolarToken
        console.log("📄 Deploying SolarToken...");
        const SolarToken = await ethers.getContractFactory("SolarToken");
        const solarToken = await SolarToken.deploy(
            INITIAL_SUPPLY,
            deployer.address // fee collector
        );
        await solarToken.waitForDeployment();
        deployedContracts.SolarToken = await solarToken.getAddress();
        console.log(`✅ SolarToken deployed to: ${deployedContracts.SolarToken}\n`);

        // 2. Deploy SolChainGovernance
        console.log("🏛️ Deploying SolChainGovernance...");
        const SolChainGovernance = await ethers.getContractFactory("SolChainGovernance");
        const governanceConfig = {
            votingDelay: 24 * 60 * 60, // 1 day delay
            votingPeriod: 7 * 24 * 60 * 60, // 7 days voting period
            proposalThreshold: ethers.parseEther("1000"), // 1000 tokens to propose
            quorumPercentage: 4 // 4% quorum
        };
        const governance = await SolChainGovernance.deploy(
            deployedContracts.SolarToken,
            governanceConfig
        );
        await governance.waitForDeployment();
        deployedContracts.SolChainGovernance = await governance.getAddress();
        console.log(`✅ SolChainGovernance deployed to: ${deployedContracts.SolChainGovernance}\n`);

        // 3. Deploy SolChainStaking
        console.log("🔒 Deploying SolChainStaking...");
        const SolChainStaking = await ethers.getContractFactory("SolChainStaking");
        const staking = await SolChainStaking.deploy(
            deployedContracts.SolarToken
        );
        await staking.waitForDeployment();
        deployedContracts.SolChainStaking = await staking.getAddress();
        console.log(`✅ SolChainStaking deployed to: ${deployedContracts.SolChainStaking}\n`);

        // 4. Deploy SolChainOracle
        console.log("🔮 Deploying SolChainOracle...");
        const SolChainOracle = await ethers.getContractFactory("SolChainOracle");
        const oracle = await SolChainOracle.deploy();
        await oracle.waitForDeployment();
        deployedContracts.SolChainOracle = await oracle.getAddress();
        console.log(`✅ SolChainOracle deployed to: ${deployedContracts.SolChainOracle}\n`);

        // 5. Deploy EnergyTrading
        console.log("⚡ Deploying EnergyTrading...");
        const EnergyTrading = await ethers.getContractFactory("EnergyTrading");
        const energyTrading = await EnergyTrading.deploy(
            deployedContracts.SolarToken,
            deployer.address // fee collector
        );
        await energyTrading.waitForDeployment();
        deployedContracts.EnergyTrading = await energyTrading.getAddress();
        console.log(`✅ EnergyTrading deployed to: ${deployedContracts.EnergyTrading}\n`);

        // Post-deployment setup
        console.log("⚙️ Setting up post-deployment configurations...\n");

        // Grant minter role to staking contract
        const MINTER_ROLE = await solarToken.MINTER_ROLE();
        await solarToken.grantRole(MINTER_ROLE, deployedContracts.SolChainStaking);
        console.log("✅ Granted MINTER_ROLE to SolChainStaking");

        // Grant admin role to governance contract
        const DEFAULT_ADMIN_ROLE = await solarToken.DEFAULT_ADMIN_ROLE();
        await solarToken.grantRole(DEFAULT_ADMIN_ROLE, deployedContracts.SolChainGovernance);
        console.log("✅ Granted DEFAULT_ADMIN_ROLE to SolChainGovernance");

        // Setup oracle admin
        const ORACLE_OPERATOR_ROLE = await oracle.ORACLE_OPERATOR_ROLE();
        await oracle.grantRole(ORACLE_OPERATOR_ROLE, deployedContracts.SolChainGovernance);
        console.log("✅ Granted ORACLE_OPERATOR_ROLE to SolChainGovernance");

        console.log("\n🎉 All contracts deployed successfully!\n");

        // Summary
        console.log("📋 Deployment Summary:");
        console.log("=====================");
        for (const [name, address] of Object.entries(deployedContracts)) {
            console.log(`${name}: ${address}`);
        }

        console.log("\n📝 Deployment configuration:");
        console.log("============================");
        console.log(`Initial Supply: ${ethers.formatEther(INITIAL_SUPPLY)} ST`);

        return deployedContracts;

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
