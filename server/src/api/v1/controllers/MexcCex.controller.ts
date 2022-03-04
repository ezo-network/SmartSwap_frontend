import { Request, Response } from "express";
import _ from "lodash";
import web3Js from 'web3';
import { log, constants } from "../../../config";
import SwapProvider from '../models/SwapProvider';
import SwapProviderTest from '../models/SwapProviderTest';
import Order from '../models/order';
import {Helper} from "../helpers/helper";
import {MexcRequest} from "../helpers/MexcRequest";

let print = log.createLogger('Logs', 'trace');
let cexSandBox = false;
let exchangeInstance = new MexcRequest();

let exchange = null;

const MexcCexController = {
    mexcTests: async(req: Request, res: Response, args: Object) => {
        let response, result = {};
        try {
            
            if(args['type'] == 'apiValidateCheck'){
                response = await exchangeInstance.accInfo({
                    key: args['apiKey'],
                    secret: args['secret']
                });
        
                if(response.code === 400){
                    // invalid key            
                    result = false;
                } else if(response.code === 200){
                    // valid key
                    result = true;   
                }

                await MexcCexController.updateTest(args['spId'], args['type'], result).then(async() => {
                    await MexcCexController.updateTest(args['spId'], 'mexcApiKeysCheck', result);
                    await MexcCexController.testsCheck(args['spId']);
                    res.status(200).json({
                        result: result,
                        type: args['type']
                    });
                });
            }


            if(args['type'] == 'accountCheck'){
                if(args['accountType'] == "SPOT" || args['accountType'] == "BOTH"){
                    response = await exchangeInstance.queryWithdrawRecords({},{
                        key: args['apiKey'],
                        secret: args['secret']
                    });
            
                    if(response.code === 200){
                        result['spotCanReadWithdraw'] = true;
                        result['canDeposit'] = true;
                    } else {
                        result['spotCanReadWithdraw'] = false;
                        result['canDeposit'] = false;
                    }

                    response = await exchangeInstance.queryTransferRecords({},{
                        key: args['apiKey'],
                        secret: args['secret']
                    });

                    if(response.code === 200){
                        result['spotCanReadTransfer'] = true;
                    } else {
                        result['spotCanReadTransfer'] = false;
                    }

                    response = await exchangeInstance.queryOpenOrders({
                        symbol: 'BNB_USDT' // ANY VALID SYMBOL
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']                        
                    });

                    if(response.code === 200){
                        result['spotCanReadTrade'] = true;
                    } else {
                        result['spotCanReadTrade'] = false;
                    }  
                    
                    response = await exchangeInstance.placeOrder({
                        symbol: 'BNB/USDT',
                        price: '1',
                        quantity: '1',
                        trade_type: 'BUY',
                        order_type: 'IMMEDIATE_OR_CANCEL'
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']                        
                    });

                    if(response.code === 30002){
                        result['spotCanTrade'] = true;
                    } else {
                        result['spotCanReadTrade'] = false;
                    }

                    result['canTrade'] = result['spotCanTrade'] && result['spotCanReadTrade'];

                    response = await exchangeInstance.placeWithdrawOrder({
                        currency: 'USDT',
                        chain: 'ERC-20',
                        amount: 1,
                        address: '1234',
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']                        
                    });
                    
                    if(response.code === 10212){
                        result['spotCanWithdraw'] = true;
                    } else {
                        result['spotCanWithdraw'] = false;
                    }

                    result['canWithdraw'] = result['spotCanWithdraw'] && result['spotCanReadWithdraw'];
                }

                if(args['accountType'] == "CONTRACT" || args['accountType'] == "BOTH"){
                    response = await exchangeInstance.queryContractHistoricalOrders({
                        page_num: 1,
                        page_size: 20
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']                        
                    });

                    if(response.code === 0){
                        result['contractCanReadTrade'] = true;
                    } else {
                        result['contractCanReadTrade'] = false;                        
                    }

                    response = await exchangeInstance.getContractTransferRecords({
                        page_num: 1,
                        page_size: 20
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']
                    });
                    
                    if(response.code === 0){
                        result['contractCanReadAccount'] = true;
                    } else {
                        result['contractCanReadAccount'] = false;                        
                    }              

                    response = await exchangeInstance.placeContractOrder({
                        symbol: "BNB/USDT",
                        price: 100,
                        vol: 0.00001,
                        side: 1, // open long
                        type: 5, // market orders
                        openType: 1 // isolated
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']
                    });

                    if(response.code === 2015){
                        result['contractCanTrade'] = true;
                    } else {
                        result['contractCanTrade'] = false;
                    }
                } 

                if(args['accountType'] == "BOTH"){
                    result['result'] = 
                        result['contractCanTrade']
                        && result['contractCanReadAccount']
                        && result['contractCanReadTrade']
                        && result['canDeposit']
                        && result['canTrade']
                        && result['canWithdraw'];
                    
                     await MexcCexController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                        await MexcCexController.testsCheck(args['spId']);
                        res.status(200).json(result);
                    });

                } else {
                    res.status(200).json(result);
                }


                
            }

            if(args['type'] == 'transferCheck'){
                let spotToContract = false;
                let spotToContractTrasferId = null;
                let contracttToSpot = false;
                let contractToSpotTrasferId = null;
                if(args['transferType'] == 3){

                    response = await exchangeInstance.assetsTransfer({
                        currency: args['asset'],
                        amount: "1",
                        from: "MAIN",
                        to: "CONTRACT"
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']
                    });

    
                    if(response.code === 200){
                        spotToContract = true;
                        spotToContractTrasferId = response.data.transact_id;
                    }

                    response = await exchangeInstance.assetsTransfer({
                        currency: args['asset'],
                        amount: "1",
                        from: "CONTRACT",
                        to: "MAIN"
                    }, {
                        key: args['apiKey'],
                        secret: args['secret']
                    });

                    if(response.code === 200){
                        contracttToSpot = true;
                        contractToSpotTrasferId = response.data.transact_id;
                    }

                    result = spotToContract && contracttToSpot;
                    await MexcCexController.updateTest(args['spId'], args['type'], result).then(async() => {
                        await MexcCexController.testsCheck(args['spId']);
                        res.status(200).json({
                            result: result,
                            spotToFutureTrasferId: spotToContractTrasferId,
                            futureToSpotTrasferId: contractToSpotTrasferId
                        }); 
                    });
                }
            }

            if(args['type'] == 'withdrawCheck') {
                result['withdrawOrderId'] = null;
                response = await exchangeInstance.placeWithdrawOrder({
                    currency: args['asset'],
                    address: args['address'],
                    chain: args['network'],
                    amount: args['amount']
                }, {
                    key: args['apiKey'],
                    secret: args['secret']
                });
                
                if(response.code === 10075){
                    result['ipWhiteListCheck'] = false;
                }

                if(response.code === 10212){
                    result['ipWhiteListCheck'] = true;
                    result['spAddressWhiteListCheck'] = false;
                }
                
                if(response.code === 200){
                    result['result'] = true;
                    result['withdrawOrderId'] = response.data.withdrawId
                } else if(response.code === 10101) {
                    result['result'] = true;
                } else {
                    result['result'] = false;
                }
            
                result['response'] = response;

                await MexcCexController.updateTest(args['spId'], args['type'], result['result']).then(async() => {
                    await MexcCexController.updateTest(args['spId'], 'withdrawEnabledCheck', result['result']);
                    await MexcCexController.updateTest(args['spId'], 'spAddressWhiteListCheck', result['result']);
                    await MexcCexController.updateTest(args['spId'], 'ipWhiteListCheck', result['result']);
                    await MexcCexController.testsCheck(args['spId']);
                    res.status(200).json(result);
                });
            }

        } catch (e) {
            await MexcCexController.testsCheck(args['spId']);
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
            testOnMexc,
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

        testOnMexc = [
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
            "CONTRACT",
            "BOTH"
        ];

        transferTypesMap = {
            "SPOT_TO_CONTRACT": 1,
            "CONTRACT_TO_SPOT": 2,
            "TWO_WAY": 3
        };

        validTransferTypes = [
            "SPOT_TO_CONTRACT",
            "CONTRACT_TO_SPOT",
            "TWO_WAY"
        ];

        validAssetsToWithdraw = [
            "BNB", "ETH", "MATIC"
        ];

        withdrawalNetworks = {
            "BNB": "BEP20(BSC)",
            "ETH": "ERC-20",
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

            if(testOnMexc.includes(type)){
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
                    // todo - not running yet
                    res.status(422).json({
                        message: "Test is not availble or not running yet."
                    });
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
                    if(transferType == "SPOT_TO_CONTRACT" || transferType == "CONTRACT_TO_SPOT"){
                        defaultAsset = (asset == null || asset == undefined) ? "USDT" : asset;
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

                    result = await MexcCexController.testsCheck(sp._id);
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
                    await MexcCexController.updateTest(sp._id, 'contractOwnerCheck', result).then(async() => {
                        await MexcCexController.testsCheck(sp._id);
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
                    await MexcCexController.updateTest(sp._id, 'contractGasAndFeeCheck', result).then(async() => {
                        await MexcCexController.testsCheck(sp._id);
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
                    await MexcCexController.updateTest(sp._id, 'spProfitPercentCheck', result).then(async() => {
                        await MexcCexController.testsCheck(sp._id);
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
                    await MexcCexController.updateTest(sp._id, 'apiKeysCheck', result).then(async() => {
                        await MexcCexController.testsCheck(sp._id);
                        res.status(200).json({
                            result: result,
                            type: type,
                            key: keyCheck,
                            secret: secretCheck
                        });
                    });  
                }

                if(type == "apiValidateCheck"){
                    await MexcCexController.mexcTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'spId': sp._id
                    });
                }

                if(type == "accountCheck"){
                    await MexcCexController.mexcTests(req, res, {
                        'apiKey': sp.cexData.key,
                        'secret': sp.cexData.secret,
                        'type': type,
                        'accountType': (accountType).toUpperCase(),
                        'spId': sp._id
                    });
                }


                if(type == "transferCheck"){
                    await MexcCexController.mexcTests(req, res, {
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
                        await MexcCexController.updateTest(sp._id, 'withdrawEnabledCheck', true);
                        await MexcCexController.updateTest(sp._id, 'spAddressWhiteListCheck', true);
                        await MexcCexController.updateTest(sp._id, 'ipWhiteListCheck', true);
                        await MexcCexController.testsCheck(sp._id);
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

                        await MexcCexController.updateTest(sp._id, 'withdrawEnabledCheck', false);
                        await MexcCexController.updateTest(sp._id, 'spAddressWhiteListCheck', false);
                        await MexcCexController.updateTest(sp._id, 'ipWhiteListCheck', false);
                        await MexcCexController.mexcTests(req, res, {
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

    withdrawHandler: async(swapProvider, order) => {
        print.info('👉 Handle withdraw');
        try {
            let response = null;
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(swapProvider.networkId) });
            let asset = networkConfig['ASSET'];
            let network = networkConfig['CHAIN_ON_MEXC'];
            let amount = Number(order.spot.executedQty);
            let address = swapProvider.smartContractAddress;
            if(order.withdraw.status == "PENDING"){

                if(!cexSandBox){
                    try {
                        const args = {
                            currency: asset,
                            address: address,
                            chain: network,
                            amount: amount
                        };
                        print.info({
                            placeWithdrawOrderArgs: args,
                            swapProvider: swapProvider._id
                        });
                        response = await exchangeInstance.placeWithdrawOrder(args, {
                            key: swapProvider.cexData.key,
                            secret: swapProvider.cexData.secret
                        });

                        print.info({
                            placeWithdrawOrder: response
                        });

                    } catch (err) {
                        print.info('❌ Error from withdrawHandler exchangeinstance.withdraw: ' + err.message);
                        await MexcCexController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message); 
                    }
                } else {
                    response = {
                        code: 200,
                        data: {
                            withdrawId: 'abvasd'
                        }
                    }
                }
                
                if(response.code === 200 && response.data.hasOwnProperty('withdrawId')){
                    // save withdraw order
                    let args = {
                        refId: response.data.withdrawId,
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
                } else {
                    print.info('❌ Error from withdrawHandler exchangeinstance.withdraw: ' + JSON.stringify(response));
                    await MexcCexController.errorHandler('withdrawHandler', swapProvider._id, order._id, response.msg);
                }
    
            } else if(order.withdraw.status == "PROCESSED"){
                // query withdraw status
    
            } else if(order.withdraw.status == "COMPLETED"){
                // mark distribution done on swap provider
                const web3 = new web3Js(new web3Js.providers.HttpProvider(networkConfig['PROVIDER']));
                const address = swapProvider.smartContractAddress;
                let ticker = await exchangeInstance.fetchTicker(`${asset}/USDT`);
                let price = ticker[0].last;
    
                let spBal =  await web3.eth.getBalance(address, function (error, result) {
                    return result
                });
                let spContractBal = web3Js.utils.fromWei((spBal).toString(), 'ether');
                
                let newTotalWithdrawnAmount;
                if(cexSandBox == false){
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
            await MexcCexController.errorHandler('withdrawHandler', swapProvider._id, order._id, err.message);
        }
    },

    newSpotOrderHandler: async(swapProvider, existingOrder = null) => {
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
            let ticker = await exchangeInstance.fetchTicker(`${asset}/USDT`);
            let price = ticker[0].last;
            price = Number(price) + ((Number(price) * 1) / 100); // to imediate fill

            spBal =  await web3.eth.getBalance(address, function (error, result) {
                return result
            });
            spContractBal = web3Js.utils.fromWei((spBal).toString(), 'ether');

            if(cexSandBox == false){
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

                    let response = await exchangeInstance.placeOrder({
                        'symbol': `${asset}/USDT`,
                        trade_type: 'BUY',
                        order_type: 'IMMEDIATE_OR_CANCEL',
                        price: (price).toString(),
                        quantity: (amount).toString()
                    }, {
                        key: swapProvider.cexData.key, 
                        secret: swapProvider.cexData.secret
                    });

                    print.info(response);
        
                    if(response.code === 200){
                        // save order
                        let args = {
                            'swapProvider': swapProvider._id,
                            'type': 'distribution',
                            'spot': {
                                'asset': `${asset}/USDT`,
                                'type': 'MARKET',
                                'side': 'BUY',
                                'orderId': response.data,
                                'price': price,
                                'origQty': (amount).toString(),
                                'executedQty': (0).toString(),
                                'cummulativeQuoteQty': (0).toString(),
                                'status': 'NEW',
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
                                    await MexcCexController.errorHandler('newSpotOrderHandler', swapProvider._id, existingOrder._id, err.message);
                                }
                            }
                        } catch(err){
                            print.info(`❌ Error From saveOrder:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
                            await MexcCexController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);
                        }
                    } else {
                        await SwapProvider.updateOne({
                            _id: swapProvider._id
                        }, {
                            distributionStatus: "FAILED",
                            withdrawReinitiate: false,
                            message: response.message
                        }).then(async(res) => {
                            print.info(`swapProvider ${swapProvider._id} - newSpotOrderHandler error. `+ response.message)
                        }).catch(err => print.info('❌ Error from newSpotOrderHandler: swapProvider.updateOne with withdrawReinitiate flag false., ' + err.message));                        
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
            await MexcCexController.errorHandler('newSpotOrderHandler', swapProvider._id, null, err.message);            
        }         
    },

    querySpotOrderHandler: async(swapProvider, order) => {
        try {
            const networkConfig = _.find(constants.NETWORKS, { "NETWORK_ID": Number(swapProvider.networkId) });
            const asset = networkConfig['ASSET'];
            
            let response = await exchangeInstance.queryOrder({
                order_ids: order.spot.orderId
            }, {
                'key': swapProvider.cexData.key,
                'secret': swapProvider.cexData.secret
            });
            if(response.code === 200){
                if(response.data.length > 0 && response.data[0].hasOwnProperty('id')){
                    response = response.data[0];
                    if(response.state == "FILLED"){

                        await Order.updateOne({
                            _id: order._id
                        }, {
                            'spot.status': response.state,
                            'spot.executedQty': response.quantity,
                            'spot.cummulativeQuoteQty': response.quantity
                        }).then(async(res) => {
                            // handle withdraw
                            const spotOrder = await Order.findOne({
                                _id: order._id
                            });
                            await MexcCexController.withdrawHandler(swapProvider, spotOrder);
                        }).catch(err => print.info('❌ Error from Order.updateOne with status FILLED, ' + err.message));
                        
                    } else {
                        await Order.updateOne({
                            _id: order._id
                        }, {
                            'spot.status': response.state
                        }).then(async(res) => {
                        }).catch(err => print.info(`❌ Error from Order.updateOne with status ${response.state}, ` + err.message));
                    }
                }
            } else {
                print.info(`❌ Error From querySpotOrderHandler: `, JSON.stringify(response));
            }
        } catch(err){
            print.info(`❌ Error From querySpotOrderHandler:`, err.constructor.name, err.message, ' at:' + new Date().toJSON());
            await MexcCexController.errorHandler('querySpotOrderHandler', swapProvider._id, order._id, err.message);
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
            
            if(pendingDistributionRecord['distributionStatus'] == "PENDING" || pendingDistributionRecord['withdrawReinitiate'] == true){
    
                print.info("inside distributionStatus and withdrawReinitiate check");
    
                await SwapProvider.updateOne({
                    _id: pendingDistributionRecord._id
                }, {
                    distributionStatus: 'PROCESSED',
                    withdrawReinitiate: false
                }).then(async(res) => {
                    // make new spot order
                    await MexcCexController.newSpotOrderHandler(pendingDistributionRecord);
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
                    || distributionOrder.spot.status == "CANCELED"
                    || distributionOrder.spot.status == "REJECTED"
                    || distributionOrder.spot.status == "EXPIRED"
                ){
                    print.info(distributionOrder.spot.status);
                    print.info(distributionOrder);
                    await MexcCexController.newSpotOrderHandler(pendingDistributionRecord, distributionOrder);
                } else {
                    // check status of distributionOrder
                    if(distributionOrder.spot.status == "FILLED"){
                        // create withdraw order
                        await MexcCexController.withdrawHandler(pendingDistributionRecord, distributionOrder);
                    } else {
                        // query order status
                        await MexcCexController.querySpotOrderHandler(pendingDistributionRecord, distributionOrder);
                    }
                }
            }

        } catch(err){
            print.log(err);
        }
    }
}

export default MexcCexController;