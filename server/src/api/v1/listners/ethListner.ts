import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { CronJob } from 'cron';
import { log, constants } from "../../../config";
import swapFactoryAbi from "../../../abis/swapFactory.json";
import swapProviderController from "../controllers/swapProvider.controller";
import { AbiItem } from 'web3-utils';

const network = constants.NETWORKS.ETH;
const web3 = new Web3(new Web3.providers.HttpProvider(network.PROVIDER));
const address = network.SMARTSWAP_ADDRESS;
const abi = swapFactoryAbi;
const SWAP_INSTANCE = new web3.eth.Contract(abi as AbiItem[], address);

async function listenEvents() {
    fs.readFile(path.resolve(__dirname, './ethBlock.json'), async(err, blockData) => {
        if (err) {
            return;
        }
        blockData = JSON.parse(blockData.toString());

        let lastcheckBlock = blockData["lastblock"];
        const latest = await web3.eth.getBlockNumber();
        blockData["lastblock"] = latest;
        console.log("ETH", {Last:lastcheckBlock, New:latest})
        
        SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
            fromBlock: lastcheckBlock,
            toBlock: latest // You can also specify 'latest'          
        }).then(async function(resp) {
            for (let i = 0; i < resp.length; i++) {
                    await addSwapProvider(resp[i]);
            }
        }).catch((err) => console.error(err));

        fs.writeFile(path.resolve(__dirname, './ethBlock.json'), JSON.stringify(blockData), (err) => {
            if (err) console.log(err);
        });
    });
}

async function addSwapProvider(eventData) {
    await swapProviderController.addSwapProvider(eventData, network.NETWORK_ID);
}

export default async function fetchEvent(args) {
    SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
        //filter: {swapProvider: "0xfcbdf7e5ef8ba15fb9a5d2464cf4af7d35fd6987"},
        fromBlock: args.blockNumber,
        toBlock: args.blockNumber
    }, function(error, events){ console.log(events); })
    .then(function(events){
        console.log(events) // same results as the optional callback above
    });
}

// new CronJob("*/40 * * * * *", async function() {
//     console.log("Listning event on ETH Chain: AddSwapProvider")
//     await listenEvents();
// }, undefined, true, "GMT");