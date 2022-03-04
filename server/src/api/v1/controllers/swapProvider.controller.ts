import { Request, Response } from "express";
import { log, constants } from "../../../config";
import web3Js from 'web3';
import SwapProvider, {ISwapProvider} from '../models/SwapProvider';
import SwapProviderTest from '../models/SwapProviderTest';
import swapFactoryAbi from "../../../abis/swapFactory.json";
import { AbiItem } from 'web3-utils';
import _ from "lodash";
let print = log.createLogger('Logs', 'trace');

// cex
import BinanceCexController from "./BinanceCex.controller";
import MexcCexController from "./MexcCex.controller";

// library 
import { Helper } from "../helpers/helper";

const swapProviderController = {
    becomeSwapProvider: async (req: Request, res: Response) => {

        try {
            const { 
                spAccount, networkId, tokenA, tokenB, amountA,
                walletAddressToSend, walletAddressToReceive, 
                gasAndFeeAmount, spProfitPercent, accumulateFundsLimit, 
                stopRepeatsMode, stopRepeatsOnDate, stopRepeatsAfterCalls,
                withdrawMode, withdrawOnDate, withdrawAfterCalls, 
                txid, smartContractAddress, swapSpeedMode, withdrawPercent  
            } = req.body;

            // validations
            if(tokenA == tokenB){
                return res.status(422).json({ 
                    errorMessage: {
                        error: "Token A and Token B can't be the same" 
                    }                 
                });
            }

            if(Number(networkId) == Number(constants.NETWORKS.ETH.NETWORK_ID)){
                if(tokenA !== constants.NETWORKS.ETH.ADDRESS){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token A selected" 
                        }                 
                    });                    
                }

                if(!((tokenB == constants.NETWORKS.BSC.ADDRESS) || (tokenB == constants.NETWORKS.POLYGON.ADDRESS))){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token B selected" 
                        }                 
                    });                    
                }                
            }

            if(Number(networkId) == Number(constants.NETWORKS.BSC.NETWORK_ID)){
                if(tokenA !== constants.NETWORKS.BSC.ADDRESS){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token A selected" 
                        }                 
                    });                    
                }

                if(!((tokenB == constants.NETWORKS.ETH.ADDRESS) || (tokenB == constants.NETWORKS.POLYGON.ADDRESS))){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token B selected" 
                        }                 
                    });                    
                }                
            }

            if(Number(networkId) == Number(constants.NETWORKS.POLYGON.NETWORK_ID)){
                if(tokenA !== constants.NETWORKS.POLYGON.ADDRESS){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token A selected" 
                        }                 
                    });                    
                }

                if(!((tokenB == constants.NETWORKS.ETH.ADDRESS) || (tokenB == constants.NETWORKS.BSC.ADDRESS))){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token B selected" 
                        }                 
                    });                    
                }    
            }

            let allowedNetworks = [
                Number(constants.NETWORKS.ETH.NETWORK_ID), 
                Number(constants.NETWORKS.BSC.NETWORK_ID),
                Number(constants.NETWORKS.POLYGON.NETWORK_ID)
            ];
            
            if(!allowedNetworks.includes(Number(networkId))){
                return res.status(422).json({ 
                    errorMessage: {
                        error: "Provided network is not allowed to deploy contract." 
                    }
                });                
            }

            // SP exist?
            const isSwapProviderExists: ISwapProvider = await SwapProvider.findOne({
                'walletAddresses.spAccount' : (spAccount).toLowerCase(),
                'networkId': networkId,
                'tokenA.address': tokenA,
                'tokenB.address': tokenB,
                'smartContractAddress': {
                    $exists: true, 
                    $ne: null
                }                                
            }).exec();
            
            if (isSwapProviderExists) return res.status(401).json({ errorMessage: {
                error: "Swap provider already exists" 
            } }); 

            // save into db
            let spArgs = {
                walletAddresses: {
                    toSend: walletAddressToSend,
                    toReceive: walletAddressToReceive,
                    spAccount: (spAccount).toLowerCase()
                },
                totalAmount: amountA,
                tokenA: {
                    address: tokenA,
                    recievedAmount: 0
                },
                tokenB: {
                    address: tokenB
                },
                networkId,
                gasAndFeeAmount,
                swapSpeedMode,
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
                withdrawPercent: withdrawPercent <= 45 ? withdrawPercent : 45,
                withdrawReinitiate: false,
                updateGasAndFeeAmount: false
            };
            const swapProvider = await new SwapProvider(spArgs).save().then(async(sp) => {
                await new SwapProviderTest({
                    swapProvider: sp._id
                }).save();
                return sp;
            }).catch(err => print.info(err));

            print.info({
                "Saved SP:": swapProvider
            });
            
            return res.status(201).json(swapProvider);

        } catch (err) {
            err['errorOrigin'] = "becomeSwapProvider";
            return res.status(500).json({ errorMessage: {
                error: err
            } });
        }
    },

    update: async(req: Request, res: Response) => {
        try{
            const request = req.body;
            let message = 'Contract updated successfully.';
            let messageType = "success";
            let withdrawPercentChanged = true;
            let amountAChanged = true;
            let filter = {};
            
            if ('gasAndFeeAmount' in request){
                Object.assign(filter, {
                    gasAndFeeAmount: request['gasAndFeeAmount']
                });
            }

            if ('swapSpeedMode' in request){
                Object.assign(filter, {
                    swapSpeedMode: request['swapSpeedMode']
                });
                
                Object.assign(filter, {
                    swapSpeedMode: 'UPFRONT'
                });
                // to quickly disable realtime more for now

            }

            if ('spreadAmount' in request){
                Object.assign(filter, {
                    spreadAmount: request['spreadAmount']
                });
            }
            
            if ('amountA' in request){
                Object.assign(filter, {
                    'totalAmount': request['amountA']
                });
            }

            // if ('amountA' in request){
            //     Object.assign(filter, {
            //         'withdrawReinitiate': true
            //     });
            // }

            if ('walletAddressToSend' in request){
                Object.assign(filter, {
                    'walletAddresses.toSend': request['walletAddressToSend']
                });
            }

            if ('spProfitPercent' in request){
                Object.assign(filter, {
                    spProfitPercent: request['spProfitPercent']
                });
            }


            if ('accumulateFundsLimit' in request){
                Object.assign(filter, {
                    accumulateFundsLimit: request['accumulateFundsLimit']
                });
            }

            if ('cexType' in request){
                Object.assign(filter, {
                    'cexData.type': (request['cexType']).toUpperCase()
                });
            }
            
            if ('cexApiKey' in request){
                Object.assign(filter, {
                    'cexData.key': request['cexApiKey']
                });
            }

            if ('cexApiSecret' in request){
                Object.assign(filter, {
                    'cexData.secret': request['cexApiSecret']
                });
            }

            // if(('cexApiKey' in request)  && ('cexApiSecret' in request)){
            //     let apiCheck = await swapProviderController.binanceApiCheck(request['cexApiKey'], request['cexApiSecret']);
                
            //     if(apiCheck == false){
            //         return res.status(422).json({
            //             "Message": "Invalid API Keys"
            //         });                    
            //     }

            //     Object.assign(filter, {
            //         'active': true
            //     });

            // }


            if ('withdrawMode' in request){
                Object.assign(filter, {
                    'withdraw.mode': request['withdrawMode']
                });

                if(request['withdrawMode'] == 1){
                    Object.assign(filter, {
                        'withdraw.onDate': request['withdrawOnDate']
                    });                    
                }

                if(request['withdrawMode'] == 2){
                    Object.assign(filter, {
                        'withdraw.afterCalls': request['withdrawAfterCalls']
                    });                    
                }

            }


            if ('stopRepeatsMode' in request){
                Object.assign(filter, {
                    'stopRepeats.mode': request['stopRepeatsMode']
                });

                if(request['stopRepeatsMode'] == 1){
                    Object.assign(filter, {
                        'stopRepeats.onDate': request['stopRepeatsOnDate']
                    });
                    Object.assign(filter, {
                        'stopRepeats.afterCalls': null
                    });                                        
                }

                if(request['stopRepeatsMode'] == 2){
                    Object.assign(filter, {
                        'stopRepeats.afterCalls': request['stopRepeatsAfterCalls']
                    });                    
                    Object.assign(filter, {
                        'stopRepeats.onDate': null
                    });                                                            
                }

                if(request['stopRepeatsMode'] == 3){
                    Object.assign(filter, {
                        'stopRepeats.afterCalls': null
                    });
                    Object.assign(filter, {
                        'stopRepeats.onDate': null
                    });                                                         
                }

            }

            if ('active' in request){
                Object.assign(filter, {
                    active: request['active']
                });
            }


            if('withdrawPercent' in request){
                Object.assign(filter, {
                    withdrawPercent: request['withdrawPercent']
                });
                // Object.assign(filter, {
                //     'withdrawReinitiate': true
                // });
            }

            if('cexType' in request){
                let sp = await SwapProvider.findOne({
                    smartContractAddress: (request.smartContractAddress).toLowerCase()
                });
                
                // if during update cex changed then reset these states
                const spCexType = sp.cexData['type'] === null ? null : (sp.cexData['type']).toUpperCase()
                if(spCexType !== (request['cexType']).toUpperCase()) {
                    Object.assign(filter, {
                        'cexData.type': (request['cexType']).toUpperCase(),
                        'active': false,
                        'distributionStatus': 'PENDING',
                        'totalWithdrawnAmount': 0
                    });

                    await SwapProviderTest.updateOne({
                        "swapProvider": sp._id
                    }, {
                        'contractOwnerCheck': false,
                        'contractGasAndFeeCheck': false,
                        'spProfitPercentCheck': false,
                        'apiKeysCheck': false,
                        'apiValidateCheck': false,
                        'accountCheck': false,
                        'balanceCheck': false,
                        'transferCheck': false,
                        'withdrawCheck': false,
                        'ipWhiteListCheck': false,
                        'spAddressWhiteListCheck': false,
                        'withdrawEnabledCheck': false
                    });               

                }
                
            }

            if('withdrawReinitiate' in request){
                if(request['withdrawReinitiate'] == true){
                    let sp = await SwapProvider.findOne({
                        smartContractAddress: (request.smartContractAddress).toLowerCase()
                    });

                    if(Number(sp['totalAmount']) == Number(request['amountA'])) {
                        delete filter['totalAmount'];
                        amountAChanged = false;
                    }

                    if(Number(sp['withdrawPercent']) == Number(request['withdrawPercent'])) {
                        delete filter['withdrawPercent'];
                        withdrawPercentChanged = false;
                    }

                    console.log({
                        sp: sp,
                        cond1: (sp['distributionStatus'] == "COMPLETED" && sp['withdrawReinitiate'] == false),
                        cond2: (sp['distributionStatus'] == "FAILED" && sp['withdrawReinitiate'] == false),
                        combined: (sp['distributionStatus'] == "COMPLETED" && sp['withdrawReinitiate'] == false) 
                        ||
                        (sp['distributionStatus'] == "FAILED" && sp['withdrawReinitiate'] == false),
                        amountAChanged: amountAChanged,
                        withdrawPercentChanged: withdrawPercentChanged
                    });

                    if(
                        (amountAChanged == true && sp['active'] == true) 
                        || 
                        (withdrawPercentChanged == true && sp['active'] == true)
                    ){
                        if(
                            (sp['distributionStatus'] == "COMPLETED" && sp['withdrawReinitiate'] == false) 
                            ||
                            (sp['distributionStatus'] == "FAILED" && sp['withdrawReinitiate'] == false)
                        ){
                            Object.assign(filter, {
                                withdrawReinitiate: true
                            });
                        } else {
                            delete filter['totalAmount'];
                            delete filter['withdrawPercent'];
                            message = "Withdraw to contract already in process.";
                            messageType = "info";
                        }
                    }
                }
            }

            print.info(filter);
            
            
            let usp = await SwapProvider.updateOne({
                smartContractAddress: (request.smartContractAddress).toLowerCase()
            }, filter);
            
            // let sp:ISwapProvider = await SwapProvider.findOne({
            //     smartContractAddress: request.smartContractAddress
            // });
            
            if(usp.ok == 1){
                return res.status(200).json({
                    "message": message,
                    "messageType": messageType
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


            let fsp = await SwapProvider.findOne({
                _id: docId
            });            

            if(fsp !== null){
                let args = {
                    networkId: networkId,
                    blockNumber: blockNumber,
                    txhash: txid,
                    tokenA: fsp.tokenA.address,
                    tokenB: fsp.tokenB.address
                }
                print.info(args);
    
                let event = await swapProviderController.fetchEvent(args);
    
    
                print.info("updaing event:", event);
    
                let usp = await SwapProvider.updateOne({
                    _id: docId
                }, {
                    txid: txid,
                    fromBlock: blockNumber,
                    smartContractAddress: (event['returnValues']['spContract']).toLowerCase()
                });
    
                if(usp.ok == 1){
                    return res.status(200).json({
                        "Message": "Record updated",
                        smartContractAddress: event['returnValues']['spContract']
                    });
                }
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
        const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(args.networkId) });
        const provider = networkConfig['PROVIDER'];
        const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
        const address = constants.getSmartswapContractAddressByPairs(args.tokenA, args.tokenB);
        const SWAP_INSTANCE = new web3.eth.Contract(swapFactoryAbi as AbiItem[], address);

        return await SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
            //filter: {swapProvider: "0xfcbdf7e5ef8ba15fb9a5d2464cf4af7d35fd6987"},
            fromBlock: Number(args.blockNumber),
            toBlock: Number(args.blockNumber)
        }).then(async(events) => {
            let matchedEvent; 
            print.info("matchedEvent", events) // same results as the optional callback above
            for (let i = 0; i < events.length; i++) {
                if(events[i]['transactionHash'] == args.txhash){
                    print.info("matched event:", events[i]);
                    matchedEvent = events[i];
                    break;
                }
            }

            return matchedEvent;

        }).catch((err) => console.error(err));
    },

    getActiveContracts: async(req: Request, res: Response) => {
        const {
            spAccount, networkId
        } = req.body;

        try{
            const activeContracts = await SwapProvider.find({
                'walletAddresses.spAccount' : (spAccount).toLowerCase(),
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                },
                'networkId': Number(networkId)
            }).lean().exec();

            
            if(activeContracts.length > 0){

                // for(let i=0; i<activeContracts.length; i++){
                //     let maskedKey = activeContracts[i].cexData.key;
                //     let maskedSecret = activeContracts[i].cexData.secret;
                //     if(maskedKey !== null){
                //         activeContracts[i].cexData.key = maskedKey.replace(/.(?=.{4,}$)/g, '*');
                //     }
                //     if(maskedSecret !== null){
                //         activeContracts[i].cexData.secret = maskedSecret.replace(/.(?=.{4,}$)/g, '*');
                //     }                    
                // }

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
    },

    testSuite: async(req: Request, res: Response) => {
        const {cexType} = req.body;        
        if(cexType == "" || cexType == null || cexType == undefined){
            res.status(400).json({
                message: "a mandatory field cexType type is required."
            });
        }

        if(cexType == "BINANCE"){
            await BinanceCexController.testSuite(req, res);
        }

        if(cexType == "MEXC"){
            await MexcCexController.testSuite(req, res);
        }

    },
    
    amountDistributionHandler: async () => {
        try{
            let pendingDistributionRecord = await SwapProvider.findOne({
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                },
                active: true,
                swapSpeedMode: "UPFRONT",
                "$or": [{
                    "distributionStatus": 'PENDING'
                }, {
                    "withdrawReinitiate": true
                }]
            }).sort({updatedAt: 1}).exec();

            if(pendingDistributionRecord == null){
                pendingDistributionRecord = await SwapProvider.findOne({
                    distributionStatus: 'PROCESSED'
                }).sort({updatedAt: 1}).exec(); 
            }

            if(pendingDistributionRecord !== null){
                if(pendingDistributionRecord.cexData.type === "BINANCE" ){
                    await BinanceCexController.amountDistributionProcess(pendingDistributionRecord);
                }

                if(pendingDistributionRecord.cexData.type === "MEXC" ){
                    await MexcCexController.amountDistributionProcess(pendingDistributionRecord);
                }

            } else {
                print.info('❌ No new active swap provider found whose distribution is pending yet.');
            }
        } catch(err){
            print.info(`❌ Error From distributeAmount:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }        
    },

    updateGasAndFeeAmountHandler : async() => {
        try{
            const swapProviders = await SwapProvider.find({
                updateGasAndFeeAmount: true,
                active: true
            }).sort({
                updatedAt: 1 // /1 for oldest and -1 for latest
            }).limit(1);

            if(swapProviders.length > 0){
                // get GasAndFeeAmount from contract
                let swapProvider = swapProviders[0];
                const address = swapProvider.smartContractAddress;
                let contractInstance = Helper.contractInstance(address, swapProvider.networkId);
                await contractInstance.methods.getFeeAmountLimit().call().then(async(result) => {
                    await SwapProvider.updateOne({
                        _id: swapProvider._id
                    }, {
                        updateGasAndFeeAmount: false,
                        gasAndFeeAmount: result,
                        message: ""
                    }).then(async(res) => {
                    }).catch(err => print.info(`❌ Error swapProvider.updateOne with gasAndFeeAmount and gasAndFeeAmount flag false , ` + err.message));
                }).catch(async(error) => {
                    print.info(`❌ Error while calling getFeeAmountLimit contract func from updateGasAndFeeAmountHandler, ` + error);
                    await SwapProvider.updateOne({
                        _id: swapProvider._id
                    }, {
                        message: "updateGasAndFeeAmountHandler error: " + error,
                        updateGasAndFeeAmount: true
                    }).then(async(res) => {
                    }).catch(err => print.info(`❌ Error swapProvider.updateOne with updateGasAndFeeAmount flag true again , ` + err.message));
                });
            }
        } catch(err){
            print.info(`❌ Error From updateGasAndFeeAmountHandler:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }
    }
    
}

export default swapProviderController;