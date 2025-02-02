// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiProductReverseAuction {
    address public owner;
    address public user;
    uint public auctionEndTime;
    bool public auctionEnded;
    uint public ownerFeePercentage = 5; // 5% fee on refunds

    struct Product {
        string name;
        uint benchmarkPrice;
        uint lowestBid;
        address lowestBidder;
    }

    mapping(uint => Product) public products;

    event BasePriceSet(uint indexed productId, address indexed user, uint amount);
    event NewBid(uint indexed productId, address indexed bidder, uint amount);
    event AuctionEnded(uint indexed productId, address winner, uint winningBid, uint refundAmount, uint ownerFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier auctionActive() {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        _;
    }

    modifier auctionNotEnded() {
        require(!auctionEnded, "Auction already ended");
        _;
    }

    constructor(string[3] memory _products, uint _auctionDuration) {
        owner = msg.sender;
        auctionEndTime = block.timestamp + _auctionDuration;
        auctionEnded = false;

        for (uint i = 0; i < 3; i++) {
            products[i] = Product({
                name: _products[i],
                benchmarkPrice: 0,
                lowestBid: type(uint).max,
                lowestBidder: address(0)
            });
        }
    }

    function setBasePrices(uint[3] memory basePrices) external payable auctionNotEnded {
        require(user == address(0), "Base prices already set");
        require(msg.value == basePrices[0] + basePrices[1] + basePrices[2], "Incorrect total amount sent");

        user = msg.sender;
        
        for (uint i = 0; i < 3; i++) {
            require(basePrices[i] > 0, "Base price must be greater than 0");
            products[i].benchmarkPrice = basePrices[i];
        }

        // Transfer funds to the owner immediately
        (bool sent, ) = payable(owner).call{value: msg.value}("");
        require(sent, "Base price transfer to owner failed");

        for (uint i = 0; i < 3; i++) {
            emit BasePriceSet(i, msg.sender, basePrices[i]);
        }
    }

    function placeBid(uint productId, uint bidAmount) external auctionActive {
        require(user != address(0), "Base prices not set yet");
        require(productId < 3, "Invalid product ID");

        Product storage product = products[productId];

        require(bidAmount < product.lowestBid, "Bid must be lower than the current lowest bid");
        require(bidAmount <= product.benchmarkPrice, "Bid cannot exceed base price");

        product.lowestBidder = msg.sender;
        product.lowestBid = bidAmount;

        emit NewBid(productId, msg.sender, bidAmount);
    }

    function endAuction() external onlyOwner auctionNotEnded {
        require(block.timestamp >= auctionEndTime, "Auction still ongoing");
        require(user != address(0), "No user has set base prices");

        auctionEnded = true;

        for (uint i = 0; i < 3; i++) {
            Product storage product = products[i];
            
            uint refundAmount = product.benchmarkPrice - product.lowestBid;
            uint ownerFee = (refundAmount * ownerFeePercentage) / 100;
            uint finalRefund = refundAmount - ownerFee;

            if (product.lowestBidder != address(0)) {
                (bool successBidder, ) = payable(product.lowestBidder).call{value: product.lowestBid}("");
                require(successBidder, "Payment to lowest bidder failed");
            }

            if (finalRefund > 0) {
                (bool successUser, ) = payable(user).call{value: finalRefund}("");
                require(successUser, "Refund to user failed");
            }

            emit AuctionEnded(i, product.lowestBidder, product.lowestBid, finalRefund, ownerFee);
        }
    }

    function getProductDetails(uint productId) external view returns (string memory, uint, uint, address) {
        require(productId < 3, "Invalid product ID");
        Product storage product = products[productId];
        return (product.name, product.benchmarkPrice, product.lowestBid, product.lowestBidder);
    }

    function timeLeft() external view returns (uint) {
        if (block.timestamp >= auctionEndTime) {
            return 0;
        } else {
            return auctionEndTime - block.timestamp;
        }
    }
}