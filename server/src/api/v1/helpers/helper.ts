import web3Js from 'web3';
import _ from "lodash";
import spContractAbi from "../../../abis/spContract.json";
import { AbiItem } from 'web3-utils';
import { log, constants } from "../../../config";
let print = log.createLogger('Logs', 'trace');

const Helper = {
    contractInstance: (contractAddress, networkId) => {
        try {
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(networkId) });
            const provider = networkConfig['PROVIDER'];
            const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
            return new web3.eth.Contract(spContractAbi as AbiItem[], contractAddress);    
        } catch(err){
            print.info(`❌ Error From contractInstance:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }
    }
}


export {Helper}