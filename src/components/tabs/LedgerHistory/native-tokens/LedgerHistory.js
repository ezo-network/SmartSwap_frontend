import { PureComponent } from "react";
import { WalletContext, EthereumEvents } from '../../../../context/WalletProvider';
import errors from '../../../../helper/errorConstantsHelper';
import SmartSwapApiHelper from "../../../../helper/smartswapApiHelper";
import _ from "lodash";
import web3 from "web3";
import OrderInformation from "./OrderInformation";
import PendingOrder from "./status/PendingOrder";
import FulfilledOrder from "./status/FulfilledOrder";

const FILTERS = [
    "ALL", "COMPLETED", "PENDING"
]

class LedgerHistory extends PureComponent {
    _componentMounted = false;
    interval = null;
    constructor(props) {
        super();
        this.state = {
            swapRequests: [],
            filterBy: FILTERS[0]
        }
    }

    componentDidMount = async() => {
        console.log("LedgerHistory Component mounted");
        this._componentMounted = true;        
        if(this._componentMounted){
            await this.getLedgerByAccountAddress();
            await this.reFetch();
        }

        if(window?.ethereum !== undefined){
            // detect Network account change
            window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                await this.getLedgerByAccountAddress();
            });

            window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async (accounts) => {
                console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);                
                await this.getLedgerByAccountAddress();
            });

            window.ethereum.on(EthereumEvents.CONNECT, async (error) => {
                console.log(EthereumEvents.CONNECT);
            });

            window.ethereum.on(EthereumEvents.DISCONNECT, async (error) => {
                console.log(EthereumEvents.DISCONNECT);
            });
        } else {
            console.error(errors.metamask.walletNotFound);
        }
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if(this.props.isLedgerOpen !== prevProps.isLedgerOpen && this.props.isLedgerOpen === true){
            await this.getLedgerByAccountAddress();
        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        clearInterval(this.interval);
        console.log("LedgerHistory Component unmounted");
    }

    getLedgerByAccountAddress = async() => {
        try {
            const {account} = this.context;
    
            if(account !== null){
                const {response, code, error} = await SmartSwapApiHelper.getLedgerByAccountAddress(account);
                
                if(code !== 200){
                    console.error("getLedgerByAccountAddress", response, code, error);
                }
        
                if(code === 200){
                    if(this._componentMounted){
                        this.setState({
                            swapRequests: response?.data
                        })
                    }            
                }
            }
    
        } catch(error){
            console.error('getLedgerByAccountAddress', error.message);
        }
    }

    setFilterBy = (filterType) => {
        if(this._componentMounted){
            this.setState({
                filterBy: filterType
            });
        }
    }

    reFetch = async() => {
		try {
			if(this._componentMounted){
				const getLedgerByAccountAddress = await this.getLedgerByAccountAddress();
				const timeOutPromise = new Promise(function (resolve, reject) {
					this.interval = setTimeout(resolve, 5000, 'Refetching ledger history');
				}.bind(this));
		
				Promise.all([getLedgerByAccountAddress, timeOutPromise]).then(async (responses) => {
                    await this.reFetch();
				});
			}
		} catch (err){
			console.error("reFetch", err.message);
		}
    }

    render() {

        // active network
        const activeNetworkConfig = _.find(this.props.networks, { chainId: this.context.chainIdNumber });

        const filteredSwapRequests = _.filter(this.state.swapRequests, (swapRequest) => {
            return (swapRequest.chainId === activeNetworkConfig?.chainId ?? null) &&
            (this.state.filterBy === 'ALL' ? true : (
                this.state.filterBy === 'COMPLETED' 
                    ? (swapRequest.status === 'FULFILLED' && swapRequest.claimStatus === 'CLAIMED')
                    : (
                        swapRequest.status === 'PENDING' 
                        || swapRequest.status === 'CLAIM_PROCESSING'
                        || swapRequest.status === 'CLAIM_SENT'
                        || swapRequest.status === 'SP_MATCHED' 
                        || swapRequest.status === 'SP_CLAIM_SENT'
                        || swapRequest.status === 'FAILED'
                        || (swapRequest.status === 'FULFILLED' && swapRequest.claimStatus === 'PENDING')
                    )
            ));
        });

        let pendingOrdersCount = 0;

        return (
            <>
                <div id="ledger-history" className="dropdown">
                    <h4 className={`dropdown-title ${this.props.isLedgerOpen ? 'active' : ''}`} onClick={() => this.props.toggleLedger()}>Ledger</h4>
                </div>
                <div style={{display: this.props.isLedgerOpen ? 'block' : 'none'}}>
                    <nav className="tab-nav">
                        <a className={`cursor ${this.state.filterBy === 'ALL' ? 'active' : ''}`} href="#" onClick={(e) => this.setFilterBy('ALL')}>All</a>
                        <a className={`cursor ${this.state.filterBy === 'COMPLETED' ? 'active' : ''}`} href="#" onClick={(e) => this.setFilterBy('COMPLETED')}>Completed</a>
                        <a className={`cursor ${this.state.filterBy === 'PENDING' ? 'active' : ''}`} href="#" onClick={(e) => this.setFilterBy('PENDING')}>Pending</a>
                    </nav>
                    {activeNetworkConfig !== undefined && filteredSwapRequests.map((swapRequest) => {
                        
                        if(swapRequest?.status === 'PENDING'){
                            pendingOrdersCount = pendingOrdersCount+1;
                        }

                        const toNetworkConfig = _.find(this.props.networks, {
                            chainId: swapRequest?.crossChainId ?? null
                        });
                        if(toNetworkConfig !== undefined){
                            return <div key={swapRequest.txHash} className="ledger-tab">
                                <div className="ledger-half">
                                    <OrderInformation
                                        sentTokenSymbol={activeNetworkConfig?.nativeCurrencySymbol}
                                        sentTokenQty={swapRequest?.processAmount}                       
                                        sentTokenOnDollarPrice={swapRequest?.tokenAPrices?.prices}
                                        sentOnTime={swapRequest?.srTime}
                                        tranactionHash={swapRequest?.txHash}
                                        sentFromNetworkConfig={activeNetworkConfig}
                                        status={swapRequest?.status}
                                    >
                                    </OrderInformation>
                                </div>
                                {swapRequest?.status === 'FULFILLED' && swapRequest?.claimStatus === 'CLAIMED' &&
                                <div className="ledger-half completed">                                    
                                    <FulfilledOrder
                                        receivedTokenSymbol={toNetworkConfig?.nativeCurrencySymbol}
                                        receivedTokenQty={swapRequest?.claimedAmount}                       
                                        receinvedTokenOnDollarPrice={swapRequest?.tokenBPrices?.prices}
                                        receivedOnTime={swapRequest?.approveTime}
                                        claimApprovedTranactionHash={swapRequest?.relationship?.claim?.approveHash}
                                        receivingToNetworkConfig={toNetworkConfig}
                                    >
                                    </FulfilledOrder>
                                </div>
                                }
                                {(
                                    (swapRequest?.status === 'PENDING') 
                                    || 
                                    (swapRequest?.status === 'CLAIM_PROCESSING')
                                    || 
                                    (swapRequest?.status === 'CLAIM_SENT')
                                    ||
                                    (swapRequest?.status === 'SP_MATCHED') 
                                    ||
                                    (swapRequest?.status === 'SP_CLAIM_SENT')                                                                         
                                    || 
                                    (swapRequest?.status === 'FAILED') 
                                    || 
                                    (swapRequest.status === 'FULFILLED' && swapRequest.claimStatus === 'PENDING')
                                )  &&
                                <div className="ledger-half">
                                    <PendingOrder
                                        networks={this.props.networks}
                                        receivingTokenQty="..."
                                        receivingTokenSymbol={toNetworkConfig?.nativeCurrencySymbol}                                        
                                        orderCreationDate={swapRequest?.srTime}
                                        isExpedited={swapRequest?.isExpedited}
                                        canExpedite={swapRequest?.canExpedite}
                                        expediteUsed={swapRequest?.expediteUsed}
                                        swapRequest={swapRequest}
                                    ></PendingOrder>
                                </div>
                                }
                            </div>
                        }
                    })}
                </div>
            </>
        )
    }
}

LedgerHistory.contextType = WalletContext;


export {LedgerHistory}