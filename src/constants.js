var CONSTANT = function () { }

CONSTANT.COINGECKO_URL = "https://api.coingecko.com/api/v3";

CONSTANT.PrePath = "https://smartswap.exchange";
// CONSTANT.PrePath = "http://localhost:3000";

CONSTANT.API_URL = "https://api.smartswap.exchange";

CONSTANT.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

CONSTANT.currencyAddresses = {
    "BNB": "0x0000000000000000000000000000000000000001",
    "ETH": "0x0000000000000000000000000000000000000002",
    "JNTR/e": "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042",
    "JNTR/b": "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",
    "JNTR": "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A",
}

// ------------------------------------------mainnet-config-start----------------------------------------------

CONSTANT.NETWORK_ID = {
    'ETHEREUM': Number(process.env.REACT_APP_ETH_CHAIN_ID),
    'BINANCE': Number(process.env.REACT_APP_BSC_CHAIN_ID)
}

CONSTANT['NETWORK_ID'][Number(process.env.REACT_APP_ETH_CHAIN_ID)] = "ETHEREUM";
CONSTANT['NETWORK_ID'][Number(process.env.REACT_APP_BSC_CHAIN_ID)] = "BINANCE";

CONSTANT.RPC_PROVIDER_ETHEREUM = 'wss://kovan.infura.io/ws/v3/d86e5c556a9f4e5d84c5319ab1d174be';

CONSTANT.RPC_PROVIDER_BINANCE = 'https://data-seed-prebsc-2-s3.binance.org:8545';

// ------------------------------------------mainnet-config-end----------------------------------------------
// ------------------------------------------testnet-config-start----------------------------------------------

// CONSTANT.NETWORK_ID = {
//     "ETHEREUM": 42,
//     "BINANCE": 97,
//     "42": "ETHEREUM",
//     "97": "BINANCE"
// }

// CONSTANT.RPC_PROVIDER_ETHEREUM = 'wss://kovan.infura.io/ws/v3/d86e5c556a9f4e5d84c5319ab1d174be';

// CONSTANT.RPC_PROVIDER_BINANCE = 'https://data-seed-prebsc-1-s1.binance.org:8545';

// ------------------------------------------testnet-config-end----------------------------------------------

// CONSTANT.RPC_PROVIDER_BINANCE = 'https://data-seed-prebsc-2-s3.binance.org:8545';

module.exports = CONSTANT;