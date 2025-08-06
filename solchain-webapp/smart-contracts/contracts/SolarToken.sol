// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolarToken is ERC20, Ownable {
    // Token details
    string private constant _name = "SolarToken";
    string private constant _symbol = "ST";
    uint8 private constant _decimals = 18;

    // Initial supply of tokens
    uint256 private constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(_decimals));

    constructor() ERC20(_name, _symbol) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Function to mint new tokens
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    // Function to burn tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}