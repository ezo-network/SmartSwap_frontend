import { Request, Response } from "express";
import { log, constants } from "../../../config";
import { v4 as uuidv4 } from 'uuid';
import { Transaction as Tx } from '@ethereumjs/tx'
import SwapProvider, {ISwapProvider} from '../models/SwapProvider';

import web3Js from 'web3';
import { ethers } from 'ethers';

import swapFactoryAbi from "../../../abis/swapFactory.json";
import constantConfig from "../../../../../src/config/constantConfig";
import CONSTANT from "../../../../../src/constants.js";
import { AbiItem } from 'web3-utils';
import _ from "lodash";

const ETH_PROVIDER="https://kovan.infura.io/v3/b06e3282ffb44f07a3ba3efb7faa8d29";
const BSC_PROVIDER="https://data-seed-prebsc-1-s1.binance.org:8545/";
let nonce = 0;

const getRawTransactionApp = function(_address, _nonce, _gasPrice, _gasLimit, _to, _value, _data, chain_id, web3) {
    console.log("claming on: " + chain_id)
    return {
        nonce: web3.utils.toHex(_nonce),
        gasPrice: _gasPrice === null ? '0x098bca5a00' : web3.utils.toHex(_gasPrice),
        gasLimit: _gasLimit === null ? '0x96ed' : web3.utils.toHex(_gasLimit),
        to: _to,
        value: _value === null ? '0x00' : web3.utils.toHex(_value),
        data: _data === null ? '' : _data,
        chainId: chain_id
    }
}

const swapProviderController = {
    becomeSwapProvider: async (req: Request, res: Response) => {

        try {
            const { 
                spAccount, networkId, tokenA, tokenB, amountA,
                walletAddressToSend, walletAddressToReceive, 
                gasAndFeeAmount, spProfitPercent, accumulateFundsLimit, 
                stopRepeatsMode, stopRepeatsOnDate, stopRepeatsAfterCalls,
                withdrawMode, withdrawOnDate, withdrawAfterCalls,
                cexApiKey, cexApiSecret, txid, smartContractAddress         
            } = req.body;
            
            // SP exist?
            const isSwapProviderExists: ISwapProvider = await SwapProvider.findOne({
                'walletAddresses.spAccount' : spAccount,
                'networkId': networkId,
                'tokenA.address': tokenA,
                'tokenB.address': tokenB
            }).exec();
            
            if (isSwapProviderExists) return res.status(401).json({ errorMessage: {
                error: "Swap provider already exists" 
            } }); 

            // save into db
            let spArgs = {
                walletAddresses: {
                    toSend: walletAddressToSend,
                    toReceive: walletAddressToReceive,
                    spAccount
                },
                tokenA: {
                    address: tokenA,
                    recievedAmount: amountA
                },
                tokenB: {
                    address: tokenB
                },
                networkId,
                gasAndFeeAmount,
                spProfitPercent,
                accumulateFundsLimit,
                stopRepeats: {
                    mode: stopRepeatsMode,
                    onDate: stopRepeatsOnDate,
                    afterCalls: stopRepeatsAfterCalls
                },
                withdraw: {
                    mode: withdrawMode,
                    onDate: withdrawOnDate,
                    afterCalls: withdrawAfterCalls
                },
                cexData: {
                    key: cexApiKey,
                    secret: cexApiSecret
                }
            };
            const swapProvider = await new SwapProvider(spArgs).save();
            // const swapProvider = {
            //     tokenA: {
            //       consumedAmount: 0,
            //       address: '0x0000000000000000000000000000000000000002',
            //       recievedAmount: 10
            //     },
            //     tokenB: { recievedAmount: 0, address: '0x0000000000000000000000000000000000000001' },
            //     smartContractAddress: '9b909d25-079c-49ce-b937-534b77f8a9c9',
            //     txid: '5bf54f13-7e38-4127-a65c-62754aec5815',
            //     active: true,
            //     _id: '6109081b8a73615144abf49f',
            //     walletAddresses: {
            //       toSend: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //       toReceive: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //       spAccount: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8'
            //     },
            //     networkId: 42,
            //     gasAndFeeAmount: 3.3,
            //     spProfitPercent: 0.3,
            //     accumulateFundsLimit: 0.3,
            //     stopRepeats: { mode: 3 },
            //     withdraw: { mode: 3 },
            //     cexData: { key: '00000000ab', secret: '00000000yz' },
            //     createdAt: '2021-08-03T09:10:51.181Z',
            //     updatedAt:'2021-08-03T09:10:51.181Z',
            //     __v: 0
            // }

            console.log({
                "Saved SP:": swapProvider
            });
            
            return res.status(201).json(swapProvider);
            // if(swapProvider[0].hasOwnProperty('_id')){
            //     // call add swap provider 
            //     // add as provider onto blockchain 
            //     // let contractAddress = constantConfig[networkId].swapFactoryContract;                
                
            //     // contractAddress = "0xcb8fAb404a5b55942690457ccD0b31F1D09B5419";

            //     // let provider = 42 == 42 ? INFURA_WEB_ENDPOINT : BSC_WEB_ENDPOINT
            //     // const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
            //     // const contractInstance = new web3.eth.Contract(swapFactoryAbi as AbiItem[], contractAddress);
            //     //console.log(contractInstance);
            //     // await swapProviderController.addSwapProvider(contractInstance, spArgs, web3).then(response => {
            //     //     swapProvider['addSwapProviderResponse'] = response;
            //     //     return res.status(201).json(swapProvider);
            //     // });
            // }

        } catch (err) {
            err['errorOrigin'] = "becomeSwapProvider";
            return res.status(500).json({ errorMessage: {
                error: err
            } });
        }
    },

    addSwapProvider: async(event, networkId) => {
        // event = {
        //     address: '0xcb8fAb404a5b55942690457ccD0b31F1D09B5419',
        //     blockHash: '0x0928b0fce1f8bc0ed4e72f58975a630e4a496e015dc74aea35e0f86c13bd7991',
        //     blockNumber: 26637578,
        //     logIndex: 0,
        //     removed: false,
        //     transactionHash: '0xc399f0b6ac26abff81670904cf3a45acb59f09cd4da2c0d59c295f5b95eb94f3',
        //     transactionIndex: 0,
        //     transactionLogIndex: '0x0',
        //     type: 'mined',
        //     id: 'log_cd0a9e6a',
        //     returnValues: {
        //       '0': '0x216D55ef7d326c94cea812E6057b5620760828C2',
        //       '1': '0x640961D8273Bc9d8A2784c96deCc70CF60A3a5d1',
        //       swapProvider: '0x216D55ef7d326c94cea812E6057b5620760828C2',
        //       spContract: '0x640961D8273Bc9d8A2784c96deCc70CF60A3a5d1'
        //     },
        //     event: 'AddSwapProvider',
        //     signature: '0xa1eff58c8543affdfb5afa33295ae122f9b6fd5a1f6b5ba48a39014cfcb70b5d',
        //     raw: {
        //       data: '0x000000000000000000000000216d55ef7d326c94cea812e6057b5620760828c2000000000000000000000000640961d8273bc9d8a2784c96decc70cf60a3a5d1',
        //       topics: [
        //         '0xa1eff58c8543affdfb5afa33295ae122f9b6fd5a1f6b5ba48a39014cfcb70b5d'
        //       ]
        //     }
        // };
        //console.log(event);
        let usp = await SwapProvider.updateOne({
            txid: event.transactionHash,
            networkId: networkId
        }, {
            smartContractAddress: event.returnValues.spContract,
        });
        //console.log(usp);
    },

    update: async(req: Request, res: Response) => {
        try{
            const request = req.body;

            let filter = {};
            
            if ('gasAndFeeAmount' in request){
                Object.assign(filter, {
                    gasAndFeeAmount: request['gasAndFeeAmount']
                });
           }
            
            console.log(filter);
            
            
            let usp = await SwapProvider.updateOne({
                smartContractAddress: request.smartContractAddress
            }, filter);
            
            // let sp:ISwapProvider = await SwapProvider.findOne({
            //     smartContractAddress: request.smartContractAddress
            // });
            
            if(usp.ok == 1){
                return res.status(200).json({
                    "Message": "Record updated"
                });
            }
        
        }  catch (err) {
            err['errorOrigin'] = "update";
            return res.status(500).json({ message: err });
        }
    },

    updateTransactionHash: async(req: Request, res: Response) => {
        try {
            const { 
                txid,
                docId,
                blockNumber,
                networkId
            } = req.body;

            let args = {
                networkId: networkId,
                blockNumber: blockNumber,
                txhash: txid
            }
            console.log(args);

            let event = await swapProviderController.fetchEvent(args);

            let usp = await SwapProvider.updateOne({
                _id: docId
            }, {
                txid: txid,
                fromBlock: blockNumber,
                smartContractAddress: event['returnValues']['spContract']
            });

            if(usp.ok == 1){
                return res.status(200).json({
                    "Message": "Record updated",
                    smartContractAddress: event['returnValues']['spContract']
                });
            }

        }  catch (err) {
            err['errorOrigin'] = "updateTransactionHash";
            return res.status(500).json({ message: err });
        }
    },

    getContractAddress: async(req: Request, res: Response) => {
        try {
            const {
                docId    
            } = req.query;

            let sp = await SwapProvider.findOne({
                _id: docId
            }).exec();

            if(sp){
                return res.status(200).json({
                    smartContractAddress: sp.smartContractAddress
                });
            }

        }  catch (err) {
            err['errorOrigin'] = "getContractAddress";
            return res.status(500).json({ message: err });
        }        
    },

    fetchEvent: async(args) => {
        const provider = Number(args.networkId) === 42 ? ETH_PROVIDER : BSC_PROVIDER;
        const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
        const address = constantConfig[args.networkId].swapFactoryContract;
        const SWAP_INSTANCE = new web3.eth.Contract(swapFactoryAbi as AbiItem[], address);        

        console.log(args.blockNumber);
        
        return await SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
            //filter: {swapProvider: "0xfcbdf7e5ef8ba15fb9a5d2464cf4af7d35fd6987"},
            fromBlock: Number(args.blockNumber),
            toBlock: Number(args.blockNumber)
        }).then(async(events) => {
            let matchedEvent; 
            //console.log("sadasd", events) // same results as the optional callback above
            for (let i = 0; i < events.length; i++) {
                if(events[i]['transactionHash'] == args.txhash){
                    console.log("matched event:", events[i]);
                    matchedEvent = events[i];
                    break;
                }
            }

            return matchedEvent;

        }).catch((err) => console.error(err));;
    },

    getActiveContracts: async(req: Request, res: Response) => {
        const {
            spAccount
        } = req.body;

        try{
            const activeContracts = await SwapProvider.find({
                'walletAddresses.spAccount' : spAccount
            }).exec();

            if(activeContracts.length > 0){
                res.status(200).json(activeContracts);
            } else {
                res.status(404).json({ errorMessage: {
                    error: "No active contract found." 
                }});
            }

        } catch(err){
            err['errorOrigin'] = "getContractAddress";
            return res.status(500).json({ message: err });
        }
    }
    
}

export default swapProviderController;