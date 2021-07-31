"use strict";

const data = {

};

// mainnet config


data[97] = {};
data[56] = {};

data[42] = {};

data.allowedNetwork = [97, 42];


// data[97].frozenTokenContract = "0xac7Fcf3907Eb1B4bC70C5Aee18856a25a32C1c7F";
// data[97].tokenGateWay = "0x23C9523DC77441eFb878c57D426190E8b9586AF3";

data[97].swapFactoryContract = "0x309208d15fba3207be6c760771ca3b4846e1be93";
data[97].explorer = "https://testnet.bscscan.com";

// priceFeed 0x9326BFA02ADD2366b30bacB125260Af641031331
// data[42].frozenTokenContract = "0x0A3EefA17Ef03dc9Ef34B68d2A2F1178C959a237";
// data[42].tokenGateWay = "0xaEb8818Df09F0476c8160935Ec61978B34eC3151";

data[42].swapFactoryContract = "0xeaf41806fcc2a3893a662dbba7a111630f9f6704";
data[42].explorer = "http://kovan.etherscan.io";

// testnet config


// data[97] = {};
// data[56] = {};

// data[42] = {};

// data.allowedNetwork = [97, 42];


// data[97].frozenTokenContract = "0xac7Fcf3907Eb1B4bC70C5Aee18856a25a32C1c7F";
// data[97].tokenGateWay = "0x23C9523DC77441eFb878c57D426190E8b9586AF3";
// data[97].swapFactoryContract = "0x7d064c45ce3b76ebd1ce3b64e0aa85db706ffbfa";
// data[97].explorer = "https://testnet.bscscan.com";

// // priceFeed 0x9326BFA02ADD2366b30bacB125260Af641031331
// data[42].frozenTokenContract = "0x0A3EefA17Ef03dc9Ef34B68d2A2F1178C959a237";
// data[42].tokenGateWay = "0xaEb8818Df09F0476c8160935Ec61978B34eC3151";
// data[42].swapFactoryContract = "0xb303febf2da5d0a45eeb0bf185f3c5335ebd53f5";
// data[42].explorer = "http://kovan.etherscan.io";



data.pureToken = [{
        name: "Ether",
        networkId: 42,
        image: "imgs/pureEth.png",
        id: "ethereum",
        // frozenToken: data[42].frozenTokenContract
    },
    {
        name: "Bnb",
        networkId: 97,
        image: "imgs/pureBnb.png",
        id: "binancecoin",
        // frozenToken: data[97].frozenTokenContract
    }
];


data.tokenDetails = {
    "BNB": {
        symbol: "BNB",
        name: "Binance Coin",
        networkId: 97,
        coingecko_id: "binancecoin",
        address: "0x0000000000000000000000000000000000000001",
        isActive: true,
        iconName: "BNB",
        approveRequire: false,
        icon: "images/ddBNB-icon.png"
    },
    "ETH": {
        symbol: "ETH",
        name: "Ethereum",
        networkId: 42,
        coingecko_id: "ethereum",
        address: "0x0000000000000000000000000000000000000002",
        isActive: true,
        iconName: "ETH",
        approveRequire: false,
        icon: "images/ddETH-icon.png"
    },
    "JNTR/e": {
        symbol: "JNTR/e",
        name: "JNTR E",
        networkId: 1,
        coingecko_id: "",
        address: "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042",
        isActive: true,
        iconName: "JNTRE",
        approveRequire: true,
        icon: "images/ddETH-icon.png"
    },
    "JNTR/b": {
        symbol: "JNTR/b",
        name: "JNTR B",
        networkId: 56,
        coingecko_id: "",
        address: "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",
        isActive: true,
        iconName: "JNTRB",
        approveRequire: true,
        icon: "images/ddETH-icon.png"
    },
    // "JNTR" : {
    //     symbol: "JNTR",
    //     name: "Jointer Token",
    //     networkId: 97,
    //     coingecko_id: "",
    //     address: "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A",
    //     isActive: true,
    //     iconName: "JNTR",
    //     approveRequire: true
    // }
}


data.addressByToken = {
    "0x0000000000000000000000000000000000000001": {
        name: "Binance Coin",
        symbol: "BNB"
    },
    "0x0000000000000000000000000000000000000002": {
        name: "Ethereum",
        symbol: "ETH"
    }
}



module.exports = data;