import { Request, Response } from "express";
import { log, constants } from "../../../config";
import { v4 as uuidv4 } from 'uuid';
import { Transaction as Tx } from '@ethereumjs/tx'
import SwapProvider, {ISwapProvider} from '../models/SwapProvider';

import web3Js from 'web3';
import { ethers } from 'ethers';

import swapFactoryAbi from "../../../abis/swapFactory.json";
import spContractAbi from "../../../abis/spContract.json";
import { AbiItem } from 'web3-utils';
import _ from "lodash";
const ccxt = require ('ccxt');

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
                txid, smartContractAddress, swapSpeedMode      
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

                if(tokenB !== constants.NETWORKS.BSC.ADDRESS){
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

                if(tokenB !== constants.NETWORKS.ETH.ADDRESS){
                    return res.status(422).json({ 
                        errorMessage: {
                            error: "Invalid token B selected" 
                        }                 
                    });                    
                }                
            }


            let allowedNetworks = [Number(constants.NETWORKS.ETH.NETWORK_ID), Number(constants.NETWORKS.BSC.NETWORK_ID)];
            if(!allowedNetworks.includes(Number(networkId))){
                return res.status(422).json({ 
                    errorMessage: {
                        error: "Provided network is not allowed to deploy contract." 
                    }
                });                
            }

            // SP exist?
            const isSwapProviderExists: ISwapProvider = await SwapProvider.findOne({
                'walletAddresses.spAccount' : spAccount,
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
                    spAccount
                },
                totalAmount: amountA,
                tokenA: {
                    address: tokenA,
                    recievedAmount: (Number(amountA) * 55 / 100)
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
                    'tokenA.recievedAmount': request['amountA']
                });
            }

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

            if(('cexApiKey' in request)  && ('cexApiSecret' in request)){
                let apiCheck = await swapProviderController.binanceApiCheck(request['cexApiKey'], request['cexApiSecret']);
                
                if(apiCheck == false){
                    return res.status(422).json({
                        "Message": "Invalid API Keys"
                    });                    
                }

                Object.assign(filter, {
                    'active': true
                });

            }


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
                }

                if(request['stopRepeatsMode'] == 2){
                    Object.assign(filter, {
                        'stopRepeats.afterCalls': request['stopRepeatsAfterCalls']
                    });                    
                }

            }

            if ('active' in request){
                Object.assign(filter, {
                    active: request['active']
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
        //try {
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


            console.log("updaing event:", event);

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

        // }  catch (err) {
        //     err['errorOrigin'] = "updateTransactionHash";
        //     return res.status(500).json({ message: err });
        // }
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

        const network = Number(args.networkId) === Number(constants.NETWORKS.ETH.NETWORK_ID) ? constants.NETWORKS.ETH : constants.NETWORKS.BSC;
        const provider = network.PROVIDER;
        const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
        const address = network.SMARTSWAP_ADDRESS;
        const SWAP_INSTANCE = new web3.eth.Contract(swapFactoryAbi as AbiItem[], address);

        return await SWAP_INSTANCE.getPastEvents('AddSwapProvider', {
            //filter: {swapProvider: "0xfcbdf7e5ef8ba15fb9a5d2464cf4af7d35fd6987"},
            fromBlock: Number(args.blockNumber),
            toBlock: Number(args.blockNumber)
        }).then(async(events) => {
            let matchedEvent; 
            console.log("matchedEvent", events) // same results as the optional callback above
            for (let i = 0; i < events.length; i++) {
                if(events[i]['transactionHash'] == args.txhash){
                    console.log("matched event:", events[i]);
                    matchedEvent = events[i];
                    break;
                }
            }

            return matchedEvent;

        }).catch((err) => console.error(err));
    },

    getActiveContracts: async(req: Request, res: Response) => {
        const {
            spAccount
        } = req.body;

        try{
            const activeContracts = await SwapProvider.find({
                'walletAddresses.spAccount' : spAccount,
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                }
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
            console.log (e.constructor.name, e.message);
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
                    res.status(200).json({
                        result: true
                    });                
                } else {
                    res.status(200).json({
                        result: false
                    });                
                }
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
                
                result['canDeposit'] = response.canDeposit;
                result['canTrade'] = response.canTrade;
                result['canWithdraw'] = response.canWithdraw;
                result['result'] = (response.canTrade && response.canDeposit && response.canWithdraw);
                res.status(200).json(result);
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
                res.status(200).json(result);
            }

            if(args['type'] == 'binanceTransferCheck'){
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

            if(args['type'] == 'binanceWithdrawCheck'){
                // response = await exchange.sapiGetAssetAssetDetail({
                //     asset: args['asset']
                // });
                // let minWithdrawAmount = response[args['asset']]['minWithdrawAmount'];
                // let withdrawFee = response[args['asset']]['withdrawFee'];

                //args['amount'] = Number(minWithdrawAmount) + Number(withdrawFee);

                response = await exchange.withdraw(
                    args['asset'],
                    args['amount'],
                    args['address'],
                    undefined, // address tag
                    {
                        'network': args['network']
                    }
                );

                if(response.hasOwnProperty('id')){
                    // mark canWithdraw true
                    let usp = await SwapProvider.updateOne({
                        _id: args['spId']
                    }, {
                        canWithdraw: true
                    });

                    if(usp.ok == 1){
                        res.status(200).json({
                            result: true,
                            response: response.id                                             
                        });
                    }

                } else {
                    res.status(200).json({
                        result: false,
                        response: response
                    });
                }
            }

        } catch (e) {
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
            validAssetsToWithdraw;

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
            "binanceWithdrawEnabledCheck"
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
            "COINM"
        ];

        transferTypesMap = {
            "SPOT_TO_USDTM": 1,
            "USDTM_TO_SPOT": 2,
            "SPOT_TO_COINM": 3,
            "COINM_TO_SPOT": 4            
        };

        validTransferTypes = [
            "SPOT_TO_USDTM",
            "USDTM_TO_SPOT",
            "SPOT_TO_COINM",
            "COINM_TO_SPOT"
        ];

        validAssetsToWithdraw = [
            "BNB", "ETH"
        ];

        withdrawalNetworks = {
            "BNB": "BSC",
            "ETH": "ETH" 
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
                amount
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
                'walletAddresses.spAccount' : owner,
                'networkId': networkId,
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                }
            }

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
                        defaultAsset = "BNB";
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
                    if(!validTransferTypes.includes((transferType).toUpperCase())){
                        res.status(400).json({
                            message: "Invalid transfer type"
                        });                
                    }
                    if(transferType == "SPOT_TO_USDTM" || transferType == "USDTM_TO_SPOT"){
                        defaultAsset = (asset == null || asset == undefined) ? "USDT" : asset;
                    }
                    if(transferType == "SPOT_TO_COINM" || transferType == "COINM_TO_SPOT"){
                        defaultAsset = (asset == null || asset == undefined) ? "BNB" : asset;
                    }
                    defaultAmount = (amount == null || amount == undefined) ? 0.00000001 : Number(amount).toFixed(8);
                }

            }
            
            const sp = await SwapProvider.findOne(filters).sort({
                createdAt: -1 // latest to oldest
            });
            
            if(sp !== null){                
                
                if(testsOnContract.includes(type)){
                    contractAddress = sp.smartContractAddress;
                    contractInstance = swapProviderController.contractInstance(contractAddress, networkId);
                }

                if(type == "contractOwnerCheck"){
                    response = await contractInstance.methods.owner().call();
                    result = (owner).toLowerCase() == (response).toLowerCase() ? true : false;
                    res.status(200).json({
                        result: result,
                        type: type
                    });
                }

                if(type == "contractGasAndFeeCheck"){
                    response = await contractInstance.methods.getFeeAmountLimit().call();
                    result = response == sp.gasAndFeeAmount ? true : false;
                    let message = result == true ? "Equal" : "Different";
    
                    res.status(200).json({
                        result: result,
                        type: type,
                        message: message,
                        value: response
                    });
                }
                
                if(type == "spProfitPercentCheck"){
                    if('spProfitPercent' in sp && Number(sp.spProfitPercent) >= 0 && Number(sp.spProfitPercent) <= 1){
                        res.status(200).json({
                            result: true
                        });
                    } else {
                        res.status(200).json({
                            result: false
                        });                    
                    }                                        
                }

                if(type == "binanceApiKeysCheck"){
                    let keyCheck = (sp?.cexData?.key) && (sp.cexData.key != null);
                    let secretCheck = (sp?.cexData?.secret) && (sp.cexData.secret != null);

                    result = keyCheck == true && secretCheck == true ? true : false;              

                    res.status(200).json({
                        result: result,
                        type: type,
                        key: keyCheck,
                        secret: secretCheck
                    });
                }

                if(type == "binanceApiValidateCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type
                    });
                }

                if(type == "binanceAccountCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        
                    });
                }

                if(type == "binanceBalanceCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        'asset': defaultAsset,
                        'recievedAmount': Number(sp.tokenA.recievedAmount),
                        'leverage': leverage
                    });                    
                }


                if(type == "binanceTransferCheck"){
                    await swapProviderController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'transferType': transferTypesMap[transferType],
                        'asset': defaultAsset,
                        'amount': Number(defaultAmount)
                    });
                }

                if(type == "binanceWithdrawCheck" || type == "binanceIpWhiteListCheck" || type == "binanceSpAddressWhiteListCheck" || type == "binanceWithdrawEnabledCheck"){
                    if(sp.canWithdraw == true){
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
                        defaultAsset = Number(sp.networkId) == Number(constants.NETWORKS.ETH.NETWORK_ID) ? 'ETH': 'BNB';
                        defaultwithdrawalNetwork = withdrawalNetworks[defaultAsset];
                        defaultAmount = 0.01;

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
            const network = Number(networkId) === Number(constants.NETWORKS.ETH.NETWORK_ID) ? constants.NETWORKS.ETH : constants.NETWORKS.BSC;
            const provider = network.PROVIDER;
            const web3 = new web3Js(new web3Js.providers.HttpProvider(provider));
            return new web3.eth.Contract(spContractAbi as AbiItem[], contractAddress);    
        } catch(err){
            console.log(`❌ Error From contractInstance:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }
    },
    
    distributeAmount: async (req: Request, res: Response) => {
        try{
            const pendingDistributionRecord = await SwapProvider.findOne({
                'smartContractAddress': {
                    $exists: true,
                    $ne: null
                },
                active: true,
                distributed: false
            }).exec();

            if(pendingDistributionRecord !== null){
                // if pending then get 45% amount and try to withdraw that to SP contract
                let usdtAmountToBuyToken = (Number(pendingDistributionRecord.tokenA.recievedAmount) * 45 / 100);
                let network = Number(pendingDistributionRecord.networkId) == Number(constants.NETWORKS.ETH.NETWORK_ID) ? 'ETH': 'BSC';
                let asset = Number(pendingDistributionRecord.networkId) == Number(constants.NETWORKS.ETH.NETWORK_ID) ? 'ETH' : 'BNB';
                let address = pendingDistributionRecord.smartContractAddress;

                // bal check if avail then buy then withdraw
                const exchange = new ccxt.binance ({
                    'apiKey': pendingDistributionRecord.cexData.key,
                    'secret': pendingDistributionRecord.cexData.secret,
                    'enableRateLimit': true,
                });

                let response = await exchange.createOrder(`${asset}/USDT`, 'MARKET', 'buy', undefined, usdtAmountToBuyToken);
        
                if(response.hasOwnProperty('info') && _.isEmpty(response.info)){
                    res.status(200).json({
                        result: true
                    });                
                    // withdraw 
                    response = await exchange.withdraw(
                        asset,
                        //qtyInAsset,
                        address,
                        undefined, // address tag
                        {
                            'network': network
                        }
                    );
    
                    if(response.hasOwnProperty('id')){
    
                        pendingDistributionRecord['distributed'] = true;
                        response = await pendingDistributionRecord.save();
    
                        res.status(200).json({
                            result: true,
                            response: response
                        });
                    } else {
                        res.status(200).json({
                            result: false,
                            response: response
                        });
                    }
                } else {
                    res.status(200).json({
                        result: false
                    });                
                }                

            } else {
                res.status(404).json({ errorMessage: {
                    error: `No new swap provider found whose distribution is pending yet.` 
                }});
            }
        } catch(err){
            console.log(`❌ Error From distributeAmount:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
        }        
    }
    
}

export default swapProviderController;