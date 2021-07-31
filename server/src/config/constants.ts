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
}

export default constants;
