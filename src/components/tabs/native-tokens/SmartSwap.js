import { WalletContext, EthereumEvents } from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import {Link} from "react-router-dom";
import Swap from "../../../../src/assets/images/swap-arrow.png";
import { LoopCircleLoading } from "react-loadingg";
import web3 from "web3";
import Select, { components } from 'react-select';
import _ from "lodash";
import bigInt from 'big-integer';
import notificationConfig from "../../../config/notificationConfig";
import NewReimbursementContract from "../../../helper/newReimbursementContract";
import SmartSwapContract from "../../../helper/smartSwapContract";
import SmartSwapApiHelper from "../../../helper/smartswapApiHelper";
import errors from "../../../helper/errorConstantsHelper";
import { debounce, numberExponentToLarge, toFixedWithoutRounding, numberToBn} from "../../../helper/utils";
const { Option, SingleValue } = components;


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
            //console.log({ data, isDisabled, isFocused, isSelected });
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
        indicatorSeparator: (styles) => ({ display: 'none' }),
        input: (provided, styles) => ({
            ...provided,
            color: color,
            display: 'flex',
            //justifyContent: 'center',
            alignItems: 'center',
            gap: '9px'
        })
    }
}


export default class SmartSwap extends PureComponent {
    _componentMounted = false;
    interval = null;
    userBalance = 0;
    constructor(props) {
        super();
        this.state = {
            showSidebar: false,
            amountToSwap: '',
            userBalance: 0,
            estimatedAmountToSwap: 0,
            fromChainId: null,
            toChainId: null,
            time: null,
            btnClicked: false,
            swapTxhash: null,
            estimateGasAndFees: 0
        }

        this.connectWallet = this.connectWallet.bind(this);
        this.debouncedSmartswapPriceQuote = debounce(this.smartswapPriceQuote, 1000);
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        if(this._componentMounted){
            console.log('Smartswap Component mounted');
            
            if(window?.ethereum !== undefined){

                await this.connectWallet();
    
                const isSupportedNetwork = _.find(this.props.networks, {
                    chainId: this.context.chainIdNumber
                });
    
                if(isSupportedNetwork === undefined){
                    await this.setDefaultChainIds();                
                } else {
                    await this.setChainIds();
                }
                
                // set interval one time - runs every 30 secs
                this.interval = setInterval(async() => {
                    await this.estimateGasAndFees();
                }, 30000);

                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                    const networkConfig = _.find(this.props.networks, {chainId: web3.utils.hexToNumber(chainId)});
                    if(networkConfig !== undefined){
                        await this.setChainIds();
                    } else {
                        await this.setDefaultChainIds();
                    }
                });
    
                window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async (accounts) => {
                    console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);
                    await this.getBalance();
                });
    
                window.ethereum.on(EthereumEvents.CONNECT, async (error) => {
                    console.log(EthereumEvents.CONNECT);
                    await this.getBalance();
                });
    
                window.ethereum.on(EthereumEvents.DISCONNECT, async (error) => {
                    console.log(EthereumEvents.DISCONNECT);
                });
            } else {
                await this.setDefaultChainIds();
                console.error(errors.metamask.walletNotFound);
            }

        }
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if (this.props.selectedInputMode !== prevProps.selectedInputMode) {
            this.setState({
                amountToSwap: '',
                estimatedAmountToSwap: 0
            }, async() => {
                this.smartswapPriceQuote();
            });
        }

        if(this.props.networks !== prevProps.networks){
            const isSupportedNetwork = _.find(this.props.networks, {
                chainId: this.context.chainIdNumber
            });

            if(isSupportedNetwork === undefined){
                await this.setDefaultChainIds();                
            } else {
                await this.setChainIds();
            }
        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        // clear interval when component unmounted
        clearInterval(this.interval);
        console.log("SmartSwap Component unmounted");
    }

    connectWallet = async() => {
        try {
            if(this._componentMounted){
                const wallet = this.context;
                const walletConnected = await wallet.connectWallet();
                if(walletConnected === false){
                    notificationConfig.error(errors.metamask.walletNotConnected);
                }
            }
        } catch(error){
            console.error('connectWallet', error.message)
        }
    }

    setChainIds = async() => {
         // To network config - filter out from network then choose first element
        await this.context.connectWallet();
        
        const toNetworkConfig = (_.filter(this.props.networks, function(network) {
            return network.chainId !== this.context.chainIdNumber;
        }.bind(this)))[0];

        if(toNetworkConfig !== undefined){
            if(this._componentMounted){
                this.setState({
                    amountToSwap: 1,
                    fromChainId: this.context.chainIdNumber,
                    toChainId: toNetworkConfig.chainId ?? null
                }, async() => {
                    await this.getBalance();
                    await this.smartswapPriceQuote();
                    await this.estimateGasAndFees();
                });
            }
        } 
    }

    setDefaultChainIds = async() => {
        const fromNetworkConfig = _.find(this.props.networks, {chain: "ETH"});
        const toNetworkConfig = _.find(this.props.networks, {chain: "BSC"});
        if(this._componentMounted){
            if(fromNetworkConfig !== undefined && toNetworkConfig !== undefined){
                this.userBalance = 0;
                this.setState({
                    amountToSwap: 1,
                    userBalance: 0,
                    fromChainId: fromNetworkConfig.chainId,
                    toChainId: toNetworkConfig.chainId
                }, async() => {
                    await this.smartswapPriceQuote();
                    await this.estimateGasAndFees();
                    await this.switchNetwork(fromNetworkConfig.chainId, toNetworkConfig.chainId);
                });
            }
        }
    }

    switchNetwork = async(newfromChainId, newToChainId) => {
        if(window?.ethereum !== undefined){
            if (Number(this.context.chainIdNumber) !== Number(newfromChainId)) {
                if(this._componentMounted){
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: web3.utils.toHex(newfromChainId) }],
                    }).then(async(response) => {
                        if(this._componentMounted){
                            this.setState({
                                fromChainId: newfromChainId,
                                toChainId: newToChainId
                            });
                            await this.getBalance();
                        }
                    }).catch(async (error) => {
                        console.error(error);
                        if (error.code === -32002) {
                            //notificationConfig.info(errors.switchRequestPending);
                        }
        
                        if (error.code === 4902) {
                            notificationConfig.error(errors.metamask.networkNotFound);
                            await this.addNetworkToWallet(newfromChainId);
                        }
                    });
                }
            }
        } else {
            notificationConfig.error(errors.metamask.walletNotConnected);
        }
    }

    addNetworkToWallet = async (chainId) => {
        try {

            const networkConfig = _.find(this.props.networks, { chainId: Number(chainId) });

            if (networkConfig !== undefined) {
                if(this._componentMounted){
                    if(window?.ethereum !== undefined){
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
                    } else {
                        notificationConfig.error(errors.metamask.walletNotConnected);
                    }
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

    swapDirection = async(toChainId) => {
        try {
            const newfromChainId = toChainId;
            const newToChainId = this.state.fromChainId;
            if(this._componentMounted){
                if(this.context.chainIdNumber === toChainId){
                    return 
                }
                await this.switchNetwork(newfromChainId, newToChainId);
            }
        } catch(error) {
            console.error('swapDirection', error.message);
        }
    }

    changeToDirection = async(toChainId) => {
        if(this._componentMounted){
            if(this.context.chainIdNumber === toChainId){
                return;         
            }

            this.setState({
                toChainId: toChainId    
            }, async() => {
                await this.estimateGasAndFees();
                await this.smartswapPriceQuote();
            });
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

    setMaxAmount = async() => {
        if(this.props.selectedInputMode === this.props.inputModes[0]){
            const networkConfig = _.find(this.props.networks, { chainId: Number(this.context.chainIdNumber) });
            if(networkConfig !== undefined){
                const rate = _.find(this.props.tokensUsdPrice, {chain: networkConfig.chain});
                if(rate !== undefined){
                    // console.log({
                    //     calc: "setMaxAmount dollar mode",
                    //     amountToSwap: this.userBalance * rate.value,
                    //     estimatedAmountToSwap: this.userBalance
                    // });
                    this.setState({
                        amountToSwap: toFixedWithoutRounding(numberExponentToLarge(this.userBalance * rate.value), 2),
                        estimatedAmountToSwap: this.userBalance
                    }, async() => {
                        this.debouncedSmartswapPriceQuote();
                    });
                }
            }
        }

        if(this.props.selectedInputMode === this.props.inputModes[1]){
            // console.log({
            //     calc: "setMaxAmount token amount mode",
            //     amountToSwap: this.userBalance,
            //     estimatedAmountToSwap: this.userBalance
            // });            
            this.setState({
                amountToSwap: this.userBalance,
                estimatedAmountToSwap: this.userBalance
            }, async() => {
                this.debouncedSmartswapPriceQuote();
            });
        }
    }

    setAmount = async(e) => {

        let inputValue = e.target.value;

        if(inputValue === ""){
            this.setState({
                amountToSwap: "",
                estimatedAmountToSwap: 0
            }, async() => {
                await this.smartswapPriceQuote();
            })
            return;
        }

        if(isNaN(inputValue)){
            return;
        }

        if(this._componentMounted){
            // amountToSwap will be in USD
            if(this.props.selectedInputMode === this.props.inputModes[0]){
                if(this.decimalPointsFilter(inputValue) === false){
                    return;
                }

                const networkConfig = _.find(this.props.networks, { chainId: Number(this.context.chainIdNumber) });                

                if(networkConfig !== undefined){
                    const rate = _.find(this.props.tokensUsdPrice, {chain: networkConfig.chain});
                    if(rate !== undefined){
                        inputValue = toFixedWithoutRounding(inputValue, 2);
                        const amountToSwapInUsd = inputValue / rate.value;
                        // console.log({
                        //     calc: "setAmount dollar mode",
                        //     estimatedAmountToSwap: amountToSwapInUsd,
                        //     amountToSwap: Number(inputValue)
                        // });                                
    
                        if(this._componentMounted){
                            this.setState({
                                estimatedAmountToSwap: amountToSwapInUsd,
                                amountToSwap: Number(inputValue)
                            }, async() => {
                                //await this.smartswapPriceQuote();
                                this.debouncedSmartswapPriceQuote();
                            });
                        }
                    }
                }
            }
    
            // amountToSwap will be in native token
            if(this.props.selectedInputMode === this.props.inputModes[1]){
                if(this._componentMounted){
                    // console.log({
                    //     calc: "setAmount token mode",
                    //     estimatedAmountToSwap: Number(inputValue),
                    //     amountToSwap: Number(inputValue)
                    // });

                    this.setState({
                        estimatedAmountToSwap: Number(inputValue),
                        amountToSwap: Number(inputValue)
                    }, async() => {
                        this.debouncedSmartswapPriceQuote();
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

        await this.context.connectWallet();

        const fromNetworkConfig = _.find(this.props.networks, {
            chainId: this.context.chainIdNumber
        });

        const toNetworkConfig = _.find(this.props.networks, {
            chainId: toChainId
        });

        if(toNetworkConfig === undefined || fromNetworkConfig === undefined){
            return;
        }

        const {response, code, error} = await SmartSwapApiHelper.getEstimateGasAndFees(fromChainId, toChainId);
        if(code !== 200){
            console.error("estimateGasAndFees", response, code, error);
        }


        if(code === 200){
            if(this._componentMounted){
                if(fromNetworkConfig !== undefined){
                    this.props.onGasFeeUpdate(response, fromNetworkConfig.nativeCurrencySymbol, fromNetworkConfig.nativeCurrencyDecimals)
                    if(this._componentMounted){
                        this.setState({
                            estimateGasAndFees: `${((response?.result).toFixed(fromNetworkConfig.nativeCurrencyDecimals) ?? 0) + ' ' + fromNetworkConfig.nativeCurrencySymbol}`
                        });
                    }
                }
            }            
        } else {
            if(this._componentMounted){
                if(fromNetworkConfig !== undefined){
                    let response = {
                        result: 0
                    };
                    this.props.onGasFeeUpdate(response, fromNetworkConfig.nativeCurrencySymbol, fromNetworkConfig.nativeCurrencyDecimals)
                    if(this._componentMounted){
                        this.setState({
                            estimateGasAndFees: (0).toFixed(fromNetworkConfig.nativeCurrencyDecimals) + ' ' + fromNetworkConfig.nativeCurrencySymbol
                        });
                    }
                }
            }            
        }
    }

    estimateProcessingFees = async() => {
        const {fromChainId, toChainId} = this.state;
        
        if(fromChainId === null || toChainId === null){
            return null;
        }
        
        const {response, code, error} = await SmartSwapApiHelper.getEstimateProcessingFees(fromChainId, toChainId);     
        if(code !== 200){
            console.error("estimateProcessingFees", response, code, error);
        }
        if(code === 200){
            return response?.result ?? null;
        } else {
            return null;            
        }
    }

    swap = async() => {
        try {
            this.setState({
                btnClicked: true
            });
            await this.connectWallet();
            const {web3: web3Provider, chainIdNumber, account} = this.context;
            const {networks} = this.props;
            let {amountToSwap, estimatedAmountToSwap, toChainId} = this.state;

            if (amountToSwap === "" || amountToSwap === 0) {
                notificationConfig.error("Enter value to swap");
                this.setState({
                    btnClicked: false
                });
                return;
            }

            if (estimatedAmountToSwap === "" || estimatedAmountToSwap === 0) {
                notificationConfig.error("Enter value to swap");
                this.setState({
                    btnClicked: false
                });
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
                const companyFee = bigInt(bigInt(amountToSwap).multiply(companyFeeRatio)).divide(1000);
                console.log('swap companyFee from amount', companyFee);
                const reimbursementFeeRatio = await reimbursementContractInstance.getLicenseeFee(activeNetworkConfig.licenseeAddress, smartSwapContract.address);
                console.log('swap reimbursementFeeRatio', reimbursementFeeRatio);
                const reimbursementFee = bigInt(bigInt(amountToSwap).multiply(reimbursementFeeRatio)).divide(1000);
                console.log('swap reimbursementFee from amount', reimbursementFee);
                const fee = bigInt(companyFee).add(reimbursementFee);
                console.log('swap fee', fee.toString());
                const totalFee = bigInt(processingFee).add(fee);
                console.log('swap totalFee', totalFee.toString());
                const value = bigInt(amountToSwap).add(totalFee);
                console.log('swap value without fee', amountToSwap.toString());
                console.log('swap value', value.toString());
                await this.getBalance();
                const balance = bigInt(numberToBn(this.userBalance, decimalPoints, true));


                console.log({
                    'this.userBalance': this.userBalance,
                    balance: balance,
                    value: value
                });

                if(value.gt(balance)){
                    notificationConfig.error("Insufficient funds");
                    this.setState({
                        btnClicked: false
                    });
                    return;                  
                }

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
                        // this.setState({
                        //     swapTxhash: hash
                        // });
                    },
                    async(response) => {

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
                                await this.getBalance();
                                this.props.openLedger();
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            notificationConfig.success("Swap Success");
                            this.setState({
                                swapTxhash: response.transactionHash
                            });
                            await this.getBalance();
                            this.props.openLedger();
                        }

                        this.setState({
                            btnClicked: false
                        });

                    }
                );                

            } else {
                console.error("Something went wrong with web3 provider");
                this.setState({
                    btnClicked: false
                });
            }

        } catch(err) {
            console.error("swap", err.message);
            this.setState({
                btnClicked: false
            });
        }
    }

    decimalPointsFilter = (value) => {
        if(this.props.selectedInputMode === this.props.inputModes[0]){
            const decimalPointsFilter = value.match(/^(\d*\.{0,1}\d{0,2}$)/)
            if (decimalPointsFilter === false) {
                return false;
            }
            return true
        }
    }

    smartswapPriceQuote = async() => {
        try {
            const {networks, selectedInputMode, inputModes, tokensUsdPrice} = this.props;
            const {toChainId, fromChainId, amountToSwap} = this.state;
            const fromNetworkConfig = _.find(this.props.networks, {chainId: fromChainId});
            const toNetworkConfig = _.find(this.props.networks, {chainId: toChainId});
            const fromTokeUsdValue = _.find(tokensUsdPrice, {chain: fromNetworkConfig?.chain});
            const toTokeUsdValue = _.find(tokensUsdPrice, {chain: toNetworkConfig?.chain});

            if(fromNetworkConfig !== undefined && toNetworkConfig !== undefined && fromTokeUsdValue !== undefined && toTokeUsdValue !== undefined){
                const amountToReceiveInUsd = () => {
                    if(selectedInputMode === inputModes[0]){
                        return toFixedWithoutRounding(Number(amountToSwap).toFixed(2), 2);
                    } else {
                        if((amountToSwap).toString().length > 0){
                            return toFixedWithoutRounding(numberExponentToLarge(amountToSwap * fromTokeUsdValue?.value), 2);
                        } else {
                            return toFixedWithoutRounding('', 2);
                        }
                    }
                }

                const amountToReceive = () => {
                    if((amountToSwap).toString().length > 0){
                        if(selectedInputMode === inputModes[0]){
                            return toFixedWithoutRounding(numberExponentToLarge(amountToSwap / toTokeUsdValue?.value), 5) + ' ' + toNetworkConfig.nativeCurrencySymbol;
                        } else {
                            return toFixedWithoutRounding(numberExponentToLarge(amountToSwap * (fromTokeUsdValue?.value / toTokeUsdValue?.value)), 5) + ' ' + toNetworkConfig.nativeCurrencySymbol;
                        }
                    } else {
                        // toNetworkConfig.nativeCurrencyDecimals
                        return toFixedWithoutRounding('', 5) + ' ' + toNetworkConfig?.nativeCurrencySymbol ?? '';
                    }
                }

                const swapAmount = () => {
                    if(selectedInputMode === inputModes[0]){
                        return (Number(amountToSwap) / Number(fromTokeUsdValue?.value));
                    } else {
                        return amountToSwap;
                    }
                }

                //console.log("smartswapPriceQuote amount to swap", swapAmount())

                this.props.updateCrossChainQuotePrice(
                    fromChainId,
                    toChainId,
                    toNetworkConfig?.nativeCurrencySymbol ?? '',
                    swapAmount(), {
                    quotePrice: amountToReceive(),
                    quotePriceInUsd: amountToReceiveInUsd(),
                    quoteEstimatedFee: 0
                });
            } else {
                console.error({
                    amountToSwap: amountToSwap,
                    toNetworkConfig: toNetworkConfig,
                    fromTokeUsdValue: fromTokeUsdValue,
                    toTokeUsdValue: toTokeUsdValue
                });
            }

        } catch(err) {
            console.error("smartswapPriceQuote", err.message);
        }     
    }
    
    render() {

        // active network
        const activeNetworkConfig = _.find(this.props.networks, { chainId: this.state.fromChainId });
        const activeNetworkTokenUsdValue = _.find(this.props.tokensUsdPrice, {chain: activeNetworkConfig?.chain});

        // console.log({
        //     activeNetworkTokenUsdValue: activeNetworkTokenUsdValue,
        //     'this.props.tokensUsdPrice': this.props.tokensUsdPrice
        // });

        // To network config - filter out from network then choose first element
        let toNetworkConfig = null;
        if(this.state.toChainId === null || (this.state.toChainId === this.state.fromChainId)){
            toNetworkConfig = (_.filter(this.props.networks, function(network) {
                return network.chainId !== activeNetworkConfig?.chainId;
            }))[0];
        } else {
            toNetworkConfig = _.find(this.props.networks, {
                chainId: this.state.toChainId
            });
        }

        const toNetworkTokenUsdValue = _.find(this.props.tokensUsdPrice, {chain: toNetworkConfig?.chain});

        // all options array
        const supportedChainSelectOptions = [];
        const supportedNativeTokenSelectOptions = [];

        // fallback option
        supportedChainSelectOptions.push({
            value: null,
            label: 'UNSUPPORTED',
            icon: '/images/free-listing/chains/default.png',
            nativeTokenIcon: '/images/free-listing/tokens/default.png',
            nativeTokenSymbol: 'UNSUPPORTED',
            nativeTokenUsdValue: 0
        });

        supportedNativeTokenSelectOptions.push({
            value: null,
            label: 'UNSUPPORTED',
            icon: '/images/free-listing/chains/default.png'
        });

        // by default from blockchain select option
        const defaultFromSelectOption = {
            value: activeNetworkConfig?.chainId ?? null,
            label: activeNetworkConfig?.name ?? 'UNSUPPORTED',
            icon: '/images/free-listing/chains/' + (activeNetworkConfig?.chain ?? 'default').toLowerCase() + '.png',
            nativeTokenIcon: '/images/free-listing/tokens/' + (activeNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png',
            nativeTokenSymbol: activeNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            nativeTokenUsdValue: activeNetworkTokenUsdValue?.value ?? 0
        }
        
        // by default from token select option
        const defaultFromTokenSelectOption = {
            value: activeNetworkConfig?.chainId ?? null,
            label: activeNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            icon: '/images/free-listing/tokens/' + (activeNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png'
        }

        // by default to blockchain select option
        const defaultToSelectOption = {
            value: toNetworkConfig?.chainId ?? null,
            label: toNetworkConfig?.name ?? 'UNSUPPORTED',
            icon: '/images/free-listing/chains/' + (toNetworkConfig?.chain ?? 'default').toLowerCase() + '.png',
            nativeTokenIcon: '/images/free-listing/tokens/' + (toNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png',
            nativeTokenSymbol: toNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            nativeTokenUsdValue: toNetworkTokenUsdValue?.value ?? 0,
            estimatedAmountToReceive: () => {
                if(this.props.selectedInputMode === this.props.inputModes[0]){
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        // console.log({
                        //     calc: "estimatedAmountToReceive dollar mode",
                        //     ex: toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap / tokeUsdValue), toNetworkConfig?.nativeCurrencyDecimals)
                        // });
                        return toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap / tokeUsdValue), toNetworkConfig?.nativeCurrencyDecimals);
                    } else {
                        return toFixedWithoutRounding(0, toNetworkConfig?.nativeCurrencyDecimals);
                    }
                } else {
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        // console.log({
                        //     calc: "estimatedAmountToReceive token mode",
                        //     ex: toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue)), toNetworkConfig?.nativeCurrencyDecimals)
                        // });
                        return toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue)), toNetworkConfig?.nativeCurrencyDecimals);
                    } else {
                        return toFixedWithoutRounding(0, toNetworkConfig?.nativeCurrencyDecimals);
                    }                    
                }
            },
            amountToReceive: () => {
                if(this.props.selectedInputMode === this.props.inputModes[0]){
                    return toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap), 2);
                } else {
                    const tokeUsdValue = toNetworkTokenUsdValue?.value ?? 0;
                    if(!isNaN(tokeUsdValue) && (tokeUsdValue > 0)){
                        // console.log({
                        //     calc: "amountToReceive token mode",
                        //     ex: toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue)), toNetworkConfig?.nativeCurrencyDecimals)
                        // });    
                        return toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap * (defaultFromSelectOption.nativeTokenUsdValue / tokeUsdValue)), toNetworkConfig?.nativeCurrencyDecimals);
                    } else {
                        return toFixedWithoutRounding(0, toNetworkConfig?.nativeCurrencyDecimals);
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
                                <span className="color-white">{this.props.selectedInputMode === this.props.inputModes[0] ? '$' : ''}{toFixedWithoutRounding(numberExponentToLarge(this.state.amountToSwap), activeNetworkConfig?.nativeCurrencyDecimals)}</span>
                                &nbsp;of {defaultFromSelectOption.nativeTokenSymbol} to&nbsp;
                                <span className="color-white">{this.props.selectedInputMode === this.props.inputModes[0] ? '$' : ''}{defaultToSelectOption.amountToReceive()}</span> 
                                &nbsp;of {defaultToSelectOption.nativeTokenSymbol}  |  Estimated swap time:&nbsp;
                                <span className="color-green">~30 seconds</span>
                                &nbsp;
                                <i className="help-circle">
                                    <i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Slippage free trades remain pending until there is a peer to peer match. This mean the trade time can vary greatly. For instant trades, use the Slippage option or click expedite during a pending trade."></i>
                                </i>
                            </p>
                            {/* <p className="font-11 color-light-n">Estimated swap time: <span className="color-green">Instant</span></p> */}
                            <p className="font-11 color-light-n">
                                {/* 26.31% still pending 
                                <i className="help-circle">
                                    &nbsp;<i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i>&nbsp;
                                </i> 
                                | &nbsp;&nbsp; */}

                                <a href="/" className="color-light-n">Start new swap</a>
                            </p>
                            </>
                        }
                    </>
                );
            }
        }        

        // by default to token select option
        const defaultToTokenSelectOption = {
            value: toNetworkConfig?.chainId ?? null,
            label: toNetworkConfig?.nativeCurrencySymbol ?? 'UNSUPPORTED',
            icon: '/images/free-listing/tokens/' + (toNetworkConfig?.nativeCurrencySymbol ?? 'default').toLowerCase() + '.png'            
        }

        // supported chains Options
        this.props.networks.forEach(chainConfig => {
            supportedChainSelectOptions.push({
                value: chainConfig.chainId,
                label: chainConfig.name,
                icon: '/images/free-listing/chains/' + (chainConfig.chain).toLowerCase() + '.png',
                nativeTokenIcon: '/images/free-listing/tokens/' + (chainConfig.nativeCurrencySymbol).toLowerCase() + '.png',
                nativeTokenSymbol: chainConfig.nativeCurrencySymbol
            });
        });

        this.props.networks.forEach(chainConfig => {
            supportedNativeTokenSelectOptions.push({
                value: chainConfig.chainId,
                label: chainConfig.nativeCurrencySymbol,
                icon: '/images/free-listing/tokens/' + (chainConfig.nativeCurrencySymbol).toLowerCase() + '.png',
            });
        });

        // console.log({
        //     activeNetworkConfig: activeNetworkConfig,
        //     defaultFromSelectOption: defaultFromSelectOption,
        //     defaultToSelectOption: defaultToSelectOption
        // });

        const chainOptions = ({ children, ...props }) => (
            <Option className={props.data.label === 'UNSUPPORTED' ? "hidden-option" : ""} {...props} value={props.data.value}>
                <img
                    src={props.data.icon}
                    style={{ width: 15 }}
                    alt={props.data.label}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                />
                {props.data.label}
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
                {props?.data.label}
            </SingleValue>
        );
        
        const tokenOptions = ({ children, ...props }) => (
            <Option className={props.data.label === 'UNSUPPORTED' ? "hidden-option" : ""} {...props} value={props.data.value}>
                <img
                    src={props.data.icon}
                    style={{ width: 15 }}
                    alt={props.data.label}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                />
                {props.data.label}
            </Option>
        );
        
        const singleToken = ({ children, ...props }) => (
            <SingleValue {...props} value={props.data.value}>
                <img
                    src={props.data.icon}
                    style={{ width: 20 }}
                    alt={props.data.label}
                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                />
                {props.data.label}
            </SingleValue>
        );

        return (
            <>  
                {this.state.swapTxhash === null && 
                <>
                    <div className=" form-group-n  items-center-n">
                        <div className="flex-1 w-100-sm flex-auto-sm">
                            <div className="inputs-wrap light-controls-n">
                                <div className="inputs-wrap-control">
                                    <div className="input-box1">
                                        <label htmlFor="" className="form-label">from</label>
                                        <div className="i-outer">
                                            <input
                                                type="number"
                                                step="any"
                                                className={`form-control-n ${this.props.selectedInputMode === this.props.inputModes[0] ? 'dollar-amount-mode' : ''}`}
                                                placeholder={this.state.amountToSwap.length === 0 ? 0 : this.state.amountToSwap}
                                                id="native-token-input"
                                                value={this.state.amountToSwap.length === 0 ? '' : this.state.amountToSwap}
                                                onChange={(e) => this.setAmount(e)}
                                                autoComplete="off"
                                            />
                                            {                                                
                                            this.props.selectedInputMode === this.props.inputModes[0] && 
                                                <span className="currency-ic-n">$</span>                                                
                                            }

                                            {                                                
                                            this.props.selectedInputMode !== this.props.inputModes[0] && 
                                                <></>
                                            }                                           
                                            {/* <span className="currency-ic-n">
                                                {
                                                    this.props.selectedInputMode === this.props.inputModes[0]
                                                        ? '$'
                                                        : 
                                                        <img
                                                            alt={defaultFromSelectOption.nativeTokenSymbol}
                                                            style={{ width: '20px' }}
                                                            src={defaultFromSelectOption.nativeTokenIcon}
                                                        ></img>
                                                }
                                            </span> */}
                                        </div>
                                    </div>
                                    <div className="input-box2">
                                        <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                        <Select
                                            value={defaultFromSelectOption}
                                            onChange={(e) => this.swapDirection(e.value)}
                                            options={supportedChainSelectOptions}
                                            //filterOption={(option) => option.value !== null && option.value !== this.context.chainIdNumber}
                                            components={{ Option: chainOptions, SingleValue: singleChain }}
                                            styles={selectElementStyleOptions("light")}
                                        />
                                    </div>
                                    <div className="input-box2">
                                        <label htmlFor="" className="form-label">TOKEN</label>
                                        <Select
                                            value={defaultFromTokenSelectOption}
                                            onChange={(e) => this.swapDirection(e.value)}
                                            options={supportedNativeTokenSelectOptions}
                                            components={{ Option: tokenOptions, SingleValue: singleToken }}
                                            styles={selectElementStyleOptions("light")}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex jc-sb">
                                <p className="form-label font-normal mb-0">≈ {toFixedWithoutRounding(numberExponentToLarge(this.state.estimatedAmountToSwap), activeNetworkConfig?.nativeCurrencyDecimals)} | 1 {defaultFromSelectOption.nativeTokenSymbol} : ${defaultFromSelectOption.nativeTokenUsdValue}</p>
                                {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                                <p className="form-label font-normal mb-0">
                                    Balance: {this.state.userBalance} {defaultFromSelectOption.nativeTokenSymbol}&nbsp;
                                    <span onClick={(e) => this.setMaxAmount()} className="color-green">MAX</span>
                                </p>
                            </div>
                        </div>
                        <div className="form-ic">
                            <a className="grey-arrow"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.swapDirection(defaultToSelectOption.value);
                                }}
                            >
                                <img width="22" src={Swap} alt="" />
                            </a>
                            <a className="green-arrow"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.swapDirection(defaultToSelectOption.value);
                                }}
                            >
                                <img width="22" src={Swap} alt="" />
                            </a>
                        </div>
                        <div className="flex-1 w-100-sm flex-auto-sm">
                            <div className="inputs-wrap dark-controls-n">
                                <div className="inputs-wrap-control">
                                    <div className="input-box1 ver2 Subh">
                                        <label htmlFor="" className="form-label">to</label>
                                        <div className="i-outer">
                                            <input
                                                type="text"
                                                className={`form-control-n ${this.props.selectedInputMode === this.props.inputModes[0] ? 'dollar-amount-mode' : ''}`}
                                                placeholder="0"
                                                disabled={true}
                                                readOnly={true}
                                                value={defaultToSelectOption.amountToReceive()}
                                            />

                                            {                                                
                                            this.props.selectedInputMode === this.props.inputModes[0] && 
                                                <span className="currency-ic-n ver2">$</span>                                                
                                            }

                                            {                                                
                                            this.props.selectedInputMode !== this.props.inputModes[0] && 
                                                <></>
                                            }

                                            {/* <span className="currency-ic-n ver2">
                                                {
                                                    this.props.selectedInputMode === this.props.inputModes[0]
                                                        ? '$'
                                                        : 
                                                        <img
                                                            alt={defaultToSelectOption.nativeTokenSymbol}
                                                            style={{ width: '20px' }}
                                                            src={defaultToSelectOption.nativeTokenIcon}
                                                        ></img>
                                                }
                                            </span> */}
                                        </div>
                                    </div>
                                    <div className="input-box2 ver2">
                                        <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                        <Select
                                            value={defaultToSelectOption}
                                            onChange={(e) => this.changeToDirection(e.value)}
                                            options={supportedChainSelectOptions}
                                            //filterOption={(option) => ((option.value !== null) && (option.value !== defaultFromSelectOption.value)) }
                                            components={{ Option: chainOptions, SingleValue: singleChain }}
                                            styles={selectElementStyleOptions("dark")}
                                        />
                                    </div>
                                    <div className="input-box2 ver2">
                                        <label htmlFor="" className="form-label">TOKEN</label>
                                        <Select
                                            value={defaultToTokenSelectOption}
                                            onChange={(e) => this.changeToDirection(e.value)}
                                            options={supportedNativeTokenSelectOptions}
                                            //filterOption={(option) => ((option.value !== null) && (option.value !== defaultFromSelectOption.value)) }
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
                            <button className="native-btn ani-1 connect btn-unsupported">
                                {/* <span className="currency">
                                    <img 
                                        style={{filter: 'none', width: '30px', height: '30px'}}
                                        src={('/images/free-listing/chains/default.png').toLowerCase()}
                                        onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                        alt='UNSUPPORTED NETWORK'
                                    ></img>
                                </span> */}
                                <span>UNSUPPORTED NETWORK</span>
                            </button>
                        }

                        {   this.context.isAuthenticated === true && defaultFromSelectOption.value === this.context.chainIdNumber &&
                            <button 
                                disabled={this.state.btnClicked} 
                                className={`
                                    native-btn 
                                    ani-1 
                                    connect 
                                    ${ this.state.btnClicked ? 'cross-over-processing' : '' }
                                    ${this.userBalance == 0 ? 'connect-wallet no-clickable' : ''}
                                `} 
                                onClick={(e) => this.swap()
                            }>
                                <span className="currency">
                                    <img
                                        style={{filter: 'none'}}
                                        alt={defaultFromSelectOption.nativeTokenSymbol}
                                        src={defaultFromSelectOption.nativeTokenIcon}
                                    ></img>
                                </span>

                                {this.state.btnClicked === false ? 'CORSS OVER' : 'Swapping'}
                                {this.state.btnClicked === true &&
                                <LoopCircleLoading
                                    height={"20px"}
                                    width={"20px"}
                                    color={"#ffffff"}
                                />
                                }
                            </button>
                        }

                        <p className='nativ-bottomTxt'>Estimated gas and fees: 
                            <i className="help-circle">
                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Slippage free trades carry higher gas costs than slippage trades. Gas and fees are 100% reimbursed" aria-hidden="true"></i>
                            </i>
                            &nbsp;&nbsp;{this.state.estimateGasAndFees}
                        </p>
                        <div className="swap-outer">
                            {defaultToSelectOption.swapInfoText()}
                        </div>

                    </div>
                </>
                }

                {this.state.swapTxhash !== null &&
                    <div className="success-msg">
                        <i className="fas fa-check"></i>
                        <h4>Swap sent successfully</h4>
                        <p className="cursor" onClick={() => this.props.openLedger()}>Check the ledger below</p> | 
                        <p className="cursor">
                            <a href="/" className="cursor color-light-n">Start another swap</a>
                        </p>
                    </div>
                }
            </>
        )
    }
}

SmartSwap.contextType = WalletContext;