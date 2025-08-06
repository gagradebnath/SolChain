const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting SolChain smart contract deployment...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

    try {
        // Deploy the SolarToken contract
        console.log("\n📋 Deploying SolarToken contract...");
        const SolarToken = await hre.ethers.getContractFactory("SolarToken");
        const solarToken = await SolarToken.deploy();
        await solarToken.deployed();
        console.log("✅ SolarToken deployed to:", solarToken.address);

        // Deploy the EnergyTrading contract (instead of EnergyMarketplace)
        console.log("\n📋 Deploying EnergyTrading contract...");
        const EnergyTrading = await hre.ethers.getContractFactory("EnergyTrading");
        const energyTrading = await EnergyTrading.deploy(solarToken.address);
        await energyTrading.deployed();
        console.log("✅ EnergyTrading deployed to:", energyTrading.address);

        // Deploy the EnergyMarketplace contract
        console.log("\n📋 Deploying EnergyMarketplace contract...");
        const EnergyMarketplace = await hre.ethers.getContractFactory("EnergyMarketplace");
        const energyMarketplace = await EnergyMarketplace.deploy();
        await energyMarketplace.deployed();
        console.log("✅ EnergyMarketplace deployed to:", energyMarketplace.address);

        // Deploy the Governance contract
        console.log("\n📋 Deploying Governance contract...");
        const Governance = await hre.ethers.getContractFactory("Governance");
        const governance = await Governance.deploy();
        await governance.deployed();
        console.log("✅ Governance deployed to:", governance.address);

        // Setup initial configuration
        console.log("\n⚙️ Setting up initial configuration...");
        
        // Authorize EnergyTrading contract to mint/burn tokens
        try {
            const authTx = await solarToken.authorizeMinter(energyTrading.address);
            await authTx.wait();
            console.log("✅ EnergyTrading contract authorized as minter");
        } catch (error) {
            console.log("ℹ️ Could not authorize minter (method may not exist)");
        }

        // Get token details
        const tokenName = await solarToken.name();
        const tokenSymbol = await solarToken.symbol();
        const totalSupply = await solarToken.totalSupply();
        
        console.log("\n🎯 Deployment Summary:");
        console.log("========================");
        console.log("Token Name:", tokenName);
        console.log("Token Symbol:", tokenSymbol);
        console.log("Total Supply:", hre.ethers.utils.formatEther(totalSupply), "ST");
        console.log("SolarToken Address:", solarToken.address);
        console.log("EnergyTrading Address:", energyTrading.address);
        console.log("EnergyMarketplace Address:", energyMarketplace.address);
        console.log("Governance Address:", governance.address);
        console.log("Deployer Address:", deployer.address);
        
        // Save deployment info
        const deploymentInfo = {
            network: "localhost",
            solarToken: {
                address: solarToken.address,
                name: tokenName,
                symbol: tokenSymbol,
                totalSupply: hre.ethers.utils.formatEther(totalSupply)
            },
            energyTrading: {
                address: energyTrading.address
            },
            energyMarketplace: {
                address: energyMarketplace.address
            },
            governance: {
                address: governance.address
            },
            deployer: deployer.address,
            timestamp: new Date().toISOString()
        };

        // Write to deployment file
        const fs = require('fs');
        const path = require('path');
        
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(deploymentPath, 'localhost.json'), 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📄 Deployment info saved to deployments/localhost.json");
        
        console.log("\n🎉 SolChain deployment completed successfully!");
        console.log("\n📋 Next Steps:");
        console.log("1. Update your .env files with the contract addresses");
        console.log("2. Add SolarToken to MetaMask:");
        console.log("   Contract Address:", solarToken.address);
        console.log("   Token Symbol: ST");
        console.log("   Decimals: 18");
        console.log("3. Start the backend and frontend applications");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });