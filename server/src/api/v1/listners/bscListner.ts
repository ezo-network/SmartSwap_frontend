import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { CronJob } from 'cron';
import { log, constants } from "../../../config";
import swapFactoryAbi from "../../../abis/swapFactory.json";
import swapProviderController from "../controllers/swapProvider.controller";
import { AbiItem } from 'web3-utils';

const network = constants.NETWORKS.BSC;
const web3 = new Web3(new Web3.providers.HttpProvider(network.PROVIDER));
const address = network.SMARTSWAP_ADDRESS;
const abi = swapFactoryAbi;
const SWAP_INSTANCE = new web3.eth.Contract(abi as AbiItem[], address);

async function listenEvents() {
    fs.readFile(path.resolve(__dirname, './bscBlock.json'), async(err, blockData) => {
        if (err) {
            return;
        }
        blockData = JSON.parse(blockData.toString());

        let lastcheckBlock = blockData["lastblock"];
        const latest = await web3.eth.getBlockNumber();
        blockData["lastblock"] = latest;
        console.log("BSC", {Last:lastcheckBlock, New:latest})
        SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
            fromBlock: lastcheckBlock,
            toBlock: latest // You can also specify 'latest'          
        }).then(async function(resp) {
            for (let i = 0; i < resp.length; i++) {
                    await addSwapProvider(resp[i]);
            }
        }).catch((err) => console.error(err));

        fs.writeFile(path.resolve(__dirname, './bscBlock.json'), JSON.stringify(blockData), (err) => {
            if (err) console.log(err);
        });
    });
}

async function addSwapProvider(eventData) {
    await swapProviderController.addSwapProvider(eventData, network.NETWORK_ID);
}

new CronJob("*/30 * * * * *", async function() {
    console.log("Listning event on BSC Chain: AddSwapProvider")
    await listenEvents();
}, undefined, true, "GMT");