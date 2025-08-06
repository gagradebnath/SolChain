// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SolarToken.sol";

contract EnergyMarketplace {
    struct EnergyOffer {
        address seller;
        uint256 amount; // in kWh
        uint256 price; // in SolarTokens per kWh
        bool isActive;
    }

    SolarToken public solarToken;
    EnergyOffer[] public offers;

    event OfferCreated(uint256 offerId, address indexed seller, uint256 amount, uint256 price);
    event OfferPurchased(uint256 offerId, address indexed buyer, uint256 amount);
    event OfferCancelled(uint256 offerId);

    constructor(address _solarTokenAddress) {
        solarToken = SolarToken(_solarTokenAddress);
    }

    function createOffer(uint256 amount, uint256 price) external {
        require(amount > 0, "Amount must be greater than zero");
        require(price > 0, "Price must be greater than zero");

        offers.push(EnergyOffer({
            seller: msg.sender,
            amount: amount,
            price: price,
            isActive: true
        }));

        emit OfferCreated(offers.length - 1, msg.sender, amount, price);
    }

    function purchaseOffer(uint256 offerId, uint256 amount) external {
        require(offerId < offers.length, "Offer does not exist");
        EnergyOffer storage offer = offers[offerId];
        require(offer.isActive, "Offer is not active");
        require(amount <= offer.amount, "Not enough energy available");

        uint256 totalPrice = amount * offer.price;
        require(solarToken.balanceOf(msg.sender) >= totalPrice, "Insufficient SolarTokens");

        solarToken.transferFrom(msg.sender, offer.seller, totalPrice);
        offer.amount -= amount;

        if (offer.amount == 0) {
            offer.isActive = false;
        }

        emit OfferPurchased(offerId, msg.sender, amount);
    }

    function cancelOffer(uint256 offerId) external {
        require(offerId < offers.length, "Offer does not exist");
        EnergyOffer storage offer = offers[offerId];
        require(offer.seller == msg.sender, "Only the seller can cancel the offer");
        require(offer.isActive, "Offer is not active");

        offer.isActive = false;

        emit OfferCancelled(offerId);
    }

    function getOffers() external view returns (EnergyOffer[] memory) {
        return offers;
    }
}