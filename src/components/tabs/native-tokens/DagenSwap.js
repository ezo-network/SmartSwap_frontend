import { WalletContext, EthereumEvents } from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import Swap from "../../../../src/assets/images/swap-arrow.png";
import { LoopCircleLoading } from "react-loadingg";
import web3 from "web3";
import _ from "lodash";
import axios from "axios";
import Switch from "react-switch";
import CONSTANT from "../../../constants";
import notificationConfig from "../../../config/notificationConfig";
import errors from "../../../helper/errorConstantsHelper";


export default class DagenSwap extends PureComponent {
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
    }

    componentDidMount = async() => {
        this._componentMounted = true;
        if(this._componentMounted){
            console.log('Dagen UI mounted');
            if(window?.ethereum !== undefined){

                await this.connectWallet();

                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                    await this.getBalance();
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
                console.error(errors.metamask.walletNotFound);
            }
        }
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if (this.props.selectedInputMode !== prevProps.selectedInputMode) {

        }

        if(this.props.networks !== prevProps.networks){

        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
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

    changeToDirection = async(toChainId) => {
        if(this._componentMounted){
            if(this.context.chainIdNumber === toChainId){
                return;         
            }

            this.setState({
                toChainId: toChainId    
            }, async() => {

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

    decimalPointsFilter = (value) => {
        if(this.props.selectedInputMode === this.props.inputModes[0]){
            const decimalPointsFilter = value.match(/^(\d*\.{0,1}\d{0,2}$)/)
            if (decimalPointsFilter === false) {
                return false;
            }
            return true
        }
    }


    swap = async() => {
       
    }    

    render() {
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
                                            value={0}
                                            //onKeyDown={(e) => Validation.floatOnly(e)}
                                            //onChange={(e) => this.receivedToken(e)}
                                            autoComplete="off"
                                        />
                                        {/* <span className="currency-ic-n">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img width={20} src="/images/free-listing/chains/eth.png"></img>
                                            }
                                        </span> */}
                                        {                                                
                                        this.props.selectedInputMode === this.props.inputModes[0] && 
                                            <span className="currency-ic-n">$</span>                                                
                                        }

                                        {                                                
                                        this.props.selectedInputMode !== this.props.inputModes[0] && 
                                            <></>
                                        }                                                
                                    </div>
                                </div>

                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    <button>
                                        <img width={20} src="/images/free-listing/chains/eth.png"></img>ETH
                                    </button>
                                </div>
                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    <button>
                                        <img width={20} src="/images/free-listing/tokens/eth.png"></img>ETH
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {(0).toFixed(5)} | 1 BNB : 300</p>
                            {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                            <p className="form-label font-normal mb-0">
                                Balance: BNB&nbsp;<span className="color-green">MAX</span>
                            </p>
                        </div>
                    </div>
                    <div className="form-ic">
                        <a className="grey-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.changeCurrency(true);
                            }}
                        >
                            <img width="22" src={Swap} alt="" />
                        </a>
                        <a className="green-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.changeCurrency(true);
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
                                            readOnly=""
                                            disabled
                                            value={0}
                                        />
                                        {/* <span className="currency-ic-n ver2">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img width={20} src="/images/free-listing/chains/bsc.png"></img>
                                            }
                                        </span> */}
                                        {                                                
                                        this.props.selectedInputMode === this.props.inputModes[0] && 
                                            <span className="currency-ic-n ver2">$</span>                                                
                                        }

                                        {                                                
                                        this.props.selectedInputMode !== this.props.inputModes[0] && 
                                            <></>
                                        }                                                
                                    </div>
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    <button>
                                        <img width={20} src="/images/free-listing/chains/bsc.png"></img>BSC
                                    </button>
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    <button>
                                        <img width={20} src="/images/free-listing/tokens/bnb.png"></img>BNB
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {(0).toFixed(5)} | 1 ETH : 1200</p>
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
                        // this.context.isAuthenticated === true && (Number(this.context.chainIdNumber) !== activeNetworkConfig?.chainId ?? null) && 
                        // <button className="native-btn ani-1 connect btn-unsupported">
                        //     {/* <span className="currency">
                        //         <img 
                        //             style={{filter: 'none', width: '30px', height: '30px'}}
                        //             src={('/images/free-listing/chains/default.png').toLowerCase()}
                        //             onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                        //             alt='UNSUPPORTED NETWORK'
                        //         ></img>
                        //     </span> */}
                        //     <span>UNSUPPORTED NETWORK</span>
                        // </button>
                    }   

                    {/* {   this.context.isAuthenticated === true && defaultFromSelectOption.value === this.context.chainIdNumber &&
                        <button disabled={this.state.btnClicked} className="native-btn ani-1 connect" onClick={(e) => this.swap()}>
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
                    }                                      */}

                </div>

                {this.state.swapTxhash !== null &&
                    <div className="success-msg">
                        <i className="fas fa-check"></i>
                        <h4>Swap sent successfully</h4>
                        <p className="cursor" onClick={() => this.props.openLedger()}>Check the ledger below</p>
                    </div>
                }
            </>
        )
    }
}

DagenSwap.contextType = WalletContext;