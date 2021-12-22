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

CONSTANT.NETWORK_ID = {
    'ETHEREUM': Number(process.env.REACT_APP_ETH_CHAIN_ID),
    'BINANCE': Number(process.env.REACT_APP_BSC_CHAIN_ID),
    [Number(process.env.REACT_APP_ETH_CHAIN_ID)]: 'ETHEREUM',
    [Number(process.env.REACT_APP_BSC_CHAIN_ID)]: 'BINANCE'
}

CONSTANT.RPC_PROVIDER_ETHEREUM = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'wss://mainnet.infura.io/ws/v3/0bc569339d39467c9c1840a2f5c6615f' : 'wss://kovan.infura.io/ws/v3/d86e5c556a9f4e5d84c5319ab1d174be';

CONSTANT.RPC_PROVIDER_BINANCE = Number(process.env.REACT_APP_BSC_CHAIN_ID) === 56 ? 'https://bsc-dataseed.binance.org' : 'https://data-seed-prebsc-1-s1.binance.org:8545';

CONSTANT.WEB_RPC_PROVIDER_ETHEREUM = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'https://mainnet.infura.io/v3/0bc569339d39467c9c1840a2f5c6615f' : 'https://kovan.infura.io/v3/0bc569339d39467c9c1840a2f5c6615f';

CONSTANT.WEB_RPC_PROVIDER_BINANCE = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'https://bsc-dataseed.binance.org' : 'https://data-seed-prebsc-1-s1.binance.org:8545';

export default CONSTANT;