const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Verifying contracts with the account:", deployer.address);

    const contracts = [
        {
            name: "SolarToken",
            address: "YOUR_SOLARTOKEN_CONTRACT_ADDRESS"
        },
        {
            name: "EnergyMarketplace",
            address: "YOUR_ENERGYMARKETPLACE_CONTRACT_ADDRESS"
        },
        {
            name: "Governance",
            address: "YOUR_GOVERNANCE_CONTRACT_ADDRESS"
        }
    ];

    for (const contract of contracts) {
        console.log(`Verifying ${contract.name}...`);
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: []
        });
    }

    console.log("Verification completed.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });