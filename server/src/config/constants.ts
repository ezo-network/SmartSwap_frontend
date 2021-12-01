import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const constants = {
    port: 4006,
    host: "localhost",
    dbUri: "mongodb://localhost:27017/rest-api",
    JWT_TOKEN_LIFETIME:3600,
    JWT_SECRET:'39yujkpce9',
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    NETWORKS: {
        'ETH': {
            NETWORK_ID: 42,
            SMARTSWAP_ADDRESS: '0xb303febf2da5d0a45eeb0bf185f3c5335ebd53f5',
            PROVIDER: 'https://kovan.infura.io/v3/b06e3282ffb44f07a3ba3efb7faa8d29'
        },
        'BSC': {
            NETWORK_ID: 97,
            SMARTSWAP_ADDRESS: '0x7d064c45ce3b76ebd1ce3b64e0aa85db706ffbfa',
            PROVIDER: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
        }        
    }
}

export default constants;
