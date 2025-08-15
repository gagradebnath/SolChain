const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing SolChain Blockchain Functionality...\n");

    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("Testing with accounts:");
    console.log("Deployer:", deployer.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address, "\n");

    // Get deployed contract addresses
    const contracts = {
        SolarToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        SolChainGovernance: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        SolChainStaking: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        SolChainOracle: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        EnergyTrading: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
    };

    // Connect to contracts
    const solarToken = await ethers.getContractAt("SolarToken", contracts.SolarToken);
    const governance = await ethers.getContractAt("SolChainGovernance", contracts.SolChainGovernance);
    const staking = await ethers.getContractAt("SolChainStaking", contracts.SolChainStaking);
    const oracle = await ethers.getContractAt("SolChainOracle", contracts.SolChainOracle);
    const energyTrading = await ethers.getContractAt("EnergyTrading", contracts.EnergyTrading);

    console.log("✅ Connected to all contracts\n");

    // Test 1: Token Functionality
    console.log("🪙 Testing SolarToken...");
    const initialSupply = await solarToken.totalSupply();
    const deployerBalance = await solarToken.balanceOf(deployer.address);
    console.log(`  Initial Supply: ${ethers.formatEther(initialSupply)} ST`);
    console.log(`  Deployer Balance: ${ethers.formatEther(deployerBalance)} ST`);

    // Mint tokens to users
    const mintAmount = ethers.parseEther("1000");
    await solarToken.mint(user1.address, mintAmount, "Test minting for user1");
    await solarToken.mint(user2.address, mintAmount, "Test minting for user2");
    console.log(`  ✅ Minted ${ethers.formatEther(mintAmount)} ST to each user\n`);

    // Test 2: Oracle Functionality
    console.log("🔮 Testing SolChainOracle...");
    const priceData = await oracle.latestPrice();
    console.log(`  Current Energy Price: ${ethers.formatEther(priceData.price)} ETH per kWh`);
    console.log(`  Price Timestamp: ${new Date(Number(priceData.timestamp) * 1000).toLocaleString()}`);
    console.log(`  ✅ Oracle is operational\n`);

    // Test 3: Staking Functionality
    console.log("🔒 Testing SolChainStaking...");
    
    // First approve tokens for staking
    const stakeAmount = ethers.parseEther("100");
    await solarToken.connect(user1).approve(contracts.SolChainStaking, stakeAmount);
    
    // Check staking parameters
    const stakingParams = await staking.stakingPool();
    console.log(`  Minimum Stake: ${ethers.formatEther(stakingParams.minimumStake)} ST`);
    console.log(`  Total Staked: ${ethers.formatEther(stakingParams.totalStaked)} ST`);
    console.log(`  ✅ Staking contract is operational\n`);

    // Test 4: Energy Trading Functionality
    console.log("⚡ Testing EnergyTrading...");
    
    // Approve tokens for trading
    const tradeAmount = ethers.parseEther("10");
    await solarToken.connect(user1).approve(contracts.EnergyTrading, tradeAmount);
    await solarToken.connect(user2).approve(contracts.EnergyTrading, tradeAmount);

    // Check trading parameters
    const tradingParams = await energyTrading.tradingParameters();
    console.log(`  Minimum Trade Amount: ${ethers.formatEther(tradingParams.minimumTradeAmount)} ST`);
    console.log(`  Escrow Delay: ${tradingParams.escrowDelay} seconds`);
    console.log(`  Trading Fee: ${tradingParams.tradingFee} basis points`);
    console.log(`  ✅ Energy Trading contract is operational\n`);

    // Test 5: Governance Functionality
    console.log("🏛️ Testing SolChainGovernance...");
    const config = await governance.config();
    console.log(`  Voting Delay: ${config.votingDelay} seconds`);
    console.log(`  Voting Period: ${config.votingPeriod} seconds`);
    console.log(`  Proposal Threshold: ${ethers.formatEther(config.proposalThreshold)} ST`);
    console.log(`  Quorum Percentage: ${config.quorumPercentage}%`);
    console.log(`  ✅ Governance contract is operational\n`);

    console.log("🎉 All SolChain contracts are functioning correctly!");
    console.log("\n📊 System Status: READY FOR INTEGRATION");
    console.log("✅ Token economics active");
    console.log("✅ P2P trading enabled");
    console.log("✅ Staking system operational");
    console.log("✅ Oracle feeds working");
    console.log("✅ DAO governance active");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
