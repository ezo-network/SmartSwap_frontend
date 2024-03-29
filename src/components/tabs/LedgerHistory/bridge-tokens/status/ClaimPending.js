import { WalletContext, EthereumEvents } from '../../../../../context/WalletProvider';
import { PureComponent } from "react";
import moment from 'moment';
import _ from "lodash";
import bigInt from 'big-integer';
import Web3 from "web3";
import notificationConfig from "../../../../../config/notificationConfig";
import AuthorityServerApiHelper from "../../../../../helper/authorityServerApiHelper";
import BridgeContract from "../../../../../helper/bridgeContract";
import errors from '../../../../../helper/errorConstantsHelper';
import {numberExponentToLarge} from "../../../../../helper/utils";

const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;
const wrapTokenSymbolPrefixLength = Number((wrapTokenSymbolPrefix).length);

export default class ClaimPending extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            btnClicked: false,
            claimTxHash: null,
            claimSent: false
        }
    }

    componentDidMount = async () => {
        console.log("ClaimPending Component mounted");
        this._componentMounted = true;
        if (this._componentMounted) { 

        }
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if (this._componentMounted) { 
            // if(prevProps.depositRequest.isExpedited !== this.props.depositRequest.isExpedited){
            //     this.setState({
            //         expedited: this.props.depositRequest.isExpedited
            //     })
            // }
        }        
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("ClaimPending Component unmounted");
    }

    claimDerivativeToken = async(depositTxHash, depositTokenNetwork) => {
        try {
            if(this._componentMounted){
                this.setState({
                    btnClicked: true
                });
                console.log('Claim derivative token');
                await this.context.connectWallet();            
                const {response, code, error} = await AuthorityServerApiHelper.getAuthoritySignature(depositTxHash, depositTokenNetwork);
                if(code === 200){
                    // check for allowence and approval
                    const networkConfig = _.find(this.props.networks, {chainId: this.context.chainIdNumber});

                    console.log({
                        bridgeContractAddress: networkConfig
                    });

                    if(networkConfig !== undefined){
                        const bridgeContract = new BridgeContract(this.context.web3, this.context.account, networkConfig.bridgeContractAddress);
                        

                        console.log(response.originalToken,
                            response.originalChainID,
                            depositTxHash,
                            response.to,
                            response.value,
                            depositTokenNetwork,
                            response.signature
                        );

                        await bridgeContract.claimToken(
                            response.originalToken,
                            response.originalChainID,
                            depositTxHash,
                            response.to,
                            response.value,
                            depositTokenNetwork,
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
                                        notificationConfig.success('Token claimed Successfully!');
                                        //await this.updateSourceTokenBalance();
                                        if(this._componentMounted){
                                            this.setState({
                                                claimTxHash: response.receipt.transactionHash
                                            });
                                        }
                                    }
                                }
                                            
                                if(response.status === 1) {
                                    //response.transactionHash
                                    notificationConfig.success('Token claimed Successfully!');
                                    if(this._componentMounted){
                                        this.setState({
                                            claimTxHash: response.transactionHash
                                        });
                                    }
                                }
        
                                if(this._componentMounted){
                                    this.setState({
                                        btnClicked: false
                                        //btnAction: btnAction
                                    });
                                }
                            }
                        ); 
    
                    }
    
                } else {
                    this.setState({
                        btnClicked: false
                    });
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
            }
        } catch(err) {
            console.error({
                claimToken: err.message
            });
            this.setState({
                btnClicked: false
            });
        }
    }

    addNetworkToWallet = async(chainId) => {
        try {
            
          const networkConfig = _.find(this.props.networks, {chainId: Number(chainId)});

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
            if (Number(this.context.chainIdNumber) !== Number(chainId)) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: Web3.utils.toHex(chainId) }],
                }).then(async(response) => {

                }).catch(async (error) => {
                    console.error(error);
                    if (error.code === -32002) {
                        notificationConfig.info(errors.switchRequestPending);
                    }

                    if (error.code === 4902) {
                        notificationConfig.error(errors.metamask.networkNotFound);
                        await this.addNetworkToWallet(chainId);
                    }

                    if (error.code === 4001) {

                    }

                });
            }
        } catch (err) {
            console.error("switchNetwork", err.message);
        }
    }    

    render() {

        const symbol = this.props.isWrapTokenDeposit ? this.props.tokenSymbol.substring(wrapTokenSymbolPrefixLength) : this.props.tokenSymbol;

        return (
            <>
                <h3>
                    <b>{this.props.title}</b>
                </h3>
                <h4>{numberExponentToLarge(this.props.value / 10 ** this.props.decimals)} {symbol} ({this.props.toNetworkConfig.name})
                </h4>
                <p>{moment().format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <div className="pending-text" style={{justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', color: this.props.depositRequest.status === "CLAIM_FAILED" ? '#f00' : "#91dc27"}}>
                            {(this.props.depositRequest.status === 'CLAIM_FAILED') && (
                                <>
                                    Failed
                                </>
                            )}

                            {(this.props.depositRequest.status === 'CLAIM_PENDING') && (
                                <>
                                    Pending
                                    {this.state.btnClicked === false &&
                                    <div className="loader"></div>
                                    }
                                </>
                            )}

                        </div>               
                        
                        {(this.props.depositRequest.status === 'CLAIM_PENDING') && 
                        <div className="expedite-section cursor">
                                <span style={{
                                    padding: '5px', 
                                    background: (this.props.depositRequest?.toChainId === this.context.chainIdNumber) ? "#91dc27" : '#f00', 
                                    color: '#fff', 
                                    display: 'flex', 
                                    alignContent: "center",
                                    justifyContent: "space-between",
                                    borderRadius: "3px"
                                }}>
                                    {this.state.btnClicked === false && (this.props.depositRequest?.toChainId === this.context.chainIdNumber) &&
                                    <>
                                        <button
                                            style={{
                                                background: '#0000',
                                                border: 'none',
                                                color: '#fff'                                
                                            }}
                                            disabled={this.state.btnClicked} 
                                            onClick={(e) => this.claimDerivativeToken(this.props.depositRequest?.txHash, this.props.depositRequest?.fromChainId)}
                                        >
                                            Claim Token
                                        </button>
                                    </>
                                    }
                                    {this.state.btnClicked === false && (this.props.depositRequest?.toChainId !== this.context.chainIdNumber) &&
                                    <>
                                        <button 
                                            style={{
                                                background: '#0000',
                                                border: 'none',
                                                color: '#fff'                                
                                            }}
                                            disabled={this.state.btnClicked} 
                                            onClick={(e) => this.switchNetwork(this.props.depositRequest?.toChainId)}
                                        >
                                            Claim Token
                                        </button>
                                    </>
                                    }                              
                                    {this.state.btnClicked === true &&
                                    <>
                                        Claiming In Process
                                        <div className="loader"></div>
                                    </>
                                    }
                                    {(this.state.claimSent && this.state.btnClicked === false) &&
                                        <>
                                            Token Claimed
                                        </>
                                    }
                                </span>
                        </div>
                        }
                    </div>
                </div>
                {/* <div className="pending-bottom">
                    <i className="fas fa-cog color-green"></i>
                    <span>Wait until a match is found or cancel the transaction to redeem the 10 ETH pending to your wallet</span>
                </div> */}
            </>
        )
    }
}

ClaimPending.contextType = WalletContext;