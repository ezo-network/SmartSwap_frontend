import React, {Component} from "react";
import ActiveContract from "./ActiveContract";
import Web3 from 'web3';
import Collapse from "@kunukn/react-collapse";
import InputRange from 'react-input-range';
import DatePicker from "react-datepicker";
import { LoopCircleLoading } from 'react-loadingg';
import AxiosRequest from "../../helper/axiosRequest";
import { tokenDetails } from "../../config/constantConfig";
import constantConfig from '../../config/constantConfig';
import web3Config from "../../config/web3Config";
import notificationConfig from '../../config/notificationConfig';
import SwapFactoryContractPairWise from '../../helper/swapFactoryContractPairWise';
var _ = require('lodash');


export default class SpContractDeployForm extends Component {
    constructor(props) {
        super();
        this.state = {
            web3: null,
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
            maxGasAndFeeAmount: 100,
            minStepForGasAndFeeAmount: 0,
            swapSpeedMode: 'UPFRONT',
            withdrawPercent: 45,
            spreadAmount: 100,
            spProfitPercent: 0.5,
            accumulateFundsLimit: 100,
            stopRepeatsMode: 3,
            stopRepeatsOnDate: new Date(),
            stopRepeatsAfterCalls: 200,
            withdrawMode: 3,
            withdrawOnDate: new Date(),
            withdrawAfterCalls: 250,            
            txid: null,
            smartSwapContractAddress: 'Deploy contract to get this address.',
            confirmed: false,
            deployed: false,
            deployButtonText: "DEPLOY SMART CONTRACT",
            loadingIcon: false,
            serverError: null,
            errorMessage: null,
            clientSideError: false,
            clientSideErrorMessage: {
                spProfitPercent: null,
                amountA: null,
                spProfitPercentOnContract: null,
                amountAOnContract: null
            },
            spData: []
        }
    }

    componentWillReceiveProps(newProps) {
        if (typeof window.ethereum !== 'undefined') {
            // detect Network account change
            window.ethereum.on('chainChanged', networkId => {
                console.log('chainChanged', networkId);
                this.setState({
                    web3: null,
                    confirmed: false,
                    spData: null
                });
    
                this.connectWallet();
            });
    
            window.ethereum.on('accountsChanged', accounts => {
                console.log('account Changed');
                this.setState({
                    web3: null,
                    confirmed: false,
                    spData: null                                    
                });
                // on account change currently disconnecting wallet so we can again check active contract on wallet connect 
    
                this.connectWallet();
            });
        }
    }

    componentDidMount() {
        this.setState({
            loading: true,
            tokenA: this.state.coinList[this.state.selectedTokenA]['address'],
            tokenB: this.state.coinList[this.state.selectedTokenB]['address']
        });

        this.setGasFeeAndAmountMinMaxRanges('ETH');
    }

    toggle = index => {
        let collapse = "isOpen" + index;
        this.setState(prevState => ({
            [collapse]: !prevState[collapse]
        }));
        //this.toggleActiveContractSection();
    };

    changeTokenA(token) {
        this.setState({
            selectedTokenA: token,
            tokenA: this.state.coinList[token]['address'],
            networkId: web3Config.getNetworkId(),
            spAccount: web3Config.getAddress(),
            isOpen1: false
        });
        this.setGasFeeAndAmountMinMaxRanges(token);
        //notificationConfig.info('Token reset. Please set Gas and Fee again.');
    };

    changeTokenB(token) {
        this.setState({
            selectedTokenB: token,
            tokenB: this.state.coinList[token]['address'],
            isOpen2: false
        });
    };

    getAlternateToken(token){
        let tokensList = Object.assign({}, this.state.coinList);
        delete tokensList[token];
        return Object.entries(tokensList)[0];
    }

    checkAmountA(value, minValue){
        var clientSideErrorMessage;
        if(Number(value) < minValue){        
            this.setState({
                clientSideError: true
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountA = `Minimum amount is $${minValue}`;
            this.setState({clientSideErrorMessage});
            //notificationConfig.success(`Test ${testType} fetched`);
            return;
        } else {
            this.setState({
                amountA: Number(value)
            });

            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountA = null;
            this.setState({clientSideErrorMessage});
        }
        
        this.clientSideError();
    }

    changeSpread(value, minSpreadRange, maxSpreadRange) {
        var clientSideErrorMessage;
        if(Number(value) > maxSpreadRange || Number(value) < minSpreadRange){            
            this.setState({
                clientSideError: true
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercent = `Please provide a valid input between ${minSpreadRange}-${maxSpreadRange} range`;
            this.setState({clientSideErrorMessage});
            return;
        } else {
            this.setState({
                spProfitPercent: Number(value)
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercent = null;
            this.setState({clientSideErrorMessage});
        }

        this.clientSideError();
    };

    setGasFeeAndAmountMinMaxRanges(selectedToken) {
        let token = this.state.coinList[(selectedToken).toUpperCase()];
        this.setState({
            minGasAndFeeAmount: token.minGasAndFeeAmount,
            gasAndFeeAmount: token.gasAndFeeAmount,
            maxGasAndFeeAmount: token.maxGasAndFeeAmount,
            minStepForGasAndFeeAmount: token.minStepForGasAndFeeAmount
        });
    }

    validateWithdrawOnContractFromCexSlider(maxWithdrawPercent){
        if(this.state.withdrawPercent > maxWithdrawPercent){
            notificationConfig.error('You must keep balance on your CEX account at least 55% of the total amount');
            this.setState({
                withdrawPercent: maxWithdrawPercent
            });
            return false;
        }
        return true;
    };

    clientSideError(){
        let check  = !Object.values(this.state.clientSideErrorMessage).every(o => o === null);

        console.log({
            error: check
        });

        if(check){
            this.setState({
                clientSideError: true
            });
        } else {
            this.setState({
                clientSideError: false
            });            
        }
        return check;
    };

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
            notificationConfig.error('Please Select Ethereum, BSC or Polygon Network');
            this.setState({ btnClick: false });
            return;
        }

        let token = _.find(this.state.coinList, { "networkId": Number(networkId) });
        let selectedTokenA = _.find(this.state.coinList, { 
            "symbol": (this.state.selectedTokenA).toString().toUpperCase() 
        });

        if(networkId !== Number(selectedTokenA.networkId)){
            notificationConfig.error(`Please connect wallet to ${selectedTokenA.networkName} network or switch token A to active network.`);
            return;
        }

        if(token){
            //this.changeTokenA(token.symbol); // enable if connect wallet button autometic switch to active network
            //this.setGasFeeAndAmountMinMaxRanges(token.symbol); // if above condition true then we need to enable this to reset gas fee slider token and amount
            let alternateToken = this.getAlternateToken(token.symbol);
            this.changeTokenB(alternateToken[0]);
            this.setState({
                web3: web3Config.getWeb3(),
                btnClick: false,
                networkId: networkId,
                spAccount: web3Config.getAddress(),
                spData: null
            });
    
            await this.getActiveContracts();
        }

    }


    async deployContract(event) {

        let allowedNetworks = constantConfig.allowedNetwork;

        if(!Web3.utils.isAddress(this.state.walletAddressToSend)){
            notificationConfig.error('Please provide a valid wallet address that send token A');
            return;
        }

        if(!Web3.utils.isAddress(this.state.walletAddressToReceive)){
            notificationConfig.error('Please provide a valid wallet address that receive token B');
            return;
        }

        if(this.state.tokenA === this.state.tokenB){
            notificationConfig.error("Token A and Token B can't be the same");
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

        let validationPass = await this.validateWithdrawOnContractFromCexSlider(this.props.maxWithdrawPercent);
        if(validationPass === false){
            return;
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
        if (Number(this.state.stopRepeatsMode) === 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                stopRepeatsOnDate: this.state.stopRepeatsOnDate,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.stopRepeatsMode) === 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: this.state.stopRepeatsAfterCalls
            });
        }

        if (Number(this.state.stopRepeatsMode) === 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.withdrawMode) === 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                withdrawOnDate: this.state.withdrawOnDate,
                withdrawAfterCalls: null
            });
        }

        if (Number(this.state.withdrawMode) === 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                withdrawOnDate: null,
                withdrawAfterCalls: this.state.withdrawAfterCalls
            });
        }

        if (Number(this.state.withdrawMode) === 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                withdrawOnDate: null,
                withdrawAfterCalls: null
            });
        }

        const tokenA = _.find(this.state.coinList, { "address": this.state.tokenA });
        const tokenB = _.find(this.state.coinList, { "address": this.state.tokenB });

        let finalArgs = {
            data: Object.assign(args, {
                spAccount: web3Config.getAddress(),
                networkId: web3Config.getNetworkId(),
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
                withdrawPercent: this.state.withdrawPercent
            }),
            path: 'become-swap-provider',
            method: 'POST'
        };

        console.log(finalArgs)

        try {
            let response = await AxiosRequest.request(finalArgs);
            console.log(response);
            if (response.status === 201) {
                console.log('record created!');
                let swapFactory = new SwapFactoryContractPairWise(this.state.web3, tokenA.symbol, tokenB.symbol, 'LiquidityProvider');
                swapFactory.addSwapProvider(
                    response.data.tokenA.address,
                    response.data.tokenB.address,
                    response.data.walletAddresses.toSend,
                    response.data.walletAddresses.toReceive,
                    Web3.utils.fromWei((response.data.gasAndFeeAmount.$numberDecimal).toString(), 'ether'),
                    async (hash) => {
                        if(hash !== null || hash !== undefined){
                            // update tx hash to db
                            let args = {
                                data: {
                                    docId: response.data._id,
                                    txid: hash
                                },
                                path: 'update-tx-hash',
                                method: 'POST'
                            }
                            response = await AxiosRequest.request(args);
                            console.log(response);
                        }
                    },
                    async (response) => {
                        console.log({
                            "Contract response:": response
                        });
                        if(response.code === 4001){
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
                            const newSpContactAddress = response.logs[0].address;
                            // get deployment status
                            await this.getContractDepolymentStatus(newSpContactAddress);
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
                notificationConfig.error(response.data.errorMessage.error);
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

    async getActiveContracts() {

        this.setState({
            deployed: true,
            deployButtonText: 'Getting active contract'
        });

        let args = {
            data: {
                spAccount: web3Config.getAddress(),
                networkId: web3Config.getNetworkId()
            },
            path: 'active-contracts',
            method: 'POST'
        }

        try {
            let response = await AxiosRequest.request(args);
            if (response.status === 200) {

                const isactiveContractExist = response.data.find(obj => {
                    if ((obj.networkId === web3Config.getNetworkId()) && ((web3Config.getAddress()).toLowerCase() === obj.walletAddresses.spAccount)) {
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
                        deployed: false,
                        deployButtonText: 'DEPLOY SMART CONTRACT'
                    });
                    return true;
                } else {
                    this.setState({
                        deployed: false,
                        deployButtonText: 'DEPLOY SMART CONTRACT'
                    });
                    notificationConfig.error('No active contract for the selected network.');
                    return false;
                }
            } else if (response.status === 404) {
                this.setState({
                    deployed: false,
                    deployButtonText: 'DEPLOY SMART CONTRACT'
                });
                notificationConfig.error('No active contract.');
                return false;
            } else {
                console.log(response);
            }

        } catch (error) {
            this.setState({
                web3: null,
                deployed: false,
                deployButtonText: 'CONNECT YOUR WALLET'
            });
            notificationConfig.error('Failed to connect to server.');
        }
    }


    async getContractDepolymentStatus(smartContractAddress){
        let args = {
            data: {
                spAccount: this.state.spAccount,
                networkId: web3Config.getNetworkId(),
                smartContractAddress: smartContractAddress,
                tokenA: this.state.tokenA,
                tokenB: this.state.tokenB
            },
            path: 'get-contract-status',
            method: 'POST'
        }

        var networkPromise = await AxiosRequest.request(args);
        var timeOutPromise = new Promise(function(resolve, reject) {
            setTimeout(resolve, 5000, 'Timeout Done');
        });
        Promise.all(
        [networkPromise, timeOutPromise]).then(async(responses) => {
            if(responses[0].data === true){
                await this.getActiveContracts();
                this.setState({
                    smartSwapContractAddress: (smartContractAddress).toLowerCase(),
                    confirmed: true,
                    deployButtonText: "Contract Deployed",
                    loadingIcon: false,
                    isActiveContractExist: true
                });
                notificationConfig.success('Swap provider Added');
            } else {
                await this.getContractDepolymentStatus(smartContractAddress);
            }
        });
    }
    


    render() {

        const smallError = {
            fontSize: "13px",
            lineHeight: "20px"
        };

        return (
            <>
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
                                                    this.state.selectedTokenB !== this.state.coinList[coin]['symbol'] &&
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
                                            (this.state.selectedTokenA !== this.state.coinList[coin]['symbol']) &&
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
                        <div className="LiProLable d-flex">Choose the total amount you are authorizing the API<br></br> to use
                            <i className="help-circle">
                                <i 
                                    className="fas fa-question-circle protip" 
                                    data-pt-position="top" 
                                    data-pt-title="The total amount includes the amount that will be send to your smart contract, the stable coin amount that will be left on your CEX account and the funds that will be use to place short order when needed." 
                                    aria-hidden="true"
                                ></i>
                            </i>
                        </div>
                    </div>
                    <div className="LiProfSbox02">
                        <div className="LiproInput01 withLable01" style={{ marginTop: "12px" }}>
                            <span>$</span>
                            <input
                                type="text"
                                defaultValue=''
                                placeholder="50000"
                                onChange={event => this.checkAmountA(event.target.value, this.props.minAmountA)}
                                ref={(input) => this.amountA = input}
                            />
                        </div>
                        <br></br>
                        {this.state.errorMessage !== null && this.state.errorMessage.includes("amountA") &&
                            <div className="error-Msg" style={smallError}>
                                <label>{this.state.errorMessage}</label>
                            </div>
                        }
                        {this.state.clientSideError === true && (this.state.clientSideErrorMessage.amountA !== null) &&
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
                                    onChange={event => this.setState({ swapSpeedMode: 'UPFRONT' })}
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
                                    onChange={event => this.setState({ swapSpeedMode: 'UPFRONT' })}
                                    checked={this.state.swapSpeedMode === 'REALTIME'}
                                    ref={(input) => this.swapSpeedMode2 = input}
                                    disabled={true}
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
                    <div className="LiProfSbox03 withdrawSlider">
                        {/* withdraw % slider */}
                        <div className="dragorInput v2">
                            <InputRange
                                step={1}
                                maxValue={100}
                                minValue={0}
                                value={this.state.withdrawPercent}
                                formatLabel={value => `${value}%`}
                                onChange={value => this.setState({ withdrawPercent: value })}
                                onChangeComplete={() => this.validateWithdrawOnContractFromCexSlider(this.props.maxWithdrawPercent)}
                            />
                        </div>
                        <p className="withdrawOnContractAlert">
                        You must keep balance on your CEX account at least 55% of the total amount
                        </p>                        
                    </div>

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
                                    onChange={event => this.changeSpread(event.target.value, this.props.minSpreadRange, this.props.maxSpreadRange)}
                                    ref={(input) => this.spProfitPercent = input}
                                    min={this.props.minSpreadRange}
                                    max={this.props.maxSpreadRange}
                                />
                                <span>%</span>
                            </div>
                            <br></br>
                            {this.state.errorMessage !== null && this.state.errorMessage.includes("spProfitPercent") &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.errorMessage}</label>
                                </div>
                            }
                            {this.state.clientSideError === true && (this.state.clientSideErrorMessage.spProfitPercent !== null) &&
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
                                        name="s12"
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
                                        name="s13"
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

                    {/* <div className='spacerLine'></div>
                    {this.state.serverError !== null &&
                        <div className="error-Msg" style={{display: 'none;'}}>
                            <label>{this.state.serverError}</label>
                        </div>
                    } */}
                </div>
                <div className='spacerLine'></div>
                {
                    ((this.state.confirmed === true) && (this.state.spData !== null) && (this.state.spData.length > 0)) &&
                    <>
                        <div className="LiProTitle03">Below is your Swap Provider smart contract address</div>
                        {this.state.spData.map((data, index) => {
                            return <ActiveContract 
                                key={index}
                                index={index+1}
                                contractData={data}
                                coinList={this.state.coinList}
                                stepOpen={true}
                                web3={this.state.web3}
                                tokenPrices={this.props.tokenPrices}
                                minAmountA={this.props.minAmountA}
                                maxWithdrawPercent={this.props.maxWithdrawPercent}
                                sandboxMode={this.props.sandboxMode}
                            />
                        })}
                    </>
                }
            </>         
        )
    }
};
