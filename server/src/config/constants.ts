import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import _ from "lodash";

const constants = {
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: Number(process.env.SERVER_PORT),
    DB_URL : process.env.DB_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    NETWORKS: {
        'ETH': {
            NETWORK_ID: Number(process.env.ETH_CHAIN_ID),
            SMARTSWAP_ADDRESS: process.env.ETH_SMARTSWAP_CONTRACT_ADDRESS,
            PROVIDER: process.env.ETH_CHAIN_PROVIDER,
            ADDRESS: '0x0000000000000000000000000000000000000002',
            ASSET: 'ETH',
            MIN_WITHDRAW_AMOUNT: 0.01,
            MIN_AMOUNT_TO_TEST_TRANSFER: 0.00000001,
            NETWORK: 'ETH'
        },
        'BSC': {
            NETWORK_ID: Number(process.env.BSC_CHAIN_ID),
            SMARTSWAP_ADDRESS: process.env.BSC_SMART_SWAP_CONTRACT_ADDRESS,
            PROVIDER: process.env.BSC_CHAIN_PROVIDER,
            ADDRESS: '0x0000000000000000000000000000000000000001',
            ASSET: 'BNB',
            MIN_WITHDRAW_AMOUNT: 0.01,
            MIN_AMOUNT_TO_TEST_TRANSFER: 0.00000001,
            NETWORK: 'BSC'
        },
        'POLYGON': {
            NETWORK_ID: Number(process.env.POLYGON_CHAIN_ID),
            SMARTSWAP_ADDRESS: process.env.POLYGON_SMART_SWAP_CONTRACT_ADDRESS,
            PROVIDER: process.env.POLYGON_CHAIN_PROVIDER,
            ADDRESS: '0x0000000000000000000000000000000000000004',
            ASSET: 'MATIC',
            MIN_WITHDRAW_AMOUNT: 0.3,
            MIN_AMOUNT_TO_TEST_TRANSFER: 0.00000001,
            NETWORK: 'MATIC'
        },
    },

    contractAddressesByPairs: {
        smartswap:{
            "ETH/BNB": process.env.ETH_BNB_SMARTSWAP_CONTRACT_ADDRESS,
            "ETH/MATIC": process.env.ETH_MATIC_SMART_SWAP_CONTRACT_ADDRESS,        
            "BNB/ETH": process.env.BNB_ETH_SMARTSWAP_CONTRACT_ADDRESS,        
            "BNB/MATIC": process.env.BNB_MATIC_SMART_SWAP_CONTRACT_ADDRESS,        
            "MATIC/BNB": process.env.MATIC_BNB_SMART_SWAP_CONTRACT_ADDRESS,        
            "MATIC/ETH": process.env.MATIC_ETH_SMART_SWAP_CONTRACT_ADDRESS,        
        },
        expedite: {
    
        },
        reimbursement: {
    
        }
    },

    getSmartswapContractAddressByPairs: function(tokenA, tokenB){
        const tokenAData = _.find(this.NETWORKS, { "ADDRESS": tokenA });
        const tokenBData = _.find(this.NETWORKS, { "ADDRESS": tokenB });
        const key = tokenAData.ASSET + '/' + tokenBData.ASSET;
        return this.contractAddressesByPairs.smartswap[key];
    }
}

export default constants;
