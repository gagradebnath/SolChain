const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function deployClean() {
    try {
        console.log("🚀 Starting fresh deployment to Hardhat...");
        
        // Connect to local Hardhat node
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        
        // Use first Hardhat account
        const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log(`Deploying from: ${wallet.address}`);
        
        // Get current nonce
        let nonce = await provider.getTransactionCount(wallet.address, 'latest');
        console.log(`Starting nonce: ${nonce}`);
        
        // Load contract artifacts
        const artifactsPath = path.join(__dirname, "../artifacts/contracts");
        
        // Deploy SolarToken
        console.log("📄 Deploying SolarToken...");
        const SolarTokenArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactsPath, "SolarToken.sol/SolarToken.json"), "utf8")
        );
        const SolarTokenFactory = new ethers.ContractFactory(
            SolarTokenArtifact.abi, 
            SolarTokenArtifact.bytecode, 
            wallet
        );
        
        const solarToken = await SolarTokenFactory.deploy(
            ethers.parseEther("1000000"), // 1M initial supply
            wallet.address, // fee collector
            { nonce: nonce++, gasLimit: 8000000 }
        );
        await solarToken.waitForDeployment();
        const solarTokenAddress = await solarToken.getAddress();
        console.log(`✅ SolarToken deployed: ${solarTokenAddress}`);
        
        // Deploy Oracle
        console.log("🔮 Deploying Oracle...");
        const OracleArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactsPath, "Oracle.sol/SolChainOracle.json"), "utf8")
        );
        const OracleFactory = new ethers.ContractFactory(
            OracleArtifact.abi, 
            OracleArtifact.bytecode, 
            wallet
        );
        
        const oracle = await OracleFactory.deploy({ nonce: nonce++, gasLimit: 8000000 });
        await oracle.waitForDeployment();
        const oracleAddress = await oracle.getAddress();
        console.log(`✅ Oracle deployed: ${oracleAddress}`);
        
        // Deploy Staking
        console.log("🥩 Deploying Staking...");
        const StakingArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactsPath, "Staking.sol/SolChainStaking.json"), "utf8")
        );
        const StakingFactory = new ethers.ContractFactory(
            StakingArtifact.abi, 
            StakingArtifact.bytecode, 
            wallet
        );
        
        const staking = await StakingFactory.deploy(solarTokenAddress, { nonce: nonce++, gasLimit: 8000000 });
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        console.log(`✅ Staking deployed: ${stakingAddress}`);
        
        // Deploy Governance
        console.log("🏛️ Deploying Governance...");
        const GovernanceArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactsPath, "Governance.sol/SolChainGovernance.json"), "utf8")
        );
        const GovernanceFactory = new ethers.ContractFactory(
            GovernanceArtifact.abi, 
            GovernanceArtifact.bytecode, 
            wallet
        );
        
        const governance = await GovernanceFactory.deploy(
            solarTokenAddress,
            17280, // 1 day in blocks
            { nonce: nonce++, gasLimit: 8000000 }
        );
        await governance.waitForDeployment();
        const governanceAddress = await governance.getAddress();
        console.log(`✅ Governance deployed: ${governanceAddress}`);
        
        // Deploy EnergyTrading
        console.log("⚡ Deploying EnergyTrading...");
        const EnergyTradingArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactsPath, "EnergyTrading.sol/EnergyTrading.json"), "utf8")
        );
        const EnergyTradingFactory = new ethers.ContractFactory(
            EnergyTradingArtifact.abi, 
            EnergyTradingArtifact.bytecode, 
            wallet
        );
        
        const energyTrading = await EnergyTradingFactory.deploy(
            solarTokenAddress,
            oracleAddress,
            { nonce: nonce++, gasLimit: 8000000 }
        );
        await energyTrading.waitForDeployment();
        const energyTradingAddress = await energyTrading.getAddress();
        console.log(`✅ EnergyTrading deployed: ${energyTradingAddress}`);
        
        // Save deployment addresses
        const addresses = {
            SolarToken: solarTokenAddress,
            Oracle: oracleAddress,
            Staking: stakingAddress,
            Governance: governanceAddress,
            EnergyTrading: energyTradingAddress,
            deployer: wallet.address,
            network: "hardhat",
            deployedAt: new Date().toISOString()
        };
        
        const addressesPath = path.join(__dirname, "deployed-addresses.json");
        fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
        console.log(`📄 Addresses saved to: ${addressesPath}`);
        
        console.log("\n🎉 All contracts deployed successfully!");
        console.log("\n📋 Contract Addresses:");
        console.log("========================");
        Object.entries(addresses).forEach(([name, address]) => {
            if (name !== 'deployedAt' && name !== 'network') {
                console.log(`${name}: ${address}`);
            }
        });
        
        return addresses;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Run deployment if called directly
if (require.main === module) {
    deployClean()
        .then(() => {
            console.log("✅ Deployment completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = { deployClean };
