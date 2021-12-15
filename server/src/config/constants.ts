import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const constants = {
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: Number(process.env.SERVER_PORT),
    DB_URL : process.env.DB_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    NETWORKS: {
        'ETH': {
            NETWORK_ID: process.env.ETH_CHAIN_ID,
            SMARTSWAP_ADDRESS: process.env.ETH_SMARTSWAP_CONTRACT_ADDRESS,
            PROVIDER: process.env.ETH_CHAIN_PROVIDER
        },
        'BSC': {
            NETWORK_ID: process.env.BSC_CHAIN_ID,
            SMARTSWAP_ADDRESS: process.env.BSC_SMART_SWAP_CONTRACT_ADDRESS,
            PROVIDER: process.env.BSC_CHAIN_PROVIDER
        }
    }
}

export default constants;
