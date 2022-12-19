import {WalletContext, EthereumEvents} from '../../../context/WalletProvider';
import React, { PureComponent } from "react";
import {Link} from "react-router-dom";
import _ from "lodash";
import Web3 from 'web3';
import { aggregate } from '@makerdao/multicall';
import notificationConfig from "../../../config/notificationConfig";
import SourceTokenPopup from "./SourceTokenPopup";
import DestinationTokensPopup from "./DestinationTokensPopup";
import CheckAuthenticityPopup from "./CheckAuthenticityPopup";

import AuthorityServerApiHelper from "../../../helper/authorityServerApiHelper";
import BridgeApiHelper from "../../../helper/bridgeApiHelper";
import BridgeContract from "../../../helper/bridgeContract";
import ERC20TokenContract from "../../../helper/erc20TokenContract";
import axios from "axios";
import errors from '../../../helper/errorConstantsHelper';
import bigInt from 'big-integer';
import swapImg from "../../../assets/images/reverticon.png";
import SmartExchange from "../../../../src/assets/images/smart-exchange.png";

let source;
//const maxAprovalLimit =  Web3.utils.toBN('115792089237316200000000000000000000000000000000000000000000'); // 60 digit number
// https://velvetshark.com/articles/max-int-values-in-solidity
const maxAprovalLimit =  Web3.utils.toBN(process.env.REACT_APP_MAX_TOKEN_APPROVE_LIMIT); // uint96 max 
const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;
const wrapTokenSymbolPrefixLength = Number((wrapTokenSymbolPrefix).length);


const defaultSourceTokenData = {
    symbol:  'Choose token',
    chainId: undefined,
    chain: 'CUSTOM',
    amount: '',
    address: null,
    isWrappedToken: false,
    balance: 0,
    decimals: null
};

const defaultDestinationTokenData = {
    symbol: 'Wrap a token on',
    chainId: undefined,
    chain: 'chain',
    amount: 0,
    address: null,
    isWrappedToken: false,
    balance: 0,
    decimals: null
};

export default class BridgeSwap extends PureComponent {
    _componentMounted = false;
    pendingNetworkSwitchRequest = false;
    sourceTokenBalance = 0;
    constructor(props) {
        super();
        this.state = {
            btnClicked: false,
            btnAction: 'BRIDGE FOR FREE',
            sourceTokenData: {
                symbol:  'Choose token',
                chainId: undefined,
                chain: 'CUSTOM',
                amount: '',
                address: null,
                isWrappedToken: false,
                balance: 0,
                decimals: null
            },
            destinationTokenData: {
                symbol: 'Wrap a token on',
                chainId: undefined,
                chain: 'chain',
                amount: 0,
                address: null,
                isWrappedToken: false,
                balance: 0,
                decimals: null
            },
            isSourceTokenSelected: false,
            isDestinationTokenSelected: false,
            toggleSourceTokenPopup: false,
            toggleDestinationTokensPopup: false,
            toggleCheckAuthenticityPopup: false,
            networks: [],
            tokens: [],
            tokensWithBalance: [],
            wrappedTokens: [],
            projects: [],
            customTokenBalance: null
        };

        source = axios.CancelToken.source();

        this.walletConnectCallback = this.walletConnectCallback.bind(this);
        this.setSourceToken = this.setSourceToken.bind(this);
        this.tokenAddressCallback = this.tokenAddressCallback.bind(this)
    }

    componentDidMount = async() => {
        this._componentMounted = true;
		if(this._componentMounted === true){

            await this.getNetworkList();
            await this.getTokenList();
            await this.walletConnectCallback();

            if(window?.ethereum !== undefined){
                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async(chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                    await this.resetSelectedTokens();
                    await this.walletConnectCallback();
                });
    
                window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async(accounts) => {
                    console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);
                    await this.walletConnectCallback();
                    if(this.state.isSourceTokenSelected){
                        await this.aggregateBalanceOfMultiCall(
                            this.context.chainIdNumber,
                            [this.state.sourceTokenData.address],
                            this.context.account,
                            this.state.sourceTokenData.decimals
                        );
                    }
                });
    
                window.ethereum.on(EthereumEvents.CONNECT, async (error) => {
                    console.log(EthereumEvents.CONNECT);
                    await this.walletConnectCallback();
                });
    
                window.ethereum.on(EthereumEvents.DISCONNECT, async (error) => {
                    console.log(EthereumEvents.DISCONNECT);
                    await this.walletConnectCallback();          
                });
            } else {
                console.error('Metamask is not installed');
            }
        }
    }
    
    componentDidUpdate = async(prevState) => {
        this._componentMounted = true;
		if(this._componentMounted === true){
            
        }
    }

    componentWillUnmount() {
		this._componentMounted = false;
        if (source) {
          source.cancel("BridgeSwap Component got unmounted");
        }
	}

    connectWallet = async() => {
        try {
            const walletConnected = await this.context.connectWallet();
            if(walletConnected){
                await this.walletConnectCallback();
            } else {
                notificationConfig.error('Matamask wallet not connected');
            }
        } catch(error){
            console.error('connectWallet', error.message)
        }
    }

    resetSelectedTokens = async() => {
		if(this._componentMounted === true){
            // if change changed and source token selected then reset source token to 
            this.setState(prevState => {                       
                const sourceTokenData = prevState.sourceTokenData;
                const destinationTokenData = prevState.destinationTokenData;

                sourceTokenData['symbol'] = defaultSourceTokenData.symbol;
                sourceTokenData['chainId'] = defaultSourceTokenData.chainId;
                sourceTokenData['chain'] = defaultSourceTokenData.chain;
                sourceTokenData['amount'] = defaultSourceTokenData.amount;
                sourceTokenData['address'] = defaultSourceTokenData.address;
                sourceTokenData['isWrappedToken'] = defaultSourceTokenData.isWrappedToken;
                sourceTokenData['balance'] = defaultSourceTokenData.balance;
                sourceTokenData['decimals'] = defaultSourceTokenData.decimals;

                destinationTokenData['symbol'] = defaultDestinationTokenData.symbol;
                destinationTokenData['chainId'] = defaultDestinationTokenData.chainId;
                destinationTokenData['chain'] = defaultDestinationTokenData.chain;
                destinationTokenData['amount'] = defaultDestinationTokenData.amount;
                destinationTokenData['address'] = defaultDestinationTokenData.address;
                destinationTokenData['isWrappedToken'] = defaultDestinationTokenData.isWrappedToken;
                destinationTokenData['balance'] = defaultDestinationTokenData.balance;
                destinationTokenData['decimals'] = defaultDestinationTokenData.decimals;

                return {
                    isSourceTokenSelected: false,
                    isDestinationTokenSelected: false,
                    sourceTokenData,
                    destinationTokenData
                };
            });
        }            
    }

    toggleSourceTokenPopup = async(type) => {
		if(this._componentMounted === true){
            if(type === 'OPEN'){
                if(this.pendingNetworkSwitchRequest === false){
                    if(this.context.isAuthenticated){
                        await this.filterTokenByWalletBalance().then(() => {
                            this.setState({
                                toggleSourceTokenPopup: !this.state.toggleSourceTokenPopup
                            });
                        });
                    } else {
                        notificationConfig.info(errors.connectWalletRequestMessage);
                    }
                } else {
                    notificationConfig.info(errors.switchRequestPending);
                }
            }
            if(type === 'CLOSE'){
                this.setState({
                    toggleSourceTokenPopup: !this.state.toggleSourceTokenPopup
                });
            }
        }
    }

    toggleDestinationTokensPopup = (type) => {
        if(this.state.isSourceTokenSelected){
            if(this.pendingNetworkSwitchRequest === false){
                if(this.context.isAuthenticated === true && (Number(this.context.chainIdNumber) === Number(this.state.sourceTokenData.chainId))){
                    if(this._componentMounted === true){
                        this.setState({
                            toggleDestinationTokensPopup: !this.state.toggleDestinationTokensPopup
                        });
                    }
                } else {
                    notificationConfig.info(errors.switchRequestMessage);                    
                }
            } else {
                notificationConfig.info(errors.switchRequestPending);
            } 
        } else {
            notificationConfig.info(errors.selectSourceTokenMessage);
        }
    }

    toggleCheckAuthenticityPopup = (type) => {
        if(this.pendingNetworkSwitchRequest === false){
            if(this.state.isSourceTokenSelected && this.state.isDestinationTokenSelected){
                if(this._componentMounted === true){
                    this.setState({
                        toggleCheckAuthenticityPopup: !this.state.toggleCheckAuthenticityPopup
                    });
                }
            } else {
                if(!this.state.isSourceTokenSelected){
                    notificationConfig.info(errors.selectSourceTokenMessage);
                    return;
                }
                if(!this.state.isDestinationTokenSelected){
                    notificationConfig.info(errors.selectedDestinationToken);
                    return;
                }
            }
        } else {
            notificationConfig.info(errors.switchRequestPending);
        }
    }

    async walletConnectCallback() {
        if(this._componentMounted === true){
            this.sourceTokenBalance = 0;
            this.setState({
              customTokenBalance: null,
              toggleSourceTokenPopup: false,
              toggleDestinationTokensPopup: false,
              toggleCheckAuthenticityPopup: false
            });
            await this.getAllWrappedTokens();
            await this.getAllProjectList();
        }
    }

    getNetworkList = async() => {
        try {
          const {
            response, 
            error,
            code
          } = await BridgeApiHelper.getNetworkList(source.token);
          
          if(this._componentMounted === true){
              if(code === 200){
                if(this._componentMounted === true){
                    this.setState({
                      networks: response
                    });
                }
              } else {
                console.error(error)
              }
          }
        } catch (error){
          console.error(error)
        }
    }

    getTokenList = async () => {
        try {
            const {
                response, 
                error,
                code
            } = await BridgeApiHelper.getTokenList(source.token);

            if(this._componentMounted === true){
                if(code === 200){
                    if(this._componentMounted === true){
                        this.setState({
                            tokens: response
                        });
                    }
                } else {
                    console.error(error)
                }
            }

        } catch (error){
            console.error(error)
        }    
    }   

    getAllWrappedTokens = async() => {
        try {
          const {
            response,
            error,
            code
          } = await BridgeApiHelper.getWrappedTokens(null, null, true, source.token);
          if(this._componentMounted === true){
              if (code === 200) {
                if(this._componentMounted === true){
                    this.setState({
                      wrappedTokens: response
                    });
                }
              } else {
                console.error(error)
              }
          }
    
        } catch (error) {
          console.error(error)
        }
    }    

    getAllProjectList = async() => {
        try {
            if(this.context.chainIdNumber !== null){
                const {
                    response,
                    error,
                    code
                } = await BridgeApiHelper.getProjects({chainId: this.context.chainIdNumber}, source.token);
                console.log({
                   'getAllProjectList':  this.context.chainIdNumber
                })
                if (this._componentMounted === true) {
                    if (code === 200) {
                        if (this._componentMounted === true) {
                            this.setState({
                                projects: response
                            });
                        }
                    } else {
                        console.error(error)
                    }
                }
            }

        } catch (error) {
            console.error(error)
        }        
    }

    setSourceToken = async(tokenSymbol, chainId, chain, address, decimals) => {
        if(this._componentMounted === true){
            this.setState(prevState => {
                const sourceTokenData = prevState.sourceTokenData;
                sourceTokenData['symbol'] = tokenSymbol;
                sourceTokenData['chainId'] = chainId;
                sourceTokenData['chain'] = chain;
                sourceTokenData['address'] = address;
                sourceTokenData['decimals'] = decimals;
                sourceTokenData['isWrappedToken'] = false;
    
    
                const destinationTokenData = {
                    symbol: 'Wrap a token on',
                    chainId: undefined,
                    chain: 'chain',
                    amount: 0,
                    address: null,
                    decimals: null,
                    isWrappedToken: false
                };
    
                return {
                  sourceTokenData,
                  destinationTokenData,
                  isSourceTokenSelected: true,
                  isDestinationTokenSelected: false
                };
            });
            
            await this.aggregateBalanceOfMultiCall(
                chainId,
                [address],
                this.context.account,
                decimals
            );
        }
    }

    setDestinationToken = (tokenSymbol, chainId, chain, address) => {
        this.setState(prevState => {
            const destinationTokenData = prevState.destinationTokenData;
            destinationTokenData['symbol'] = tokenSymbol;
            destinationTokenData['chainId'] = chainId;
            destinationTokenData['chain'] = chain;
            destinationTokenData['address'] = address;
            destinationTokenData['decimals'] = this.state.sourceTokenData.decimals;
            destinationTokenData['isWrappedToken'] = true;            
            return {
                destinationTokenData,
                isDestinationTokenSelected: true
            };
        });
    }

    swapDirections = async() => {
        
        if(this.state.isSourceTokenSelected === false){
            notificationConfig.error(errors.sourceTokenNotSelected);
            return;
        }
        if(this.state.isDestinationTokenSelected === false){
            notificationConfig.error(errors.destinationTokenNotSelected);
            return;
        }

        this.setState(prevState => {
            const sourceTokenData = prevState.destinationTokenData;
            const destinationTokenData = prevState.sourceTokenData;
            return {
                sourceTokenData,
                destinationTokenData
            };
        });    
        
        await this.aggregateBalanceOfMultiCall(
            this.state.destinationTokenData.chainId,
            [this.state.destinationTokenData.address],
            this.context.account,
            this.state.destinationTokenData.decimals
        );
        
    }

    addNetworkToWallet = async(chainId) => {
        try {
            
          const networkConfig = _.find(this.state.networks, {chainId: Number(chainId)});

          console.log({
            addNetworkToWalletNetworkConfig: networkConfig,
            chainId: chainId
          });
    
          if(networkConfig !== undefined){
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: Web3.utils.toHex(networkConfig.chainId),
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
              });
            }).catch((error) => {
              console.error({
                addNetworkToWalletError: error
              });
            });
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
    
    switchNetwork = async (chainId, actionType = null) => {
        try {
            if(this.pendingNetworkSwitchRequest === false){
                if (Number(this.context.chainIdNumber) !== Number(chainId)) {
                    this.pendingNetworkSwitchRequest = true;
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: Web3.utils.toHex(chainId) }],
                    }).then((response) => {
                        this.pendingNetworkSwitchRequest = false;
                    }).catch(async (error) => {
                        console.error(error);
                        if (error.code === -32002) {
                            notificationConfig.info(errors.switchRequestPending);
                            this.pendingNetworkSwitchRequest = true;
                        }
    
                        if (error.code === 4902) {
                            notificationConfig.error(errors.metamask.networkNotFound);
                            await this.addNetworkToWallet(chainId);
                            this.pendingNetworkSwitchRequest = false;
                        }
    
                        if (error.code === 4001) {
                            this.pendingNetworkSwitchRequest = false;
                        }
    
                    });
                }
            } else {
                notificationConfig.info(errors.switchRequestPending);                
                this.pendingNetworkSwitchRequest = true;
            }
        } catch (err) {
            console.error(err);
        }
    }

    aggregateBalanceOfMultiCall = async(chainId, tokenAddresses = [], accountAddress, decimals) => {
        try {

            const networkConfig = _.find(this.state.networks, {chainId: Number(chainId)});

            console.log(networkConfig);

            const config = {
                rpcUrl: networkConfig.rpc,
                multicallAddress: networkConfig.multicallContractAddress
            };
        
            const multicallTokensConfig = [];
            tokenAddresses.forEach(tokenAddress => {
                // will only work with erc20 token addresses
                var obj = {
                    target: tokenAddress,
                    call: ['balanceOf(address)(uint256)', accountAddress],
                    returns: [['BALANCE_OF_' + tokenAddress, val => val / 10 ** decimals]]
                }
                multicallTokensConfig.push(obj);
            });
            
            const response = await aggregate(
                multicallTokensConfig,
                config
            );
            
            Object.keys(response.results.transformed).forEach((token, index) => {
                console.log(response.results.transformed[token]);
                const balanceInDecimals = (response.results.transformed[token]).toFixed(decimals);
                console.log(`${index} ${token} - ${balanceInDecimals}`)
                this.sourceTokenBalance = balanceInDecimals;

                const sourceTokenData = {...this.state.sourceTokenData};
                sourceTokenData.balance = this.sourceTokenBalance;
                if(this._componentMounted === true){
                    this.setState({sourceTokenData});
                }
            });
          
        } catch(error){
          console.error(error.message);
        }
    }    

    aggregateTokenBalanceWithMultiCall = async (chainId, tokenAddresses = [], accountAddress) => {
        try {

            const networkConfig = _.find(this.state.networks, { chainId: Number(chainId) });
            console.log(networkConfig);
            
            const config = {
                rpcUrl: networkConfig.rpc,
                multicallAddress: networkConfig.multicallContractAddress
            };
            
            const multicallTokensConfig = [];
            tokenAddresses.forEach(tokenAddress => {
                const token = _.find(this.state.tokens, { address: (tokenAddress).toLowerCase() });
                // will only work with erc20 token addresses
                var obj = {
                    target: tokenAddress,
                    call: ['balanceOf(address)(uint256)', accountAddress],
                    returns: [['BALANCE_OF_' + tokenAddress, val => val / 10 ** Number(token.decimals)]]
                }
                multicallTokensConfig.push(obj);
            });

            console.log(multicallTokensConfig);

            const response = await aggregate(
                multicallTokensConfig,
                config
            );

            Object.keys(response.results.transformed).forEach((token, index) => {
                const tokenAddress = (token.substring(11)).toLowerCase();
                const isTokenExist = _.find(this.state.tokens, {
                    address: tokenAddress,
                    chainId: Number(chainId)
                });
                if (isTokenExist) {
                    console.log(`${index} ${isTokenExist.symbol}  ${isTokenExist.chainId} - ${token} - ${response.results.transformed[token]}`)
                    if (response.results.transformed[token] > 0) {
                        this.setState(prevState => ({
                            tokensWithBalance: [...prevState.tokensWithBalance, isTokenExist]
                        }))
                    }
                }
            });
        } catch (error) {
            console.log({
                error: error,
                chainId, tokenAddresses, accountAddress
            })
            console.error(error.message);
        }
    }    

    getCustomTokenBalance = async(tokenAddress) => {
        try {

            tokenAddress = (tokenAddress).toLowerCase();

            const networkConfig = _.find(this.state.networks, {chainId: Number(this.context.chainIdNumber)});

            console.log(tokenAddress);
            console.log(networkConfig);

            const config = {
                rpcUrl: networkConfig.rpc,
                multicallAddress: networkConfig.multicallContractAddress
            };
        
            const multicallTokensConfig = [];
            // will only work with erc20 token addresses
            const key = 'BALANCE_OF_' + tokenAddress
            var obj = {
                target: tokenAddress,
                call: ['balanceOf(address)(uint256)', this.context.account],
                returns: [['BALANCE_OF_' + tokenAddress, val => val]]
            }

            multicallTokensConfig.push(obj);
            
            const response = await aggregate(
                multicallTokensConfig,
                config
            );

            console.log({
                'custom token balance': (response.results.transformed[key]).toString()
            });
                        
            if(response.results.transformed){
                this.setState({
                    customTokenBalance: (response.results.transformed[key]).toString()
                })
            }
          
        } catch(error){
          console.error(error.message);
          return false;
        }
    }

    updateSourceTokenBalance = async() => {
        await this.aggregateBalanceOfMultiCall(
            this.state.sourceTokenData.chainId,
            [this.state.sourceTokenData.address],
            this.context.account,
            this.state.sourceTokenData.decimals
        );        
    }

    setMaxAmount = () => {
        const sourceTokenData = {...this.state.sourceTokenData};
        const destinationTokenData = {...this.state.destinationTokenData};
        sourceTokenData.amount = this.sourceTokenBalance;
        destinationTokenData.amount = this.sourceTokenBalance;
        this.setState({sourceTokenData, destinationTokenData});
    }

    setAmount = (amount) => {
        if(!isNaN(amount)){
            const sourceTokenData = {...this.state.sourceTokenData};
            const destinationTokenData = {...this.state.destinationTokenData};
            sourceTokenData.amount = amount;
            destinationTokenData.amount = amount;
            this.setState({sourceTokenData, destinationTokenData});
        }
    }

    depositTokens = async() => {
        try {
            if(this.state.isSourceTokenSelected === false){
                notificationConfig.error(errors.sourceTokenNotSelected);
                return;
            }
            if(this.state.isDestinationTokenSelected === false){
                notificationConfig.error(errors.destinationTokenNotSelected);
                return;
            }
            
            const decimalPoints = this.state.sourceTokenData.decimals;
            const pow = bigInt(10).pow(decimalPoints);
            const regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
            let depositAmount = this.state.sourceTokenData.amount.toString().match(regExp)[0];
            depositAmount = Number(depositAmount * pow.toJSNumber()).toFixed(0);
            depositAmount = bigInt(depositAmount).toString();
            depositAmount = Web3.utils.toBN(depositAmount);
            
            let balance = (this.sourceTokenBalance).toString();
            balance = Number(balance * pow.toJSNumber()).toFixed(0);
            balance = bigInt(balance).toString();
            balance = Web3.utils.toBN(balance);

            console.log({
                inputAmount: (depositAmount).toString(),
                balance: (balance).toString(),
                cond: depositAmount.gt(balance),
                decimals: decimalPoints
            });

            if(depositAmount.gt(balance)){
                notificationConfig.error(errors.amountGreaterThanBalance);
                return;
            }

            if(depositAmount.lte(Web3.utils.toBN('0'))){
                notificationConfig.error(errors.amountEqualToZero);                
                return;
            }

            const btnAction = this.state.btnAction;

            this.setState({
                btnClicked: true,
                btnAction: "PROCESSING..."
            });

            // deposit tokens

            // check for allowence and approval
            const networkConfig = _.find(this.state.networks, {chainId: this.context.chainIdNumber});

            const erc20TokenContract = new ERC20TokenContract(
                this.context.web3,
                this.context.account,
                this.state.sourceTokenData.address,
                networkConfig.bridgeContractAddress
            );

            await erc20TokenContract.allowance(async(response) => {

                console.log({allowance: response});

                // get apporval
                const allowedSpendLimit = Web3.utils.toBN((response).toString());
                //const depositAmountInWei = Number(depositAmount) * (10 ** Number(this.state.sourceTokenData.decimals));

                console.log({
                    depositAmount: (depositAmount).toString(),
                    allowedSpendLimit: (allowedSpendLimit).toString(),
                    cond: depositAmount.gt(allowedSpendLimit)
                });

                if (depositAmount.gt(allowedSpendLimit)) {
                    this.setState({
                        btnAction: "APPROVE TOKEN ACCESS"
                    });
                    //const diffAmount = depositAmount.sub(allowedSpendLimit);
                    //console.log({ 'diffAmount': (diffAmount).toString() })
                    // get approval
                    await erc20TokenContract.approve(maxAprovalLimit, (hash) => {
                        console.log({ 'approveHash': hash });
                        this.setState({
                            btnAction: "AWATING APPROVAL..."
                        });
                    }, (response) => {
                        console.log({
                            approveReceiptResponse: response
                        });

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
                            notificationConfig.error("execution reverted: TransferHelper: TRANSFER_FROM_FAILED");                        
                        }
                
                        if(response.code === 'NOT_A_CONTRACT'){
                            notificationConfig.error(errors.erc20Errors.NOT_A_CONTRACT('Token', this.state.sourceTokenData.address));
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
                                notificationConfig.success('Successfully Approved');
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            notificationConfig.success('Successfully Approved');
                        }

                        this.setState({
                            btnClicked: false,
                            btnAction: btnAction
                        });
                    });         
                    return;
                }

                // deposit tokens
                const bridgeContract = new BridgeContract(this.context.web3, this.context.account, networkConfig.bridgeContractAddress);
                await bridgeContract.depositTokens(
                    this.state.sourceTokenData.address,
                    depositAmount,
                    this.state.destinationTokenData.chainId,
                    async (hash) => {
                        console.log({
                            hash: hash
                        });
                    },
                    async (response) => {
                        console.log(response)
                        
                        if (response.code >= 4001 && response.code <= 4901) {
                            // https://blog.logrocket.com/understanding-resolving-metamask-error-codes/#4001
                            notificationConfig.error(response.message);
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
                            notificationConfig.error("execution reverted: TransferHelper: TRANSFER_FROM_FAILED");                        
                        }
                
                        if(response.code === 'NOT_A_CONTRACT'){
                            notificationConfig.error(errors.erc20Errors.NOT_A_CONTRACT('Bridge', networkConfig.bridgeContractAddress));
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
                                notificationConfig.success('Swapped Successfully!');
                                await this.updateSourceTokenBalance();
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            notificationConfig.success('Swapped Successfully!');
                            await this.updateSourceTokenBalance();
                        }

                        this.setState({
                            btnClicked: false,
                            btnAction: btnAction
                        });
                    }
                );                


            }, (error) => {
                console.log(error);
                if(error?.error !== undefined){
                    notificationConfig.error(error?.error);
                }
                this.setState({
                    btnClicked: false,
                    btnAction: btnAction
                });
                return error;
            });


        } catch(err) {
            console.error({
                depositTokensCatch: err.message
            })
        }
    }

    claimToken = async(depositTxHash, depositTokenNetwork) => {
        try {
            console.log('send claim');
            await this.context.connectWallet();            
            const {response, code, error} = await AuthorityServerApiHelper.getAuthoritySignature(depositTxHash, depositTokenNetwork);
            if(code === 200){
                // check for allowence and approval
                const networkConfig = _.find(this.state.networks, {chainId: this.context.chainIdNumber});
                if(networkConfig !== undefined){
                    const bridgeContract = new BridgeContract(this.context.web3, this.context.account, networkConfig.bridgeContractAddress);

                    await bridgeContract.claimToken(
                        response.originalToken,
                        response.originalChainID,
                        depositTxHash,
                        response.to,
                        response.value,
                        response.originalChainID,
                        response.signature,
                        async (hash) => {
                            console.log({
                                hash: hash
                            });
                        },
                        async (response) => {
                            console.log(response)
                            
                            if (response.code >= 4001 && response.code <= 4901) {
                                // https://blog.logrocket.com/understanding-resolving-metamask-error-codes/#4001
                                notificationConfig.error(response.message);
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
                                notificationConfig.error("execution reverted: TransferHelper: TRANSFER_FROM_FAILED");                        
                            }
                    
                            if(response.code === 'NOT_A_CONTRACT'){
                                notificationConfig.error(errors.erc20Errors.NOT_A_CONTRACT('Bridge', networkConfig.bridgeContractAddress));
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
                                    notificationConfig.success('Swapped Successfully!');
                                    //await this.updateSourceTokenBalance();
                                }
                            }
                                        
                            if(response.status === 1) {
                                //response.transactionHash
                                notificationConfig.success('Swapped Successfully!');
                                //await this.updateSourceTokenBalance();
                            }
    
                            this.setState({
                                btnClicked: false
                                //btnAction: btnAction
                            });
                        }
                    ); 

                }

            } else {
                console.log(error)
                // if(error.includes('Confirming:')){
                //     notificationConfig.info("warning", "Please wait!, Deposit token transaction is not yet confirmed completely"); 
                //     return
                // }

                // if(error.includes('Wrong transaction:')){
                //     notificationConfig.info("error", "Wrong deposit token transaction"); 
                //     return                    
                // }
            }
        } catch(err) {
            console.error({
                claimToken: err.message
            })
        }
    }

    filterTokenByWalletBalance = async () => {
        try {
            this.setState({
                tokensWithBalance: []
            });

            await this.context.connectWallet();
            
            const groupedTokenByNetwork = this.state.tokens.reduce(function (r, token) {
                r[token.chainId] = r[token.chainId] || [];
                r[token.chainId].push(token.address);
                return r;
            }, Object.create(null));

            Object.keys(groupedTokenByNetwork).forEach(async (network) => {
                // only active network
                if(Number(this.context.chainIdNumber) === Number(network)){
                    console.log(this.context.account);
                    await this.aggregateTokenBalanceWithMultiCall(network, groupedTokenByNetwork[network], this.context.account);
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    tokenAddressCallback = async() => {
        await this.getTokenList().then(async() => {
            await this.filterTokenByWalletBalance();
        });
    }

    render() {


        let sourceNetworkConfig = _.find(this.state.networks, {chainId: this.context.chainIdNumber});

        console.log({
            sourceNetworkConfig: sourceNetworkConfig
        });

        if(sourceNetworkConfig === undefined){
            sourceNetworkConfig = {};
        }

        let sideAIcon = this.state.sourceTokenData.isWrappedToken === true
            ? ((this.state.sourceTokenData.symbol.substring(wrapTokenSymbolPrefixLength)).toLowerCase()).toString()
            : ((this.state.sourceTokenData.symbol).toLowerCase()).toString();

        let sideASymbol = this.state.sourceTokenData.isWrappedToken === true
            ? (this.state.sourceTokenData.symbol.substring(-wrapTokenSymbolPrefixLength, wrapTokenSymbolPrefixLength)).toLowerCase() + 
              this.state.sourceTokenData.symbol.substring(wrapTokenSymbolPrefixLength)
            : this.state.sourceTokenData.symbol;

        let sideBIcon = this.state.destinationTokenData.isWrappedToken === true
        ? ((this.state.destinationTokenData.symbol.substring(wrapTokenSymbolPrefixLength)).toLowerCase()).toString()
        : ((this.state.destinationTokenData.symbol).toLowerCase()).toString();            

        let sideBSymbol = this.state.destinationTokenData.isWrappedToken === true
        ? (this.state.destinationTokenData.symbol.substring(-wrapTokenSymbolPrefixLength, wrapTokenSymbolPrefixLength)).toLowerCase() + 
          this.state.destinationTokenData.symbol.substring(wrapTokenSymbolPrefixLength)
        : this.state.destinationTokenData.symbol;

        return (
            <>
                <div className="tabRow">
                    <div className="tabCol">
                        <div className="d-flex balance-row">
                            <div className="b-text">
                                Balance: {this.state.sourceTokenData.balance} &nbsp;<span className="cursor" onClick={() => this.setMaxAmount()}>MAX</span>
                            </div>
                        </div>
                    </div>
                    <div className="tabCol">
                        <button onClick={(e) => this.toggleCheckAuthenticityPopup()} className="color-green button-link">Check authenticity</button>
                    </div>
                </div>
                <div className="tabRow">
                    <div className="tabCol">
                        <label>DEPOSIT</label>
                        <div className="from-token inputIcon white">
                            <i>
                                <img
                                    src={'/images/free-listing/tokens/' + (sideAIcon + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                    alt="from-token-input-icon"
                                ></img>
                            </i>
                            <input 
                                className="from-token-input" 
                                type="text" 
                                onChange={(e) => this.setAmount(e.target.value)} 
                                value={this.state.sourceTokenData.amount} 
                                placeholder="0"
                            ></input>
                        </div>
                        <figure className="from-token-selector" onClick={(e) => this.toggleSourceTokenPopup('OPEN')}>
                            <div className="figIcon">
                                <img
                                    src={'/images/free-listing/tokens/' + (sideAIcon + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                    alt={this.state.sourceTokenData.chain}
                                ></img>
                            </div>
                            <figcaption>
                                <span>{sideASymbol}</span>
                                <span>{sourceNetworkConfig?.chain ?? defaultSourceTokenData.chain}</span>
                            </figcaption>
                        </figure>
                    </div>
                    <div className="tabDivider">
                        <button 
                            className="swap"
                            //onClick={() => this.swapDirections()}
                        >
                            <img src={swapImg} alt="swap-directions-button"></img>
                        </button>
                    </div>
                    <div className="tabCol">
                        <label>RECEIVE</label>
                        <div className="to-token inputIcon black">
                            <i>
                                <img
                                    src={'/images/free-listing/tokens/' + (sideBIcon + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                    alt="to-token-input-icon"
                                ></img>
                            </i>
                            <input className="to-token-input" type="text" placeholder="0" value={this.state.destinationTokenData.amount} readOnly></input>
                        </div>
                        <figure className="to-token-selector" onClick={(e) => this.toggleDestinationTokensPopup()}>
                            <div className="figIcon">
                                <img 
                                    src={'/images/free-listing/tokens/' + (sideBIcon + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                    alt={this.state.destinationTokenData.chain}
                                ></img>
                            </div>
                            <figcaption>
                                <span>{sideBSymbol}</span>
                                <span>{this.state.destinationTokenData.chain}</span>
                            </figcaption>
                        </figure>
                    </div>
                </div>
                <div className="tabRow hasBtn action-btn">
                    {
                        this.context.isAuthenticated === false && 
                        <button onClick={() => this.connectWallet()} className="btn btn-primary inactive">CONNECT YOUR WALLET</button>
                    }
                    {
                        this.context.isAuthenticated === true && (Number(this.context.chainIdNumber) !== sourceNetworkConfig?.chainId ?? null) && 
                        <button className="btn btn-unsupported" onClick={(e) => e.preventDefault()}>
                            <div className="btn-container">
                                {/* <img 
                                    src={'/images/free-listing/chains/' + (this.state.sourceTokenData.chain + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                    alt={this.state.sourceTokenData.chain}
                                ></img> */}
                                <span>UNSUPPORTED NETWORK</span>
                            </div>
                        </button>                        
                    }
                    {
                        this.context.isAuthenticated === true && 
                        (Number(this.context.chainIdNumber) === (Number(sourceNetworkConfig?.chainId) ?? null)) && 
                        <>
                            <button 
                                disabled={
                                    this.state.btnClicked 
                                    || !this.state.isDestinationTokenSelected 
                                    || !this.state.isSourceTokenSelected
                                }
                                onClick={
                                    () => this.depositTokens()
                                }
                                className="btn btn-primary">
                                    <div className="btn-container">
                                        <img 
                                            src={'/images/free-listing/chains/' + (sourceNetworkConfig?.chain + '.png').toLowerCase()}
                                            onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                            alt={sourceNetworkConfig?.chain}
                                        ></img>
                                        {this.state.btnAction}                                    
                                    </div>
                            </button>
                        </>
                    }
                    {/* {
                        this.context.isAuthenticated === true && 
                        (Number(this.context.chainIdNumber) === Number(this.state.sourceTokenData.chainId)) && 
                        this.sourceTokenBalance <= 0 &&
                        this.state.isDestinationTokenSelected &&
                        this.state.isSourceTokenSelected &&
                        <button className="btn btn-primary">{`Insufficient ${this.state.sourceTokenData.symbol} balance`}</button>
                    } */}
                    <p>Bridge to any EVM chain for free with 1:1 derivative token</p>
                </div>

                {this.state.toggleSourceTokenPopup &&
                <SourceTokenPopup 
                    show={this.state.toggleSourceTokenPopup} 
                    closePopupCallback={this.toggleSourceTokenPopup}
                    tokens={this.state.tokensWithBalance}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    sourceTokenSelectedCallback={this.setSourceToken}
                    accountAddress={this.context.account}
                    walletConnected={this.context.isAuthenticated}
                    chainId={this.context.chainIdNumber}
                    onTokenAddedCallback={this.tokenAddressCallback}
                    onCustomTokenBalanceCheck={this.getCustomTokenBalance}
                    customTokenBalance={this.state.customTokenBalance}
                    projects={this.state.projects}
                ></SourceTokenPopup>
                }

                {this.state.toggleDestinationTokensPopup &&   
                <DestinationTokensPopup 
                    chainId={this.context.chainIdNumber}
                    show={this.state.toggleDestinationTokensPopup} 
                    closePopupCallback={this.toggleDestinationTokensPopup}
                    tokens={this.state.tokens}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    selectedSourceToken={this.state.sourceTokenData}
                    destinationTokenSelectedCallback={this.setDestinationToken}
                    projects={this.state.projects}
                ></DestinationTokensPopup>
                }
                
                {this.state.toggleCheckAuthenticityPopup &&
                <CheckAuthenticityPopup 
                    show={this.state.toggleCheckAuthenticityPopup} 
                    closePopupCallback={this.toggleCheckAuthenticityPopup}
                    networks={this.state.networks}
                    selectedSourceToken={this.state.sourceTokenData}
                    selectedDestinationToken={this.state.destinationTokenData}
                ></CheckAuthenticityPopup>
                }


                {/** Bottom bar */}
                <div className="bottom-action-bar swap-Textlink bridge-Textlink">
                    <div className="powertextBX">
                        <p className="poweredBy">
                            Powered by
                            <img alt="smart exchange" src={SmartExchange} />
                            {/* <a href="#">Start new swap</a> */}
                        </p>
                        <div className="powertextBX-links">
                            <Link to='/freelisting'>Free listing</Link>
                            <span>|</span>
                            {/* <a href="">Free license</a> */}
                            <a href="">Apply for licensing</a>

                            <a style={{marginLeft: "15px"}} href="">Bridge another token</a>
                        </div>
                    </div>
                </div>

                {/* Success message */} 
                {/* <div className="success-msg">
                    <i className="fas fa-check"></i>
                    <h4>Token Bridged Successfully</h4>
                    <p>Check the ledger below</p>
                </div> */}
            </>            
        );
    }
}

BridgeSwap.contextType = WalletContext;