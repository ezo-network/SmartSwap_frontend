import { Request, Response } from "express";
import ccxt from 'ccxt';
import _ from "lodash";
import web3Js from 'web3';
import { log, constants } from "../../../config";
import SwapProvider from '../models/SwapProvider';
import SwapProviderTest from '../models/SwapProviderTest';
import Order from '../models/order';
import {Helper} from "../helpers/helper";

let print = log.createLogger('Logs', 'trace');
let ccxtSandBox = false;

const BinanceCexController = {
    binanceTests: async(req: Request, res: Response, args: Object) => {
        let response, result = {};
        try {


            const exchange = new ccxt.binance ({
                'apiKey': args['apiKey'],
                'secret': args['secret'],
                'enableRateLimit': true,
            });
            
            if(args['type'] == 'apiValidateCheck'){
                response = await exchange.createOrder('BNB/USDT', 'MARKET', 'buy', 1, undefined, {
                    test: true
                });
        
                if(response.hasOwnProperty('info') && _.isEmpty(response.info)){    
                    result = true;   
                } else {
                    result = false;
                }

                await BinanceCexController.updateTest(args['spId'], args['type'], result).then(async() => {
                    await BinanceCexController.updateTest(args['spId'], 'apiKeysCheck', result);
                    await BinanceCexController.testsCheck(args['spId']);
                    res.status(200).json({
                        result: result,
                        type: args['type']
                    });
                });

            }


            if(args['type'] == 'accountCheck'){
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

                    await BinanceCexController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                        await BinanceCexController.testsCheck(args['spId']);
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

            if(args['type'] == 'balanceCheck'){
                
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
                await BinanceCexController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                    await BinanceCexController.testsCheck(args['spId']);
                    res.status(200).json(result);
                });

            }

            if(args['type'] == 'transferCheck'){
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
                    await BinanceCexController.updateTest(args['spId'], args['type'], result).then(async() => {
                        await BinanceCexController.testsCheck(args['spId']);
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

            if(args['type'] == 'withdrawCheck'){
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

                await BinanceCexController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                    await BinanceCexController.updateTest(args['spId'], 'withdrawEnabledCheck', result['result']);
                    await BinanceCexController.updateTest(args['spId'], 'spAddressWhiteListCheck', result['result']);
                    await BinanceCexController.updateTest(args['spId'], 'ipWhiteListCheck', result['result']); 
                    await BinanceCexController.testsCheck(args['spId']);                                      
                    res.status(200).json(result);
                });
            }

        } catch (e) {
            await BinanceCexController.testsCheck(args['spId']);
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
            "apiKeysCheck",
            "apiValidateCheck",
            "accountCheck",
            "balanceCheck",
            "transferCheck",
            "withdrawCheck",
            "ipWhiteListCheck",
            "spAddressWhiteListCheck",
            "withdrawEnabledCheck",
            "testsCheck"
        ];

        testOnBinance = [
            "apiValidateCheck",
            "accountCheck",
            "balanceCheck",
            "transferCheck",
            "withdrawCheck",
            "ipWhiteListCheck",
            "spAddressWhiteListCheck",
            "withdrawEnabledCheck"
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

                if(type == "accountCheck"){
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

                if(type == "balanceCheck"){
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

                if(type == "transferCheck"){
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
                    "-balanceCheck"
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

                    result = await BinanceCexController.testsCheck(sp._id);
                    res.status(200).json({
                        result: result,
                        response: spTests
                    });               
                }


                if(testsOnContract.includes(type)){
                    contractAddress = sp.smartContractAddress;
                    contractInstance = Helper.contractInstance(contractAddress, networkId);
                }

                if(type == "contractOwnerCheck"){
                    response = await contractInstance.methods.owner().call();
                    result = (owner).toLowerCase() == (response).toLowerCase() ? true : false;
                    await BinanceCexController.updateTest(sp._id, 'contractOwnerCheck', result).then(async() => {
                        await BinanceCexController.testsCheck(sp._id);
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
                    await BinanceCexController.updateTest(sp._id, 'contractGasAndFeeCheck', result).then(async() => {
                        await BinanceCexController.testsCheck(sp._id);
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
                    await BinanceCexController.updateTest(sp._id, 'spProfitPercentCheck', result).then(async() => {
                        await BinanceCexController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type
                        });
                    });                    
                }

                if(type == "apiKeysCheck"){
                    let keyCheck = (sp?.cexData?.key) && (sp.cexData.key != null);
                    let secretCheck = (sp?.cexData?.secret) && (sp.cexData.secret != null);
                    result = keyCheck == true && secretCheck == true ? true : false;
                    await BinanceCexController.updateTest(sp._id, 'apiKeysCheck', result).then(async() => {
                        await BinanceCexController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type,
                            key: keyCheck,
                            secret: secretCheck
                        });
                    });  
                }

                if(type == "apiValidateCheck"){
                    await BinanceCexController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'spId': sp._id
                    });
                }

                if(type == "accountCheck"){
                    await BinanceCexController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        'spId': sp._id
                    });
                }

                if(type == "balanceCheck"){
                    await BinanceCexController.binanceTests(req, res, {
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


                if(type == "transferCheck"){
                    await BinanceCexController.binanceTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'transferType': transferTypesMap[transferType],
                        'asset': defaultAsset,
                        'amount': Number(defaultAmount),
                        'spId': sp._id
                    });
                }

                if(type == "withdrawCheck" || type == "ipWhiteListCheck" || type == "spAddressWhiteListCheck" || type == "withdrawEnabledCheck"){
                    if(spTests.withdrawCheck == true){  
                        await BinanceCexController.updateTest(sp._id, 'withdrawEnabledCheck', true);
                        await BinanceCexController.updateTest(sp._id, 'spAddressWhiteListCheck', true);
                        await BinanceCexController.updateTest(sp._id, 'ipWhiteListCheck', true);
                        await BinanceCexController.testsCheck(sp._id);
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

                        await BinanceCexController.updateTest(sp._id, 'withdrawEnabledCheck', false);
                        await BinanceCexController.updateTest(sp._id, 'spAddressWhiteListCheck', false);
                        await BinanceCexController.updateTest(sp._id, 'ipWhiteListCheck', false);
                        await BinanceCexController.binanceTests(req, res, {
                            'apiKey': sp.cexData.key,
                            'secret': sp.cexData.secret,
                            'type': 'withdrawCheck',
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

        if (field == 'apiKeysCheck'){
            Object.assign(fieldToUpdate, {
                apiKeysCheck: value
            });
        }

        if (field == 'apiValidateCheck'){
            Object.assign(fieldToUpdate, {
                apiValidateCheck: value
            });
        }

        if (field == 'accountCheck'){
            Object.assign(fieldToUpdate, {
                accountCheck: value
            });
        }

        if (field == 'balanceCheck'){
            Object.assign(fieldToUpdate, {
                balanceCheck: value
            });
        }

        if (field == 'transferCheck'){
            Object.assign(fieldToUpdate, {
                transferCheck: value
            });
        }

        if (field == 'withdrawCheck'){
            Object.assign(fieldToUpdate, {
                withdrawCheck: value
            });
        }

        if (field == 'ipWhiteListCheck'){
            Object.assign(fieldToUpdate, {
                ipWhiteListCheck: value
            });
        }

        if (field == 'spAddressWhiteListCheck'){
            Object.assign(fieldToUpdate, {
                spAddressWhiteListCheck: value
            });
        }

        if (field == 'withdrawEnabledCheck'){
            Object.assign(fieldToUpdate, {
                withdrawEnabledCheck: value
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
            "-balanceCheck"
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
                        await BinanceCexController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message); 
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
            await BinanceCexController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message);
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
                                    await BinanceCexController.errorHandler('newSpotOrderHandler', swapProvider._id, existingOrder._id, err.message);
                                }
                            }
                        } catch(err){
                            print.info(`❌ Error From saveOrder:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
                            await BinanceCexController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);
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
            await BinanceCexController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);            
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
                        const spotOrder = await Order.findOne({
                            _id: order._id
                        });
                        await BinanceCexController.withdrawHandler(swapProvider, spotOrder, exchangeinstance);
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
            await BinanceCexController.errorHandler('querySpotOrderHandler', swapProvider._id, order._id, err.message);
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

    amountDistributionProcess: async(pendingDistributionRecord) => {
        try {
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
                    await BinanceCexController.newSpotOrderHandler(pendingDistributionRecord, exchangeinstance);
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
                    await BinanceCexController.newSpotOrderHandler(pendingDistributionRecord, exchangeinstance, distributionOrder);
                } else {
                    // check status of distributionOrder
                    if(distributionOrder.spot.status == "FILLED"){
                        // create withdraw order
                        await BinanceCexController.withdrawHandler(pendingDistributionRecord, distributionOrder, exchangeinstance);
                    } else {
                        // query order status
                        await BinanceCexController.querySpotOrderHandler(pendingDistributionRecord, distributionOrder, exchangeinstance);
                    }
                }
            }
        } catch(err){
            print.log(err);
        }    
    }
}

export default BinanceCexController;