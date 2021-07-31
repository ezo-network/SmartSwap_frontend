import constants from "./constants";
import { ConnectionOptions } from "mongoose";

const mongoOpts: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};

const mongoConfig = {
    url: `mongodb://${constants.DB_HOST}:${constants.DB_PORT}/${constants.DB_NAME}`,
    configs: mongoOpts,
}

export default mongoConfig;