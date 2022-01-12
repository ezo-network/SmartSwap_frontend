import React, { PureComponent } from "react";
import { tokenDetails } from "../config/constantConfig";
import Web3 from 'web3';
import web3Config from "../config/web3Config";
import Collapse from "@kunukn/react-collapse";
import InputRange from 'react-input-range';
import CONSTANT from '../constants';
import swapFactoryAbi from '../abis/swapFactory.json';
import constantConfig from '../config/constantConfig';
import notificationConfig from '../config/notificationConfig';
import AxiosRequest from "../helper/axiosRequest";
import SwapFactoryContract from '../helper/swapFactoryContract';
import SPContract from '../helper/spContract';
import { LoopCircleLoading } from 'react-loadingg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateFormat from "dateformat";
import axios from "axios";

var _ = require('lodash');

export default class LiquidityProvider extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            web3: null,
            web3Config: null,
            coinList: tokenDetails,
            isOpen1: false,
            isOpen2: false,
            btnClick: false,
            selectedTokenA: 'ETH',
            selectedTokenB: 'BNB',
            // input fields
            spAccount: null,
            networkId: null,
            tokenA: null,
            tokenB: null,
            amountA: null,
            walletAddressToSend: null,
            walletAddressToReceive: null,
            gasAndFeeAmount: 0,
            minGasAndFeeAmount: 0,
            maxGasAndFeeAmount: 0,
            minStepForGasAndFeeAmount: 0,
            swapSpeedMode: 'UPFRONT',
            spreadAmount: 100,
            spProfitPercent: 0.5,
            accumulateFundsLimit: 100,
            stopRepeatsMode: 3,
            stopRepeatsOnDate: new Date(),
            stopRepeatsAfterCalls: 200,
            toggleStopRepeatsSection: true,
            withdrawMode: 3,
            withdrawOnDate: new Date(),
            withdrawAfterCalls: 250,
            cexApiKey: null,
            cexApiSecret: null,
            cexApiKeyMasked: null,
            cexApiSecretMasked: null,
            cexApiKeyEditable: false,
            cexApiSecretEditable: false,            
            txid: null,
            smartSwapContractAddress: 'Deploy contract to get this address.',
            confirmed: false,
            deployed: false,
            updating: false,
            updated: false,
            reAuthrizeing: false,
            deployButtonText: "DEPLOY SMART CONTRACT",
            updateButtonText: "SAVE TO UPDATE CONTRACT",
            loadingIcon: false,
            errorMessage: null,
            serverError: null,
            isActiveContractExist: false,
            spData: null,
            contractCreatedAt: '',
            baseState: null,
            ethTokenUsdValue: null, 
            bnbTokenUsdValue: null, 
            spContractBal: null,
            spContractBalInUsd: null,
            clientSideError: false,
            clientSideErrorMessage: {
                spProfitPercent: null,
                amountA: null
            },
            tests: null,
            testPassed: false,
            testing: false
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        });

        if (typeof window.ethereum !== 'undefined') {
            // detect Network account change
            window.ethereum.on('networkChanged', networkId => {
                console.log('networkChanged', networkId);
                this.setState({
                    web3: null,
                    confirmed: false,
                    isActiveContractExist: false,
                    spData: null,
                    smartSwapContractAddress: null,
                    spAccount: null,
                    tests: null,
                    testPassed: false,
                    testing: false                    
                });
                //this.resetForm();
            });
    
            // detect Network account change
            window.ethereum.on('chainChanged', networkId => {
                //networkChanged will emit the network ID as a decimal string
                //chainChanged will emit the chain ID as a hexadecimal string
            });
    
            window.ethereum.on('accountsChanged', accounts => {
                console.log('account Changed');
                this.setState({
                    web3: null,
                    confirmed: false,
                    isActiveContractExist: false,
                    spData: null,
                    smartSwapContractAddress: null,
                    spAccount: null,
                    tests: null,
                    testPassed: false,
                    testing: false                    
                });
                // on account change currently disconnecting wallet so we can again check active contract on wallet connect 
    
                //this.resetForm();
            });
        }
    }

    componentDidMount() {

        // preserve the initial state in a new object
        this.setState({
            baseState: this.state
        });

        this.setState({
            web3Ethereum: new Web3(
                new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
            ),
            web3Binance: new Web3(
                new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
            ),
        });

        this.setState({
            loading: true,
            tokenA: this.state.coinList[this.state.selectedTokenA]['address'],
            tokenB: this.state.coinList[this.state.selectedTokenB]['address']
        }, async () => {
            await this.initInstance();
        });

        this.setGasFeeAndAmountMinMaxRanges();

        this.getTokenUsdValuesFromCoingecko();

    }

    resetForm() {
        this.setState(this.baseState);
        this.dispatchEventHandler(this.amountA, '');
        this.dispatchEventHandler(this.walletAddressToSend, '');
        this.dispatchEventHandler(this.walletAddressToReceive, '');
        this.dispatchEventHandler(this.amountA, '');
        this.dispatchEventHandler(this.cexApiKey, '');
        this.dispatchEventHandler(this.cexApiSecret, '');
        this.dispatchEventHandler(this.withdrawMode3, 3, 'checked', 'click');
        this.dispatchEventHandler(this.stopRepeatsMode3, 3, 'checked', 'click');
        this.dispatchEventHandler(this.spProfitPercent, '');
        this.dispatchEventHandler(this.accumulateFundsLimit, '');
        //this.dispatchEventHandler(this.gasAndFeeAmount, 0);
        this.dispatchEventHandler(this.swapSpeedMode1, 'UPFRONT', 'checked', 'click');
    }

    toggle = index => {
        let collapse = "isOpen" + index;
        this.setState(prevState => ({
            [collapse]: !prevState[collapse]
        }));
        //this.toggleActiveContractSection();
    };

    copyText(entryText){
      let rsp = navigator.clipboard.writeText(entryText);
      notificationConfig.success('Address copied.make sure to cross check');
    }

    changeTokenA(token) {
        this.setState({
            selectedTokenB: this.state.selectedTokenA,
            tokenB: this.state.coinList[this.state.selectedTokenA]['address'],
            selectedTokenA: token,
            tokenA: this.state.coinList[token]['address'],
            networkId: web3Config.getNetworkId(),
            spAccount: web3Config.getAddress()
        });
        this.toggleActiveContractSection();
        notificationConfig.error('Token reset. Please set Gas and Fee again.');
        this.setGasFeeAndAmountMinMaxRanges(this.state.coinList[this.state.selectedTokenB]['networkId']);
    };

    changeTokenB(token) {
        this.setState({
            selectedTokenA: this.state.selectedTokenB,
            tokenA: this.state.coinList[this.state.selectedTokenB]['address'],
            selectedTokenB: token,
            tokenB: this.state.coinList[token]['address'],
            networkId: web3Config.getNetworkId(),
            spAccount: web3Config.getAddress()
        });
        this.toggleActiveContractSection();
        notificationConfig.error('Token reset. Please set Gas and Fee again.');
        this.setGasFeeAndAmountMinMaxRanges(this.state.coinList[this.state.selectedTokenB]['networkId']);
    };

    toggleActiveContractSection() {
        if (this.state.spData !== null) {
            const activeContractAddress = this.state.spData.find(obj => {
                return obj.networkId === this.state.networkId;
            }).smartContractAddress;

            if (activeContractAddress) {
                //notificationConfig.success('Active contract found.');   
                this.setState({
                    confirmed: true,
                    isActiveContractExist: true,
                    smartSwapContractAddress: activeContractAddress,
                    deployed: false
                });
            } else {
                this.setState({
                    confirmed: false,
                    isActiveContractExist: false,
                    smartSwapContractAddress: null,
                    deployed: false
                });
            }
        }
    };

    changeSpread(value) {
        if(Number(value) > 1 || Number(value) < 0){
            
            this.setState({
                clientSideError: true
            });
            var clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercent = "Please provide a valid input between 0-1 range";
            this.setState({clientSideErrorMessage});
            //notificationConfig.success(`Test ${testType} fetched`);
            return;
        } else {
            this.setState({
                spProfitPercent: Number(value),
                clientSideError: false
            });

            var clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercent = null;
            this.setState({clientSideErrorMessage});
        }
    };

    checkAmountA(value){
        if(Number(value) < 100){            
            this.setState({
                clientSideError: true
            });
            var clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountA = "Minimum amount is $100";
            this.setState({clientSideErrorMessage});
            //notificationConfig.success(`Test ${testType} fetched`);
            return;
        } else {
            this.setState({
                amountA: Number(value),
                clientSideError: false
            });

            var clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountA = null;
            this.setState({clientSideErrorMessage});
        }        
    }

    inputMask(input, value){
        let maskedValue = value.replace(/.(?=.{4,}$)/g, '*');
        if(input == "key"){
            this.setState({
                cexApiKey: value,
                cexApiKeyMasked: maskedValue
            });            
        }
        if(input == "secret"){
            this.setState({
                cexApiSecret: value,
                cexApiSecretMasked: maskedValue
            });            
        }        
    }

    clearKeys(input){
        if(input == "key"){
            this.setState({
                cexApiKey: null,
                cexApiKeyMasked: null,
                cexApiKeyEditable:false
            });
            this.dispatchEventHandler(this.cexApiKey, null);
        }
        if(input == "secret"){
            this.setState({
                cexApiSecret: null,
                cexApiSecretMasked: null,
                cexApiSecretEditable:false
            });
            this.dispatchEventHandler(this.cexApiSecret, null);            
        }
    }

    toggleStopRepeatsSection(){
        this.setState(prevState => ({
            toggleStopRepeatsSection: !prevState.toggleStopRepeatsSection
        }));
    }

    async connectWallet() {

        if (typeof window.ethereum == 'undefined') {
            console.log('MetaMask is not installed!');
            notificationConfig.error('Metamask not found.');
            return;
        }

        this.setState({ btnClick: true });
        await web3Config.connectWallet(0);
        let networkId = web3Config.getNetworkId();



        if (!constantConfig.allowedNetwork.includes(networkId)) {
            notificationConfig.error('Please Select Ethereum or BSC Network');
            this.setState({ btnClick: false });
            return;
        }
        if (
            constantConfig.tokenDetails[this.state.selectedTokenA].networkId !==
            networkId &&
            (networkId === 97 || networkId === 56)
        ) {
            this.changeTokenA(this.state.selectedTokenB);
            this.setGasFeeAndAmountMinMaxRanges(networkId);
            //notificationConfig.warning('Change metamask network to Ethereum Or Change token A BNB !');
            //return;
        } else if (
            constantConfig.tokenDetails[this.state.selectedTokenA].networkId !==
            networkId &&
            (networkId === 42 || networkId === 1)
        ) {
            this.changeTokenA(this.state.selectedTokenB);
            this.setGasFeeAndAmountMinMaxRanges(networkId);
            //notificationConfig.warning('Change metamask network to Binance! Or Change token A ETH !');
            //return;
        }
        this.setState({
            web3: web3Config.getWeb3(),
            btnClick: false,
            networkId: networkId,
            spAccount: web3Config.getAddress(),
            spData: null,
            tests: null,
            testPassed: false,
            testing: false
        });


        await this.getActiveContracts();

    }

    setGasFeeAndAmountMinMaxRanges(networkID = CONSTANT.NETWORK_ID.ETHEREUM) {
        if (networkID == CONSTANT.NETWORK_ID.BINANCE) {
            this.setState({
                minGasAndFeeAmount: 0.5,
                gasAndFeeAmount: 500,
                maxGasAndFeeAmount: 500,
                minStepForGasAndFeeAmount: 0.5,
                selectedTokenA: 'BNB',
                selectedTokenB: 'ETH',
            })
        }
        if (networkID == CONSTANT.NETWORK_ID.ETHEREUM) {
            this.setState({
                minGasAndFeeAmount: 0.05,
                gasAndFeeAmount: 50,
                maxGasAndFeeAmount: 50,
                minStepForGasAndFeeAmount: 0.05,
                selectedTokenA: 'ETH',
                selectedTokenB: 'BNB',
            })
        }
    }

    async initInstance() {
        let { web3Binance, web3Ethereum } = this.state;
        let instanceSwapFactoryBinance = null;
        let instanceSwapFactoryEthereum = null;
        instanceSwapFactoryBinance = new web3Binance.eth.Contract(
            swapFactoryAbi,
            constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract
        );
        instanceSwapFactoryEthereum = new web3Ethereum.eth.Contract(
            swapFactoryAbi,
            constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract
        );

        this.setState({
            instanceSwapFactoryBinance,
            instanceSwapFactoryEthereum
        });
    }

    async deployContract(event) {

        let allowedNetworks = [Number(process.env.REACT_APP_ETH_CHAIN_ID), Number(process.env.REACT_APP_BSC_CHAIN_ID)];

        if(!Web3.utils.isAddress(this.state.walletAddressToSend)){
            notificationConfig.error('Please provide a valid wallet address that send token A');
            return;
        }

        if(!Web3.utils.isAddress(this.state.walletAddressToReceive)){
            notificationConfig.error('Please provide a valid wallet address that receive token B');
            return;
        }

        if(this.state.tokenA == this.state.tokenB){
            notificationConfig.error("Token A and Token B can't be the same");
            return;            
        }

        if(web3Config.getNetworkId() !== this.state.networkId){
            notificationConfig.error("Invalid network selected");
            return;                        
        }

        if(!allowedNetworks.includes(Number(this.state.networkId))){
            notificationConfig.error("Selected network is not allowed.");
            return;                        
        }

        if(Number(this.state.spProfitPercent) > 1 || Number(this.state.spProfitPercent) < 0){
            this.setState({
                clientSideErrorMessage: "Please provide a valid input between 0-1 range",
                clientSideError: true
            });
            return;           
        } else {
            this.setState({
                clientSideError: false
            });            
        }

        // set this to disable deploy button
        this.setState({
            deployed: true,
            loadingIcon: true,
            deployButtonText: "Deploying...",
            errorMessage: null
        });

        console.log(`deploying contact on network - ${web3Config.getNetworkId()}`)

        let args = {};
        if (Number(this.state.stopRepeatsMode) == 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                stopRepeatsOnDate: this.state.stopRepeatsOnDate,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.stopRepeatsMode) == 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: this.state.stopRepeatsAfterCalls
            });
        }

        if (Number(this.state.stopRepeatsMode) == 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.withdrawMode) == 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                withdrawOnDate: this.state.withdrawOnDate,
                withdrawAfterCalls: null
            });
        }

        if (Number(this.state.withdrawMode) == 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                withdrawOnDate: null,
                withdrawAfterCalls: this.state.withdrawAfterCalls
            });
        }

        if (Number(this.state.withdrawMode) == 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                withdrawOnDate: null,
                withdrawAfterCalls: null
            });
        }


        let finalArgs = {
            data: Object.assign(args, {
                spAccount: this.state.spAccount,
                networkId: this.state.networkId,
                tokenA: this.state.tokenA,
                tokenB: this.state.tokenB,
                amountA: this.state.amountA === null ? ('').toString() : this.state.amountA,
                walletAddressToSend: this.state.walletAddressToSend === null ? ('').toString() : this.state.walletAddressToSend,
                walletAddressToReceive: this.state.walletAddressToReceive === null ? ('').toString() : this.state.walletAddressToReceive,
                gasAndFeeAmount: Web3.utils.toWei((this.state.gasAndFeeAmount).toString()),
                swapSpeedMode: this.state.swapSpeedMode,
                spProfitPercent: this.state.spProfitPercent,
                accumulateFundsLimit: this.state.accumulateFundsLimit,
                stopRepeatsMode: this.state.stopRepeatsMode,
                withdrawMode: this.state.withdrawMode,
                // cexApiKey: this.state.cexApiKey === null ? ('').toString() : this.state.cexApiKey,
                // cexApiSecret: this.state.cexApiSecret === null ? ('').toString() : this.state.cexApiSecret
            }),
            // data: {
            //     spAccount: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     networkId: 42,
            //     tokenA: '0x0000000000000000000000000000000000000002',
            //     tokenB: '0x0000000000000000000000000000000000000001',
            //     amountA: 100,
            //     walletAddressToSend: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     walletAddressToReceive: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     gasAndFeeAmount: 10,
            //     spProfitPercent: 0.3,
            //     accumulateFundsLimit: 0.5,
            //     stopRepeatsMode: 3,
            //     stopRepeatsOnDate: 'April 2,2021',
            //     stopRepeatsAfterCalls: 0,
            //     withdrawMode: 3,
            //     withdrawOnDate: 'April 2,2021',
            //     withdrawAfterCalls: 0,
            //     cexApiKey: '00000000ab',
            //     cexApiSecret: '00000000yz'
            // },            
            path: 'become-swap-provider',
            method: 'POST'
        };

        console.log(finalArgs)

        try {
            let response = await AxiosRequest.request(finalArgs);
            console.log(response);
            if (response.status === 201) {
                console.log('record created!');
                let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), this.state.networkId, 'LiquidityProvider');
                swapFactory.addSwapProvider(
                    response.data.tokenA.address,
                    response.data.tokenB.address,
                    response.data.walletAddresses.toSend,
                    response.data.walletAddresses.toReceive,
                    Web3.utils.fromWei((response.data.gasAndFeeAmount.$numberDecimal).toString(), 'ether'),
                    async (hash) => {
                        this.setState({
                            txid: response.data._id,
                        });
                    },
                    async (response) => {

                        console.log({
                            "Contract response:": response
                        });

                        if(response.code == 4001){
                            this.setState({
                                confirmed: false,
                                deployButtonText: "DEPLOY SMART CONTRACT",
                                deployed: false,
                                loadingIcon: false,
                                isActiveContractExist: false
                            });
                            notificationConfig.error('Deploying cancelled. Please try again');
                        }

                        if (response.status === 1) {
                            // update tx hash to db
                            let args = {
                                data: {
                                    docId: this.state.txid,
                                    txid: response.transactionHash,
                                    blockNumber: response.blockNumber,
                                    networkId: this.state.networkId
                                },
                                path: 'update-tx-hash',
                                method: 'POST'
                            }
                            response = await AxiosRequest.request(args);

                            if (response.status === 200) {
                                this.setState({
                                    smartSwapContractAddress: (response.data['smartContractAddress']).toLowerCase(),
                                    confirmed: true,
                                    deployButtonText: "Contract Deployed",
                                    loadingIcon: false,
                                    isActiveContractExist: true
                                });
                                notificationConfig.success('Swap provider Added');
                            }
                        }

                    }
                );
            }



            if (response.status === 400) {
                this.setState({
                    loadingIcon: false,
                    deployButtonText: "DEPLOY SMART CONTRACT",
                    deployed: false,
                    errorMessage: response.data[0]
                });
                notificationConfig.error('Something went wrong!');
            }

            if (response.status === 401 || response.status === 422) {
                this.setState({
                    loadingIcon: false,
                    deployButtonText: "DEPLOY SMART CONTRACT",
                    deployed: false,
                    serverError: response.data.errorMessage.error
                });
                notificationConfig.error('Something went wrong!');
            }

        } catch (err) {
            console.log(err);
            notificationConfig.error('Server Error!');
            this.setState({
                loadingIcon: false,
                deployButtonText: "DEPLOY SMART CONTRACT",
                deployed: false
            });
        }


    }


    dispatchEventHandler(inputRef, value, type = 'value', eventType = 'input') {
        const valueSetter = Object.getOwnPropertyDescriptor(inputRef, type).set;
        const prototype = Object.getPrototypeOf(inputRef);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, type).set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(inputRef, value);
        } else {
            valueSetter.call(inputRef, value);
        }

        if (eventType == 'mousemove') {
            inputRef.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
        } else {
            inputRef.dispatchEvent(new Event(eventType, { bubbles: true }));
        }

    }

    async getActiveContracts() {

        this.setState({
            deployed: true,
            deployButtonText: 'Getting active contract'
        });

        let args = {
            data: {
                spAccount: this.state.spAccount
            },
            path: 'active-contracts',
            method: 'POST'
        }

        try {
            let response = await AxiosRequest.request(args);
            if (response.status === 200) {

                const isactiveContractExist = response.data.find(obj => {
                    if ((obj.networkId == this.state.networkId) && (this.state.spAccount == obj.walletAddresses.spAccount)) {
                        
                        // convert gasAndFeeAmount to ether so it can be set to input field
                        let gasAndFeeAmount = Web3.utils.fromWei((obj.gasAndFeeAmount.$numberDecimal).toString(), 'ether');
                        this.setState({
                            isActiveContractExist: true,
                            gasAndFeeAmount: Number(gasAndFeeAmount),
                            spProfitPercent: obj.spProfitPercent,
                            contractCreatedAt: obj.createdAt,
                            amountA: obj.totalAmount.$numberDecimal,
                            accumulateFundsLimit: obj.accumulateFundsLimit,
                            stopRepeatsMode: obj.stopRepeats.mode,
                            cexApiKey: obj.cexData.key,
                            cexApiKeyEditable: true,
                            cexApiSecret: obj.cexData.secret,
                            cexApiSecretEditable: true
                        });

                        if(obj.stopRepeats.mode == 1){
                            let toDate = new Date(obj.stopRepeats.onDate)
                            this.setState({
                                stopRepeatsOnDate: toDate,
                                stopRepeatsAfterCalls: null
                            })
                        }

                        if(obj.stopRepeats.mode == 2){
                            this.setState({
                                stopRepeatsAfterCalls: obj.stopRepeats.afterCalls,
                                stopRepeatsOnDate: null
                            })
                        }

                        this.inputMask('key', obj.cexData.key);
                        this.inputMask('secret', obj.cexData.secret);

                        // this.dispatchEventHandler(this.amountA, obj.tokenA.recievedAmount.$numberDecimal);
                        // this.dispatchEventHandler(this.walletAddressToReceive, obj.walletAddresses.toReceive);
                        // this.dispatchEventHandler(this.walletAddressToSend, obj.walletAddresses.toSend);
                        //this.dispatchEventHandler(this.gasAndFeeAmount, Number(gasAndFeeAmount));
                        //this.dispatchEventHandler(this.spProfitPercent, obj.spProfitPercent);
                        // this.dispatchEventHandler(this.accumulateFundsLimit, obj.accumulateFundsLimit);
                        // this.dispatchEventHandler(this.cexApiKey, obj.cexData.key);
                        // this.dispatchEventHandler(this.cexApiSecret, obj.cexData.secret);

                        // if(obj.stopRepeats.mode == 3){
                        //     this.dispatchEventHandler(this.stopRepeatsMode3, obj.stopRepeats.mode, 'checked', 'click');
                        // }

                        // if(obj.stopRepeats.mode == 2){
                        //     this.dispatchEventHandler(this.stopRepeatsMode2, obj.stopRepeats.mode, 'checked', 'click');
                        //     this.dispatchEventHandler(this.stopRepeatsAfterCalls, obj.stopRepeats.afterCalls);
                        // }

                        // if(obj.stopRepeats.mode == 1){
                        //     this.dispatchEventHandler(this.stopRepeatsMode1, obj.stopRepeats.mode, 'checked', 'click');
                        //     //this.dispatchEventHandler(this.stopRepeatsOnDate, obj.stopRepeats.onDate);
                        // }


                        // if(obj.withdraw.mode == 3){
                        //     this.dispatchEventHandler(this.withdrawMode3, obj.withdraw.mode, 'checked', 'click');
                        // }

                        // if(obj.withdraw.mode == 2){
                        //     this.dispatchEventHandler(this.withdrawMode2, obj.withdraw.mode, 'checked', 'click');
                        //     this.dispatchEventHandler(this.withdrawAfterCalls, obj.withdraw.afterCalls);
                        //     this.setState({
                        //         withdrawOnDate: null
                        //     });
                        // }

                        // if(obj.withdraw.mode == 1){
                        //     this.dispatchEventHandler(this.withdrawMode1, obj.withdraw.mode, 'checked', 'click');
                        //     //this.dispatchEventHandler(this.withdrawOnDate, obj.withdraw.onDate);
                        //     this.setState({
                        //         afterCalls: null
                        //     });
                        // }

                        // if(obj.swapSpeedMode == 'UPFRONT'){
                        //     this.dispatchEventHandler(this.swapSpeedMode1, obj.swapSpeedMode, 'checked', 'click');                            
                        //     //this.dispatchEventHandler(this.swapSpeedMode3, obj.swapSpeedMode, 'checked', 'click');                            
                        // }

                        // if(obj.swapSpeedMode == 'REALTIME'){
                        //     this.dispatchEventHandler(this.swapSpeedMode2, obj.swapSpeedMode, 'checked', 'click');
                        //     //this.dispatchEventHandler(this.swapSpeedMode4, obj.swapSpeedMode, 'checked', 'click');
                        // }


                        // this.setState({
                        //     contractCreatedAt: obj.createdAt
                        // });

                        //this.dispatchEventHandler(this.gasAndFeeAmount, obj.gasAndFeeAmount.$numberDecimal, 'value', 'mousemove');



                        return true;
                    } else {
                        return false;
                    }
                })

                if (isactiveContractExist) {
                    notificationConfig.success('Active contract found.');
                    this.setState({
                        spData: response.data,
                        confirmed: true,
                        isActiveContractExist: true,
                        smartSwapContractAddress: isactiveContractExist.smartContractAddress,
                        deployed: false,
                        deployButtonText: 'DEPLOY SMART CONTRACT'
                    });

                    this.getContractBal();
                    this.getAllTests();

                } else {
                    this.setState({
                        deployed: false,
                        deployButtonText: 'DEPLOY SMART CONTRACT'
                    });
                    notificationConfig.error('No active contract for the selected network.');
                }
            } else if (response.status === 404) {
                this.setState({
                    deployed: false,
                    deployButtonText: 'DEPLOY SMART CONTRACT'
                });
                notificationConfig.error('No active contract.');
            } else {
                console.log(response);
            }

        } catch (err) {
            console.log(err);
        }
    }

    asyncInterval = async (ms, triesLeft = 10) => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                let args = {
                    path: `get-contract-address?docId=${this.state.txid}`,
                    method: 'GET'
                }
                let response = await this.getContractAddress(args);
                if (response !== null) {
                    resolve();
                    clearInterval(interval);
                    this.setState({
                        smartSwapContractAddress: response
                    });
                } else if (triesLeft <= 1) {
                    reject();
                    clearInterval(interval);
                }
                triesLeft--;
            }, ms);
        });
    }

    getContractAddress = async (args) => {
        let response = await AxiosRequest.request(args);
        console.log({
            getContractAddress: response
        });
        return response.data.smartContractAddress;
    }

    reAuthrizeFeeAndGasLimit = async () => {
        if (this.state.isActiveContractExist) {
            this.setState({
                reAuthrizeing: true
            });
            let newLimit = this.state.gasAndFeeAmount;

            let spContract = new SPContract(web3Config.getWeb3(), this.state.networkId, this.state.smartSwapContractAddress);
            spContract.setFeeAmountLimit(
                newLimit,
                async (hash) => { },
                async (response) => {
                    console.log({
                        "SP Contract response:": response
                    });

                    if (response.status === 1) {
                        this.setState({
                            gasAndFeeAmount: newLimit
                        });

                        //spContract.getFeeAmountLimit();
                        await AxiosRequest.request({
                            data: {
                                smartContractAddress: this.state.smartSwapContractAddress,
                                gasAndFeeAmount: Web3.utils.toWei((newLimit).toString(), 'ether')
                            },
                            path: "update",
                            method: "POST"
                        });

                        notificationConfig.success('NEW GAS AND FEES LIMIT SET');

                        this.setState({
                            reAuthrizeing: false
                        });

                    }
                });
        }
    }

    updateContract = async () => {

        if (this.state.cexApiKey === null || this.state.cexApiKey.length === 0) {
            notificationConfig.error("API key can't be blank.");
            return;
        }

        if (this.state.cexApiSecret === null || this.state.cexApiSecret.length === 0) {
            notificationConfig.error("API secret can't be blank.");
            return;
        }

        if (Number(this.state.stopRepeatsMode) == 2) {
            if (this.state.stopRepeatsAfterCalls === null || this.state.stopRepeatsAfterCalls.length === 0) {
                notificationConfig.error("You must choose how many time to repeat on CEX");
                return;
            }
        }

        this.setState({
            updating: true,
            loadingIcon: true
        });

        let args = {};
        if (Number(this.state.stopRepeatsMode) == 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                stopRepeatsOnDate: this.state.stopRepeatsOnDate,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.stopRepeatsMode) == 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: this.state.stopRepeatsAfterCalls
            });
        }

        if (Number(this.state.stopRepeatsMode) == 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: null
            });
        }


        let finalArgs = {
            data: Object.assign(args, {
                smartContractAddress: this.state.smartSwapContractAddress,
                amountA: this.state.amountA,
                spProfitPercent: this.state.spProfitPercent,
                accumulateFundsLimit: this.state.accumulateFundsLimit,
                stopRepeatsMode: this.state.stopRepeatsMode,
                cexApiKey: this.state.cexApiKey,
                cexApiSecret: this.state.cexApiSecret,
                swapSpeedMode: this.state.swapSpeedMode === null ? 'UPFRONT' : this.state.swapSpeedMode
            }),
            // data: {
            //     spAccount: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     networkId: 42,
            //     tokenA: '0x0000000000000000000000000000000000000002',
            //     tokenB: '0x0000000000000000000000000000000000000001',
            //     amountA: 100,
            //     walletAddressToSend: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     walletAddressToReceive: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
            //     gasAndFeeAmount: 10,
            //     spProfitPercent: 0.3,
            //     accumulateFundsLimit: 0.5,
            //     stopRepeatsMode: 3,
            //     stopRepeatsOnDate: 'April 2,2021',
            //     stopRepeatsAfterCalls: 0,
            //     withdrawMode: 3,
            //     withdrawOnDate: 'April 2,2021',
            //     withdrawAfterCalls: 0,
            //     cexApiKey: '00000000ab',
            //     cexApiSecret: '00000000yz'
            // },            
            path: 'update',
            method: 'POST'
        };

        console.log(finalArgs);
        try {
            let response = await AxiosRequest.request(finalArgs);
            if (response.status == 200) {
                setTimeout(async () => {
                    console.log('Updated');
                    notificationConfig.success('Contract updated successfully');
                    this.setState({
                        updated: true,
                        updateButtonText: "CONTRACT UPDATED SUCCESSFULLY",
                        updating: false,
                        loadingIcon: false,
                    });
                }, 3000);

                setTimeout(async () => {
                    this.setState({
                        updated: false,
                        updateButtonText: 'SAVE TO UPDATE CONTRACT'
                    });
                }, 5000);
            }
        } catch (err) {
            notificationConfig.error('Something went wrong!');
        }

    }

    reAuthrizeSpreadLimit = async () => {
        if (this.state.isActiveContractExist) {
            this.setState({
                reAuthrizeing: true
            });
            let newLimit = this.state.spProfitPercent;
            //spContract.getFeeAmountLimit();
            await AxiosRequest.request({
                data: {
                    smartContractAddress: this.state.smartSwapContractAddress,
                    spProfitPercent: newLimit
                },
                path: "update",
                method: "POST"
            });
            notificationConfig.success('NEW SPREAD LIMIT SET');
            this.setState({
                reAuthrizeing: false
            });
        }
    }

    updateSwapSpeedMode = async (mode) => {
        // if (this.state.isActiveContractExist) {
        //     this.setState({
        //         updating: true,
        //         reAuthrizeing: true
        //     });
        //     let swapSpeedMode = mode;
        //     await AxiosRequest.request({
        //         data: {
        //             smartContractAddress: this.state.smartSwapContractAddress,
        //             swapSpeedMode: swapSpeedMode
        //         },
        //         path: "update",
        //         method: "POST"
        //     });
        //     notificationConfig.success('Swap speed mode updated.');
        //     this.setState({
        //         updating: false,
        //         reAuthrizeing: false
        //     });
        // }
        this.setState({
            swapSpeedMode: mode
        });
    }


    updateAPIdata = async () => {

        if (this.state.isActiveContractExist) {

            let error = false;

            if (this.state.cexApiKey === null) {
                notificationConfig.error("API key can't be blank.");
                error = true;
            }

            if (this.state.cexApiSecret === null) {
                notificationConfig.error("API secret can't be blank.");
                error = true;
            }

            if (error === false) {
                this.setState({
                    updating: true,
                    loadingIcon: true
                });

                let response = await AxiosRequest.request({
                    data: {
                        smartContractAddress: this.state.smartSwapContractAddress,
                        cexApiKey: this.state.cexApiKey,
                        cexApiSecret: this.state.cexApiSecret,
                    },
                    path: "update",
                    method: "POST"
                });

                if(response.status == 422){
                    notificationConfig.error('Invalid API keys.');
                }
                
                if(response.status == 200){
                    notificationConfig.success('API data updated successfully.');
                } 

                if(response.status == 500){
                    notificationConfig.error('Sever error');
                }

                this.setState({
                    updating: false,
                    loadingIcon: false
                });
            }
        }
    }

    getTokenUsdValuesFromCoingecko = async () => {
        let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
        
        let response = await axios.get(url).then((res) => {
            return res.data;
        }).catch((err) => {
            console.log("errorOrigin: getTokenUsdValuesFromCoingecko", err);
        });
  
        this.setState({ 
            ethTokenUsdValue: response["ethereum"]["usd"],
            bnbTokenUsdValue: response["binancecoin"]["usd"]
        });
    }


    getContractBal = async () => {

        const bscProvider = CONSTANT.WEB_RPC_PROVIDER_BINANCE;
        const ethreumProvider = CONSTANT.WEB_RPC_PROVIDER_ETHEREUM;
        const web3ForBSC = new Web3(new Web3.providers.HttpProvider(bscProvider));
        const web3ForETH = new Web3(new Web3.providers.HttpProvider(ethreumProvider));
        let web3 = null;
        let usdtFaceValue = 0;

        if(this.state.networkId == 1 || this.state.networkId == 42){
            web3 = web3ForETH;
            usdtFaceValue = this.state.ethTokenUsdValue;
        }

        if(this.state.networkId == 56 || this.state.networkId == 97){
            web3 = web3ForBSC;
            usdtFaceValue = this.state.bnbTokenUsdValue;
        }

        let spBal =  await web3.eth.getBalance(this.state.smartSwapContractAddress, function (error, result) {
            return result;
        });

        if(spBal){
            let spContractBal = Web3.utils.fromWei((spBal).toString(), 'ether');
            let spUsdtBal = Number(usdtFaceValue) * Number(spContractBal);
            this.setState({
                spContractBal: spContractBal,
                spContractBalInUsd: Number(spUsdtBal).toFixed(2)
            });
        }


    }

    withdraw = async () => {
        var BN = Web3.utils.BN;
        var zeroDigit = new BN(0)
        let spContract = new SPContract(web3Config.getWeb3(), this.state.networkId, this.state.smartSwapContractAddress);
        let assetAddress = this.state.tokenA;
        let amount = Web3.utils.toWei((this.state.spContractBal).toString(), 'ether');
        amount = new BN((amount).toString());
        
        let validAddresses = ["0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
        if(validAddresses.includes(assetAddress)){
            if(amount.gt(zeroDigit)){
                spContract.withdraw(
                    assetAddress,
                    amount, // should pass in wei
                    async (hash) => { },
                    async (response) => {
                        console.log({
                            "SP Contract response:": response
                        });
        
                        if(response.code == 4001){
                            notificationConfig.info('Withdraw transaction cancelled.');
                        }
        
                        if (response.status === 1) {
                            await this.getContractBal();
                            notificationConfig.success('Withdraw applied successfully.');
                        }
                    }
                );
            } else {
                notificationConfig.error("Contract does't have sufficient balance.");                            
            }
        } else {
            notificationConfig.error('Invalid asset address.');            
        }

    }

    getAllTests = async() => {
        // fetch all tests and set to tests var
        try {
            let response = await AxiosRequest.request({
                data: {
                    owner: this.state.spAccount,
                    networkId: this.state.networkId,
                    smartContractAddress: this.state.smartSwapContractAddress,
                    type: 'testsCheck'
                },
                path: "test-suite",
                method: "POST"
            });

            if(response.status == 200){
                this.setState({
                    tests: response.data.response,
                    testPassed: response.data.result
                });
            }

            if(response.status == 500){
                notificationConfig.error('Sever error');
            }
        } catch (e){
            console.log('Error from getAllTests: ', e.constructor.name, e.message)
        }
    }

    testSuite = async(testType = '') => {
        try {

            let filter = {
                owner: this.state.spAccount,
                networkId: this.state.networkId,
                smartContractAddress: this.state.smartSwapContractAddress,
                type: testType                
            };

            if(testType == "binanceAccountCheck"){
                filter['accountType'] = 'SPOT_USDTM';
            }

            if(testType == "binanceBalanceCheck"){
                filter['accountType'] = 'SPOT';
            }

            if(testType == "binanceTransferCheck"){
                filter['transferType'] = 'TWO_WAY';
            }

            let response = await AxiosRequest.request({
                data: filter,
                path: "test-suite",
                method: "POST"
            });

            if(response.status == 200){
                var property = {...this.state.tests.key}
                property = true;
                this.setState({property});
                //notificationConfig.success(`Test ${testType} fetched`);
                return response.data.result;
            }

            if(response.status == 500){
                notificationConfig.error('Sever error');
            }
            
            return false;

        } catch (e){
            console.log('Error from testSuite: ', e.constructor.name, e.message)
        }        
    }

    repeatTests = async(testType = '') => {
        try {

            if(this.state.testing == false){
                this.setState({
                    testing: true
                });
                notificationConfig.info('Testing swap proider configuratons');
                let failedTests = [], passedTests = [];
                await this.getAllTests().then(async() => {
                    // get all failed tests
                    if(this.state.tests !== null){
                        for (let [key, value] of Object.entries(this.state.tests)) {
                            if (key == '_id' || key == 'id') {
                                continue;
                            } else {
                                if(value == false){
                                    var property = {...this.state.tests.key};
                                    property = false;
                                    this.setState({property});
                                    failedTests.push(key);
                                } else {
                                    var property = {...this.state.tests.key};
                                    property = true;
                                    this.setState({property});                                
                                    passedTests.push(key);                                
                                }
                            }
                        }
                        
                    }
                }).catch(e => {
                    console.log('Error from repeatTests: ', e.constructor.name, e.message);
                    notificationConfig.error(`Something went wrong while testing swap provider.`);
                });
    
                if(failedTests.length > 0){
                    for(let test=0; test<failedTests.length; test++){
                        await this.testSuite(failedTests[test]);
                    }                
                }
    
                await this.getAllTests();

                this.setState({
                    testing: false
                });

            } else {
                notificationConfig.info('Testing already in progress.');
            }



        } catch (e){
            console.log('Error from repeatTests: ', e.constructor.name, e.message)
        } 
    }

    render() {

        const smallError = {
            fontSize: "13px",
            lineHeight: "20px"
        };

        return (
            <div className="main-Popup wallet-Popup" id="LiquidityProvider">
                <div className="container-Grid details-n">
                    <div className="LiProTitle01 ">Become a Swap Provider</div>
                    <div className="details-para-n">
                        <p>Swap Provider (SP) act as a default counterparty when swaps are pending due to lack of liquidity. SP use an API to automatically buying in real time tokens from centralized exchange (CEX) and sell them as a counterparty on the Smartswap based on average market price. The spread between the market to average market is the SP's profit. SP can control the outcome of the swap including the profits by setting terms for the API, such as the maximum funds to use, the minimum spread to gain from and other terms.</p>
                        <p>The SP process works like a fountain, first users place orders on the Smartswap, and if there is no counterparty, the SP's CEX account will be trigger by an API to use stablecoin to buy in real time the tokens those users looking for. Then those token will be send by the CEX account to the smartswap and at the same time the Smartswap will send the counter party tokens to the SP's CEX account, at that point the API will sell those receiving tokens back to stablecoins and wait for the next trigger to repeat the process again. Since the receiving tokens from the counterparty can take few long minutes until it's received in the SP's CEX account and sold back to stablecoins, the API will protect the SP's profits by placing automatically short order to guaranty that the face value of the receiving tokens will not be change during that time. </p>
                        <p>As SP you do not need to do anything active, everything will work for you, so everything your account sending funds out to the smartswap it will gain that fund back plus a spread as a profit.</p>
                        <ul className="count-content-wrap-n">
                            <li>
                                <div className="count-content-n">
                                    <span className="count-n">
                                        1
                                    </span>
                                    <p>Set terms for the API and deploy you smart contract.</p>
                                </div>
                            </li>
                            <li>
                                <div className="count-content-n">
                                    <span className="count-n">
                                        2
                                    </span>
                                    <p>Go to your CEX and open an API and whitelist the smart contract and IP address for withdrawal.</p>
                                </div>
                            </li>
                            <li>
                                <div className="count-content-n">
                                    <span className="count-n">
                                        3
                                    </span>
                                    <p>Update the smart contract with the new API and Secret Key you received from your CEX.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    {this.state.serverError !== null &&
                        <div className="error-Msg">
                            <label>{this.state.serverError}</label>
                        </div>
                    }
                    <div className="LiProFormMbox">

                        <div className="LiProfSbox01">
                            <div className="LiProTitle02">SEND</div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProTitle02">RECEIVED</div>
                        </div>
                        <div className="LiProfSbox01">
                            <div className="LiProLable">Choose the token A to sell on Smartswap<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Total amount circulating as a swap provider. 
<br/><br/>
For example, selecting $100,000 means up $100,000 circulates to support SmartSwap liquidity" aria-hidden="true"></i></i></div>
                            <div className="bspMBX01">
                                <div className="bspSBX01 fw">
                                    <div className="LiproDropdown">
                                        <button className='LiproDDbtn01' onClick={() => this.toggle(1)} >
                                            <div className="ddIconBX"> <span> <img src={this.state.coinList[this.state.selectedTokenA]['icon']} alt="" /></span> {this.state.coinList[this.state.selectedTokenA]['symbol']}</div>
                                            <i className="fas fa-caret-down"></i>
                                        </button>
                                        <div className="ddContainer">
                                            <Collapse isOpen={this.state.isOpen1} className={"collapse-css-transition"} >
                                                {
                                                    Object.keys(this.state.coinList).map((coin) => (
                                                        this.state.selectedTokenA !== this.state.coinList[coin]['symbol'] &&
                                                        (this.state.coinList[coin]['approveRequire'] === false) &&
                                                        <button
                                                            onClick={() => {
                                                                this.changeTokenA(this.state.coinList[coin]['symbol']);
                                                            }}
                                                            key={this.state.coinList[coin]['symbol']} className='LiproDDbtn01'
                                                        >
                                                            <div className="ddIconBX"> <span> <img src={this.state.coinList[coin]['icon']} alt="" /></span> {this.state.coinList[coin]['symbol']}</div>
                                                        </button>
                                                    ))
                                                }
                                            </Collapse>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="FlyICO03"> {"<>"} </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Choose token B to receive from SmartSwap</div>
                            <div className="LiproDropdown">
                                <button className='LiproDDbtn01' onClick={() => this.toggle(2)} >
                                    <div className="ddIconBX"> <span> <img src={this.state.coinList[this.state.selectedTokenB]['icon']} alt="" /></span> {this.state.coinList[this.state.selectedTokenB]['symbol']}</div>
                                    <i className="fas fa-caret-down"></i>
                                </button>
                                <div className="ddContainer">
                                    <Collapse isOpen={this.state.isOpen2} className={"collapse-css-transition"} >
                                        {
                                            Object.keys(this.state.coinList).map((coin) => (
                                                (this.state.selectedTokenB !== this.state.coinList[coin]['symbol']) &&
                                                (this.state.coinList[coin]['approveRequire'] === false) &&
                                                <button
                                                    onClick={() => {
                                                        this.changeTokenB(this.state.coinList[coin]['symbol']);
                                                    }}
                                                    key={this.state.coinList[coin]['symbol']} className='LiproDDbtn01'
                                                >
                                                    <div className="ddIconBX"> <span> <img src={this.state.coinList[coin]['icon']} alt="" /></span> {this.state.coinList[coin]['symbol']}</div>
                                                </button>
                                            ))
                                        }
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                        <div className="LiProfSbox01">
                            <div className="LiProLable">Your CEX wallet address <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter you CEX wallet (for example your Binance wallet address) that will become a swap provider. " aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input
                                    type="text"
                                    defaultValue=''
                                    onChange={event => this.setState({ walletAddressToSend: event.target.value })}
                                    ref={(input) => this.walletAddressToSend = input}
                                />
                            </div>
                            <br></br>
                            {this.state.errorMessage !== null && this.state.errorMessage.includes("walletAddressToSend") &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.errorMessage}</label>
                                </div>
                            }
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Your CEX wallet address <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter the wallet that receives SP results and rewards. This wallet address may be the same CEX wallet address as the token A address. 
<br/><br/>
N.B. that on some CEX it may be two different wallet addresses, one to send and one to receive." aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input
                                    type="text"
                                    defaultValue=''
                                    onChange={event => this.setState({ walletAddressToReceive: event.target.value })}
                                    ref={(input) => this.walletAddressToReceive = input}
                                />
                            </div>
                            <br></br>
                            {this.state.errorMessage !== null && this.state.errorMessage.includes("walletAddressToReceive") &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.errorMessage}</label>
                                </div>
                            }
                        </div>
                        <div className="LiProfSbox01 ">
                            <div className="LiProLable d-flex">Choose the total amount you are authorizing the API to use<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="The total amount includes the amount that will be send to your smart contract, the stable coin amount that will be left on your CEX account and the funds that will be use to place short order when needed." aria-hidden="true"></i></i></div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiproInput01 withLable01" style={{ marginTop: "12px" }}>
                                <span>$</span>
                                <input
                                    type="text"
                                    defaultValue=''
                                    placeholder="50000"
                                    onChange={event => this.checkAmountA(event.target.value)}
                                    ref={(input) => this.amountA = input}
                                />
                            </div>
                            <br></br>
                            {this.state.errorMessage !== null && this.state.errorMessage.includes("amountA") &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.errorMessage}</label>
                                </div>
                            }
                            {this.state.clientSideError == true && (this.state.clientSideErrorMessage.amountA !== null) &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.clientSideErrorMessage.amountA}</label>
                                </div>
                            }                                                            
                        </div>
                        <div className='spacerLine'></div>

                        <div className="LiProfSbox01">
                            <div className="LiProTitle02">CHOOSE YOUR SWAPPING SPEED<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="right" data-pt-title="The Smart swap using a matcher to match between users to users and if there are no users available, between users to swap providers (SP). the matcher taking under consideration, which SP can complete the swap fully, faster and cheaper. 
                            <br/><br/>
                            SP can hold stable coin (USDT) on their controlled CEX account, which will be trigger by API to buy in real time tokens and send over to the SP's smarts contact which will be  use as a counterparty to other users. same exchange processing withdraw after few long minutes and also each blockchain network as different proccing speed, those facts can put some SP with holding upfront tokens on their smart contract with advantage over other SP that requires to buy those tokens and then send them over.
                            <br/><br/>
                            As a SP you can choose if you want to send tokens to your smart contract in real time, or if you want to act faster by depositing tokens upfront to to your smart contract." aria-hidden="true"></i></i></div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProTitle02"> </div>
                        </div>
                        <div className="LiProfSbox01">
                            <div className='LipRadioFix01' >
                                <div className="md-radio md-radio-inline ">
                                    <input
                                        type="radio"
                                        id="spS01"
                                        name="s001"
                                        onChange={() => { this.updateSwapSpeedMode('UPFRONT'); }}
                                        checked={this.state.swapSpeedMode === 'UPFRONT'}
                                        ref={(input) => this.swapSpeedMode1 = input}
                                    />
                                    <label htmlFor="spS01"></label>
                                </div>
                                <div className="LiProFlexBX01 padFixer01">
                                    <div className="LipRTitle01">Deposit token A to the smart contract upfront<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="right" data-pt-title="This option required from you hold upfront 45% of the sell token in the smart contract, and another 55% as stable coin (USDT) on your centralized account (that 55% will be used to buy the sell tokens in real time and placing a short order against the receiving token to secure it's face value from volatility).
                                    <br/><br/>
                                    Once you will deploy your smart contract, you will need to deposit directly to your smart contract address the 45% the funds as tokens that you want to sell. 
                                    <br/><br/>
                                    For example if you want to and you are looking to gain profit of 0.05% as a spread. in exchange for ETH and you are looking to gain profit of 0.05% as a spread, you will need to deposit $45,000 of BNB to your smart contract, so users that buying those BNB will get those tokens instantly without waiting for your centralized account to send it over to the smart contract (which can takes few long minutes). Wen swaps take place your CEX account will be trigger to buy in real time new BNB at the best price in the exchange and then send them to feed back your smart contract, while on the same time the smartswap will send to your CEX account $45,225 of ETH (which is the same amount plus the spread that you agree to), then the API will open a short position to make sure those ETH will be sold back to stablecoins without any lost to volatility." aria-hidden="true"></i></i></div>
                                </div>
                            </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className='LipRadioFix01' >
                                <div className="md-radio md-radio-inline ">
                                    <input
                                        type="radio"
                                        id="spS02"
                                        name="s002"
                                        onChange={() => { this.updateSwapSpeedMode('REALTIME'); }}
                                        checked={this.state.swapSpeedMode === 'REALTIME'}
                                        ref={(input) => this.swapSpeedMode2 = input}
                                        disabled="true"
                                    />
                                    <label htmlFor="spS02"></label>
                                </div>
                                <div className="LiProFlexBX01 padFixer01">
                                    <div className="LipRTitle01">Deposit token A to the smart contract in real time<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Selecting this option allows zero up front tokens and 100% of your funds may wait as stablecoins (USDT) on your centralized exchange account. Once your account is triggered to provide liquidity to SmartSwap, the controlled account uses the authorized stablecoin account to buy the tokens and send them to your smart contract address.
                                    <br/><br/>
                                    N.B. The process to send tokens from centralized  exchange accounts to your smart contract may take few minutes depending on the exchange and the speed of network. Therefore, the SmartSwap may choose other SPs over you which have tokens available on their smart contract already and can execute the swap faster for the end user." aria-hidden="true"></i></i></div>
                                </div>
                            </div>
                        </div>
                        {
                            this.state.errorMessage !== null && this.state.errorMessage.includes("swapSpeedMode") &&
                            <div className="error-Msg" style={smallError}>
                                <label>{this.state.errorMessage}</label>
                            </div>
                        }

                        <div className='spacerLine'></div>

                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">GAS AND FEES</div>
                            <div className="LiProLable mtFix01">Set the maximum amount which the smart contract is authorized to withdraw from your CEX account to cover the gas and fees. Once the total is reached, the contract stops performing until reauthorized with a new limit</div>
                            <div className="dragorInput v2">
                                <InputRange
                                    step={this.state.minStepForGasAndFeeAmount}
                                    maxValue={this.state.maxGasAndFeeAmount}
                                    minValue={this.state.minGasAndFeeAmount}
                                    value={this.state.gasAndFeeAmount}
                                    formatLabel={value => this.state.selectedTokenA + ` ${value}`}
                                    onChange={value => this.setState({ gasAndFeeAmount: value })}
                                    ref={(input) => this.gasAndFeeAmount = input}
                                />
                            </div>
                            <br></br>
                            {this.state.errorMessage !== null && this.state.errorMessage.includes("gasAndFeeAmount") &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.errorMessage}</label>
                                </div>
                            }
                        </div>

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">PROFIT</div>
                        </div>
                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum that you want to gain on each swap <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Set a profit limit that triggers your funds for swapping. Take under consideration all costs such as exchange fees. 
                                <br/><br/>
                                For example, you can choose that you want your funds to swap only if it's gain 0.5% profits. When you set the profit limit, take under consideration all the costs that you may pay to your CEX for such transaction short position, blockchain cost, (which by themselves can be range from 0.1 to 0.3% - depend on the CEX and network)." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <input
                                        type="text"
                                        placeholder={this.state.spProfitPercent}
                                        onChange={event => this.changeSpread(event.target.value)}
                                        ref={(input) => this.spProfitPercent = input}
                                        min="0"
                                        max="1"
                                    />
                                    <span>%</span>
                                </div>
                                <br></br>
                                {this.state.errorMessage !== null && this.state.errorMessage.includes("spProfitPercent") &&
                                    <div className="error-Msg" style={smallError}>
                                        <label>{this.state.errorMessage}</label>
                                    </div>
                                }
                                {this.state.clientSideError == true && (this.state.clientSideErrorMessage.spProfitPercent !== null) &&
                                    <div className="error-Msg" style={smallError}>
                                        <label>{this.state.clientSideErrorMessage.spProfitPercent}</label>
                                    </div>
                                }
                            </div>
                        </div>


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum amount that you are willing to swap with<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Take under consideration, performing a swap costs gas and fees which are reimbursed via SMART" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <span>$</span>
                                    <input
                                        type="text"
                                        placeholder={this.state.accumulateFundsLimit}
                                        onChange={event => this.setState({ accumulateFundsLimit: event.target.value })}
                                        ref={(input) => this.accumulateFundsLimit = input}
                                    />
                                </div>
                                <br></br>
                                {this.state.errorMessage !== null && this.state.errorMessage.includes("accumulateFundsLimit") &&
                                    <div className="error-Msg" style={smallError}>
                                        <label>{this.state.errorMessage}</label>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">REPEAT</div>
                        </div>

                        <div className='LiProFlexBX01 tabFixer smFixer02' style={{ alignItems: 'flex-start' }}>
                            <div className="LiProfSbox01" style={{ paddingTop: '10px' }}>
                                <div className="LiProLable">Stop repeat on CEX <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how many transactions you approve as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stops, there is no way to change the process besides deploying a new Swap Provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">

                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s01"
                                            name="s11"
                                            value="s01"
                                            onChange={event => this.setState({ stopRepeatsMode: 1 })}
                                            checked={this.state.stopRepeatsMode === 1}
                                            ref={(input) => this.stopRepeatsMode1 = input}
                                        />
                                        <label htmlFor="s01"></label>
                                    </div>
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <DatePicker
                                                selected={this.state.stopRepeatsOnDate}
                                                onChange={(date) => this.setState({ stopRepeatsOnDate: date })}
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                dateFormat="dd/MM/yyyy"
                                                ref={(input) => this.stopRepeatsOnDate = input}
                                            />
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s02"
                                            name="s11"
                                            value="s02"
                                            onChange={event => this.setState({ stopRepeatsMode: 2 })}
                                            checked={this.state.stopRepeatsMode === 2}
                                            ref={(input) => this.stopRepeatsMode2 = input}
                                        />
                                        <label htmlFor="s02"></label>
                                    </div>
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input
                                                type="text"
                                                placeholder={this.state.stopRepeatsAfterCalls}
                                                onChange={event => this.setState({ stopRepeatsAfterCalls: event.target.value })}
                                                ref={(input) => this.stopRepeatsAfterCalls = input}
                                            />
                                            {/* <div className="FlyICO02">Days</div> */}
                                            <span>Repeats</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s03"
                                            name="s11"
                                            value="s03"
                                            onChange={event => this.setState({ stopRepeatsMode: 3 })}
                                            checked={this.state.stopRepeatsMode === 3}
                                            ref={(input) => this.stopRepeatsMode3 = input}
                                        />
                                        <label htmlFor="s03"></label>
                                    </div>
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account." aria-hidden="true"></i></i></div>
                                    </div>
                                </div>

                            </div>
                        </div>


                        {/* <div className='LiProFlexBX01 tabFixer smFixer02' style={{ alignItems: 'flex-start' }}>
                            <div className="LiProfSbox01" style={{ paddingTop: '10px' }}>
                                <div className="LiProLable">Withdraw from Smartswap<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how long you wish your funds to be used as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stop, there is no way to change it besides to deploy a new swap provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s04"
                                            name="s12"
                                            value="s04"
                                            onChange={event => this.setState({ withdrawMode: 1 })}
                                            checked={this.state.withdrawMode === 1}
                                            ref={(input) => this.withdrawMode1 = input}
                                        />
                                        <label htmlFor="s04"></label>
                                    </div>
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <DatePicker
                                                selected={this.state.withdrawOnDate}
                                                onChange={(date) => this.setState({ withdrawOnDate: date })}
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                dateFormat="dd/MM/yyyy"
                                                ref={(input) => this.withdrawOnDate = input}
                                            />
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s05"
                                            name="s12"
                                            value="s05"
                                            onChange={event => this.setState({ withdrawMode: 2 })}
                                            checked={this.state.withdrawMode === 2}
                                            ref={(input) => this.withdrawMode2 = input}
                                        />
                                        <label htmlFor="s05"></label>
                                    </div>
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input
                                                type="text"
                                                placeholder={this.state.withdrawAfterCalls}
                                                onChange={event => this.setState({ withdrawAfterCalls: event.target.value })}
                                                ref={(input) => this.withdrawAfterCalls = input}
                                            />
                                            
                                            <span>Repeats</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input
                                            type="radio"
                                            id="s06"
                                            name="s12"
                                            value="s06"
                                            onChange={event => this.setState({ withdrawMode: 3 })}
                                            checked={this.state.withdrawMode === 3}
                                            ref={(input) => this.withdrawMode3 = input}
                                        />
                                        <label htmlFor="s06"></label>
                                    </div>
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account " aria-hidden="true"></i></i></div>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {(() => {
                            if ((this.state.web3 === null ||
                                constantConfig.tokenDetails[
                                    this.state.selectedTokenA
                                ].networkId !== web3Config.getNetworkId())) {
                                return (<div className="LiProfSbox03">
                                    <div className='LiProformBTNbar'>
                                        <button
                                            onClick={this.connectWallet.bind(this)}
                                        >CONNECT YOUR WALLET</button>
                                    </div>
                                </div>)

                            } else {
                                return (<div className="LiProfSbox03">
                                    <div className='LiProformBTNbar'>
                                        <button
                                            onClick={this.deployContract.bind(this)} disabled={this.state.deployed}
                                        >
                                            {this.state.deployButtonText}
                                            {this.state.loadingIcon === true &&
                                                <LoopCircleLoading
                                                    height={'20px'}
                                                    width={'20px'}
                                                    color={'#ffffff'}
                                                />
                                            }
                                        </button>
                                    </div>
                                </div>)
                            }
                        }
                        )()}
                    </div>

                    <div className='spacerLine'></div>
                    {(this.state.confirmed === true) &&
                        <div>
                            <div className="LiProTitle03">Below is your Swap Provider smart contract address</div>
                            <div className="spContrlMBX spContrlMBX-n relative mt-30px-n">
                                <div className="d-flex step-title-trans-n items-center-n ">
                                    <span className="step-num-n">&#62;</span>
                                    <div className='spCountrlTitle01 spCountrlTitle01-n '>
                                        SEND  <span>{this.state.selectedTokenB} </span> {'<>'} RECEIVE <span>{this.state.selectedTokenA}</span>
                                        <div className='spContrlInfotxt mb-20px-n'>
                                            Created at {DateFormat(this.state.contractCreatedAt, "mmmm dS, yyyy, h:MM:ssTT")}
                                        </div>
                                    </div>
                                </div>
                                <span className="toggle-ic-n"><i class="fas fa-caret-up"></i></span>
                                <div className="box-border-primary-n box-border-n text-center-n">
                                    <div className="spContrlInfotxt02">Open new API and whitelist the smart contract address on your account on you CEX <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="left" data-pt-title="Before you set an API, make sure first that your account has active trade Futures (some CEX asking users to sign on risk disclosure before it become active)
                                    <br/><br/>
                                    Then go to the right API section to open new API and approve the follow restrictions:
                                    <br/><br/>
                                    1. Enable Reading<br/>
                                    2. Enable Spot & Margin Trading<br/>
                                    3. Enable Futures<br/>
                                    4. Enable Withdrawals<br/>
                                    <br/>
                                    * in order to enable withdrawals some CEX will ask you to restrict access to trusted IP, in that case use the IP address 44.235.252.39 " aria-hidden="true"></i></i></div>
                                    <div className="spContrlInfotxt02">Restrict access to trusted IP: <span className="text-primary"> 44.235.252.39</span></div>
                                </div>
                                <div className='spContrlInfotxt02 mb-20px-n'>YOUR SMART CONTRACT ADDRESS<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="To secure the API completely you need to whitelist your smart contract address under the Address Management which is usually placed on the Withdraw section.
                                <br/><br/>
                                Your smart contract address is your withdrawal Address.
                                <br/><br/>
                                Authorize your withdrawal Address to withdrawal only the token that you are selling. for example if you selling BNB, choose the BNB as a coin the and the BSC as the Network" aria-hidden="true"></i></i></div>
                                <div className='spContrlInputBX'>
                                    <input type="text"
                                        placeholder={"Your contract address for " + this.state.selectedTokenA}
                                        value={this.state.smartSwapContractAddress} 
                                        readOnly={true}
                                    />
                                    <a href="javascript:void(0)" onClick={() => this.copyText(this.state.smartSwapContractAddress)} class="LicCopyBTN v2"><i class="fas fa-copy"></i></a>
                                </div>
                                <div className='spContrlInfotxt mb-20px-n'>
                                    Balance: {this.state.spContractBal} {this.state.selectedTokenA} | ${this.state.spContractBalInUsd} USDT
                                    <button className='withdrawButton' onClick={this.withdraw.bind(this)}>
                                        <span>Withdraw all funds back to your Wallet</span>
                                    </button>
                                </div>
                                <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                    <div className="LiProfSbox01 w-100-n mb-20px-n">
                                        <div className="spContrlInfotxt02">YOUR TOTAL AMOUNT YOU AUTHORIZED THE API TO USE
                                        <i className="help-circle">
                                            <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="The total amount includes the amount that will be send to your smart contract, the stable coin amount that will be left on your CEX account and the funds that will be use to place short order when needed." aria-hidden="true">
                                            </i>
                                        </i>
                                        </div>
                                    </div>
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className="LiproInput01 withLable01" style={{ marginTop: "12px" }}>
                                            <span>$</span>
                                            <input
                                                type="text"
                                                placeholder="50000"
                                                defaultValue={this.state.amountA}
                                                onChange={event => this.checkAmountA(event.target.value)}
                                                ref={(input) => this.amountA = input}
                                            />
                                            <a href="javascript:void(0)" className="absolute-ic-n">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                        </div>
                                        <br></br> 
                                        {this.state.clientSideError == true && (this.state.clientSideErrorMessage.amountA !== null) &&
                                        <div className="error-Msg" style={smallError}>
                                            <label>{this.state.clientSideErrorMessage.amountA}</label>
                                        </div>
                                        }                                                                        
                                    </div>
                                </div>
                                <div className='spContrlInfotxt02'>AUTHORIZE NEW GAS AND FEES LIMIT<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." aria-hidden="true"></i></i></div>
                                <div className='spContrlSBX'>

                                    <div className='spContrlSSBX01'>
                                        <div className="dragorInput v2">
                                            <InputRange
                                                step={this.state.minStepForGasAndFeeAmount}
                                                maxValue={this.state.maxGasAndFeeAmount}
                                                minValue={this.state.minGasAndFeeAmount}
                                                value={this.state.gasAndFeeAmount}
                                                formatLabel={value => this.state.selectedTokenA + ` ${value}`}
                                                onChange={value => this.setState({ gasAndFeeAmount: value })} />
                                        </div>
                                    </div>
                                    <div className='spContrlSSBX02'>
                                        <button
                                            className='spContrlBTN01'
                                            onClick={this.reAuthrizeFeeAndGasLimit.bind(this)}
                                            disabled={this.state.reAuthrizeing}>
                                            AUTHORIZE NEW LIMIT
                                        </button>
                                    </div>
                                </div>

                                <div className='spContrlInfotxt02'>
                                    CHANGE THE MINIMUM SPREAD YOU WANT TO GAIN ON EACH SWAP
                                    <i className="help-circle">
                                        <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Set a profit limit that triggers your funds for swapping. Take under consideration all costs such as exchange fees. 
                                <br/><br/>
                                For example, you can choose that you want your funds to swap only if it's gain 0.5% profits. When you set the profit limit, take under consideration all the costs that you may pay to your CEX for such transaction short position, blockchain cost, (which by themselves can be range from 0.1 to 0.3% - depend on the CEX and network)." aria-hidden="true">
                                        </i>
                                    </i>
                                </div>
                                <div className='spContrlSBX mb-20px-n'>
                                    <div className='spContrlSSBX01'>
                                        <div className="dragorInput v2">
                                            <InputRange
                                                step={0.05}
                                                maxValue={1}
                                                minValue={0}
                                                value={this.state.spProfitPercent}
                                                formatLabel={value => `${Number(value).toFixed(2)}%`}
                                                onChange={value => this.setState({ spProfitPercent: value })} />
                                        </div>
                                    </div>
                                    <div className='spContrlSSBX02'>
                                        <button
                                            className='spContrlBTN01'
                                            onClick={this.reAuthrizeSpreadLimit.bind(this)}
                                            disabled={this.state.reAuthrizeing}>
                                            AUTHORIZE NEW SPREAD
                                        </button>
                                    </div>
                                </div>
                                <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                    <div className="LiProfSbox01 w-100-n mb-20px-n">
                                        <div className="spContrlInfotxt02">YOUR MINIMUM AMOUNT TO SWAP WITH
                                        <i className="help-circle">
                                            <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Take under consideration, performing a swap costs gas and fees which are reimbursed via SMART" aria-hidden="true">
                                            </i>
                                        </i>
                                    </div>
                                    </div>
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className="LiproInput01 withLable01 input-with-ic-n"  style={{ marginTop: "12px" }}>
                                            <span>$</span>
                                            <input
                                                type="text"
                                                placeholder="100"
                                                defaultValue={this.state.accumulateFundsLimit}                                            
                                                onChange={event => this.setState({ accumulateFundsLimit: event.target.value })}
                                                ref={(input) => this.accumulateFundsLimit = input}
                                            />
                                            <a href="javascript:void(0)" className="absolute-ic-n">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                    <div className="LiProfSbox01 w-100-n mb-20px-n">
                                        <div className="spContrlInfotxt02">STOP REPEAT ON CEX 
                                            <i className="help-circle">
                                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how many transactions you approve as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stops, there is no way to change the process besides deploying a new Swap Provider contract with new rules." aria-hidden="true">                                    
                                                </i>
                                            </i>
                                        </div>
                                    </div>
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className="LiproInput01 input-with-ic-n">
                                            <input
                                                type="text"
                                                placeholder=""
                                                defaultValue={
                                                    this.state.stopRepeatsMode == 3 ? 'Never stop' 
                                                    : this.state.stopRepeatsMode == 1 ? "On date: " + DateFormat(this.state.stopRepeatsOnDate, "mmmm dS, yyyy, h:MM:ssTT")
                                                    : 'After ' + this.state.stopRepeatsAfterCalls + ' repeats'}
                                                //onChange={event => this.setState({ cexApiKey: event.target.value })}
                                                //ref={(input) => this.cexApiKey = input}
                                            />
                                            <a href="javascript:void(0)" className="absolute-ic-n">
                                                <i class="fas fa-edit" onClick={() => this.toggleStopRepeatsSection()}></i>
                                            </a>
                                        </div>
                                        <br></br>
                                        {this.state.errorMessage !== null && this.state.errorMessage.includes("cexApiKey") &&
                                            <div className="error-Msg" style={smallError}>
                                                <label>{this.state.errorMessage}</label>
                                            </div>
                                        }
                                    </div>
                                    {(this.state.toggleStopRepeatsSection) &&
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className='LipRadioFix01'>
                                            <div className="md-radio md-radio-inline">
                                                <input
                                                    type="radio"
                                                    id="s01"
                                                    name="s11"
                                                    value="s01"
                                                    onChange={event => this.setState({ stopRepeatsMode: 1 })}
                                                    checked={this.state.stopRepeatsMode === 1}
                                                    ref={(input) => this.stopRepeatsMode1 = input}
                                                />
                                                <label htmlFor="s01"></label>
                                            </div>
                                            <div className='LiProFlexBX01 padFixer01'>
                                                <div className="LiproInput01">
                                                    <DatePicker
                                                        selected={this.state.stopRepeatsOnDate}
                                                        onChange={(date) => this.setState({ stopRepeatsOnDate: date })}
                                                        peekNextMonth
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        dateFormat="dd/MM/yyyy"
                                                        ref={(input) => this.stopRepeatsOnDate = input}
                                                    />
                                                    <i class="fas fa-calendar-alt FlyICO"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='LipRadioFix01' >
                                            <div className="md-radio md-radio-inline ">
                                                <input
                                                    type="radio"
                                                    id="s02"
                                                    name="s11"
                                                    value="s02"
                                                    onChange={event => this.setState({ stopRepeatsMode: 2 })}
                                                    checked={this.state.stopRepeatsMode === 2}
                                                    ref={(input) => this.stopRepeatsMode2 = input}
                                                />
                                                <label htmlFor="s02"></label>
                                            </div>
                                            <div className="LiProFlexBX01 padFixer01">
                                                <div className="LiproInput01 withLable02">
                                                    <input
                                                        type="text"
                                                        value={this.state.stopRepeatsAfterCalls}
                                                        onChange={event => this.setState({ stopRepeatsAfterCalls: event.target.value })}
                                                        ref={(input) => this.stopRepeatsAfterCalls = input}
                                                    />
                                                    {/* <div className="FlyICO02">Days</div> */}
                                                    <span>Repeats</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='LipRadioFix01' >
                                            <div className="md-radio md-radio-inline ">
                                                <input
                                                    type="radio"
                                                    id="s03"
                                                    name="s11"
                                                    value="s03"
                                                    onChange={event => this.setState({ stopRepeatsMode: 3 })}
                                                    checked={this.state.stopRepeatsMode === 3}
                                                    ref={(input) => this.stopRepeatsMode3 = input}
                                                />
                                                <label htmlFor="s03"></label>
                                            </div>
                                            <div className="LiProFlexBX01 padFixer01">
                                                <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account." aria-hidden="true"></i></i></div>
                                            </div>
                                        </div>
                                    </div>                                    
                                    }
                                </div>
                                <div className='spContrlInfotxt02'>CHANGE THE SWAP SPEED
                                    <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="right" data-pt-title="The Smart swap using a matcher to match between users to users and if there are no users available, between users to swap providers (SP). the matcher taking under consideration, which SP can complete the swap fully, faster and cheaper. 
                                <br/><br/>
                                SP can hold stable coin (USDT) on their controlled CEX account, which will be trigger by API to buy in real time tokens and send over to the SP's smarts contact which will be  use as a counterparty to other users. same exchange processing withdraw after few long minutes and also each blockchain network as different proccing speed, those facts can put some SP with holding upfront tokens on their smart contract with advantage over other SP that requires to buy those tokens and then send them over.
                                <br/><br/>
                                As a SP you can choose if you want to send tokens to your smart contract in real time, or if you want to act faster by depositing tokens upfront to to your smart contract." aria-hidden="true"></i></i>                                
                                </div>
                                <div className='spscFix01 d-flex'>
                                    <div className="LiProfSbox01 pr-20px">
                                        <div className='LipRadioFix01'>
                                            <div className="md-radio md-radio-inline ">
                                                <input
                                                    type="radio"
                                                    id="spS03"
                                                    name="s003"
                                                    //defaultChecked
                                                    onChange={() => { this.updateSwapSpeedMode('UPFRONT'); }}
                                                    checked={this.state.swapSpeedMode === 'UPFRONT'}
                                                    ref={(input) => this.swapSpeedMode3 = input}
                                                />
                                                <label htmlFor="spS03"></label>
                                            </div>
                                            <div className="LiProFlexBX01 padFixer01">
                                                <div className="LipRTitle01">Deposit token A to the smart contract upfront<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="right" data-pt-title="This option required from you hold upfront 45% of the sell token in the smart contract, and another 55% as stable coin (USDT) on your centralized account (that 55% will be used to buy the sell tokens in real time and placing a short order against the receiving token to secure it's face value from volatility).
                                    <br/><br/>
                                    Once you will deploy your smart contract, you will need to deposit directly to your smart contract address the 45% the funds as tokens that you want to sell. 
                                    <br/><br/>
                                    For example if you want to and you are looking to gain profit of 0.05% as a spread. in exchange for ETH and you are looking to gain profit of 0.05% as a spread, you will need to deposit $45,000 of BNB to your smart contract, so users that buying those BNB will get those tokens instantly without waiting for your centralized account to send it over to the smart contract (which can takes few long minutes). Wen swaps take place your CEX account will be trigger to buy in real time new BNB at the best price in the exchange and then send them to feed back your smart contract, while on the same time the smartswap will send to your CEX account $45,225 of ETH (which is the same amount plus the spread that you agree to), then the API will open a short position to make sure those ETH will be sold back to stablecoins without any lost to volatility." aria-hidden="true"></i></i></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="LiProfSbox02 pl-20px">
                                        <div className='LipRadioFix01' >
                                            <div className="md-radio md-radio-inline ">
                                                <input
                                                    type="radio"
                                                    id="spS04"
                                                    name="s004"
                                                    //defaultChecked
                                                    onChange={() => { this.updateSwapSpeedMode('REALTIME'); }}
                                                    checked={this.state.swapSpeedMode === 'REALTIME'}
                                                    ref={(input) => this.swapSpeedMode4 = input}
                                                    disabled="true"
                                                />
                                                <label htmlFor="spS04"></label>
                                            </div>
                                            <div className="LiProFlexBX01 padFixer01">
                                                <div className="LipRTitle01">
                                                    Deposit token A to the smart contract in real time
                                                    <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Selecting this option allows zero up front tokens and 100% of your funds may wait as stablecoins (USDT) on your centralized exchange account. Once your account is triggered to provide liquidity to SmartSwap, the controlled account uses the authorized stablecoin account to buy the tokens and send them to your smart contract address.
                                    <br/><br/>
                                    N.B. The process to send tokens from centralized  exchange accounts to your smart contract may take few minutes depending on the exchange and the speed of network. Therefore, the SmartSwap may choose other SPs over you which have tokens available on their smart contract already and can execute the swap faster for the end user." aria-hidden="true"></i></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="spacerLine"></div>
                                <div className="spContrlInfotxt02 mb-30px-n pt-20px">After creating an API on your CEX update here the API and Secret key</div>
                                <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                    <div className="LiProfSbox01 w-100-n mb-20px-n">
                                        <div className="spContrlInfotxt02">API Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific API key to the CEX of your choice" aria-hidden="true"></i></i></div>
                                    </div>
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className="LiproInput01">
                                            <input
                                                type="text"
                                                defaultValue={this.state.cexApiKeyMasked !== null ? this.state.cexApiKeyMasked : 'Your Cex API Key'}
                                                onChange={event => this.setState({ cexApiKey: event.target.value})}
                                                ref={(input) => this.cexApiKey = input}
                                                readOnly={this.state.cexApiKeyEditable}
                                            />
                                            <a href="javascript:void(0)" className="absolute-ic-n">
                                                <i class="fas fa-times" onClick={() => this.clearKeys('key')}></i>
                                            </a>
                                        </div>
                                        <br></br>
                                        {this.state.errorMessage !== null && this.state.errorMessage.includes("cexApiKey") &&
                                            <div className="error-Msg" style={smallError}>
                                                <label>{this.state.errorMessage}</label>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className='LiProFlexBX01 smFixer07 d-block-n '>
                                    <div className="LiProfSbox01 w-100-n mb-20px-n">
                                        <div className="spContrlInfotxt02">Secret Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific Secret Key to the CEX of your choice" aria-hidden="true"></i></i></div>
                                    </div>
                                    <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                        <div className="LiproInput01">
                                            <input
                                                type="text"
                                                defaultValue={this.state.cexApiSecretMasked !== null ? this.state.cexApiSecretMasked : 'Your Cex API Secret'}
                                                onChange={event => this.setState({ cexApiSecret: event.target.value})}
                                                ref={(input) => this.cexApiSecret = input}
                                                readOnly={this.state.cexApiSecretEditable}
                                            />
                                            <a href="javascript:void(0)" onClick={() => this.clearKeys('secret')} className="absolute-ic-n">
                                                <i class="fas fa-times"></i>
                                            </a>                                             
                                        </div>
                                        <br></br>
                                        {this.state.errorMessage !== null && this.state.errorMessage.includes("cexApiSecret") &&
                                            <div className="error-Msg" style={smallError}>
                                                <label>{this.state.errorMessage}</label>
                                            </div>
                                        }
                                    </div>
                                </div>


                                {(() => {
                                    if (
                                        (this.state.web3 !== null || constantConfig.tokenDetails[this.state.selectedTokenA].networkId === web3Config.getNetworkId())
                                        && this.state.isActiveContractExist === true) {
                                        return (
                                            <div className="LiProfSbox03">
                                                <div className={this.state.updated ? 'LiProformBTNbar mx-100 mb-30px-n btn-dark' : 'LiProformBTNbar mx-100 mb-30px-n'}>

                                                    <button onClick={() => this.updateContract()} disabled={this.state.updating || this.state.updated}>
                                                        {(this.state.updated) &&
                                                            <i className="fa fa-check" aria-hidden="true"></i>
                                                        }
                                                        &nbsp;
                                                        {this.state.updateButtonText}
                                                        {this.state.loadingIcon === true &&
                                                            <LoopCircleLoading
                                                                height={'20px'}
                                                                width={'20px'}
                                                                color={'#ffffff'}
                                                            />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    }
                                }
                                )()}

                               
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.contractOwnerCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check contract deployed for wallet address {this.state.spAccount !== null ? this.state.spAccount : '' }
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>                                
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.contractGasAndFeeCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check contract gas & fee set at limit {this.state.gasAndFeeAmount !== null ? this.state.gasAndFeeAmount : '' }
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>                                
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.spProfitPercentCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check contract spread at {this.state.spProfitPercent !== null ? this.state.spProfitPercent + '%' : '' }
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceApiKeysCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check CEX API key & API Secret set
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceApiValidateCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check CEX Valid API key and secret
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceAccountCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check enabled trading on CEX
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceBalanceCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check account balance on CEX for allowed limit
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceTransferCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Test moving USDT funds between spot and future account on CEX
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceSpAddressWhiteListCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check whitelisted smart contract address on CEX for withdraw
                                    </div>
                                </div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceIpWhiteListCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check IP whitelisted on CEX for withdraw
                                    </div>
                                </div>                                
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceWithdrawEnabledCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Check enabled withdraw on CEX
                                    </div>
                                </div>                                                                
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.tests !== null && this.state.tests.binanceWithdrawCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;Test moving fund between spot and swap provider contract address
                                    </div>
                                </div>
                                <div className='spacerLine'></div>
                                <div className='LiProFlexBX01'>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <i className={this.state.testPassed == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                        &nbsp;{this.state.testPassed == true ? 'Swap provider has been successfully activated.' : 'You must pass all the tests to become an active swap provider.'}
                                    </div>
                                    <div className='spContrlInfotxt02 test-suite'>
                                        <button className='repeatTestsButton' disabled={this.state.testPassed} onClick={this.repeatTests.bind(this)}>
                                            <span>Repeat the SP checking</span>
                                        </button>
                                    </div>                                    
                                </div>    
                            </div>
                        </div>
                    }
                </div>
                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("LiquidityProvider") }} className="close-Icon"></a>
            </div>
        )

    }

}