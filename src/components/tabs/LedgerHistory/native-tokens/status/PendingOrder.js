import { WalletContext, EthereumEvents } from '../../../../../context/WalletProvider';
import { PureComponent } from "react";
import moment from 'moment';
import _ from "lodash";
import bigInt from 'big-integer';
import web3 from "web3";
import notificationConfig from "../../../../../config/notificationConfig";
import ExpediteContract from "../../../../../helper/expediteContract";
import SmartSwapApiHelper from "../../../../../helper/smartswapApiHelper";
import { numberToBn } from "../../../../../helper/utils";
import errors from '../../../../../helper/errorConstantsHelper';

export default class PendingOrder extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            expediteTxHash: null,
            btnClicked: false,
            expedited: false
        }
    }

    componentDidMount = async () => {
        console.log("PendingOrder Component mounted");
        this._componentMounted = true;
        if (this._componentMounted) { 

        }
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if (this._componentMounted) { 
            if(prevProps.swapRequest.isExpedited !== this.props.swapRequest.isExpedited){
                this.setState({
                    expedited: this.props.swapRequest.isExpedited
                })
            }
        }        
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("PendingOrder Component unmounted");
    }

    expedite = async(transactionHash, toChainId) => {
        try {
            this.setState({
                btnClicked: true
            });
            await this.context.connectWallet();
            // active network
            const activeNetworkConfig = _.find(this.props.networks, { chainId: this.context.chainIdNumber });
            if(activeNetworkConfig !== undefined){

                let processingFee = await this.estimateProcessingFees(activeNetworkConfig.chainId, toChainId);
                processingFee = numberToBn(processingFee, activeNetworkConfig.nativeCurrencyDecimals, true);
                const expediteInstance = new ExpediteContract(
                    this.context.web3,
                    this.context.account,
                    activeNetworkConfig?.expediteContractAddress
                );
                await expediteInstance.expedite(
                    transactionHash, 
                    processingFee,
                    (hash) => {
                        // this.setState({
                        //     swapTxhash: hash
                        // });
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

                        if (response.code === "NOT_A_EXPEDITE_CONTRACT") {
                            notificationConfig.error(errors.erc20Errors.NOT_A_EXPEDITE_CONTRACT('Expedite', activeNetworkConfig?.expediteContractAddress));
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
                                notificationConfig.success("Expedited Success");
                                this.setState({
                                    expediteTxHash:response.receipt.transactionHash,
                                    expedited: true
                                });
                            }
                        }
                                    
                        if(response.status === 1) {
                            //response.transactionHash
                            notificationConfig.success("Expedited Success");
                            this.setState({
                                expediteTxHash: response.transactionHash,
                                expedited: true
                            });
                        }

                        this.setState({
                            btnClicked: false
                        });                        
                    }
                );
            }
        } catch(error){
            console.error("expedite", error.message);
        }
    }

    estimateProcessingFees = async(fromChainId, toChainId) => {

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

    render() {
        return (
            <>
                <h3>
                    <b>Pending
                        {/* <span>(73.69%)</span> */}
                    </b>
                </h3>
                <h4>{this.props.receivingTokenQty} {this.props.receivingTokenSymbol}
                    {/* <span>($2,500)</span> */}
                </h4>
                <p>{moment().format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <div className="pending-text" style={{justifyContent: 'space-between'}}>
                        <div style={{display: 'flex'}}>
                            {(this.props.isExpedited === false && this.props.swapRequest.status === 'PENDING') && 
                                <>
                                    Pending
                                </>
                            }

                            {(this.props.swapRequest.status !== 'PENDING' && this.props.swapRequest.status !== 'FULFILLED') && 
                                <>
                                    Swapping                                
                                </>
                            }
                            
                            {this.state.btnClicked === false &&
                                <div className="loader"></div>
                            }
                        </div>               
                        
                        {(this.props.canExpedite === true && this.props.isExpedited === false && this.props.swapRequest.status === 'PENDING' && this.state.expedited === false) && 
                        <div disabled={this.state.btnClicked} onClick={
                            (e) => this.expedite(this.props.swapRequest?.txHash, this.props.swapRequest?.crossChainId)
                        } className="expedite-section cursor">
                                <span className='expedite-btn'>
                                    {this.state.btnClicked === false &&
                                    <>
                                        Expedite
                                    </>
                                    }
                                    {this.state.btnClicked === true &&
                                    <>
                                        Expediting
                                        <div className="loader"></div>
                                    </>
                                    }
                                </span>
                        </div>
                        }
                        {(this.props.isExpedited || this.state.expedited) && 
                        <div className="expedite-section cursor">
                            <span className='expedite-btn'>
                                Expedited
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

PendingOrder.contextType = WalletContext;