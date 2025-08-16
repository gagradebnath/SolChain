const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Quick Test", function () {
    it("Should test chai matchers", async function () {
        const [owner] = await ethers.getSigners();
        
        // Test basic chai functionality
        expect(1).to.equal(1);
        expect(1n).to.equal(1n); // BigInt test
        
        console.log("Chai matchers working correctly!");
    });
});
