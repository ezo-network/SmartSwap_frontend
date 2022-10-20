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


export default class BridgeSwap extends PureComponent {
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
            wrappedTokens: []
        };

        this.connectWallet = this.connectWallet.bind(this);
        this.walletConnectCallback = this.walletConnectCallback.bind(this);
        this.setSourceToken = this.setSourceToken.bind(this);
    }

    componentDidMount = async() => {
        await this.getNetworkList();
        await this.getTokenList(); 
        await this.getAllWrappedTokens();       
        await this.connectWallet();
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
                    this.walletConnectCallback(true, web3Config.getWeb3());
                } else {
                    this.walletConnectCallback(false, null);              
                }
            });

            window.ethereum.on('disconnect', (error) => {
                this.walletConnectCallback(false, null);          
            });
        }
    }    

    toggleSourceTokenPopup = () => {
        if(this.pendingNetworkSwitchRequest === false){
            this.setState({
                toggleSourceTokenPopup: !this.state.toggleSourceTokenPopup
            });
        } else {
            notificationConfig.info('A switch network request is pending. Check metamask.');            
        }
    }

    toggleDestinationTokensPopup = () => {
        if(this.state.isSourceTokenSelected){
            if(this.pendingNetworkSwitchRequest === false){
                this.setState({
                    toggleDestinationTokensPopup: !this.state.toggleDestinationTokensPopup
                });
            } else {
                notificationConfig.info('A switch network request is pending. Check metamask.');
            } 
        } else {
            notificationConfig.info('Please select source token first.')
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
                    notificationConfig.info('Please select source token first.');
                    return;
                }
                if(!this.state.isDestinationTokenSelected){
                    notificationConfig.info('Please select destination token first.');
                    return;
                }
            }
        } else {
            notificationConfig.info('A switch network request is pending. Check metamask.');
        }
    }

    connectWallet = async() => {
    
        if (typeof window.ethereum == 'undefined') {
          console.log('MetaMask is not installed!');
          notificationConfig.error('Metamask not found.');
          return;
        }
    
        await web3Config.connectWallet(0).then(async(response) => {
          if(window.ethereum.isConnected() === true){
            if(response === true){
              this.walletConnectCallback(true, web3Config.getWeb3());
              //notificationConfig.success('Wallet connected');
            } else {
              notificationConfig.info('Wallet not connected to metamask');                  
            }
          } else {
            notificationConfig.info('Wallet not connected to metamask');        
          }
        }).catch(error => {
          console.log({
            error:error
          });
        });
    }

    walletConnectCallback(walletConnected, web3Instance) {
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
          } = await BridgeApiHelper.getNetworkList();
      
          if(code === 200){
            this.setState({
              networks: response
            });
          } else {
            console.error(error)
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
            } = await BridgeApiHelper.getTokenList();
            
            if(code === 200){
            this.setState({
                tokens: response
            });
            } else {
            console.error(error)
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
          } = await BridgeApiHelper.getWrappedTokens(null, null, true);
    
          if (code === 200) {
            this.setState({
              wrappedTokens: response
            });
          } else {
            console.error(error)
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
            notificationConfig.error('Source token not selected yet.');
            return;
        }
        if(this.state.isDestinationTokenSelected === false){
            notificationConfig.error('Destination token not selected yet.');
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
                            notificationConfig.info('A switch network request is pending. Check metamask.');
                            this.pendingNetworkSwitchRequest = true;
                        }
    
                        if (error.code === 4902) {
                            notificationConfig.error('Unrecognized network. Adding network to metamask');
                            await this.addNetworkToWallet(chainId);
                            this.pendingNetworkSwitchRequest = false;
                        }
    
                        if (error.code === 4001) {
                            this.pendingNetworkSwitchRequest = false;
                        }
    
                    });
                }
            } else {
                notificationConfig.info('A switch network request is pending. Check metamask.');                
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
                const balanceInWei = response.results.transformed[token];
                console.log(`${index} ${token} - ${balanceInWei}`)
                this.sourceTokenBalance = balanceInWei;

                const sourceTokenData = {...this.state.sourceTokenData};
                sourceTokenData.balance = this.sourceTokenBalance;
                this.setState({sourceTokenData});
            });
          
        } catch(error){
          console.error(error.message);
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
            if(amount <= this.sourceTokenBalance){
                const sourceTokenData = {...this.state.sourceTokenData};
                const destinationTokenData = {...this.state.destinationTokenData};
                sourceTokenData.amount = amount;
                destinationTokenData.amount = amount;
                this.setState({sourceTokenData, destinationTokenData});
            }
        }
    }

    depositTokens = async() => {
        try {
            if(this.state.isSourceTokenSelected === false){
                notificationConfig.error('Source token not selected yet.');
                return;
            }
            if(this.state.isDestinationTokenSelected === false){
                notificationConfig.error('Destination token not selected yet.');
                return;
            }

            if(this.state.sourceTokenData.amount <= 0){
                notificationConfig.info('Enter amount to bridge');                
                return;
            }

            if(this.state.sourceTokenData.amount > this.sourceTokenBalance){
                notificationConfig.error(`Amount can't be more then wallet balance`);                
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
            const bridgeContract = new BridgeContract(this.state.web3Instance, networkConfig.bridgeContractAddress);
            await bridgeContract.depositTokens(
                this.state.sourceTokenData.address,
                Web3.utils.toWei(this.state.sourceTokenData.amount, 'ether'),
                this.state.destinationTokenData.chainId,
                async (hash) => {
                    console.log({
                        hash: hash
                    });
                },
                async (response) => {
                    console.log(response)

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
                        notificationConfig.error('Bridge address is not a contract.');
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


        } catch(err) {
            console.error({
                swapBridgeToken: err.message
            })
        }
    }

    render() {

        let sideAIcon = this.state.sourceTokenData.isWrappedToken === true
            ? ((this.state.sourceTokenData.symbol.substring(2)).toLowerCase()).toString()
            : ((this.state.sourceTokenData.symbol).toLowerCase()).toString();

        let sideASymbol = this.state.sourceTokenData.isWrappedToken === true
            ? (this.state.sourceTokenData.symbol.substring(-2, 2)).toLowerCase() + 
              this.state.sourceTokenData.symbol.substring(2)
            : this.state.sourceTokenData.symbol;

        let sideBIcon = this.state.destinationTokenData.isWrappedToken === true
        ? ((this.state.destinationTokenData.symbol.substring(2)).toLowerCase()).toString()
        : ((this.state.destinationTokenData.symbol).toLowerCase()).toString();            

        let sideBSymbol = this.state.destinationTokenData.isWrappedToken === true
        ? (this.state.destinationTokenData.symbol.substring(-2, 2)).toLowerCase() + 
          this.state.destinationTokenData.symbol.substring(2)
        : this.state.destinationTokenData.symbol;

        return (
            <>
                <div className="tabRow">
                    <div className="tabCol">
                        <div className="d-flex balance-row">
                            <div className="b-text">
                                Balance: {this.state.sourceTokenData.balance} &nbsp;<span onClick={() => this.setMaxAmount()}>MAX</span>
                            </div>
                        </div>
                    </div>
                    <div className="tabCol">
                        <button onClick={(e) => this.toggleCheckAuthenticityPopup()} className="color-green button-link">Check authenticity</button>
                    </div>
                </div>
                <div className="tabRow">
                    <div className="tabCol">
                        <label>SEND</label>
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
                <div className="tabRow hasBtn">
                    {
                        this.state.walletConnected === false && 
                        <button onClick={() => this.connectWallet()} className="btn btn-primary">CONNECT YOUR WALLET</button>                        
                    }
                    {
                        this.state.walletConnected === true && (Number(web3Config.getNetworkId()) !== Number(this.state.sourceTokenData.chainId)) && 
                        <button onClick={() => this.switchNetwork(Number(this.state.sourceTokenData.chainId))} className="btn btn-switch">SWITCH NETWORK</button>                        
                    }
                    {
                        this.state.walletConnected === true && 
                        (Number(web3Config.getNetworkId()) === Number(this.state.sourceTokenData.chainId)) && 
                        <button 
                            disabled={
                                this.state.btnClicked 
                                || !this.state.isDestinationTokenSelected 
                                || !this.state.isSourceTokenSelected
                            }
                            onClick={
                                () => this.depositTokens()
                            }
                            className="btn btn-primary">{this.state.btnAction}
                        </button>
                    }
                    {
                        this.state.walletConnected === true && 
                        (Number(web3Config.getNetworkId()) === Number(this.state.sourceTokenData.chainId)) && 
                        this.sourceTokenBalance <= 0 && 
                        this.state.isDestinationTokenSelected && 
                        this.state.isSourceTokenSelected &&
                        <button className="btn btn-primary">{`Insufficient ${this.state.sourceTokenData.symbol} balance`}</button>
                    }
                    <p>Bridge to any EVM chain for free with 1:1 wrap value</p>
                </div>

                <SourceTokenPopup 
                    show={this.state.toggleSourceTokenPopup} 
                    closePopupCallback={this.toggleSourceTokenPopup}
                    tokens={this.state.tokens}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    sourceTokenSelectedCallback={this.setSourceToken}
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