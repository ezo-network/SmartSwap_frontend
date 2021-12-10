import express from "express";
import {constants,log, db} from "./config";
import routes from "./api/v1/routes/routes";
import cors from "cors";
// Mongoose
import mongoose from 'mongoose';
import ETHListner = require('./api/v1/listners/ethListner');
import BSCListner = require('./api/v1/listners/bscListner');

mongoose.connect(db.url, db.configs);

const port = constants.SERVER_PORT as number;
const host = constants.SERVER_HOST as string;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

app.listen(port, host, () => {
    log.info(`Server listing at http://${host}:${port}`);

    routes(app);

    // listners
    //ETHListner;
    //BSCListner;
});