import React, { PureComponent, lazy, Suspense } from "react";
import _ from "lodash";
import Web3 from 'web3';
import { aggregate } from '@makerdao/multicall';
import notificationConfig from "../../config/notificationConfig";
import swapImg from "../../assets/images/reverticon.png";
import SourceTokenPopup from "../../components/bridge-tokens/SourceTokenPopup";
import DestinationTokensPopup from "../../components/bridge-tokens/DestinationTokensPopup";
import CheckAuthenticityPopup from "../../components/bridge-tokens/CheckAuthenticityPopup";
import web3Config from "../../config/web3Config";
import BridgeApiHelper from "../../helper/bridgeApiHelper";
import BridgeContract from "../../helper/bridgeContract";
import ERC20TokenContract from "../../helper/erc20TokenContract";
import styled from 'styled-components';
import axios from "axios";
import errors from '../../helper/errorConstantsHelper';

let source;
//const maxAprovalLimit =  Web3.utils.toBN('115792089237316200000000000000000000000000000000000000000000'); // 60 digit number
// https://velvetshark.com/articles/max-int-values-in-solidity
const maxAprovalLimit =  Web3.utils.toBN(process.env.REACT_APP_MAX_TOKEN_APPROVE_LIMIT); // uint96 max 
const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;
const wrapTokenSymbolPrefixLength = Number((wrapTokenSymbolPrefix).length);



export default class BridgeSwap extends PureComponent {
    _isMounted = false;
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
                amount: 0,
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
            walletConnected: false,
            web3Instance: null,
            chainId: null,
            accountAddress: null,
            networks: [],
            tokens: [],
            tokensWithBalance: [],
            wrappedTokens: [],
            customTokenBalance: null
        };

        source = axios.CancelToken.source();

        this.connectWallet = this.connectWallet.bind(this);
        this.walletConnectCallback = this.walletConnectCallback.bind(this);
        this.setSourceToken = this.setSourceToken.bind(this);
        this.tokenAddressCallback = this.tokenAddressCallback.bind(this)
    }

    componentDidMount = async() => {
        this._isMounted = true;
		if(this._isMounted === true){
            await this.getNetworkList();
            await this.getTokenList(); 
            await this.getAllWrappedTokens();       
            await this.connectWallet();
        }
    }
    
    componentDidUpdate(newProps) {
        if (typeof window.ethereum !== 'undefined') {
            // detect Network account change
            window.ethereum.on('chainChanged', networkId => {
                //console.log('chainChanged', networkId);
                this.connectWallet();
            });

            window.ethereum.on('accountsChanged', async(accounts) => {          
                //console.log('accountChanged', accounts);
                if(accounts.length > 0){
                    await web3Config.connectWallet(0);
                    await this.walletConnectCallback(true, web3Config.getWeb3());
                } else {
                    await this.walletConnectCallback(false, null);              
                }
            });

            window.ethereum.on('disconnect', async (error) => {
                await this.walletConnectCallback(false, null);          
            });
        }
    }  

    componentWillUnmount() {
		this._isMounted = false;
        if (source) {
          source.cancel("BridgeSwap Component got unmounted");
        }
	}

    toggleSourceTokenPopup = async() => {
        if(this.pendingNetworkSwitchRequest === false){
            if(this.state.walletConnected){
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

    toggleDestinationTokensPopup = () => {
        if(this.state.isSourceTokenSelected){
            if(this.pendingNetworkSwitchRequest === false){
                if(this.state.walletConnected === true && (Number(web3Config.getNetworkId()) === Number(this.state.sourceTokenData.chainId))){
                    this.setState({
                        toggleDestinationTokensPopup: !this.state.toggleDestinationTokensPopup
                    });
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

    toggleCheckAuthenticityPopup = () => {
        if(this.pendingNetworkSwitchRequest === false){
            if(this.state.isSourceTokenSelected && this.state.isDestinationTokenSelected){
                this.setState({
                    toggleCheckAuthenticityPopup: !this.state.toggleCheckAuthenticityPopup
                });
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

    connectWallet = async() => {
    
        if (typeof window.ethereum == 'undefined') {
          console.log('MetaMask is not installed!');
          notificationConfig.error(errors.metamask.walletNotFound);
          return;
        }
    
        await web3Config.connectWallet(0).then(async(response) => {
            if(this._isMounted === true){
                if(window.ethereum.isConnected() === true){
                  if(response === true){
                    await this.walletConnectCallback(true, web3Config.getWeb3());
                    //notificationConfig.success('Wallet connected');
                  } else {
                    notificationConfig.info(errors.metamask.walletNotConnected);                  
                  }
                } else {
                  notificationConfig.info(errors.metamask.walletNotConnected);        
                }
            }
        }).catch(error => {
          console.log({
            error:error
          });
        });
    }

    async walletConnectCallback(walletConnected, web3Instance) {
        this.setState({
          walletConnected: walletConnected,
          web3Instance: web3Instance,
          chainId: web3Config.getNetworkId(),
          accountAddress: web3Config.getAddress()
        });

        this.setState(prevState => {
            const newNetworkId = web3Config.getNetworkId();
            const networkConfig = _.find(this.state.networks, {
                chainId: Number(newNetworkId)
            });
           
            const sourceTokenData = prevState.sourceTokenData;
            if(networkConfig !== undefined){
                sourceTokenData['chainId'] = Number(networkConfig.chainId);
                sourceTokenData['chain'] = networkConfig.chain;
            } else {
                sourceTokenData['chainId'] = null;
                sourceTokenData['chain'] = 'CUSTOM'
            }
            
            const destinationTokenData = {
                symbol: 'Wrap a token on',
                chainId: undefined,
                chain: 'chain',
                amount: 0,
                address: null,
                isWrappedToken: false
            };

            return {
              sourceTokenData,
              destinationTokenData
            };
        });
    }

    getNetworkList = async() => {
        try {
          const {
            response, 
            error,
            code
          } = await BridgeApiHelper.getNetworkList(source.token);
          
          if(this._isMounted === true){
              if(code === 200){
                this.setState({
                  networks: response
                });
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

            if(this._isMounted === true){
                if(code === 200){
                    this.setState({
                        tokens: response
                    });
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
          if(this._isMounted === true){
              if (code === 200) {
                this.setState({
                  wrappedTokens: response
                });
              } else {
                console.error(error)
              }
          }
    
        } catch (error) {
          console.error(error)
        }
    }    

    setSourceToken = async(tokenSymbol, chainId, chain, address, decimals) => {
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
            this.state.accountAddress,
            decimals
        );
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
            this.state.accountAddress,
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
                if (Number(web3Config.getNetworkId()) !== Number(chainId)) {
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
                this.setState({sourceTokenData});
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
            console.error(error.message);
        }
    }    

    getCustomTokenBalance = async(tokenAddress) => {
        try {

            tokenAddress = (tokenAddress).toLowerCase();

            const networkConfig = _.find(this.state.networks, {chainId: Number(this.state.chainId)});

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
                call: ['balanceOf(address)(uint256)', this.state.accountAddress],
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
            this.state.accountAddress,
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
            
            let depositAmount = this.state.sourceTokenData.amount.toString();
            //depositAmount = Web3.utils.toWei(depositAmount);

            depositAmount = (this.state.sourceTokenData.amount) * (10 ** Number(this.state.sourceTokenData.decimals));
            
            depositAmount = (depositAmount).toString().split('.')[0];

            depositAmount = Web3.utils.toBN(depositAmount);

            let balance = (this.sourceTokenBalance).toString();
            //balance = Web3.utils.toWei(balance);
            balance = Number(balance) * (10 ** Number(this.state.sourceTokenData.decimals));
            balance = (balance).toString().split('.')[0];
            balance = Web3.utils.toBN(balance);
            console.log({
                inputAmount: (depositAmount).toString(),
                balance: (balance).toString(),
                cond: depositAmount.gt(balance),
                decimals: Number(this.state.sourceTokenData.decimals)
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
            const networkConfig = _.find(this.state.networks, {chainId: this.state.chainId});

            const erc20TokenContract = new ERC20TokenContract(this.state.web3Instance, this.state.sourceTokenData.address, networkConfig.bridgeContractAddress);

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
                const bridgeContract = new BridgeContract(this.state.web3Instance, networkConfig.bridgeContractAddress);
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

    filterTokenByWalletBalance = async () => {
        try {
            this.setState({
                tokensWithBalance: []
            });
            
            const groupedTokenByNetwork = this.state.tokens.reduce(function (r, token) {
                r[token.chainId] = r[token.chainId] || [];
                r[token.chainId].push(token.address);
                return r;
            }, Object.create(null));

            Object.keys(groupedTokenByNetwork).forEach(async (network) => {
                // only active network
                if(Number(this.state.chainId) === Number(network)){
                    await this.aggregateTokenBalanceWithMultiCall(network, groupedTokenByNetwork[network], this.state.accountAddress);
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
                            <input className="from-token-input" type="text" onChange={(e) => this.setAmount(e.target.value)} value={this.state.sourceTokenData.amount} placeholder="0"></input>
                        </div>
                        <figure className="from-token-selector" onClick={(e) => this.toggleSourceTokenPopup()}>
                            <div className="figIcon">
                                <img
                                    src={'/images/free-listing/tokens/' + (sideAIcon + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                    alt={this.state.sourceTokenData.chain}
                                ></img>
                            </div>
                            <figcaption>
                                <span>{sideASymbol}</span>    
                                <span>{this.state.sourceTokenData.chain}</span>
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
                            <input className="to-token-input" type="text" value={this.state.destinationTokenData.amount} readOnly></input>
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
                        this.state.walletConnected === false && 
                        <button onClick={() => this.connectWallet()} className="btn btn-primary">CONNECT YOUR WALLET</button>                        
                    }
                    {
                        this.state.walletConnected === true && (Number(web3Config.getNetworkId()) !== Number(this.state.sourceTokenData.chainId)) && 
                        <button onClick={() => this.switchNetwork(Number(this.state.sourceTokenData.chainId))} className="btn btn-switch">
                            <div className="btn-container">
                                <img 
                                    src={'/images/free-listing/chains/' + (this.state.sourceTokenData.chain + '.png').toLowerCase()}
                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                    alt={this.state.sourceTokenData.chain}
                                ></img>
                                SWITCH NETWORK
                            </div>
                        </button>                        
                    }
                    {
                        this.state.walletConnected === true && 
                        (Number(web3Config.getNetworkId()) === Number(this.state.sourceTokenData.chainId)) && 
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
                                            src={'/images/free-listing/chains/' + (this.state.sourceTokenData.chain + '.png').toLowerCase()}
                                            onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                            alt={this.state.sourceTokenData.chain}
                                        ></img>
                                        {this.state.btnAction}                                    
                                    </div>
                            </button>
                        </>
                    }
                    {
                        this.state.walletConnected === true && 
                        (Number(web3Config.getNetworkId()) === Number(this.state.sourceTokenData.chainId)) && 
                        this.sourceTokenBalance <= 0 &&
                        this.state.isDestinationTokenSelected &&
                        this.state.isSourceTokenSelected &&
                        <button className="btn btn-primary">{`Insufficient ${this.state.sourceTokenData.symbol} balance`}</button>
                    }
                    <p>Bridge to any EVM chain for free with 1:1 derivative token</p>
                </div>

                <SourceTokenPopup 
                    show={this.state.toggleSourceTokenPopup} 
                    closePopupCallback={this.toggleSourceTokenPopup}
                    tokens={this.state.tokensWithBalance}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    sourceTokenSelectedCallback={this.setSourceToken}
                    accountAddress={this.state.accountAddress}
                    walletConnected={this.state.walletConnected}
                    chainId={this.state.chainId}
                    onTokenAddedCallback={this.tokenAddressCallback}
                    onCustomTokenBalanceCheck={this.getCustomTokenBalance}
                    customTokenBalance={this.state.customTokenBalance}
                ></SourceTokenPopup>
                
                <DestinationTokensPopup 
                    chainId={this.state.chainId}
                    show={this.state.toggleDestinationTokensPopup} 
                    closePopupCallback={this.toggleDestinationTokensPopup}
                    tokens={this.state.tokens}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    selectedSourceToken={this.state.sourceTokenData}
                    destinationTokenSelectedCallback={this.setDestinationToken}
                ></DestinationTokensPopup>
                
                <CheckAuthenticityPopup 
                    show={this.state.toggleCheckAuthenticityPopup} 
                    closePopupCallback={this.toggleCheckAuthenticityPopup}
                    networks={this.state.networks}
                    selectedSourceToken={this.state.sourceTokenData}
                    selectedDestinationToken={this.state.destinationTokenData}
                ></CheckAuthenticityPopup>
            </>            
        );
    }
}