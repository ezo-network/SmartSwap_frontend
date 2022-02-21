import React, {Component} from "react";
import notificationConfig from '../../config/notificationConfig';
import SPContract from '../../helper/spContract';
import AxiosRequest from "../../helper/axiosRequest";
import DateFormat from "dateformat";
import DatePicker from "react-datepicker";
import InputRange from 'react-input-range';
import Web3 from 'web3';
import constantConfig from '../../config/constantConfig';
import { LoopCircleLoading } from 'react-loadingg';
import web3Config from "../../config/web3Config";

var _ = require('lodash');

export default class ActiveContract extends Component {
    _isMounted = false;
    constructor(props) {
        super();

        let gasAndFeeAmount = Web3.utils.fromWei((props.contractData.gasAndFeeAmount.$numberDecimal).toString(), 'ether');

        let stopRepeatsOnDateOnContract = null, stopRepeatsAfterCallsOnContract = null, cexApiKeyMasked = null, cexApiSecretMasked = null, spContractBalInUsd = 0;

        if(props.contractData.stopRepeats.mode === 1){
            let toDate = new Date(props.contractData.stopRepeats.onDate);
            stopRepeatsOnDateOnContract = toDate;
        }

        if(props.contractData.stopRepeats.mode === 2){
            stopRepeatsAfterCallsOnContract = props.contractData.stopRepeats.afterCalls;
        }

        if(props.contractData.cexData.key !== null){
            cexApiKeyMasked = this.inputMask('key', props.contractData.cexData.key, false);
        }
        
        if(props.contractData.cexData.secret !== null){
            cexApiSecretMasked = this.inputMask('secret', props.contractData.cexData.secret, false);
        }

        if(props.sandboxMode === true){
            spContractBalInUsd = props.contractData.totalWithdrawnAmount.$numberDecimal;
        }

        this.state = {
            web3: props.web3,
            coinList: props.coinList,
            spContractBal: 0,
            spContractBalInUsd: spContractBalInUsd,
            tokenPrices: props.tokenPrices,

            // contract data
            spAccount: web3Config.getAddress(),
            tokenA: props.contractData.tokenA.address,
            tokenB: props.contractData.tokenB.address,
            networkIdOnContract: Number(props.contractData.networkId),
            gasAndFeeAmountOnContract: Number(gasAndFeeAmount),
            minGasAndFeeAmountOnContractSide: 0,
            maxGasAndFeeAmountOnContractSide: 0,
            minStepForGasAndFeeAmountOnContractSide: 0,
            spProfitPercentOnContract: props.contractData.spProfitPercent,
            createdAt: props.contractData.createdAt,
            amountAOnContract: props.contractData.totalAmount.$numberDecimal,
            tempAmountAOnContract: props.contractData.totalAmount.$numberDecimal,
            accumulateFundsLimitOnContract: props.contractData.accumulateFundsLimit,
            stopRepeatsModeOnContract: props.contractData.stopRepeats.mode,
            stopRepeatsOnDateOnContract: stopRepeatsOnDateOnContract,
            stopRepeatsAfterCallsOnContract: stopRepeatsAfterCallsOnContract,
            cexApiKey: props.contractData.cexData.key,
            cexApiSecret: props.contractData.cexData.secret,
            cexApiKeyMasked: cexApiKeyMasked,
            cexApiSecretMasked: cexApiSecretMasked,
            cexApiKeyEditable: true,
            cexApiSecretEditable: true,
            swapSpeedModeOnContract: props.contractData.swapSpeedMode,
            withdrawPercentOnContract: props.contractData.withdrawPercent,
            tempWithdrawPercentOnContract: props.contractData.withdrawPercent,
            spContractAddress: props.contractData.smartContractAddress,

            // error messages
            clientSideError: false,
            clientSideErrorMessage: {
                spProfitPercentOnContract: null,
                amountAOnContract: null
            },
            errorMessage: null,

            // effects
            stepOpen: props.stepOpen,
            reAuthrizeing: false,
            toggleStopRepeatsSection: false,
            updating: false,
            updated: false,
            updateButtonText: "SAVE TO UPDATE CONTRACT",
            loadingIcon: false,

            // tests vars
            tests: null,
            testPassed: false,
            testing: false,            
        }
    }

    componentWillReceiveProps(newProps) {
        if (typeof window.ethereum !== 'undefined') {
            // detect Network account change
            window.ethereum.on('chainChanged', networkId => {
                console.log('chainChanged', networkId);
                this.setState({
                    web3: null,
                    spAccount: null,
                    tests: null,
                    testPassed: false
                });
            });
    
            window.ethereum.on('accountsChanged', accounts => {
                console.log('account Changed');
                this.setState({
                    web3: null,
                    spAccount: null,
                    tests: null,
                    testPassed: false
                });
                // on account change currently disconnecting wallet so we can again check active contract on wallet connect 
            });
        }       
    }
    
    componentDidMount() {
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.sandboxMode === false){
                this.getContractBal();
            }
            this.getAllTests();
        }
    }

    getTokenData(tokenAddress, key) {
        if(tokenAddress !== null){
            let token = _.find(this.state.coinList, { "address": tokenAddress });
            //console.log(token);
            if(token !== null){
                return token[key];
            }
        }
    };

    toggleStep(){
        const currentState = this.state.stepOpen;
        this.setState({
            stepOpen: !currentState
        });
    }

    copyText(entryText){
        navigator.clipboard.writeText(entryText);
        notificationConfig.success('Address copied.make sure to cross check');
    }

    getContractBal = async () => {
        const rpcUrl = constantConfig[Number(this.state.networkIdOnContract)].rpcUrl;
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        const address = this.state.spContractAddress;
        const spBal =  await web3.eth.getBalance(Web3.utils.toChecksumAddress(address), function (error, result) {
            return result;
        });
        let token = _.find(this.state.coinList, { "networkId": Number(this.state.networkIdOnContract) });
        const usdtFaceValue = this.state.tokenPrices[token.symbol];

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
        var zeroDigit = new BN(0);
        let spContract = new SPContract(this.state.web3, this.state.spContractAddress);
        let assetAddress = this.state.tokenA;
        let amount = Web3.utils.toWei((this.state.spContractBal).toString(), 'ether');
        amount = new BN((amount).toString());
        
        let validAddresses = [
            "0x0000000000000000000000000000000000000001", 
            "0x0000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000004",            
        ];

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
        
                        if(response.code === 4001){
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

    checkAmountAOnUpdating(value, minValue){
        var clientSideErrorMessage;
        if(Number(value) < minValue){
            this.setState({
                clientSideError: true
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountAOnContract = `Minimum amount is $${minValue}`;
            this.setState({clientSideErrorMessage});
            //notificationConfig.success(`Test ${testType} fetched`);
            return;
        } else {
            this.setState({
                amountAOnContract: Number(value)
            });

            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.amountAOnContract = null;
            this.setState({clientSideErrorMessage});
        }      
        
        this.clientSideError();
    }    

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
    }  

    validateWithdrawOnContractFromCexSlider = async(onContract = false, maxWithdrawPercent) => {
        if(onContract === true){
            if(this.state.withdrawPercentOnContract > Number(maxWithdrawPercent)){
                notificationConfig.error(`You must keep balance on your CEX account at least ${100 - maxWithdrawPercent}% of the total amount`);
                this.setState({
                    withdrawPercentOnContract: this.state.tempWithdrawPercentOnContract
                });            
                return false;
            }
        } else {
            if(this.state.withdrawPercent > Number(maxWithdrawPercent)){
                notificationConfig.error('You must keep balance on your CEX account at least 55% of the total amount');
                this.setState({
                    withdrawPercent: Number(maxWithdrawPercent)
                });
                return false;
            }
        }

        return true;
    }

    reAuthrizeFeeAndGasLimit = async () => {
        if (this.props.contractData._id) {
            this.setState({
                reAuthrizeing: true
            });
            let newLimit = this.state.gasAndFeeAmountOnContract;

            let spContract = new SPContract(this.state.web3, this.state.spContractAddress);
            spContract.setFeeAmountLimit(
                newLimit,
                async (hash) => { },
                async (response) => {
                    console.log({
                        "SP Contract response:": response
                    });

                    if (response.status === 1) {
                        this.setState({
                            gasAndFeeAmountOnContract: newLimit
                        });

                        //spContract.getFeeAmountLimit();
                        await AxiosRequest.request({
                            data: {
                                smartContractAddress: this.state.spContractAddress,
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

    changeSpreadOnUpdating(value, minSpreadRange, maxSpreadRange) {
        var clientSideErrorMessage;
        if(Number(value) > Number(maxSpreadRange) || Number(value) < Number(minSpreadRange)){
            
            this.setState({
                clientSideError: true
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercentOnContract = `Please provide a valid input between ${minSpreadRange}-${maxSpreadRange} range`;
            this.setState({clientSideErrorMessage});
            return;
        } else {
            this.setState({
                spProfitPercentOnContract: Number(value)
            });
            clientSideErrorMessage = {...this.state.clientSideErrorMessage}
            clientSideErrorMessage.spProfitPercentOnContract = null;
            this.setState({clientSideErrorMessage});
        }

        this.clientSideError();
    };

    toggleStopRepeatsSection(){
        this.setState(prevState => ({
            toggleStopRepeatsSection: !prevState.toggleStopRepeatsSection
        }));
    }  

    inputMask(input, value, setState = true){
        let maskedValue = value.replace(/.(?=.{4,}$)/g, '*');
        if(input === "key"){
            if(setState){
                this.setState({
                    cexApiKey: value,
                    cexApiKeyMasked: maskedValue
                });            
            } else {
                return maskedValue
            }
        }
        if(input === "secret"){
            if(setState){
                this.setState({
                    cexApiSecret: value,
                    cexApiSecretMasked: maskedValue
                });            
            } else {
                return maskedValue
            }  
        }        
    }
    
    clearKeys(input){
        if(input === "key"){
            this.setState({
                cexApiKey: null,
                cexApiKeyMasked: null,
                cexApiKeyEditable:false
            });
            this.dispatchEventHandler(this.cexApiKey, null);
        }
        if(input === "secret"){
            this.setState({
                cexApiSecret: null,
                cexApiSecretMasked: null,
                cexApiSecretEditable:false
            });
            this.dispatchEventHandler(this.cexApiSecret, null);            
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

        if (eventType === 'mousemove') {
            inputRef.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
        } else {
            inputRef.dispatchEvent(new Event(eventType, { bubbles: true }));
        }
    }

    updateContract = async () => {

        if(this.amountAOnContract < Number(this.props.minAmountA)){
            this.checkAmountAOnUpdating(this.state.amountAOnContract, this.props.minAmountA);
            return;
        }


        let withdrawAmountValidation = await this.validateWithdrawOnContractFromCexSlider(true, this.props.maxWithdrawPercent);
        if(withdrawAmountValidation === false || withdrawAmountValidation === undefined){
            return;
        }

        if (this.state.cexApiKey === null || this.state.cexApiKey.length === 0) {
            notificationConfig.error("API key can't be blank.");
            return;
        }

        if (this.state.cexApiSecret === null || this.state.cexApiSecret.length === 0) {
            notificationConfig.error("API secret can't be blank.");
            return;
        }

        if (Number(this.state.stopRepeatsModeOnContract) === 2) {
            if (this.state.stopRepeatsAfterCallsOnContract === null || this.state.stopRepeatsAfterCallsOnContract.length === 0) {
                notificationConfig.error("You must choose how many time to repeat on CEX");
                return;
            }
        }

        if (Number(this.state.stopRepeatsModeOnContract) === 1) {
            if (this.state.stopRepeatsOnDateOnContract === null || this.state.stopRepeatsOnDateOnContract.length === 0) {
                notificationConfig.error("You must choose a date when to stop repeat on CEX");
                return;
            }
        }

        if (
            this.state.withdrawPercentOnContract === null 
            ||
            this.state.withdrawPercentOnContract < 0
            ||
            this.state.withdrawPercentOnContract > 100
        ) {
            notificationConfig.error("Invalid Withdraw Percent.");
            return;
        }      

        if(this.clientSideError() === true){
            return;
        }

        this.setState({
            updating: true,
            loadingIcon: true
        });

        let args = {};
        if (Number(this.state.stopRepeatsModeOnContract) === 1) {
            console.log('Stop mode 1');
            Object.assign(args, {
                stopRepeatsOnDate: this.state.stopRepeatsOnDateOnContract,
                stopRepeatsAfterCalls: null
            });
        }

        if (Number(this.state.stopRepeatsModeOnContract) === 2) {
            console.log('Stop mode 2');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: this.state.stopRepeatsAfterCallsOnContract
            });
        }

        if (Number(this.state.stopRepeatsModeOnContract) === 3) {
            console.log('Stop mode 3');
            Object.assign(args, {
                stopRepeatsOnDate: null,
                stopRepeatsAfterCalls: null
            });
        }


        let finalArgs = {
            data: Object.assign(args, {
                smartContractAddress: this.state.spContractAddress,
                amountA: this.state.amountAOnContract,
                spProfitPercent: this.state.spProfitPercentOnContract,
                accumulateFundsLimit: this.state.accumulateFundsLimitOnContract,
                stopRepeatsMode: this.state.stopRepeatsModeOnContract,
                cexApiKey: this.state.cexApiKey,
                cexApiSecret: this.state.cexApiSecret,
                swapSpeedMode: this.state.swapSpeedModeOnContract === null ? 'UPFRONT' : this.state.swapSpeedModeOnContract,
                withdrawPercent: this.state.withdrawPercentOnContract,
                withdrawReinitiate: true
            }),
            path: 'update',
            method: 'POST'
        };

        console.log(finalArgs);
        try {
            let response = await AxiosRequest.request(finalArgs);
            if (response.status === 200) {
                setTimeout(async () => {
                    console.log('Updated');
                    if(response.data.messageType === 'success'){
                        notificationConfig.success(response.data.message);
                    }
                    if(response.data.messageType === 'info'){
                        notificationConfig.info(response.data.message);
                    }

                    this.setState({
                        updated: true,
                        updateButtonText: "CONTRACT UPDATED SUCCESSFULLY",
                        updating: false,
                        loadingIcon: false,
                        tempWithdrawPercentOnContract: this.state.withdrawPercentOnContract,
                        tempAmountAOnContract: this.state.amountAOnContract
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
    
    getAllTests = async() => {
        // fetch all tests and set to tests var
        try {
            let response = await AxiosRequest.request({
                data: {
                    owner: (web3Config.getAddress()).toLowerCase(),
                    networkId: Number(web3Config.getNetworkId()),
                    smartContractAddress: this.state.spContractAddress,
                    type: 'testsCheck'
                },
                path: "test-suite",
                method: "POST"
            });

            if(response.status === 200){
                this.setState({
                    tests: response.data.response,
                    testPassed: response.data.result
                });
            }

            if(response.status === 500){
                notificationConfig.error('Sever error');
            }
        } catch (e){
            console.log('Error from getAllTests: ', e.constructor.name, e.message)
        }
    }

    testSuite = async(testType = '', repeat = false) => {
        try {

            let filter = {
                owner: (web3Config.getAddress()).toLowerCase(),
                networkId: Number(web3Config.getNetworkId()),
                smartContractAddress: this.state.spContractAddress,
                type: testType                
            };

            if(testType === "binanceAccountCheck"){
                filter['accountType'] = 'SPOT_USDTM';
            }

            if(testType === "binanceBalanceCheck"){
                filter['accountType'] = 'SPOT';
            }

            if(testType === "binanceTransferCheck"){
                filter['transferType'] = 'TWO_WAY';
            }

            if(testType === "testsCheck"){
                filter['repeatTests'] = repeat;
            }

            let response = await AxiosRequest.request({
                data: filter,
                path: "test-suite",
                method: "POST"
            });

            if(response.status === 200){
                var property = {...this.state.tests.key}
                property = true;
                this.setState({property});
                //notificationConfig.success(`Test ${testType} fetched`);
                return response.data.result;
            }

            if(response.status === 500){
                notificationConfig.error('Sever error');
            }
            
            return false;

        } catch (e){
            console.log('Error from testSuite: ', e.constructor.name, e.message)
        }        
    }

    repeatTests = async(testType = '') => {
        try {

            if(this.state.testing === false){
                this.setState({
                    testing: true
                });

                await this.testSuite("testsCheck", true);

                notificationConfig.info('Testing swap proider configuratons');
                let failedTests = [], passedTests = [];
                await this.getAllTests().then(async() => {
                    // get all failed tests
                    if(this.state.tests !== null){
                        for (let [key, value] of Object.entries(this.state.tests)) {
                            var property;
                            if (key === '_id' || key === 'id') {
                                continue;
                            } else {
                                if(value === false){
                                    property = {...this.state.tests.key};
                                    property = false;
                                    this.setState({property});
                                    failedTests.push(key);
                                } else {
                                    property = {...this.state.tests.key};
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

    
    // render component
    render() {
        const smallError = {
            fontSize: "13px",
            lineHeight: "20px"
        };

        return (
            <div class="contract-data-section">
            {(this.props.contractData !== null) &&
                <div id={this.props.contractData._id}>
                    <div className="spContrlMBX spContrlMBX-n relative mt-30px-n">
                        <div className="d-flex step-title-trans-n items-center-n ">
                            <span className="step-num-n">{this.props.index}</span>
                            <div className='spCountrlTitle01 spCountrlTitle01-n '>
                                SEND {this.getTokenData(this.state.tokenA, "symbol")}
                                { ' <> ' }
                                RECEIVE {this.getTokenData(this.state.tokenB, "symbol")}
                                <div className='spContrlInfotxt pb-0'>
                                    Created at {DateFormat(this.state.createdAt, "mmmm dS, yyyy, h:MM:ssTT")}
                                </div>
                            </div>
                            <span className="toggle-ic-n" onClick={this.toggleStep.bind(this)}>
                                <i className={"fas fa-caret-" + ((this.state.stepOpen ? 'down' : 'up'))}></i>
                            </span>
                            <div className={"step-" + (this.state.stepOpen ? 'open' : 'close')} style={{width: '100%'}}>
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
                                <div className='spContrlInfotxt02 mb-20px-n'>YOUR SMART CONTRACT ADDRESS
                                <i className="help-circle">
                                    <i 
                                        className="fas fa-question-circle protip" 
                                        data-pt-position="top" 
                                        data-pt-title="To secure the API completely you need to whitelist your smart contract address under the Address Management which is usually placed on the Withdraw section.
                                        <br/><br/>
                                        Your smart contract address is your withdrawal Address.
                                        <br/><br/>
                                        Authorize your withdrawal Address to withdrawal only the token that you are selling. for example if you selling BNB, choose the BNB as a coin the and the BSC as the Network" 
                                        aria-hidden="true">
                                    </i>
                                </i>
                            </div>
                            <div className='spContrlInputBX' style={{width: '100%'}}>
                                <input 
                                    type="text"
                                    placeholder={"Your contract address for " + this.getTokenData(this.state.tokenA, "symbol")}
                                    value={this.state.spContractAddress} 
                                    readOnly={true}
                                />
                                <a 
                                    href="javascript:void(0)"
                                    onClick={() => this.copyText(this.state.spContractAddress)} 
                                    class="LicCopyBTN v2"
                                >
                                    <i class="fas fa-copy"></i>
                                </a>
                            </div>
                            <div className='spContrlInfotxt mb-20px-n'>
                                Balance: {this.state.spContractBal} {this.getTokenData(this.state.tokenA, "symbol")} | ${this.state.spContractBalInUsd} USD
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
                                            defaultValue={this.state.amountAOnContract}
                                            onChange={event => this.checkAmountAOnUpdating(event.target.value, this.props.minAmountA)}
                                            ref={(input) => this.amountAOnContract = input}
                                        />
                                        <a href="javascript:void(0)" className="absolute-ic-n">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                    </div>
                                    <br></br> 
                                    {this.state.clientSideError === true && (this.state.clientSideErrorMessage.amountAOnContract !== null) &&
                                    <div className="error-Msg" style={smallError}>
                                        <label>{this.state.clientSideErrorMessage.amountAOnContract}</label>
                                    </div>
                                    }                                                                        
                                </div>
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
                                                id={"radio_05_" + this.props.index}
                                                name={"radio_05_" + this.props.index}
                                                //defaultChecked
                                                onChange={event => this.setState({ swapSpeedModeOnContract: 'UPFRONT' })}
                                                checked={this.state.swapSpeedModeOnContract === 'UPFRONT'}
                                            />
                                            <label htmlFor={"radio_05_" + this.props.index}></label>
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
                                                id={"radio_06_" + this.props.index}
                                                name={"radio_06_" + this.props.index}
                                                //defaultChecked
                                                onChange={event => this.setState({ swapSpeedModeOnContract: 'REALTIME' })}
                                                checked={this.state.swapSpeedModeOnContract === 'REALTIME'}
                                                disabled={true}
                                            />
                                            <label htmlFor={"radio_06_" + this.props.index}></label>
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
                                {/* withdraw % slider */}
                                <div className='spContrlSBX withdrawSlider'>
                                    <div className="dragorInput v2">
                                        <InputRange
                                            step={1}
                                            maxValue={100}
                                            minValue={0}
                                            value={this.state.withdrawPercentOnContract}
                                            formatLabel={value => `${value}%`}
                                            onChange={value => this.setState({ withdrawPercentOnContract: value })}
                                            onChangeComplete={() => this.validateWithdrawOnContractFromCexSlider(true, this.props.maxWithdrawPercent)}
                                        />
                                    </div>
                                </div>                                    
                                <p className="withdrawOnContractAlert">
                                You must keep balance on your CEX account at least 55% of the total amount
                                </p>
                            </div>

                            <div className='spContrlInfotxt02'>AUTHORIZE NEW GAS AND FEES LIMIT
                                <i className="help-circle">
                                    <i 
                                        className="fas fa-question-circle protip" 
                                        data-pt-position="top" 
                                        data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." 
                                        aria-hidden="true"
                                    ></i>
                                </i>
                            </div>
                            <div className='spContrlSBX'>

                                <div className='spContrlSSBX01'>
                                    <div className="dragorInput v2">
                                        <InputRange
                                            minValue={this.getTokenData(this.state.tokenA, "minGasAndFeeAmount")}
                                            maxValue={this.getTokenData(this.state.tokenA, "maxGasAndFeeAmount")}
                                            step={this.getTokenData(this.state.tokenA, "minStepForGasAndFeeAmount")}
                                            value={this.state.gasAndFeeAmountOnContract}
                                            formatLabel={value => this.getTokenData(this.state.tokenA, "symbol") + ` ${value}`}
                                            onChange={value => this.setState({ gasAndFeeAmountOnContract: value })} />
                                    </div>
                                </div>
                                <div className='spContrlSSBX02'>
                                    <button
                                        className='spContrlBTN01'
                                        onClick={this.reAuthrizeFeeAndGasLimit.bind(this)}
                                        disabled={this.state.reAuthrizeing}
                                    >
                                    AUTHORIZE NEW LIMIT
                                    </button>
                                </div>
                            </div>

                            <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                <div className="LiProfSbox01 w-100-n mb-20px-n">
                                    <div className="spContrlInfotxt02">CHANGE THE MINIMUM SPREAD YOU WANT TO GAIN ON EACH SWAP
                                    <i className="help-circle">
                                    <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Set a profit limit that triggers your funds for swapping. Take under consideration all costs such as exchange fees. 
                            <br/><br/>
                            For example, you can choose that you want your funds to swap only if it's gain 0.5% profits. When you set the profit limit, take under consideration all the costs that you may pay to your CEX for such transaction short position, blockchain cost, (which by themselves can be range from 0.1 to 0.3% - depend on the CEX and network)." aria-hidden="true">
                                    </i>
                                </i>
                                </div>
                                </div>
                                <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                    <div className="LiproInput01 withLable01 input-with-ic-n"  style={{ marginTop: "12px" }}>
                                        <input
                                            type="text"
                                            placeholder="0.5"
                                            defaultValue={this.state.spProfitPercentOnContract}
                                            onChange={event => this.changeSpreadOnUpdating(event.target.value, 0, 1)}
                                            ref={(input) => this.spProfitPercentOnContract = input}
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                                <br></br> 
                                {this.state.clientSideError === true && (this.state.clientSideErrorMessage.spProfitPercentOnContract !== null) &&
                                <div className="error-Msg" style={smallError}>
                                    <label>{this.state.clientSideErrorMessage.spProfitPercentOnContract}</label>
                                </div>
                                }                                    
                            </div>     


                            <div className='LiProFlexBX01 smFixer07 d-block-n'>
                                <div className="LiProfSbox01 w-100-n mb-20px-n">
                                    <div className="spContrlInfotxt02">YOUR MINIMUM AMOUNT TO SWAP WITH
                                        <i className="help-circle">
                                            <i 
                                                className="fas fa-question-circle protip" 
                                                data-pt-position="top" 
                                                data-pt-title="Take under consideration, performing a swap costs gas and fees which are reimbursed via SMART" 
                                                aria-hidden="true">
                                            </i>
                                        </i>
                                    </div>
                                </div>
                                <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                    <div className="LiproInput01 withLable01 input-with-ic-n" style={{ marginTop: "12px" }}>
                                        <span>$</span>
                                        <input
                                            type="text"
                                            placeholder="100"
                                            defaultValue={this.state.accumulateFundsLimitOnContract}
                                            onChange={event => this.setState({ accumulateFundsLimitOnContract: event.target.value })}
                                            ref={(input) => this.accumulateFundsLimitOnContract = input}
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
                                            <i 
                                                className="fas fa-question-circle protip" 
                                                data-pt-position="top" 
                                                data-pt-title="This option denotes how many transactions you approve as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stops, there is no way to change the process besides deploying a new Swap Provider contract with new rules." 
                                                aria-hidden="true">                                    
                                            </i>
                                        </i>
                                    </div>
                                </div>
                                <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                    <div className="LiproInput01 input-with-ic-n">
                                        <input
                                            type="text"
                                            placeholder=""
                                            readOnly={true}
                                            defaultValue={
                                                this.state.stopRepeatsModeOnContract === 3 ? 'Never stop' 
                                                : this.state.stopRepeatsModeOnContract === 1 ? "On date: " + DateFormat(this.state.stopRepeatsOnDateOnContract, "mmmm dS, yyyy, h:MM:ssTT")
                                                : 'After ' + this.state.stopRepeatsAfterCallsOnContract + ' repeats'}
                                            //onChange={event => this.setState({ cexApiKey: event.target.value })}
                                            //ref={(input) => this.cexApiKey = input}
                                        />
                                        <a href="javascript:void(0)" className="absolute-ic-n">
                                            <i class="fas fa-edit" onClick={() => this.toggleStopRepeatsSection()}></i>
                                        </a>
                                    </div>
                                </div>
                                {(this.state.toggleStopRepeatsSection) &&
                                <div className="LiProfSbox02 w-100-n pl-0px-n mb-10px-n">
                                    <div className='LipRadioFix01'>
                                        <div className="md-radio md-radio-inline">
                                            <input
                                                type="radio"
                                                id={"radio_07_" + this.props.index}
                                                name={"radio_07_" + this.props.index}
                                                onChange={event => this.setState({ stopRepeatsModeOnContract: 1 })}
                                                checked={this.state.stopRepeatsModeOnContract === 1}
                                                ref={(input) => this.stopRepeatsMode4 = input}
                                            />
                                            <label htmlFor={"radio_07_" + this.props.index}></label>
                                        </div>
                                        <div className='LiProFlexBX01 padFixer01'>
                                            <div className="LiproInput01">
                                                <DatePicker
                                                    selected={this.state.stopRepeatsOnDateOnContract}
                                                    onChange={(date) => this.setState({ stopRepeatsOnDateOnContract: date })}
                                                    peekNextMonth
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    dateFormat="dd/MM/yyyy"
                                                />
                                                <i class="fas fa-calendar-alt FlyICO"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='LipRadioFix01' >
                                        <div className="md-radio md-radio-inline ">
                                            <input
                                                type="radio"
                                                id={"radio_08_" + this.props.index}
                                                name={"radio_08_" + this.props.index}
                                                onChange={event => this.setState({ stopRepeatsModeOnContract: 2 })}
                                                checked={this.state.stopRepeatsModeOnContract === 2}
                                                ref={(input) => this.stopRepeatsMode5 = input}
                                            />
                                            <label htmlFor={"radio_08_" + this.props.index}></label>
                                        </div>
                                        <div className="LiProFlexBX01 padFixer01">
                                            <div className="LiproInput01 withLable02">
                                                <input
                                                    type="text"
                                                    value={this.state.stopRepeatsAfterCallsOnContract}
                                                    onChange={event => this.setState({ stopRepeatsAfterCallsOnContract: event.target.value })}
                                                />
                                                <span>Repeats</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='LipRadioFix01' >
                                        <div className="md-radio md-radio-inline ">
                                            <input
                                                type="radio"
                                                id={"radio_09_" + this.props.index}
                                                name={"radio_09_" + this.props.index}
                                                onChange={event => this.setState({ stopRepeatsModeOnContract: 3 })}
                                                checked={this.state.stopRepeatsModeOnContract === 3}
                                                ref={(input) => this.stopRepeatsMode6 = input}
                                            />
                                            <label htmlFor={"radio_09_" + this.props.index}></label>
                                        </div>
                                        <div className="LiProFlexBX01 padFixer01">
                                            <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account." aria-hidden="true"></i></i></div>
                                        </div>
                                    </div>
                                </div>                                    
                                }
                            </div>


                            <div className="spacerLine"></div>
                            <div className="spContrlInfotxt02 mb-30px-n pt-20px">
                                After creating an API on your CEX update here the API and Secret key
                            </div>
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
                        
                            {/** update button */}
                            {(() => {
                                if (
                                    (this.state.web3 !== null || constantConfig[Number(this.state.networkIdOnContract)] === this.state.web3.getNetworkId())
                                    && this.props.contractData._id !== null) {
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

                            { /** test cases */ }
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.contractOwnerCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check contract deployed for wallet address {this.state.spAccount !== null ? this.state.spAccount : '' }
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>                                
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.contractGasAndFeeCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check contract gas & fee set at limit {this.state.gasAndFeeAmount !== null ? this.state.gasAndFeeAmount : '' }
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>                                
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.spProfitPercentCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check contract spread at {this.state.spProfitPercentOnContract !== null ? this.state.spProfitPercentOnContract + '%' : '' }
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceApiKeysCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check CEX API key & API Secret set
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceApiValidateCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check CEX Valid API key and secret
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceAccountCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check enabled trading on CEX
                                </div>
                            </div>
                            {/* <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceBalanceCheck == true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check account balance on CEX for allowed limit
                                </div>
                            </div> */}
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceTransferCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Test moving USDT funds between spot and future account on CEX
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceSpAddressWhiteListCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check whitelisted smart contract address on CEX for withdraw
                                </div>
                            </div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceIpWhiteListCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check IP whitelisted on CEX for withdraw
                                </div>
                            </div>                                
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceWithdrawEnabledCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Check enabled withdraw on CEX
                                </div>
                            </div>                                                                
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.tests !== null && this.state.tests.binanceWithdrawCheck === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;Test moving fund between spot and swap provider contract address
                                </div>
                            </div>
                            <div className='spacerLine'></div>
                            <div className='LiProFlexBX01'>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <i className={this.state.testPassed === true ? 'test-true fa fa-check' : 'test-false fa fa-times'} aria-hidden="true"></i>
                                    &nbsp;{this.state.testPassed === true ? 'Swap provider has been successfully activated.' : 'You must pass all the tests to become an active swap provider.'}
                                </div>
                                <div className='spContrlInfotxt02 test-suite'>
                                    <button className='repeatTestsButton' onClick={this.repeatTests.bind(this)}>
                                        <span>Repeat the SP checking</span>
                                    </button>
                                </div>                                    
                            </div> 
                        {/** test case end */}
                        { /* up */ }                                                         
                            </div>
                        </div>
                    </div>
                </div>
            }
            </div>
        )
    }

}