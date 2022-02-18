import { Request, Response } from "express";
import { log, constants } from "../../../config";
import web3Js from 'web3';
import mongoose, { Schema, Document } from 'mongoose';
import SwapProvider, {ISwapProvider} from '../models/SwapProvider';
import SwapProviderTest, {ISwapProviderTest} from '../models/SwapProviderTest';
import Order, {IOrder} from '../models/order';

import swapFactoryAbi from "../../../abis/swapFactory.json";
import spContractAbi from "../../../abis/spContract.json";
import { AbiItem } from 'web3-utils';
import _, { repeat } from "lodash";
const ccxt = require ('ccxt');
let print = log.createLogger('Logs', 'trace');
let ccxtSandBox = false;

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
                console.log('herererer');
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



            if('withdrawReinitiate' in request){
                if(request['withdrawReinitiate'] == true){
                    let sp = await SwapProvider.findOne({
                        smartContractAddress: request.smartContractAddress
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


    binanceApiCheck: async(apiKey:String, secret:String) => {
        try {
            const exchange = new ccxt.binance ({
                'apiKey': apiKey,
                'secret': secret,
                'enableRateLimit': true,
            });
        
            let orderResponse = await exchange.createOrder('BNB/USDT', 'MARKET', 'buy', 1, undefined, {
                test: true
            });  
    
            if(orderResponse.hasOwnProperty('info') && _.isEmpty(orderResponse.info)){
                return true;
            } else {
                return false;
            }
        } catch (e) {
            print.info (e.constructor.name, e.message);
            return false;
        }
    },


    binanceTests: async(req: Request, res: Response, args: Object) => {
        let response, result = {};
        try {


            const exchange = new ccxt.binance ({
                'apiKey': args['apiKey'],
                'secret': args['secret'],
                'enableRateLimit': true,
            });
            
            if(args['type'] == 'binanceApiValidateCheck'){
                response = await exchange.createOrder('BNB/USDT', 'MARKET', 'buy', 1, undefined, {
                    test: true
                });
        
                if(response.hasOwnProperty('info') && _.isEmpty(response.info)){    
                    result = true;   
                } else {
                    result = false;
                }

                await swapProviderController.updateTest(args['spId'], args['type'], result).then(async() => {
                    await swapProviderController.updateTest(args['spId'], 'binanceApiKeysCheck', result);
                    await swapProviderController.testsCheck(args['spId']);
                    res.status(200).json({
                        result: result,
                        type: args['type']
                    });
                });

            }


            if(args['type'] == 'binanceAccountCheck'){
                if(args['accountType'] == "COINM"){
                    response = await exchange.dapiPrivateGetAccount();
                }

                if(args['accountType'] == "USDTM"){
                    response = await exchange.fapiPrivateV2GetAccount();                                
                }

                if(args['accountType'] == "SPOT"){
                    response = await exchange.privateGetAccount();                                
                }

                if(args['accountType'] == "SPOT_USDTM"){
                    response = await exchange.fapiPrivateV2GetAccount();
                    result['futureCanDeposit'] = response.canDeposit;
                    result['futureCanTrade'] = response.canTrade;
                    result['futureCanWithdraw'] = response.canWithdraw;

                    response = await exchange.privateGetAccount();
                    result['spotCanDeposit'] = response.canDeposit;
                    result['spotCanTrade'] = response.canTrade;
                    result['spotCanWithdraw'] = response.canWithdraw;                    

                    result['result'] = 
                        result['futureCanDeposit']
                        && result['futureCanTrade']
                        && result['futureCanWithdraw']
                        && result['spotCanDeposit']
                        && result['spotCanTrade']
                        && result['spotCanWithdraw']
                    ;

                    await swapProviderController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                        await swapProviderController.testsCheck(args['spId']);
                        res.status(200).json(result);
                    });

                } else {
                    result['canDeposit'] = response.canDeposit;
                    result['canTrade'] = response.canTrade;
                    result['canWithdraw'] = response.canWithdraw;
                    result['result'] = (response.canTrade && response.canDeposit && response.canWithdraw);
                    res.status(200).json(result);
                }
                
            }

            if(args['type'] == 'binanceBalanceCheck'){
                
                if(args['accountType'] == "COINM"){
                    response = await exchange.dapiPrivateGetAccount();
                }

                if(args['accountType'] == "USDTM"){
                    response = await exchange.fapiPrivateV2GetAccount();
                }

                if(args['accountType'] == "SPOT"){
                    response = await exchange.fetchBalance();
                    response = _.find(response.info.balances, function(balanceOf) {
                        if (balanceOf.asset == (args['asset']).toUpperCase()) {
                            return balanceOf;
                        }
                    });
                    result['availableBalance'] = Number(response.free);
                    response = Number(response.free) >= Number(args['recievedAmount']);
                } else {
                    
                    if(args['leverage']){
                        let leverage = _.find(response.positions, function(token) {
                            if (token.symbol == (args['asset']).toUpperCase() + "USDT") {
                                return token;
                            }
                        });
                        result['leverage'] = Number(leverage.leverage);
                    }

                    response = _.find(response.assets, function(balanceOf) {
                        if (balanceOf.asset == (args['asset']).toUpperCase()) {
                            return balanceOf;
                        }
                    });
                    result['availableBalance'] = Number(response.availableBalance);


                }
                
                result['result'] = response;
                await swapProviderController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                    await swapProviderController.testsCheck(args['spId']);
                    res.status(200).json(result);
                });

            }

            if(args['type'] == 'binanceTransferCheck'){
                let spot_to_future = false;
                let spotToFutureTrasferId = null;
                let future_to_spot = false;
                let futureToSpotTrasferId = null;
                if(args['transferType'] == 5){
                    response = await exchange.sapi_post_futures_transfer({
                        'asset': args['asset'],
                        'type': 1,
                        'amount': args['amount']
                    });
    
                    if(response.hasOwnProperty('tranId')){
                        spot_to_future = true;
                        spotToFutureTrasferId = response.tranId;
                    }

                    response = await exchange.sapi_post_futures_transfer({
                        'asset': args['asset'],
                        'type': 2,
                        'amount': args['amount']
                    });

                    if(response.hasOwnProperty('tranId')){
                        future_to_spot = true;
                        futureToSpotTrasferId = response.tranId;
                    }

                    result = spot_to_future && future_to_spot;
                    await swapProviderController.updateTest(args['spId'], args['type'], result).then(async() => {
                        await swapProviderController.testsCheck(args['spId']);
                        res.status(200).json({
                            result: result,
                            spotToFutureTrasferId: spotToFutureTrasferId,
                            futureToSpotTrasferId: futureToSpotTrasferId
                        }); 
                    });

                } else {
                    response = await exchange.sapi_post_futures_transfer({
                        'asset': args['asset'],
                        'type': args['transferType'],
                        'amount': args['amount']
                    });
    
                    if(response.hasOwnProperty('tranId')){
                        res.status(200).json({
                            result: true,
                            response: response.tranId
                        });
                    } else {
                        res.status(200).json({
                            result: false,
                            response: response
                        });                    
                    }
                }
            }

            if(args['type'] == 'binanceWithdrawCheck'){
                result['withdrawOrderId'] = null;
                response = await exchange.withdraw(
                    args['asset'],
                    args['amount'],
                    args['address'],
                    undefined, // address tag
                    {
                        'network': args['network']
                    }
                );
                
                result['result'] = response.hasOwnProperty('id') ? true : false;
                if(result['result']){
                    result['withdrawOrderId'] = response.id;
                }

                await swapProviderController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                    await swapProviderController.updateTest(args['spId'], 'binanceWithdrawEnabledCheck', result['result']);
                    await swapProviderController.updateTest(args['spId'], 'binanceSpAddressWhiteListCheck', result['result']);
                    await swapProviderController.updateTest(args['spId'], 'binanceIpWhiteListCheck', result['result']); 
                    await swapProviderController.testsCheck(args['spId']);                                      
                    res.status(200).json(result);
                });
            }

        } catch (e) {
            await swapProviderController.testsCheck(args['spId']);
            res.status(200).json({
                result: false,
                message: e.message
            });              
        }
    },

    testSuite: async(req: Request, res: Response) => {

        let contractAddress,
            contractInstance,
            response,
            result,
            type,
            validTestsTypes,
            testsOnContract,
            errorMessage,
            testOnBinance,
            validAccountTypes,
            defaultAsset,
            defaultLeverage,
            validTransferTypes,
            transferTypesMap,
            defaultAmount,
            defaultwithdrawalNetwork,
            withdrawalNetworks,
            validAssetsToWithdraw,
            repeatTests;

        validTestsTypes = [
            "contractOwnerCheck",
            "contractGasAndFeeCheck",
            "spProfitPercentCheck",
            "binanceApiKeysCheck",
            "binanceApiValidateCheck",
            "binanceAccountCheck",
            "binanceBalanceCheck",
            "binanceTransferCheck",
            "binanceWithdrawCheck",
            "binanceIpWhiteListCheck",
            "binanceSpAddressWhiteListCheck",
            "binanceWithdrawEnabledCheck",
            "testsCheck"
        ];

        testOnBinance = [
            "binanceApiValidateCheck",
            "binanceAccountCheck",
            "binanceBalanceCheck",
            "binanceTransferCheck",
            "binanceWithdrawCheck",
            "binanceIpWhiteListCheck",
            "binanceSpAddressWhiteListCheck",
            "binanceWithdrawEnabledCheck"
        ];

        testsOnContract = [
            "contractOwnerCheck",
            "contractGasAndFeeCheck"            
        ];

        validAccountTypes = [
            "SPOT",
            "USDTM",
            "COINM",
            "SPOT_USDTM"
        ];

        transferTypesMap = {
            "SPOT_TO_USDTM": 1,
            "USDTM_TO_SPOT": 2,
            "SPOT_TO_COINM": 3,
            "COINM_TO_SPOT": 4,
            "TWO_WAY": 5    
        };

        validTransferTypes = [
            "SPOT_TO_USDTM",
            "USDTM_TO_SPOT",
            "SPOT_TO_COINM",
            "COINM_TO_SPOT",
            "TWO_WAY"
        ];

        validAssetsToWithdraw = [
            "BNB", "ETH", "MATIC"
        ];

        withdrawalNetworks = {
            "BNB": "BSC",
            "ETH": "ETH",
            "MATIC": "MATIC"
        };

        try {
            const {
                owner,
                networkId,
                smartContractAddress,
                type,
                accountType, // COINM, USDTM, SPOT,
                asset,
                leverage,
                transferType,
                amount,
                repeatTests
            } = req.body;

            if(type == "" || type == null || type == undefined){
                res.status(400).json({
                    message: "a mandatory field type is required."
                });
            }

            if(!validTestsTypes.includes(type)){
                res.status(400).json({
                    message: "Invalid test type"
                });                
            }

            let filters = {
                'walletAddresses.spAccount' : (owner).toLowerCase(),
                'networkId': networkId,
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                }
            }

            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(networkId) });

            // exact match with sp contact address
            if(smartContractAddress !== null && smartContractAddress !== undefined){
                filters['smartContractAddress'] = (smartContractAddress).toLowerCase();
            }

            if(testOnBinance.includes(type)){
                filters['cexData.key'] = {
                    $exists: true, 
                    $ne: null                    
                };

                filters['cexData.secret'] = {
                    $exists: true, 
                    $ne: null                    
                };

                if(type == "binanceAccountCheck"){
                    if(accountType == "" || accountType == null || accountType == undefined){
                        res.status(400).json({
                            message: "a mandatory field accountType is required."
                        });
                    }

                    if(!validAccountTypes.includes((accountType).toUpperCase())){
                        res.status(400).json({
                            message: "Invalid account type"
                        });                
                    }
                }

                if(type == "binanceBalanceCheck"){
                    if(accountType == "SPOT"){
                        defaultAsset = "USDT";
                    }
                    if(accountType == "USDTM"){
                        defaultAsset = "USDT";
                    }
                    if(accountType == "COINM"){
                        defaultAsset = networkConfig['ASSET'];
                    }
                    if(accountType == "SPOT_USDTM"){
                        defaultAsset = "USDT";
                    }


                    defaultAsset = (asset == null || asset == undefined) ? defaultAsset : asset;

                    if(accountType == "USDTM" || accountType == "COINM"){
                        defaultLeverage = (leverage == undefined || leverage == null) ? false : (leverage).toLowerCase();
                        if(defaultLeverage == "true" || defaultLeverage == 1){
                            defaultLeverage = true;
                        }
                        if(defaultLeverage == "false" || defaultLeverage == 0){
                            defaultLeverage = false;
                        }
                        let isBool = (typeof defaultLeverage == "boolean");
                        if(!isBool){
                            res.status(400).json({
                                message: `leverage should be a boolean value, ${typeof defaultLeverage} given`
                            }); 
                        }
                    }

                }

                if(type == "binanceTransferCheck"){
                    if(transferType == "" || transferType == null || transferType == undefined){
                        res.status(400).json({
                            message: "a mandatory field transferType is required."
                        });
                    }
                    
                    if(!validTransferTypes.includes((transferType).toUpperCase())){
                        res.status(400).json({
                            message: "Invalid transfer type"
                        });                
                    }
                    if(transferType == "SPOT_TO_USDTM" || transferType == "USDTM_TO_SPOT"){
                        defaultAsset = (asset == null || asset == undefined) ? "USDT" : asset;
                    }
                    if(transferType == "SPOT_TO_COINM" || transferType == "COINM_TO_SPOT"){
                        defaultAsset = (asset == null || asset == undefined) ? networkConfig['ASSET'] : asset;
                    }

                    if(transferType == "TWO_WAY"){
                        defaultAsset = (asset == null || asset == undefined) ? "USDT" : asset;
                    }
                    defaultAmount = (amount == null || amount == undefined) ? networkConfig['MIN_AMOUNT_TO_TEST_TRANSFER'] : Number(amount).toFixed(8);
                }

            }
            
            const sp = await SwapProvider.findOne(filters).sort({
                createdAt: -1 // latest to oldest
            });
            
            
            if(sp !== null){

                const spTests = await SwapProviderTest.findOne({
                    "swapProvider": sp._id
                }).select([
                    "-createdAt", 
                    "-updatedAt", 
                    "-__v",
                    "-swapProvider",
                    "-binanceBalanceCheck"
                ]).lean()
                .exec();

                if(spTests == null){
                    errorMessage = "Swap provider tests does not exist."
                    res.status(404).json({
                        result: false,
                        message: errorMessage
                    });
                }

                if(type == "testsCheck"){
                    if(repeatTests == true){
                        await SwapProviderTest.updateOne({
                            "swapProvider": sp._id
                        }, {
                            'contractOwnerCheck': false,
                            'contractGasAndFeeCheck': false,
                            'spProfitPercentCheck': false,
                            'binanceApiKeysCheck': false,
                            'binanceApiValidateCheck': false,
                            'binanceAccountCheck': false,
                            'binanceBalanceCheck': false,
                            'binanceTransferCheck': false,
                            'binanceWithdrawCheck': false,
                            'binanceIpWhiteListCheck': false,
                            'binanceSpAddressWhiteListCheck': false,
                            'binanceWithdrawEnabledCheck': false
                        });
                    }

                    result = await swapProviderController.testsCheck(sp._id);
                    res.status(200).json({
                        result: result,
                        response: spTests
                    });               
                }


                if(testsOnContract.includes(type)){
                    contractAddress = sp.smartContractAddress;
                    contractInstance = swapProviderController.contractInstance(contractAddress, networkId);
                }

                if(type == "contractOwnerCheck"){
                    response = await contractInstance.methods.owner().call();
                    result = (owner).toLowerCase() == (response).toLowerCase() ? true : false;
                    await swapProviderController.updateTest(sp._id, 'contractOwnerCheck', result).then(async() => {
                        await swapProviderController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type
                        });
                    });
                }

                if(type == "contractGasAndFeeCheck"){
                    response = await contractInstance.methods.getFeeAmountLimit().call();
                    result = response == sp.gasAndFeeAmount ? true : false;
                    if(result == false){
                        await SwapProvider.updateOne({
                            _id: sp._id
                        }, {
                            gasAndFeeAmount: (response).toString()
                        });
                        result = true;
                    }
                    let message = result == true ? "Equal" : "Different";
                    await swapProviderController.updateTest(sp._id, 'contractGasAndFeeCheck', result).then(async() => {
                        await swapProviderController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type,
                            message: message,
                            value: response
                        });
                    });
                }
                
                if(type == "spProfitPercentCheck"){
                    result = ('spProfitPercent' in sp) && Number(sp.spProfitPercent) >= 0 && Number(sp.spProfitPercent) <= 1 ? true : false;
                    await swapProviderController.updateTest(sp._id, 'spProfitPercentCheck', result).then(async() => {
                        await swapProviderController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type
                        });
                    });                    
                }

                if(type == "binanceApiKeysCheck"){
                    let keyCheck = (sp?.cexData?.key) && (sp.cexData.key != null);
                    let secretCheck = (sp?.cexData?.secret) && (sp.cexData.secret != null);
                    result = keyCheck == true && secretCheck == true ? true : false;
                    await swapProviderController.updateTest(sp._id, 'binanceApiKeysCheck', result).then(async() => {
                        await swapProviderController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type,
                            key: keyCheck,
                            secret: secretCheck
                        });
                    });  
                }

                if(type == "binanceApiValidateCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'spId': sp._id
                    });
                }

                if(type == "binanceAccountCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        'spId': sp._id
                    });
                }

                if(type == "binanceBalanceCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        'asset': defaultAsset,
                        'recievedAmount': Number(sp.totalAmount),
                        'leverage': leverage,
                        'spId': sp._id
                    });                    
                }


                if(type == "binanceTransferCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'transferType': transferTypesMap[transferType],
                        'asset': defaultAsset,
                        'amount': Number(defaultAmount),
                        'spId': sp._id
                    });
                }

                if(type == "binanceWithdrawCheck" || type == "binanceIpWhiteListCheck" || type == "binanceSpAddressWhiteListCheck" || type == "binanceWithdrawEnabledCheck"){
                    if(spTests.binanceWithdrawCheck == true){  
                        await swapProviderController.updateTest(sp._id, 'binanceWithdrawEnabledCheck', true);
                        await swapProviderController.updateTest(sp._id, 'binanceSpAddressWhiteListCheck', true);
                        await swapProviderController.updateTest(sp._id, 'binanceIpWhiteListCheck', true);
                        await swapProviderController.testsCheck(sp._id);
                        res.status(200).json({
                            result: true,
                            type: type
                        });             
                    } else {
                        // if(asset == null || asset == undefined){
                        //     res.status(400).json({
                        //         message: "asset parameter is mandatory."
                        //     });                        
                        // } 
                        // if(amount == null || amount == undefined){
                        //     res.status(400).json({
                        //         message: "amount parameter is mandatory."
                        //     });                        
                        // }
                        // if(!validAssetsToWithdraw.includes((asset).toUpperCase())){
                        //     res.status(400).json({
                        //         message: "asset not allowed to withdraw, Or invalid asset"
                        //     });
                        // }
                        defaultAsset = networkConfig['ASSET'];
                        defaultwithdrawalNetwork = withdrawalNetworks[defaultAsset];
                        defaultAmount = networkConfig['MIN_WITHDRAW_AMOUNT'];

                        await swapProviderController.updateTest(sp._id, 'binanceWithdrawEnabledCheck', false);
                        await swapProviderController.updateTest(sp._id, 'binanceSpAddressWhiteListCheck', false);
                        await swapProviderController.updateTest(sp._id, 'binanceIpWhiteListCheck', false);
                        await swapProviderController.binanceTests(req, res, {
                            'apiKey': sp.cexData.key,
                            'secret': sp.cexData.secret,
                            'type': 'binanceWithdrawCheck',
                            'address': sp.smartContractAddress,
                            'asset': defaultAsset,
                            'amount': Number(defaultAmount),
                            'network': defaultwithdrawalNetwork,
                            'spId': sp._id
                        });
                    }
                }
        

            } else {
                errorMessage = "Swap provider does not exist."
                res.status(404).json({
                    result: false,
                    message: errorMessage,
                    type: type,
                    //filters: filters
                });
            }
        } catch(err){
            errorMessage = `Error From ${type}:` + err.constructor.name + ", " + err.message + ", " + ' at:' + new Date().toJSON()
            res.status(500).json({
                message: errorMessage
            });
        }
    },

    contractInstance: function(contractAddress, networkId) {
        try {
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(networkId) });
            const provider = networkConfig['PROVIDER'];
            const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
            return new web3.eth.Contract(spContractAbi as AbiItem[], contractAddress);    
        } catch(err){
            print.info(`❌ Error From contractInstance:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
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

                print.info({
                    pendingDistributionRecord: pendingDistributionRecord._id
                });

                const exchangeinstance = new ccxt.binance ({
                    'apiKey': pendingDistributionRecord.cexData.key,
                    'secret': pendingDistributionRecord.cexData.secret,
                    'enableRateLimit': true,
                });                
                exchangeinstance.set_sandbox_mode(ccxtSandBox);
                
                if(pendingDistributionRecord['distributionStatus'] == "PENDING" || pendingDistributionRecord['withdrawReinitiate'] == true){

                    print.info("inside distributionStatus and withdrawReinitiate check");

                    await SwapProvider.updateOne({
                        _id: pendingDistributionRecord._id
                    }, {
                        distributionStatus: 'PROCESSED',
                        withdrawReinitiate: false
                    }).then(async(res) => {
                        // make new spot order
                        await swapProviderController.newSpotOrderHandler(pendingDistributionRecord, exchangeinstance);
                    }).catch(err => print.info(`❌ Error From amountDistributionHandler: update SwapProvider status PROCESSED, `, err.constructor.name, err.message, ' at:' + new Date().toJSON()))
                }

                if(pendingDistributionRecord['distributionStatus'] == "PROCESSED"){
                    let distributionOrder = await Order.findOne({
                        "status": "PENDING",
                        "type": 'distribution',
                        "swapProvider": pendingDistributionRecord._id
                    }).lean().exec();
                    if(
                        distributionOrder.spot.status == "CANCELLED" 
                        || distributionOrder.spot.status == "REJECTED"
                        || distributionOrder.spot.status == "EXPIRED"
                    ){
                        print.info(distributionOrder.spot.status);
                        print.info(distributionOrder);
                        await swapProviderController.newSpotOrderHandler(pendingDistributionRecord, exchangeinstance, distributionOrder);
                    } else {
                        // check status of distributionOrder
                        if(distributionOrder.spot.status == "FILLED"){
                            // create withdraw order
                            await swapProviderController.withdrawHandler(pendingDistributionRecord, distributionOrder, exchangeinstance);
                        } else {
                            // query order status
                            await swapProviderController.querySpotOrderHandler(pendingDistributionRecord, distributionOrder, exchangeinstance);
                        }
                    }
                }

            } else {
                print.info('❌ No new active swap provider found whose distribution is pending yet.');
            }
        } catch(err){
            print.info(`❌ Error From distributeAmount:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }        
    },

    updateTest : async(spId, field, value) => {

        let fieldToUpdate = {};

        if (field == 'contractOwnerCheck'){
            Object.assign(fieldToUpdate, {
                contractOwnerCheck: value
            });
        }

        if (field == 'contractGasAndFeeCheck'){
            Object.assign(fieldToUpdate, {
                contractGasAndFeeCheck: value
            });
        }

        if (field == 'spProfitPercentCheck'){
            Object.assign(fieldToUpdate, {
                spProfitPercentCheck: value
            });
        }

        if (field == 'binanceApiKeysCheck'){
            Object.assign(fieldToUpdate, {
                binanceApiKeysCheck: value
            });
        }

        if (field == 'binanceApiValidateCheck'){
            Object.assign(fieldToUpdate, {
                binanceApiValidateCheck: value
            });
        }

        if (field == 'binanceAccountCheck'){
            Object.assign(fieldToUpdate, {
                binanceAccountCheck: value
            });
        }

        if (field == 'binanceBalanceCheck'){
            Object.assign(fieldToUpdate, {
                binanceBalanceCheck: value
            });
        }

        if (field == 'binanceTransferCheck'){
            Object.assign(fieldToUpdate, {
                binanceTransferCheck: value
            });
        }

        if (field == 'binanceWithdrawCheck'){
            Object.assign(fieldToUpdate, {
                binanceWithdrawCheck: value
            });
        }

        if (field == 'binanceIpWhiteListCheck'){
            Object.assign(fieldToUpdate, {
                binanceIpWhiteListCheck: value
            });
        }

        if (field == 'binanceSpAddressWhiteListCheck'){
            Object.assign(fieldToUpdate, {
                binanceSpAddressWhiteListCheck: value
            });
        }

        if (field == 'binanceWithdrawEnabledCheck'){
            Object.assign(fieldToUpdate, {
                binanceWithdrawEnabledCheck: value
            });
        }

        await SwapProviderTest.updateOne({
            "swapProvider": spId
        }, fieldToUpdate);
    },

    testsCheck: async(spId, repeat = false) => {
        
        const spTests = await SwapProviderTest.findOne({
            "swapProvider": spId
        }).select([
            "-createdAt", 
            "-updatedAt", 
            "-__v",
            "-swapProvider",
            "-binanceBalanceCheck"
        ]).lean()
        .exec();

        if(spTests !== null){
            let testsPassed = true;
            for (let [key, value] of Object.entries(spTests)) {
                if (key == '_id' || key == 'id') {
                    continue;
                } else {
                    if(value == false){
                        testsPassed = false;
                        break;
                    }
                }
            }
    
            await SwapProvider.updateOne({
                _id: spId
            }, {
                active: testsPassed
            });
    
            return testsPassed;
        }
    },

    withdrawHandler: async(swapProvider, order, exchangeinstance) => {
        print.info('👉 Handle withdraw');
        try {
            let response = null;
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(swapProvider.networkId) });
            let asset = networkConfig['ASSET'];
            let network = networkConfig['NETWORK'];
            let amount = Number(order.spot.executedQty);
            let address = swapProvider.smartContractAddress;
            if(order.withdraw.status == "PENDING"){
                // create withdraw
                if(!ccxtSandBox){
                    try {
                        response = await exchangeinstance.withdraw(
                            asset,
                            amount,
                            address,
                            undefined, // address tag
                            {
                                'network': network
                            }
                        ); 
                    } catch (err) {
                        print.info('❌ Error from withdrawHandler exchangeinstance.withdraw: ' + err.message);
                        await swapProviderController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message); 
                    }
                } else {
                    response = {
                        id: 'abvasd'
                    }
                }
                
                if(response !== null && response.hasOwnProperty('id')){
                    // save withdraw order
                    let args = {
                        refId: response.id,
                        asset: asset,
                        amount: (amount).toString(),
                        status: 'COMPLETED',
                        failedTry: 0,
                        message: ''
                    };
    
                    await Order.updateOne({
                        _id: order._id
                    }, {
                        'withdraw': args,
                    }).then(async(res) => {
    
                    }).catch(err => print.info('❌ Error from withdrawHandler: Order.updateOne with withdraw order data., ' + err.message));
                }
    
            } else if(order.withdraw.status == "PROCESSED"){
                // query withdraw status
    
            } else if(order.withdraw.status == "COMPLETED"){
                // mark distribution done on swap provider
                const web3 = new web3Js(new web3Js.providers.HttpProvider(networkConfig['PROVIDER']));
                const address = swapProvider.smartContractAddress;
                let ticker = await exchangeinstance.fetchTicker(`${asset}/USDT`);
                let price = ticker.last;
    
                let spBal =  await web3.eth.getBalance(address, function (error, result) {
                    return result
                });
                let spContractBal = web3Js.utils.fromWei((spBal).toString(), 'ether');
                
                let newTotalWithdrawnAmount;
                if(ccxtSandBox == false){
                    newTotalWithdrawnAmount = Number(spContractBal) * Number(price);                
                } else {
                    newTotalWithdrawnAmount = Number(swapProvider.totalWithdrawnAmount);
                }

                newTotalWithdrawnAmount = Number(Number(newTotalWithdrawnAmount) + Number(Number(order.spot.executedQty) * Number(order.spot.price)));
                let recievedAmount = Number(swapProvider.totalAmount) - Number(newTotalWithdrawnAmount);
                if(recievedAmount < 0){
                    recievedAmount = 0;
                }

                let argsToUpdate = {
                    "withdrawReinitiate": false,
                    "distributionStatus": 'COMPLETED',
                    "tokenA.recievedAmount": recievedAmount,
                    "totalWithdrawnAmount": newTotalWithdrawnAmount,
                    "message": ""
                }

                await SwapProvider.updateOne({
                    _id: swapProvider._id
                }, argsToUpdate).then(async(res) => {
                    print.info(`swapProvider ${swapProvider._id} amount distribution completed.`)

                    await Order.updateOne({
                        _id: order._id
                    }, {
                        'status': 'COMPLETED'
                    }).then(async(res) => {
    
                    }).catch(err => print.info('❌ Error from withdrawHandler: Order.updateOne with order status completed., ' + err.message));
                    

                }).catch(err => print.info('❌ Error from withdrawHandler: swapProvider.updateOne with distributed flag true., ' + err.message));
            } else {
                // failed handler
            }
        } catch (err){
            print.info(`❌ Error From withdrawHandler:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
            await swapProviderController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message);
        }
    },

    newSpotOrderHandler: async(swapProvider, exchangeInstace, existingOrder = null) => {
        try {
            let spBal, spContractBal;
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(swapProvider.networkId) });
            const web3 = new web3Js(new web3Js.providers.HttpProvider(networkConfig['PROVIDER']));
            const address = swapProvider.smartContractAddress;
            const asset = networkConfig['ASSET'];

            let totalAmount = Number(swapProvider.totalAmount);
            let withdrawPercent =  Number(swapProvider.withdrawPercent);
            let usdtAmountToBuyToken = (Number(totalAmount) * Number(withdrawPercent)) / 100;
            let totalWithdrawnAmount = Number(swapProvider.totalWithdrawnAmount);
            let ticker = await exchangeInstace.fetchTicker(`${asset}/USDT`);
            let price = ticker.last;

            spBal =  await web3.eth.getBalance(address, function (error, result) {
                return result
            });
            spContractBal = web3Js.utils.fromWei((spBal).toString(), 'ether');

            if(ccxtSandBox == false){
                totalWithdrawnAmount = Number(spContractBal) * Number(price);
            }
            
            print.info({
                totalAmount: totalAmount,
                withdrawPercent: withdrawPercent,
                usdtAmountToBuyToken: usdtAmountToBuyToken,
                totalWithdrawnAmount: totalWithdrawnAmount,
                spContractBal: spContractBal,
                price: price,
                ticker: ticker
            });

            // less then $1 floating point difference is ignored
            if(usdtAmountToBuyToken > totalWithdrawnAmount){
                let diff = usdtAmountToBuyToken - totalWithdrawnAmount;
                if(diff < 1){
                    totalWithdrawnAmount = usdtAmountToBuyToken
                }
            }

            if(usdtAmountToBuyToken > totalWithdrawnAmount){
                usdtAmountToBuyToken = usdtAmountToBuyToken - totalWithdrawnAmount;

                if(usdtAmountToBuyToken < 50){
                    await SwapProvider.updateOne({
                        _id: swapProvider._id
                    }, {
                        distributionStatus: "FAILED",
                        withdrawReinitiate: false,
                        message: "Withdraw amount less then $50"
                    }).then(async(res) => {
                        print.info(`swapProvider ${swapProvider._id}, Withdraw amount less then $50.`);
                    }).catch(err => print.info('❌ Error from newSpotOrderHandler: swapProvider.updateOne with withdrawReinitiate flag false., ' + err.message));                    
                } else {
                    let amount = Number(usdtAmountToBuyToken) / Number(price);
        
                    let response = await exchangeInstace.createOrder(`${asset}/USDT`, 'MARKET', 'buy', amount);
                    print.info(response);
        
                    if(response !== null && response.hasOwnProperty('id')){
                        // save order
                        let args = {
                            'swapProvider': swapProvider._id,
                            'type': 'distribution',
                            'spot': {
                                'asset': response.symbol,
                                'type': response.type,
                                'side': response.side,
                                'orderId': response.id,
                                'price': response.price,
                                'origQty': response.info.origQty,
                                'executedQty': response.info.executedQty,
                                'cummulativeQuoteQty': response.info.executedQty,
                                'status': response.info.status,
                                'cancelledOrderIds': []
                            }
                        };
        
                        try {
                            if(existingOrder == null){
                                await new Order(args).save();
                            } else {
                                let cancelledOrderIdsArray = [];
                                for(let i=0; i<existingOrder.spot.cancelledOrderIds.length; i++){
                                    cancelledOrderIdsArray.push(existingOrder.spot.cancelledOrderIds[i]);
                                }
                                cancelledOrderIdsArray.push(existingOrder.spot.orderId);
                                args.spot['cancelledOrderIds'] = cancelledOrderIdsArray;
                                try {
                                    await Order.updateOne({
                                        _id: existingOrder._id,
                                    }, {
                                        'spot': args.spot
                                    });
                                } catch(err){
                                    print.info(`❌ Error From newSpotOrderHandler updateOne:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
                                    await swapProviderController.errorHandler('newSpotOrderHandler', swapProvider._id, existingOrder._id, err.message);
                                }
                            }
                        } catch(err){
                            print.info(`❌ Error From saveOrder:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
                            await swapProviderController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);
                        }
                    }
                }

            } else {
                // turn off withdrawReinitiate because amount is less
                let recievedAmount = Number(swapProvider.totalAmount) - Number(usdtAmountToBuyToken);
                if(recievedAmount < 0){
                    recievedAmount = 0;
                }

                await SwapProvider.updateOne({
                    _id: swapProvider._id
                }, {
                    distributionStatus: "COMPLETED",
                    withdrawReinitiate: false,
                    'tokenA.recievedAmount': recievedAmount,
                    message: ""
                }).then(async(res) => {
                    print.info(`swapProvider ${swapProvider._id} withdraw reinitiate completed.`)
                }).catch(err => print.info('❌ Error from newSpotOrderHandler: swapProvider.updateOne with withdrawReinitiate flag false., ' + err.message));

                

            }



        } catch(err){
            print.info(`❌ Error From newSpotOrderHandler:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
            await swapProviderController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);            
        }         
    },

    querySpotOrderHandler: async(swapProvider, order, exchangeinstance) => {
        try {
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(swapProvider.networkId) });
            const asset = networkConfig['ASSET'];
            let response = await exchangeinstance.fetchOrder(order.spot.orderId, `${asset}/USDT`);
            if(response !== null && response.hasOwnProperty('id')){
                if(response.info.status == "FILLED"){
                    await Order.updateOne({
                        _id: order._id
                    }, {
                        'spot.status': response.info.status
                    }).then(async(res) => {
                        // handle withdraw
                        await swapProviderController.withdrawHandler(swapProvider, order, exchangeinstance);
                    }).catch(err => print.info('❌ Error from Order.updateOne with status FILLED, ' + err.message));
                    
                } else {
                    await Order.updateOne({
                        _id: order._id
                    }, {
                        'spot.status': response.info.status
                    }).then(async(res) => {
                    }).catch(err => print.info(`❌ Error from Order.updateOne with status ${response.info.status}, ` + err.message));
                }
            }
        } catch(err){
            print.info(`❌ Error From querySpotOrderHandler:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
            await swapProviderController.errorHandler('querySpotOrderHandler', swapProvider._id, order._id, err.message);
        }
    },

    errorHandler: async(from, swapProviderId, orderId, message) => {
        if(swapProviderId !== null){
            await SwapProvider.updateOne({
                _id: swapProviderId
            }, {
                distributionStatus: 'FAILED',
                message: message
            }).then(async(res) => {
            }).catch(err => print.info(`❌ Error from ${from} swapProvider.updateOne with distributed flag FAILED`)); 
        }

        if(orderId !== null){
            await Order.updateOne({
                _id: orderId
            }, {
                'message': message
            }).then(async(res) => {    
            }).catch(err => print.info(`❌ Error from ${from} Order.updateOne with error message`));
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
                let contractInstance = swapProviderController.contractInstance(address, swapProvider.networkId);
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