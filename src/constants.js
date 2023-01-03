var CONSTANT = function () { }

CONSTANT.COINGECKO_URL = "https://api.coingecko.com/api/v3";

CONSTANT.PrePath = "https://smartswap.exchange";
// CONSTANT.PrePath = "https://bswap.info";
// CONSTANT.PrePath = "http://localhost:3000";

CONSTANT.API_URL = "https://api.smartswap.exchange";

CONSTANT.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

CONSTANT.currencyAddresses = {
    "BNB": "0x0000000000000000000000000000000000000001",
    "ETH": "0x0000000000000000000000000000000000000002",
    "MATIC": "0x0000000000000000000000000000000000000004",
    "JNTR/e": "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042",
    "JNTR/b": "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",
    "JNTR": "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A",
}

CONSTANT.NETWORK_ID = {
    'ETHEREUM': Number(process.env.REACT_APP_ETH_CHAIN_ID),
    'BINANCE': Number(process.env.REACT_APP_BSC_CHAIN_ID),
    'POLYGON': Number(process.env.REACT_APP_POLYGON_CHAIN_ID),
    [Number(process.env.REACT_APP_ETH_CHAIN_ID)]: 'ETHEREUM',
    [Number(process.env.REACT_APP_BSC_CHAIN_ID)]: 'BINANCE',
    [Number(process.env.REACT_APP_POLYGON_CHAIN_ID)]: 'POLYGON',
}

CONSTANT.RPC_PROVIDER_ETHEREUM = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'wss://mainnet.infura.io/ws/v3/0bc569339d39467c9c1840a2f5c6615f' : 'wss://kovan.infura.io/ws/v3/d86e5c556a9f4e5d84c5319ab1d174be';

CONSTANT.RPC_PROVIDER_BINANCE = Number(process.env.REACT_APP_BSC_CHAIN_ID) === 56 ? 'https://bsc-dataseed.binance.org' : 'https://data-seed-prebsc-1-s1.binance.org:8545';

CONSTANT.WEB_RPC_PROVIDER_ETHEREUM = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'https://mainnet.infura.io/v3/0bc569339d39467c9c1840a2f5c6615f' : 'https://kovan.infura.io/v3/0bc569339d39467c9c1840a2f5c6615f';

CONSTANT.WEB_RPC_PROVIDER_BINANCE = Number(process.env.REACT_APP_ETH_CHAIN_ID) === 1 ? 'https://bsc-dataseed.binance.org' : 'https://data-seed-prebsc-1-s1.binance.org:8545';

CONSTANT.RPC_PROVIDER_POLYGON = Number(process.env.REACT_APP_POLYGON_CHAIN_ID) === 137 ? 'https://polygon-rpc.com' : 'https://matic-mumbai.chainstacklabs.com';


// new integration - dynamic

CONSTANT.HOST_TYPES = {
    'SMARTEXCHANGE_DATABASE_INSTANCE': process.env.REACT_APP_SMARTEXCHANGE_DATABASE_INSTANCE ?? "",
    'SMARTSWAP_API_INSTANCE': process.env.REACT_APP_SMARTSWAP_API_INSTANCE ?? ""
}

CONSTANT.API_ENDPOINTS = {
    'SMARTEXCHANGE_DATABASE_INSTANCE': {
        'BRIDGE_TOKENS': {
            'isProjectExist': 'customer/project-exist',
            'createNewProject': 'customer/create-project',
            'project': 'customer/project',
            'projects': 'customer/projects',
            'bridge': 'public/bridge',
            'bridges': 'public/bridges',
            'getWappedTokens': 'customer/wrapped-tokens',
            'networks': 'public/networks',
            'tokens': 'public/tokens',
            'activateToken': 'customer/activate-token',
            'attachWrappedToken': 'customer/attach-wrap-token',
            'getEmailStatus': 'customer/get-email-status',
            'addEmailAddress': 'customer/add-email-address',
            'getValidatorFileInfo': 'public/validator-file-info',
            'makeTransferWrapTokenOwnershipRequest': 'customer/transfer-wrap-token-ownership-request',
            'addValidator': 'customer/add-validator',
            'getValidator': 'customer/get-validator',
            'getOwnershipRequests': 'public/ownership-requests',
            'addErc20Token': 'customer/add-erc20-token',
            getDepositTokensHistoryByWalletAddress: (walletAddress, fromChainId, isWrapTokenDeposit) =>  {
                return `ledgers/depositTokenHistory?walletAddress=${walletAddress}&fromChainId=${fromChainId}&isWrapTokenDeposit=${isWrapTokenDeposit}`
            }
        }, 
        'NATIVE_TOKENS': {
            'networks': 'public/active-smartswap-networks',
            chainHopPriceQuoteApi: (fromChainId, toChainId, amountToSwap) => {
                return `chainHopPriceQuoteApi?fromChainId=${fromChainId}&toChainId=${toChainId}&amountToSwap=${amountToSwap}`
            }
        }
    },
    'SMARTSWAP_API_INSTANCE': (type, args = {}) =>  {
        const endpoints = {
            estimateGasAndFees: () => {
                return `swap-fee/${args?.fromChainId}-${args?.toChainId}`
            },
            estimatedProcessingFees: () => {
                return `processing-fee/${args?.fromChainId}-${args?.toChainId}`            
            },
            ledgerHistoryByAddress: () => {
                return `ledgers/${args?.accountAddress}`
            },
            ledgerHistoryBySwapRequestTransactionHash: () => {
                return `ledgers/tx/${args?.transactionHash}`
            }
        }
        return endpoints[type]();
    },
    '3RD_PARTY_APPS': {
        'COIN_GECKO_API': {
            tokensUsdPrice: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple%2Cmatic-network&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
        }
    }
    
}

CONSTANT.DEFAULT_AUTHORITY_SERVER = process.env.REACT_APP_DEFAULT_AUTHORITY_SERVER;

CONSTANT.APPLY_FOR_LICENSING_ACTION="https://docs.google.com/forms/d/e/1FAIpQLSc3A05HDv7ORapGdTFPwzKJ84KfKfPxLw3GDPHTzSmqnr7tHw/viewform";

export default CONSTANT;
