import { WalletContext, EthereumEvents } from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import {Link} from "react-router-dom";
import Swap from "../../../../src/assets/images/swap-arrow.png";
import { LoopCircleLoading } from "react-loadingg";
import web3 from "web3";
import axios from "axios";
import Select, { components } from 'react-select';
import _ from "lodash";
import { aggregate } from '@makerdao/multicall';
import bigInt from 'big-integer';
import Validation from "../../../helper/validation";
import notificationConfig from "../../../config/notificationConfig";
import SmartSwapContract from "../../../helper/smartSwapContract";
import NewReimbursementContract from "../../../helper/newReimbursementContract";
import errors from "../../../helper/errorConstantsHelper";
const { Option, SingleValue } = components;

const apisEndpoints = (type, args = {}) => {
    const allEndpoints = {
        coingeckoUsdPrice: () => 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple%2Cmatic-network&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
        estimateGasAndFees: () => {
            return `http://0.0.0.0:8082/swap-fee/${args?.fromChainId}-${args?.toChainId}`
        },
        estimatedProcessingFees: () => {
            return `http://0.0.0.0:8082/processing-fee/${args?.fromChainId}-${args?.toChainId}`            
        }
    }
    return allEndpoints[type]();
}


const toFixedWithoutRounding = (input, decimalPoints) => {
    const regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
    return input.toString().match(regExp)[0] ?? '0.00000';    
}

const numberToBn = (number, decimalPoints, toString = false) => {
    const pow = bigInt(10).pow(decimalPoints);
    const regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
    number = number.toString().match(regExp)[0];
    number = Number(number * pow.toJSNumber()).toFixed(0);
    number = bigInt(number).toString();
    number = web3.utils.toBN(number);
    return toString ? number.toString() : number;
}

const selectElementStyleOptions = (mode) => {
    const backgroundColor = mode === 'dark' ? '#21232b' : '#EDECEF';
    const color = mode === 'dark' ? 'white' : 'black';
    return {
        control: (styles) => ({ ...styles, backgroundColor: backgroundColor, height: '50px', borderRadius: '0', fontWeight: "bold", border: "2px solid #ffffff", borderRight: "0px", fontSize: "16px" }),
        singleValue: (provided, state) => ({
            ...provided,
            color: color,
            display: 'flex',
            //justifyContent: 'center',
            alignItems: 'center',
            gap: '9px'
        }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            // const color = chroma(data.color);
            console.log({ data, isDisabled, isFocused, isSelected });
            return {
                ...styles,
                color: "#000000",
                fontWeight: "bold",
                cursor: isSelected ? 'not-allowed' : 'default',
                display: 'flex',
                //justifyContent: 'center',
                alignItems: 'center',
                gap: '5px'
            };
        },
        indicatorSeparator: (styles) => ({ display: 'none' })
    }
}


export default class SmartSwap extends PureComponent {
    _componentMounted = false;
    interval = null;
    userBalance = 0;
    tokenUsdPrices = [];
    estimateGasAndFeesData = {};
    constructor(props) {
        super();
        this.state = {
            showSidebar: false,
            amountToSwap: 0,
            userBalance: 0,
            tokenUsdPrices: [],
            estimatedAmountToSwap: 0,
            fromChainId: null,
            toChainId: null,
            time: null,
            btnClicked: false,
            swapTxhash: null
        }

        this.connectWallet = this.connectWallet.bind(this);
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        if(this._componentMounted){
            console.log('Smartswap Component mounted');
            await this.fetchCoingeckoMarketPrice();
            await this.connectWallet();
            await this.getBalance();
            await this.setChainIds();
            await this.estimateGasAndFees();
            this.interval = setInterval(async() => { 
                await this.estimateGasAndFees();
            }, 30000);

            if(window?.ethereum !== undefined){
                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                    await this.setChainIds();
                    await this.estimateGasAndFees();
                });
    
                window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async (accounts) => {
                    console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);
                });
    
                window.ethereum.on(EthereumEvents.CONNECT, async (error) => {
                    console.log(EthereumEvents.CONNECT);
                });
    
                window.ethereum.on(EthereumEvents.DISCONNECT, async (error) => {
                    console.log(EthereumEvents.DISCONNECT);
                });
            } else {
                console.error('Metamask is not installed');
            }

        }
    }

    componentDidUpdate(prevProps, prevState, snapsho) {
        if (this.props.selectedInputMode !== prevProps.selectedInputMode) {
            this.setState({
                amountToSwap: 0,
                estimatedAmountToSwap: 0
            });
        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        clearInterval(this.interval);
        console.log("SmartSwap Component unmounted");
    }

    connectWallet = async() => {
        try {
            if(this._componentMounted){
                const wallet = this.context;
                const walletConnected = await wallet.connectWallet();
                if(walletConnected === false){
                    notificationConfig.error('Matamask wallet not connected');
                }
            }
        } catch(error){
            console.error('connectWallet', error.message)
        }
    }

    setChainIds = async() => {
        // To network config - filter out from network then choose first element
        const toNetworkConfig = (_.filter(this.props.networks, function(network) {
            return network.chainId !== this.context.chainIdNumber;
        }.bind(this)))[1];

        if(toNetworkConfig !== undefined){
            if(this._componentMounted){
                this.setState({
                    fromChainId: this.context.chainIdNumber,
                    toChainId: toNetworkConfig?.chainId ?? null
                });
            }
        }
    }

    switchNetwork = async(chainId) => {
        if (Number(this.context.chainIdNumber) !== Number(chainId)) {
            if(this._componentMounted){
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: web3.utils.toHex(chainId) }],
                }).then(async(response) => {
                    await this.getBalance();
                }).catch(async (error) => {
                    console.error(error);
                    if (error.code === -32002) {
                        //notificationConfig.info(errors.switchRequestPending);
                    }
    
                    if (error.code === 4902) {
                        notificationConfig.error(errors.metamask.networkNotFound);
                        await this.addNetworkToWallet(chainId);
                    }
                });
            }
        }
    }

    addNetworkToWallet = async (chainId) => {
        try {

            const networkConfig = _.find(this.props.networks, { chainId: Number(chainId) });

            if (networkConfig !== undefined) {
                if(this._componentMounted){
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: web3.utils.toHex(networkConfig.chainId),
                            chainName: networkConfig.name,
                            nativeCurrency: {
                                name: networkConfig.nativeCurrencyName,
                                symbol: networkConfig.nativeCurrencySymbol,
                                decimals: networkConfig.nativeCurrencyDecimals
                            },
                            rpcUrls: [networkConfig.rpc],
                            blockExplorerUrls: [networkConfig.explorerUrl]
                        }]
                    }).then((response) => {
                        console.log({
                            addNetworkToWalletResponse: response
                        })
                    }).catch((error) => {
                        console.error({
                            addNetworkToWalletError: error
                        });
                    });
                }
            } else {
                console.error({
                    addNetworkToWalletError: 'networkConfig undefined'
                });
            }

        } catch (error) {
            console.error({
                addNetworkToWalletCatch: error
            });
        }
    }    

    swapDirection = async(fromChainId, toChainId) => {
        console.log({
            'swapDirection': 'swapDirection',
            fromChainId: fromChainId,
            toChainId: toChainId
        });
        try {
            if(this._componentMounted){
                await this.switchNetwork(toChainId);
            }
        } catch(error) {
            console.error('swapDirection', error.message);
        }
    }

    getBalance = async () => {
        if(this._componentMounted){
            if (this.context?.web3 !== null && this.context?.account !== null) {
                try {
                    const balance = web3.utils.fromWei(web3.utils.hexToNumberString((await this.context.web3.getBalance(this.context.account))._hex));
                    this.userBalance = balance;
                    if(this._componentMounted){
                        this.setState({
                            userBalance: balance
                        });
                    }
                } catch(error){
                    console.error('getBalance', error.message);
                }
            }
        }
    }

    fetchCoingeckoMarketPrice = async () => {
        await axios.get(apisEndpoints('coingeckoUsdPrice')).then(async(res) => {
            const response = res.data;

            let tokens = [];            
            tokens.push({
                chainId: 5,
                value: response["ethereum"]["usd"]
            }, {
                chainId: 97,
                value: response["binancecoin"]["usd"]
            }, {
                chainId: 80001,
                value: response["matic-network"]["usd"]
            });

            if(this._componentMounted){
                this.setState({
                    tokenUsdPrices: tokens
                });
                this.tokenUsdPrices = tokens;
            }
        }).catch((err) => {
            console.error("fetchCoingeckoMarketPrice", err);
        });
    }

    setMaxAmount = async() => {
        if(this.props.selectedInputMode === this.props.inputModes[0]){
            const rate = _.find(this.tokenUsdPrices, {chainId: this.context.chainIdNumber});
            if(rate !== undefined){
                this.setState({
                    amountToSwap: this.userBalance,
                    estimatedAmountToSwap: this.userBalance * rate.value
                });
            }
        }

        if(this.props.selectedInputMode === this.props.inputModes[1]){
            this.setState({
                amountToSwap: this.userBalance,
                estimatedAmountToSwap: this.userBalance
            });
        }
    }

    setAmount = async(e) => {

        if(this._componentMounted){
            // amountToSwap will be in USD
            
            if(this.props.selectedInputMode === this.props.inputModes[0]){
                const rate = _.find(this.tokenUsdPrices, {chainId: this.context.chainIdNumber});
                if(rate !== undefined){
                    const userBalanceInUsd = this.userBalance * rate.value;
                    const amountToSwapInUsd = e.target.value / rate.value;
                    
                    if(this._componentMounted){
                        this.setState({
                            estimatedAmountToSwap: amountToSwapInUsd,
                            amountToSwap: Number(e.target.value)
                        });
                    }
                }
            }
    
            // amountToSwap will be in native token
            if(this.props.selectedInputMode === this.props.inputModes[1]){
                if(this._componentMounted){
                    this.setState({
                        estimatedAmountToSwap: Number(e.target.value),
                        amountToSwap: Number(e.target.value)
                    });
                }
            }

        }

    }

    estimateGasAndFees = async() => {
        const {fromChainId, toChainId} = this.state;
        
        if(fromChainId === null || toChainId === null){
            return;
        }
        const uri = apisEndpoints('estimateGasAndFees', {
            fromChainId: fromChainId,
            toChainId: toChainId
        });

        await axios.get(uri).then(async(res) => {
            const response = res.data;
            if(response?.result){
                if(this._componentMounted){
                    this.estimateGasAndFeesData = response;
                    const fromNetworkConfig = _.find(this.props.networks, {
                        chainId: this.context.chainIdNumber
                    });
                    if(fromNetworkConfig !== undefined){
                        this.props.onGasFeeUpdate(response, fromNetworkConfig.nativeCurrencySymbol)
                    }
                }
            }
        }).catch((err) => {
            console.error("estimateGasAndFees", err.message);
        });
    }

    estimateProcessingFees = async() => {
        const {fromChainId, toChainId} = this.state;
        
        if(fromChainId === null || toChainId === null){
            return null;
        }

        const uri = apisEndpoints('estimatedProcessingFees', {
            fromChainId: fromChainId,
            toChainId: toChainId
        });

        return await axios.get(uri).then(async(res) => {
            const response = res.data;
            return response?.result ?? null;
        }).catch((err) => {
            console.error("estimateProcessingFees", err.message);
        });
    }

    swap = async() => {
        try {
            const {web3: web3Provider, chainIdNumber, account} = this.context;
            const {networks} = this.props;
            let {amountToSwap, estimatedAmountToSwap, toChainId} = this.state;

            if (amountToSwap === "" || amountToSwap === 0) {
                notificationConfig.error("Enter value to swap");
                return;
            }

            if (estimatedAmountToSwap === "" || estimatedAmountToSwap === 0) {
                notificationConfig.error("Enter value to swap");
                return;
            }

            const amountToSwapInToken = (estimatedAmountToSwap).toString();

            if(web3Provider !== undefined){
                const activeNetworkConfig = _.find(networks, { chainId: chainIdNumber });
                console.log('swap', activeNetworkConfig);
                const toNetworkConfig = _.find(networks, { chainId: toChainId });
                console.log('swap', toNetworkConfig);
                const decimalPoints = activeNetworkConfig.nativeCurrencyDecimals;
                console.log('swap', decimalPoints);
                amountToSwap = numberToBn(amountToSwapInToken, decimalPoints, true);
                console.log('swap amountToSwap in big number', amountToSwap);
                console.log('smartSwapContracts', activeNetworkConfig.smartSwapContracts);
                const smartSwapContract = _.find(activeNetworkConfig.smartSwapContracts, { toChainId: toNetworkConfig.chainId });
                console.log('swap smartSwapContract', smartSwapContract);
                const smartSwapContractInstance = new SmartSwapContract(this.context.web3, this.context.account, smartSwapContract.address);
                console.log('swap smartSwapContractInstance', smartSwapContractInstance);
                const reimbursementContractInstance = new NewReimbursementContract(this.context.web3, this.context.account, activeNetworkConfig.reimbursementContractAddress);
                console.log('swap reimbursementContractInstance', reimbursementContractInstance);                
                let processingFee = await this.estimateProcessingFees();
                console.log('swap processingFee', processingFee);
                processingFee = numberToBn(processingFee, decimalPoints, true);
                console.log('swap processingFee big number', processingFee);
                const companyFeeRatio = await smartSwapContractInstance.getCompanyFeeRatio();
                console.log('swap companyFeeRatio', companyFeeRatio);
                const reimbursementFee = await reimbursementContractInstance.getLicenseeFee(activeNetworkConfig.licenseeAddress, smartSwapContract.address);
                console.log('swap reimbursementFee', reimbursementFee);
                const fee = bigInt(companyFeeRatio).add(reimbursementFee);
                console.log('swap fee', fee);
                const totalFee = bigInt(processingFee).add(fee);
                console.log('swap totalFee', totalFee);
                const value = bigInt(amountToSwap).add(totalFee);
                console.log('swap value', value.toString());



                // amountA = amountToSwap
                // value = amountToSwap + totalFee (processingFee + companyFees + reimbursementFees)
                // fees = companyFees + reimbursementFees

                await smartSwapContractInstance.swap(
                    activeNetworkConfig.nativeCurrencyInternalAddress,
                    toNetworkConfig.nativeCurrencyInternalAddress,
                    amountToSwap,
                    value,
                    fee,
                    activeNetworkConfig.licenseeAddress,
                    (hash) => {
                        this.setState({
                            btnClicked: true,
                            swapTxhash: hash,
                        });
                    },
                    (response) => {

                        if (response.code >= 4001 && response.code <= 4901) {
                            // https://blog.logrocket.com/understanding-resolving-metamask-error-codes/#4001
                            notificationConfig.error(response.message);
                        }

                        if (response?.error?.data?.originalError?.code === 3) {
                            notificationConfig.error(response?.error?.data?.originalError?.message);
                        }

                        if (response.code === "ACTION_REJECTED") {
                            notificationConfig.error(response.reason);
                        }
                
                        if (response.code === "UNPREDICTABLE_GAS_LIMIT") {
                            notificationConfig.error(response.reason);
                        }
                
                        if (response.code === -32016) {
                            notificationConfig.error(response.message);
                        }
                
                        if (response.code === -32000){
                            notificationConfig.error("Intrinsic gas too low");
                        }

                        if(response.code === -32603){
                            notificationConfig.error(response.data.message);                        
                        }
                
                        if(
                            response.code === 'CALL_EXCEPTION' 
                            || response.code === 'INSUFFICIENT_FUNDS' 
                            || response.code === 'NETWORK_ERROR' 
                            || response.code === 'NONCE_EXPIRED' 
                            || response.code === 'REPLACEMENT_UNDERPRICED'
                            || response.code === 'UNPREDICTABLE_GAS_LIMIT'
                        ){
                            notificationConfig.error(response.reason);            
                        }
                
                        if(response.code === 'TRANSACTION_REPLACED'){
                            if(response.cancelled === false && response.receipt?.transactionHash){
                                //response.receipt.transactionHash,
                                notificationConfig.success("Swap Success");
                                this.setState({
                                    swapTxhash:response.receipt.transactionHash
                                });
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            notificationConfig.success("Swap Success");
                            this.setState({
                                swapTxhash: response.transactionHash
                            });
                        }

                        this.setState({
                            btnClicked: false
                        });

                    }
                );                

            } else {
                console.error("Something went wrong with web3 provider");
            }

        } catch(err) {
            console.error("swap", err.message);
        }
    }
    
    render() {

        // active network
        const activeNetworkConfig = _.find(this.props.networks, { chainId: this.context.chainIdNumber });
        const activeNetworkTokenUsdValue = _.find(this.tokenUsdPrices, {chainId: this.context.chainIdNumber});

        console.log({
            activeNetworkTokenUsdValue: activeNetworkTokenUsdValue,
            'this.tokenUsdPrices': this.tokenUsdPrices
        });

        // To network config - filter out from network then choose first element
        const toNetworkConfig = (_.filter(this.props.networks, function(network) {
            return network.chainId !== this.context.chainIdNumber;
        }.bind(this)))[1];
        const toNetworkTokenUsdValue = _.find(this.tokenUsdPrices, {chainId: toNetworkConfig?.chainId});

        // all options array
        const supportedChainSelectOptions = [];

        // fallback option
        supportedChainSelectOptions.push({
            value: null,
            label: 'UNSUPPORTED',
            icon: '/images/free-listing/chains/default.png',
            nativeTokenIcon: '/images/free-listing/tokens/default.png',
            nativeTokenSymbol: 'UNSUPPORTED'
        });

        // by default from select option
        const defaultFromSelectOption = {
            value: activeNetworkConfig?.chainId ?? null,
            label: activeNetworkConfig?.chain ?? 'UNSUPPORTED',
            icon: '/images/free-listing/chains/' + (activeNetworkConfig?.chain ?? 'default').toLowerCase() + '.png',
            nativeTokenIcon: '/images/free-listing/tokens/' + (activeNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png',
            nativeTokenSymbol: activeNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            nativeTokenUsdValue: activeNetworkTokenUsdValue?.value ?? 0,

        }

        // by default to select option
        const defaultToSelectOption = {
            value: toNetworkConfig?.chainId ?? null,
            label: toNetworkConfig?.chain ?? 'UNSUPPORTED',
            icon: '/images/free-listing/chains/' + (toNetworkConfig?.chain ?? 'default').toLowerCase() + '.png',
            nativeTokenIcon: '/images/free-listing/tokens/' + (toNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png',
            nativeTokenSymbol: toNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            nativeTokenUsdValue: toNetworkTokenUsdValue?.value ?? 0,
            estimatedAmountToReceive: () => {
                if(this.props.selectedInputMode === this.props.inputModes[0]){
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        return toFixedWithoutRounding(this.state.amountToSwap / tokeUsdValue, 5);
                    } else {
                        return toFixedWithoutRounding(0)
                    }
                } else {
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        return toFixedWithoutRounding(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue), 5);
                    } else {
                        return toFixedWithoutRounding(0)
                    }                    
                }
            },
            amountToReceive: () => {
                if(this.props.selectedInputMode === this.props.inputModes[0]){
                    return this.state.amountToSwap;
                } else {
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        return toFixedWithoutRounding(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue), 5);
                    } else {
                        return toFixedWithoutRounding(0);
                    }
                }
            }, 
            swapInfoText: () => {
                return (
                    <>
                        {this.state.amountToSwap > 0 &&
                            <>
                            <p className="font-11 color-light-n">
                                You are swapping&nbsp;
                                <span className="color-white">{this.props.selectedInputMode === this.props.inputModes[0] ? '$' : ''}{this.state.amountToSwap}</span>
                                &nbsp;of {defaultFromSelectOption.nativeTokenSymbol} to&nbsp;
                                <span className="color-white">{this.props.selectedInputMode === this.props.inputModes[0] ? '$' : ''}{defaultToSelectOption.amountToReceive()}</span> 
                                &nbsp;of {defaultToSelectOption.nativeTokenSymbol}  |  Estimated swap time:&nbsp;
                                <span className="color-red">1-15 minutes</span>
                                &nbsp;
                                <i className="help-circle">
                                    <i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i>
                                </i>
                            </p>
                            <p className="font-11 color-light-n">Estimated swap time: <span className="color-green">Instant</span></p>
                            <p className="font-11 color-light-n">26.31% still pending 
                                <i className="help-circle">
                                    &nbsp;<i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i>&nbsp;
                                </i> | &nbsp;&nbsp;
                                <a href="/" className="color-light-n">Start new swap</a>
                            </p>
                            </>
                        }
                    </>
                );
            }
        }        

        // supported chains Options
        this.props.networks.forEach(chainConfig => {
            supportedChainSelectOptions.push({
                value: chainConfig.chainId,
                label: chainConfig.chain,
                icon: '/images/free-listing/chains/' + (chainConfig.chain).toLowerCase() + '.png',
                nativeTokenIcon: '/images/free-listing/tokens/' + (chainConfig.nativeCurrencySymbol).toLowerCase() + '.png',
                nativeTokenSymbol: chainConfig.nativeCurrencySymbol
            });
        });

        console.log({
            activeNetworkConfig: activeNetworkConfig,
            defaultFromSelectOption: defaultFromSelectOption,
            defaultToSelectOption: defaultToSelectOption
        });

        const chainOptions = ({ children, ...props }) => (
            <Option {...props}>
                <span 
                    //onClick={(e) => this.swapDirection(this.context.chainIdNumber, props.data.value)}
                >
                    <img
                        src={props.data.icon}
                        style={{ width: 15 }}
                        alt={props.data.label}
                        onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                    />
                    {props.data.label}
                </span>
            </Option>
        );
        
        const singleChain = ({ children, ...props }) => (
            <SingleValue {...props}>
                <img
                    src={props.data.icon}
                    style={{ width: 20 }}
                    alt={props.data.label}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                />
                {children}
            </SingleValue>
        );
        
        const tokenOptions = ({ children, ...props }) => (
            <Option {...props}>
                <img
                    src={props.data.nativeTokenIcon}
                    style={{ width: 15 }}
                    alt={props.data.nativeTokenSymbol}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                />
                {props.data.nativeTokenSymbol}
            </Option>
        );
        
        const singleToken = ({ children, ...props }) => (
            <SingleValue {...props}>
                <img
                    src={props.data.nativeTokenIcon}
                    style={{ width: 20 }}
                    alt={props.data.nativeTokenSymbol}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                />
                {props.data.nativeTokenSymbol}
            </SingleValue>
        );

        return (
            <>
                <div className=" form-group-n  items-center-n">
                    <div className="flex-1 w-100-sm flex-auto-sm">
                        <div className="inputs-wrap light-controls-n">
                            <div className="inputs-wrap-control">
                                <div className="input-box1">
                                    <label htmlFor="" className="form-label">from</label>
                                    <div className="i-outer">
                                        <input
                                            type="text"
                                            className="form-control-n"
                                            placeholder="0"
                                            id="input04"
                                            value={this.state.amountToSwap}
                                            onKeyDown={(e) => Validation.floatOnly(e)}
                                            onChange={(e) => this.setAmount(e)}
                                            autoComplete="off"
                                        />
                                        <span className="currency-ic-n">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img
                                                        alt={defaultFromSelectOption.nativeTokenSymbol}
                                                        style={{ width: '20px' }}
                                                        src={defaultFromSelectOption.nativeTokenIcon}
                                                    ></img>
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    <Select
                                        value={defaultFromSelectOption}
                                        onChange={(e) => { return false; }}
                                        options={supportedChainSelectOptions}
                                        filterOption={(option) => option.value !== null}
                                        components={{ Option: chainOptions, SingleValue: singleChain }}
                                        styles={selectElementStyleOptions("light")}
                                    />
                                </div>
                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    <Select
                                        value={defaultFromSelectOption}
                                        onChange={(e) => { return false; }}
                                        options={supportedChainSelectOptions}
                                        filterOption={(option) => option.value !== null}
                                        components={{ Option: tokenOptions, SingleValue: singleToken }}
                                        styles={selectElementStyleOptions("light")}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {toFixedWithoutRounding(this.state.estimatedAmountToSwap, 5)} | 1 {defaultFromSelectOption.nativeTokenSymbol} : ${defaultFromSelectOption.nativeTokenUsdValue}</p>
                            {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                            <p className="form-label font-normal mb-0">
                                Balance: {this.state.userBalance} {defaultFromSelectOption.nativeTokenSymbol}&nbsp;
                                <span onClick={(e) => this.setMaxAmount()} className="color-green">MAX</span>
                            </p>
                        </div>
                    </div>
                    <div className="form-ic">
                        <a className="grey-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.swapDirection(this.context.chainIdNumber, defaultToSelectOption.value);
                            }}
                        >
                            <img width="22" src={Swap} alt="" />
                        </a>
                        <a className="green-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.swapDirection(this.context.chainIdNumber, defaultToSelectOption.value);
                            }}
                        >
                            <img width="22" src={Swap} alt="" />
                        </a>
                    </div>
                    <div className="flex-1 w-100-sm flex-auto-sm">
                        <div className="inputs-wrap dark-controls-n">
                            <div className="inputs-wrap-control">
                                <div className="input-box1 ver2">
                                    <label htmlFor="" className="form-label">to</label>
                                    <div className="i-outer">
                                        <input
                                            type="text"
                                            className="form-control-n"
                                            placeholder="0"
                                            disabled={true}
                                            readOnly={true}
                                            value={defaultToSelectOption.amountToReceive()}
                                        />
                                        <span className="currency-ic-n ver2">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img
                                                        alt={defaultToSelectOption.nativeTokenSymbol}
                                                        style={{ width: '20px' }}
                                                        src={defaultToSelectOption.nativeTokenIcon}
                                                    ></img>
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    <Select
                                        value={defaultToSelectOption}
                                        onChange={(e) => { return false; }}
                                        options={supportedChainSelectOptions}
                                        filterOption={(option) => option.value !== null}
                                        components={{ Option: chainOptions, SingleValue: singleChain }}
                                        styles={selectElementStyleOptions("dark")}
                                    />
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    <Select
                                        value={defaultToSelectOption}
                                        onChange={(e) => { return false; }}
                                        options={supportedChainSelectOptions}
                                        filterOption={(option) => option.value !== null}
                                        components={{ Option: tokenOptions, SingleValue: singleToken }}
                                        styles={selectElementStyleOptions("dark")}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {defaultToSelectOption?.estimatedAmountToReceive()} | 1 {defaultToSelectOption.nativeTokenSymbol} : ${defaultToSelectOption.nativeTokenUsdValue}</p>
                            {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                        </div>
                    </div>
                </div>
                <div className="text-center ">
                    {   this.context.isAuthenticated === false && 
                        <button className="native-btn ani-1 connect-wallet" onClick={(e) => this.connectWallet()}>
                            CONNECT YOUR WALLET
                        </button>
                    }
                    {
                        this.context.isAuthenticated === true && (Number(this.context.chainIdNumber) !== activeNetworkConfig?.chainId ?? null) && 
                        <button className="native-btn ani-1 connect">
                            <span className="currency">
                                <img 
                                    style={{filter: 'none', width: '30px', height: '30px'}}
                                    src={('/images/free-listing/chains/default.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                    alt='UNSUPPORTED NETWORK'
                                ></img>
                            </span>
                            UNSUPPORTED NETWORK
                        </button>
                    }
                    {   this.context.isAuthenticated === true && defaultFromSelectOption.value === this.context.chainIdNumber &&
                        <button className="native-btn ani-1 connect" onClick={(e) => this.swap()}>
                            <span className="currency">
                                <img
                                    style={{filter: 'none'}}
                                    alt={defaultFromSelectOption.nativeTokenSymbol}
                                    src={defaultFromSelectOption.nativeTokenIcon}
                                ></img>
                            </span>

                            {this.state.btnClicked === false ? 'SWAP' : 'Swapping'}
                            {this.state.btnClicked === true &&
                            <LoopCircleLoading
                                height={"20px"}
                                width={"20px"}
                                color={"#ffffff"}
                            />
                            }
                        </button>
                    }

                    <div className="swap-outer">
                        {defaultToSelectOption.swapInfoText()}
                    </div>

                </div>

                
                {/* <div className="success-msg">
                        <i className="fas fa-check"></i>
                        <h4>Swap sent successfully</h4>
                        <p>Check the ledger below</p>
                    </div> */}
            </>
        )
    }
}

SmartSwap.contextType = WalletContext;