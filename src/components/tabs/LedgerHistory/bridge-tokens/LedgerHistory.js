import { PureComponent } from "react";
import { WalletContext, EthereumEvents } from '../../../../context/WalletProvider';
import errors from '../../../../helper/errorConstantsHelper';
import _ from "lodash";
import web3 from "web3";
import BridgeApiHelper from "../../../../helper/bridgeApiHelper";
import OrderInformation from "./OrderInformation";
import ClaimPending from "./status/ClaimPending";
import Claimed from "./status/Claimed";

const FILTERS = [
    "ALL", "COMPLETED", "PENDING"
]

class LedgerHistory extends PureComponent {
    _componentMounted = false;
    interval = null;
    constructor(props) {
        super();
        this.state = {
            depositRequests: [],
            filterBy: FILTERS[0]
        }
    }

    componentDidMount = async() => {
        console.log("LedgerHistory Component mounted");
        this._componentMounted = true;        
        if(this._componentMounted){
            await this.getDepositTokensHistoryByWalletAddress();
            await this.reFetch();
        }

        if(window?.ethereum !== undefined){
            // detect Network account change
            window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                await this.getDepositTokensHistoryByWalletAddress();
            });

            window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async (accounts) => {
                console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);                
                await this.getDepositTokensHistoryByWalletAddress();
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
            await this.getDepositTokensHistoryByWalletAddress();
        }

        if(this.props.isWrapTokenDeposit !== prevProps.isWrapTokenDeposit){
            await this.getDepositTokensHistoryByWalletAddress();
        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        clearInterval(this.interval);
        console.log("LedgerHistory Component unmounted");
    }

    getDepositTokensHistoryByWalletAddress = async() => {
        try {
            const {account, chainIdNumber, connectWallet} = this.context;
    
            if(account === null){
                await connectWallet();
            }
    
            const {response, code, error} = await BridgeApiHelper.getDepositTokensHistoryByWalletAddress(account, chainIdNumber, this.props.isWrapTokenDeposit);

            if(code !== 200){
                console.error("getDepositTokensHistoryByWalletAddress", response, code, error);
            }
    
            if(code === 200){
                if(this._componentMounted){
                    this.setState({
                        depositRequests: response
                    })
                }            
            }
        } catch(error){
            console.error('getDepositTokensHistoryByWalletAddress', error.message);
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
				const getDepositHistory = await this.getDepositTokensHistoryByWalletAddress();
				const timeOutPromise = new Promise(function (resolve, reject) {
					this.interval = setTimeout(resolve, 5000, 'Refetching deposit history');
				}.bind(this));
		
				Promise.all([getDepositHistory, timeOutPromise]).then(async (responses) => {
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

        const filteredDepositRequests = _.filter(this.state.depositRequests, (depositRequest) => {
            return (this.state.filterBy === 'ALL' ? true : (
                this.state.filterBy === 'COMPLETED' 
                    ? (depositRequest.status === 'COMPLETED')
                    : (depositRequest.status === 'CLAIM_PENDING' || depositRequest.status === 'CLAIM_FAILED')
            ));
        });

        //console.table(filteredDepositRequests);

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
                    {activeNetworkConfig !== undefined && filteredDepositRequests.map((depositRequest) => {

                        const fromNetworkConfig = _.find(this.props.networks, {
                            chainId: depositRequest?.fromChainId ?? null
                        });

                        const toNetworkConfig = _.find(this.props.networks, {
                            chainId: depositRequest?.toChainId ?? null
                        });

                        let token = undefined;
                        
                        if(depositRequest.isWrapTokenDeposit){
                            token = _.find(this.props.wrappedTokens, {
                                address: depositRequest.token
                                //chainId: depositRequest.fromChainId
                            });
                        } else {
                            token = _.find(this.props.tokens, {
                                address: depositRequest.token
                                //chainId: depositRequest.fromChainId
                            });
                        }

                        if(fromNetworkConfig !== undefined && toNetworkConfig !== undefined && token !== undefined){
                            return <div key={depositRequest.txHash} className="ledger-tab">
                                <div className="ledger-half">
                                    <OrderInformation
                                        title={depositRequest.isWrapTokenDeposit ? 'Derivative Token' : 'Original Token'}
                                        tokenSymbol={depositRequest.isWrapTokenDeposit ? token.tokenSymbol : token.symbol}
                                        decimals={token.decimals}
                                        value={depositRequest?.value}
                                        depositOn={depositRequest?.createdAt}
                                        tranactionHash={depositRequest?.txHash}
                                        fromNetworkConfig={fromNetworkConfig}
                                        status={depositRequest?.status}
                                        isWrapTokenDeposit={depositRequest.isWrapTokenDeposit}
                                    >
                                    </OrderInformation>
                                </div>
                                {depositRequest?.status === 'COMPLETED' &&
                                <div className="ledger-half completed">
                                    <Claimed
                                        title={depositRequest.isWrapTokenDeposit ? 'Original Token' : 'Derivative Token'}
                                        tokenSymbol={depositRequest.isWrapTokenDeposit ? token.tokenSymbol : token.symbol}
                                        decimals={token.decimals}
                                        value={depositRequest?.value}
                                        claimedOn={depositRequest?.updatedAt}
                                        claimTranactionHash={depositRequest?.claimTxHash}
                                        toNetworkConfig={toNetworkConfig}
                                        isWrapTokenDeposit={depositRequest.isWrapTokenDeposit}
                                    >
                                    </Claimed>
                                </div>
                                }
                                {(depositRequest?.status === 'CLAIM_PENDING' || depositRequest?.status === 'CLAIM_FAILED') &&
                                <div className="ledger-half">
                                    <ClaimPending
                                        title={depositRequest.isWrapTokenDeposit ? 'Original Token' : 'Derivative Token'}
                                        networks={this.props.networks}
                                        value={depositRequest?.value}
                                        tokenSymbol={depositRequest.isWrapTokenDeposit ? token.tokenSymbol : token.symbol}
                                        decimals={token.decimals}
                                        depositOn={depositRequest?.createdAt}
                                        depositRequest={depositRequest}
                                        toNetworkConfig={toNetworkConfig}
                                        isWrapTokenDeposit={depositRequest.isWrapTokenDeposit}
                                    ></ClaimPending>
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