import constants from "./constants";
import { ConnectionOptions } from "mongoose";

const mongoOpts: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};

const mongoConfig = {
    url: constants.DB_HOST,
    configs: mongoOpts,
}

export default mongoConfig;