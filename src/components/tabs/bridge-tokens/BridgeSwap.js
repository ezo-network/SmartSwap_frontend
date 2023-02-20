import {WalletContext, EthereumEvents} from '../../../context/WalletProvider';
import React, { PureComponent } from "react";
import {Link} from "react-router-dom";
import _ from "lodash";
import Web3 from 'web3';
import { aggregate } from '@makerdao/multicall';
import PlaceholderLoading from 'react-placeholder-loading'
import Switch from "react-switch";
import CONSTANT from '../../../constants';
import notificationConfig from "../../../config/notificationConfig";
import SourceTokenPopup from "./SourceTokenPopup";
import DestinationTokensPopup from "./DestinationTokensPopup";
import CheckAuthenticityPopup from "./CheckAuthenticityPopup";

/** derivative token side */
import DerivativeTokenPopup from "./derivative-side/DerivativeTokenPopup";

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
    name: 'CUSTOM',
    amount: '',
    address: null,
    isWrappedToken: false,
    balance: 0,
    decimals: null
};

const defaultDestinationTokenData = {
    symbol: 'Choose receiving token',
    chainId: undefined,
    chain: 'CUSTOM',
    name: 'CUSTOM',
    amount: '',
    address: null,
    isWrappedToken: false,
    balance: 0,
    decimals: null
};

const initialState = {
    btnClicked: false,
    btnAction: "CROSS OVER",
    sourceTokenData: {...defaultSourceTokenData},
    destinationTokenData: {...defaultDestinationTokenData},
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
    customTokenBalance: null,
    depositTokenSuccessful: false
}

export default class BridgeSwap extends PureComponent {
    _componentMounted = false;
    pendingNetworkSwitchRequest = false;
    sourceTokenBalance = 0;
    constructor(props) {
        super();
        this.state = {...initialState}

        source = axios.CancelToken.source();

        this.walletConnectCallback = this.walletConnectCallback.bind(this);
        this.setSourceToken = this.setSourceToken.bind(this);
        this.tokenAddedCallback = this.tokenAddedCallback.bind(this);
        //this.wrapTokenAddedCallback = this.wrapTokenAddedCallback.bind(this);
        this.refetch = this.refetch.bind(this);
    }

    componentDidMount = async() => {
        this._componentMounted = true;
		if(this._componentMounted === true){
            console.log('BridgeSwap component mounted');
            await this.resetSelectedTokens();
            await this.getNetworkList();
            await this.getTokenList();
            await this.walletConnectCallback();

            if(window?.ethereum !== undefined){
                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async(chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                    await this.resetSelectedTokens();
                    await this.walletConnectCallback();
                    console.log('changeeeeeeeeeeee');
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
                console.error(errors.metamask.walletNotFound);
            }


            if(this.props.preSelectedSourceTokenData !== undefined){
                if(this.props.preSelectedSourceTokenData.chainId === this.context.chainIdNumber){
                    await this.setSourceToken(
                        this.props.preSelectedSourceTokenData?.name,
                        this.props.preSelectedSourceTokenData?.chainId,
                        this.props.preSelectedSourceTokenData?.chain,
                        this.props.preSelectedSourceTokenData?.address,
                        this.props.preSelectedSourceTokenData?.decimals,
                        this.props.preSelectedSourceTokenData?.chainName
                    ).then(() => {
                        this.setState({
                            isSourceTokenSelected: true,
                            toggleDestinationTokensPopup: true
                        });
                        this.props.onResetLocationState();
                    });
                }
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
          source.cancel("BridgeSwap Component unmounted");
        }
	}

    connectWallet = async() => {
        try {
            const walletConnected = await this.context.connectWallet();
            if(walletConnected){
                await this.walletConnectCallback();
            } else {
                notificationConfig.error(errors.metamask.walletNotConnected);
            }
        } catch(error){
            console.error('connectWallet', error.message)
        }
    }

    resetSelectedTokens = async() => {
		if(this._componentMounted === true){
            // if change changed and source token selected then reset source token to 
            this.setState(prevState => {          
                const sourceTokenData = {...defaultSourceTokenData};
                const destinationTokenData = {...defaultDestinationTokenData};
                return {
                    isSourceTokenSelected: false,
                    isDestinationTokenSelected: false,
                    sourceTokenData,
                    destinationTokenData,
                    depositTokenSuccessful: false
                };
            });
        }            
    }

    toggleSourceTokenPopup = async(type) => {
		if(this._componentMounted === true){
            if(type === 'OPEN'){
                if(this.pendingNetworkSwitchRequest === false){
                    if(this.context.isAuthenticated){
                        await this.getAllProjectList().then(async() => {
                            await this.filterTokenByWalletBalance().then(() => {
                                this.setState({
                                    toggleSourceTokenPopup: !this.state.toggleSourceTokenPopup
                                });
                            });
                        })
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
        if(this.state.isSourceTokenSelected && this.state.sourceTokenData.isWrappedToken === false){
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

    walletConnectCallback = async() => {
        if(this._componentMounted === true){
            this.sourceTokenBalance = 0;
            this.setState({
              customTokenBalance: null,
              wrappedTokens: [],
              projects: [],
              //toggleSourceTokenPopup: false,
              toggleDestinationTokensPopup: false,
              toggleCheckAuthenticityPopup: false
            }, async() => {
                await this.getAllWrappedTokens();
                await this.getAllProjectList();
            });
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
                    }, async() => {
                        this.props.setNetworkList(response, "bridge-tokens");
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
                        }, () => {
                            this.props.onTokenListFetched(response);
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
                    }, () => {
                        this.props.onWrapTokenListFetched(response)
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

    getAllProjectList = async(chainId = null) => {
        try {
            const projectOnChainId = chainId === null ? this.context.chainIdNumber : chainId;
            const {
                response,
                error,
                code
            } = await BridgeApiHelper.getProjects({chainId: projectOnChainId}, source.token);
            console.log({
               'getAllProjectList': projectOnChainId
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
        } catch (error) {
            console.error(error)
        }        
    }

    setSourceToken = async(tokenSymbol, chainId, chain, address, decimals, name, projectChainId = null, projectId = null) => {
        if(this._componentMounted === true){
            this.setState(prevState => {
                
                const sourceTokenData = prevState.sourceTokenData;
                sourceTokenData['symbol'] = tokenSymbol;
                sourceTokenData['chainId'] = chainId;
                sourceTokenData['chain'] = chain;
                sourceTokenData['name'] = name;
                sourceTokenData['address'] = address;
                sourceTokenData['decimals'] = decimals;
                sourceTokenData['isWrappedToken'] = projectId !== null ? true : false;
    
    
                const destinationTokenData = projectId === null
                ? {...defaultDestinationTokenData} : {...defaultSourceTokenData}

                return {
                  sourceTokenData,
                  destinationTokenData,
                  isSourceTokenSelected: true,
                  isDestinationTokenSelected: false
                };
            }, async() => {
                await this.aggregateBalanceOfMultiCall(
                    chainId,
                    [address],
                    this.context.account,
                    decimals
                );

                if(projectId !== null){
                    await this.getAllProjectList(projectChainId).then(() => {
                        // find project and set destination token
                        const project = _.find(this.state.projects, {
                            _id: projectId,
                            chainId: projectChainId
                        });
                        console.log({
                            'projectprojectprojectproject': project,
                            projectChainId: projectChainId
                        });
                        if(project !== undefined){
                            this.setDestinationToken(
                                project.token, 
                                project.chainId, 
                                project.chain, 
                                project.tokenAddress,
                                false
                            );
                        }
                    });
                }               
            });
        }
    }

    setDestinationToken = (tokenSymbol, chainId, chain, address, isWrappedToken) => {
        this.setState(prevState => {
            const networkConfig =  _.find(this.state.networks, {
                chainId: chainId
            });
            const destinationTokenData = prevState.destinationTokenData;
            destinationTokenData['symbol'] = tokenSymbol;
            destinationTokenData['chainId'] = chainId;
            destinationTokenData['chain'] = chain;
            destinationTokenData['address'] = address;
            destinationTokenData['decimals'] = this.state.sourceTokenData.decimals;
            destinationTokenData['name'] = networkConfig.name;
            destinationTokenData['isWrappedToken'] = isWrappedToken
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
        }, async() => {
            await this.aggregateBalanceOfMultiCall(
                this.state.destinationTokenData.chainId,
                [this.state.destinationTokenData.address],
                this.context.account,
                this.state.destinationTokenData.decimals
            );
        });            
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
    
    switchNetwork = async (chainId) => {
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

    aggregateTokenBalanceWithMultiCall = async (chainId, allTokens = [], accountAddress) => {
        try {

            const networkConfig = _.find(this.state.networks, { chainId: Number(chainId) });
            console.log(networkConfig);
            
            const config = {
                rpcUrl: networkConfig.rpc,
                multicallAddress: networkConfig.multicallContractAddress
            };
            
            const multicallTokensConfig = [];
            allTokens.forEach(token => {
                let obj = null;

                if(token.hasOwnProperty('projectId')){
                    obj = {
                        target: token.address,
                        call: ['balanceOf(address)(uint256)', accountAddress],
                        returns: [['BALANCE_OF_' + token.address, val => val / 10 ** Number(token.decimals)]]
                    }
                } else {
                    obj = {
                        target: token.address,
                        call: ['balanceOf(address)(uint256)', accountAddress],
                        returns: [['BALANCE_OF_' + token.address, val => val / 10 ** Number(token.decimals)]]
                    }
                }
                multicallTokensConfig.push(obj);
            });

            console.log(multicallTokensConfig);

            const response = await aggregate(
                multicallTokensConfig,
                config
            );

            const tokensBalances = [];
            await Promise.all(Object.keys(response.results.transformed).map(async (token, index) => {
                const tokenAddress = (token.substring(11)).toLowerCase();
                const isTokenExist = _.find(this.state.tokens, {
                    address: tokenAddress,
                    chainId: Number(chainId)
                });

                
                if (isTokenExist) {
                    console.log("Original token");
                    console.log(`${index} ${isTokenExist.symbol}  ${isTokenExist.chainId} - ${token} - ${response.results.transformed[token]}`)
                    if (response.results.transformed[token] > 0) {
                        tokensBalances.push(isTokenExist);
                        // this.setState(prevState => ({
                        //     tokensWithBalance: [...prevState.tokensWithBalance, isTokenExist]
                        // }))
                    }
                } else {
                    const isWarpTokenExist = _.find(this.state.wrappedTokens, {
                        address: tokenAddress,
                        toChainId: Number(chainId)
                    });

                    if(isWarpTokenExist){
                        console.log("Wrap token");
                        console.log(`${index} ${isWarpTokenExist.tokenSymbol}  ${isWarpTokenExist.toChainId} - ${token} - ${response.results.transformed[token]}`)
                        if (response.results.transformed[token] > 0) {
                            tokensBalances.push(isWarpTokenExist);
                            // this.setState(prevState => ({
                            //     tokensWithBalance: [...prevState.tokensWithBalance, isTokenExist]
                            // }))
                        }
                    }
                }
            }));

            this.setState({
                tokensWithBalance: tokensBalances
            });

        } catch (error) {
            console.log({
                error: error,
                chainId, allTokens, accountAddress
            })
            console.error(error.message);
        }
    }
    
    aggregateWrapTokenBalanceWithMultiCall = async (chainId, wrapTokens = [], accountAddress) => {
        try {

            const networkConfig = _.find(this.state.networks, { chainId: Number(chainId) });            
            const config = {
                rpcUrl: networkConfig.rpc,
                multicallAddress: networkConfig.multicallContractAddress
            };
            
            const multicallTokensConfig = [];
            wrapTokens.forEach(wrapToken => {
                const wrapTokenConfig = _.find(this.state.wrappedTokens, { address: (wrapToken?.address).toLowerCase() });

                // will only work with erc20 token addresses
                var obj = {
                    target: wrapTokenConfig?.address,
                    call: ['balanceOf(address)(uint256)', accountAddress],
                    returns: [['BALANCE_OF_' + wrapTokenConfig?.address, val => val / 10 ** Number(wrapTokenConfig?.decimals)]]
                }
                multicallTokensConfig.push(obj);
            });

            console.log(multicallTokensConfig);

            const response = await aggregate(
                multicallTokensConfig,
                config
            );

            const tokensBalances = [];
            await Promise.all(Object.keys(response.results.transformed).map(async (token, index) => {
                const tokenAddress = (token.substring(11)).toLowerCase();
                const isTokenExist = _.find(this.state.wrappedTokens, {
                    address: tokenAddress,
                    toChainId: Number(chainId)
                });

                console.log("wrap token set");

                if (isTokenExist) {
                    console.log(`${index} ${isTokenExist.tokenSymbol}  ${isTokenExist.toChainId} - ${token} - ${response.results.transformed[token]}`)
                    console.log(response.results.transformed[token] > 0);
                    if (response.results.transformed[token] > 0) {
                        tokensBalances.push(isTokenExist);
                        // this.setState(prevState => ({
                        //     tokensWithBalance: [...prevState.tokensWithBalance, isTokenExist]
                        // }))
                    }
                }
            }));

            
            this.setState({
                tokensWithBalance: tokensBalances
            });

            console.log({
                tokensWithBalance: this.state.tokensWithBalance
            });

        } catch (error) {
            console.log({
                error: error,
                chainId, wrapTokens, accountAddress
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

            if(this.state.sourceTokenData.amount.length === 0){
                notificationConfig.error("Enter amount to cross over");
                return;                
            }


            
            if(this.state.sourceTokenData.amount.trim() === 0){
                notificationConfig.error("Enter amount to cross over");
                return;                                
            }

            console.log(this.state.sourceTokenData.amount.trim().toString());

            const decimalPoints = this.state.sourceTokenData.decimals;
            const pow = bigInt(10).pow(decimalPoints);
            const regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
            let depositAmount = (this.state.sourceTokenData.amount).trim().toString().match(regExp)[0];
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

            if(this._componentMounted){
                this.setState({
                    btnClicked: true,
                    btnAction: "PROCESSING"
                });
            }

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
                    if(this._componentMounted){
                        this.setState({
                            btnAction: "APPROVE TOKEN ACCESS"
                        });
                    }
                    //const diffAmount = depositAmount.sub(allowedSpendLimit);
                    //console.log({ 'diffAmount': (diffAmount).toString() })
                    // get approval
                    await erc20TokenContract.approve(maxAprovalLimit, (hash) => {
                        console.log({ 'approveHash': hash });
                        if(this._componentMounted){
                            this.setState({
                                btnAction: "AWATING APPROVAL..."
                            });
                        }
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

                        if(this._componentMounted){
                            this.setState({
                                btnClicked: false,
                                btnAction: btnAction
                            });
                        }
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
                
                        if(response.code === 'NOT_A_BRIDGE_CONTRACT'){
                            notificationConfig.error(errors.erc20Errors.NOT_A_BRIDGE_CONTRACT('Bridge', networkConfig.bridgeContractAddress));
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
                                if(this._componentMounted){
                                    this.setState({
                                        depositTokenSuccessful: true
                                    });
                                }
                                notificationConfig.success('Swapped Successfully!');
                                await this.updateSourceTokenBalance();
                                this.props.openLedger();
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            if(this._componentMounted){
                                this.setState({
                                    depositTokenSuccessful: true
                                });
                            }
                            notificationConfig.success('Swapped Successfully!');
                            await this.updateSourceTokenBalance();
                            this.props.openLedger();
                        }

                        if(this._componentMounted){
                            this.setState({
                                btnClicked: false,
                                btnAction: btnAction
                            });
                        }
                    }
                );                


            }, (error) => {
                console.log(error);
                if(error?.error !== undefined){
                    notificationConfig.error(error?.error);
                }
                if(this._componentMounted){
                    this.setState({
                        btnClicked: false,
                        btnAction: btnAction
                    });
                }
                return error;
            });


        } catch(err) {
            console.error({
                depositTokensCatch: err.message
            })
        }
    }

    filterTokenByWalletBalance = async () => {
        try {
            this.setState({
                tokensWithBalance: []
            }, async() => {

                //await this.context.connectWallet();
                
                await Promise.all([
                    await this.getAllWrappedTokens()
                ]);

                const [filterTokens, filteredWrappedTokens] = await Promise.all([
                    _.filter(this.state.tokens, {
                        chainId: this.context.chainIdNumber
                    }),
                    _.filter(this.state.wrappedTokens, {
                        toChainId: this.context.chainIdNumber
                    })
                ]);

                const allTokens = [...filterTokens, ...filteredWrappedTokens];

                await this.aggregateTokenBalanceWithMultiCall(this.context.chainIdNumber, allTokens, this.context.account);
            });

        } catch (error) {
            console.error(error.message);
        }
    }

    filterWrappedTokenByWalletBalance = async () => {
        try {
            this.setState({
                tokensWithBalance: []
            }, async() => {
                //await this.context.connectWallet();
                const filteredWrappedTokens = _.filter(this.state.wrappedTokens, {
                    toChainId: this.context.chainIdNumber
                });

                console.log({
                    wrappedTokens: this.state.wrappedTokens,
                    filteredWrappedTokens: filteredWrappedTokens
                });

                await this.aggregateWrapTokenBalanceWithMultiCall(
                    this.context.chainIdNumber, 
                    filteredWrappedTokens, 
                    this.context.account
                );
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    tokenAddedCallback = async() => {
        if(this._componentMounted){
            try {
                await this.getTokenList().then(async() => {
                    await this.getAllWrappedTokens().then(async() => {
                        await this.filterTokenByWalletBalance();
                    })
                });       
            } catch(error){
                console.error("tokenAddedCallback", error.message);
            }
        }
    }

    refetch = async(tokenSideToRefetch) => {
        try {
            if(this._componentMounted){
                await this.getAllWrappedTokens().then(async() => {
                    await this.filterTokenByWalletBalance();
                });
            }
        } catch(error){
            console.error("refetch", error.message);
        }
    }

    resetComponent = async(e = null) => {
        if(this._componentMounted){
            if(e !== null){
                e.preventDefault();
                await this.resetSelectedTokens();
            }
        }
    }

    render() {


        let sourceNetworkConfig = _.find(this.state.networks, {chainId: this.context.chainIdNumber});

        // console.log({
        //     sourceNetworkConfig: sourceNetworkConfig
        // });

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
                {this.state.depositTokenSuccessful === false &&
                <div className="tab-data">
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
                                        alt={sideAIcon ?? 'unsupported'}
                                    ></img>
                                </div>
                                <figcaption>
                                    <span>{sideASymbol}</span>
                                    <span>{sourceNetworkConfig?.name ?? defaultSourceTokenData.name}</span>
                                </figcaption>
                            </figure>
                        </div>
                        <div className="tabDivider">
                            <button
                                className="swap deposit-tokens"
                                onClick={(e) => e.preventDefault()}
                                //onClick={() => this.swapDirections()}
                                //onClick={() => this.toggleTokenSide()}
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
                                        alt={sideBIcon ?? 'unsupported'}
                                    ></img>                                
                                </div>
                                <figcaption>
                                    <span>{sideBSymbol}</span>
                                    <span>{this.state.destinationTokenData.name === 'CUSTOM' ? "network" : this.state.destinationTokenData.name}</span>
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
                                    className={`
                                        btn 
                                        btn-primary 
                                        ${this.state.isDestinationTokenSelected && this.state.isSourceTokenSelected && (this.state.sourceTokenData.amount).trim().toString().length > 0 ? 'can-bridge' : 'cant-bridge'}
                                        ${this.state.btnAction !== 'CROSS OVER' ? 'cross-over-processing' : ''}
                                    `}>
                                    <div className="btn-container">
                                        <img
                                            src={'/images/free-listing/chains/' + (sourceNetworkConfig?.chain + '.png').toLowerCase()}
                                            onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                            alt={sourceNetworkConfig?.chain}
                                        ></img>
                                        {/* {this.state.btnAction} */}

                                        {/* HTML for processing animation */}
                                        PROCESSING&nbsp;<i class='dot one'>.</i><i class='dot two'>.</i><i class='dot three'>.</i> 
                                        {/* HTML for processing animation */}
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
                        <p>Bridge to any EVM chain for FREE with 1:1 derivative token</p>
                    </div>
                </div>
                }
                {this.state.depositTokenSuccessful === true && 
                <div className="success-msg">
                    <i className="fas fa-check"></i>
                    <h4>Token Bridged Successfully</h4>
                    <p className='cursor' onClick={(e) => this.props.openLedger()}>Check the ledger below</p>
                </div>                
                }

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
                        onTokenAddedCallback={this.tokenAddedCallback}
                        onCustomTokenBalanceCheck={this.getCustomTokenBalance}
                        customTokenBalance={this.state.customTokenBalance}
                        projects={this.state.projects}
                        refetch={this.refetch}
                    ></SourceTokenPopup>
                }

                {this.state.toggleDestinationTokensPopup && (this.state.sourceTokenData?.isWrappedToken === false) &&
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
                <div className="bottom-action-bar">
                    <div className="swap-Textlink bridge-Textlink">
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
                                <a href={CONSTANT.APPLY_FOR_LICENSING_ACTION} target="_blank" rel="noreferrer">Apply for licensing</a>
                                <span>|</span>
                                <a href="" onClick={(e) => this.resetComponent(e)} type="button">Bridge another token</a>                        
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

BridgeSwap.contextType = WalletContext;