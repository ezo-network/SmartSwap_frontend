import express from "express";
import {constants,log, db} from "./config";
import routes from "./api/v1/routes/routes";
import cors from "cors";
// Mongoose
import mongoose from 'mongoose';
import TaskScheduler from './api/v1/taskScheduler/index';
// import ETHListner = require('./api/v1/listners/ethListner');
// import BSCListner = require('./api/v1/listners/bscListner');

let print = log.createLogger('Logs', 'trace');


mongoose.connect(db.url, db.configs);

const port = constants.SERVER_PORT as number;
const host = constants.SERVER_HOST as string;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

app.listen(port, host, async() => {
    print.info(`Server listing at http://${host}:${port}`);

    routes(app);

    // cron jobs
    TaskScheduler.start();
});