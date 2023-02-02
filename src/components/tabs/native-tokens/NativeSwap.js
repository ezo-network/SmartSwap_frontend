import { WalletContext, EthereumEvents } from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import Switch from "react-switch";
import SmartswapApiHelper from "../../../helper/smartswapApiHelper";
import SmartSwap from "./SmartSwap";
import DagenSwap from "./DagenSwap";
import Sidebar from "./components/Sidebar";

// images
import Filter from "../../../../src/assets/images/filter.png";
import Doller from "../../../../src/assets/images/doller.png";
import SmartExchange from "../../../../src/assets/images/smart-exchange.png";
import CONSTANT from '../../../constants';

const SLIPPAGE_MODES = ["SMARTSWAP", "DAGENSWAP"];
const INPUT_MODES = ["FIAT", "TOKEN"];

// axios cancel token
let axiosSource;


export default class NativeSwap extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            networks: [],
            slippageMode: SLIPPAGE_MODES[0],
            inputMode: INPUT_MODES[1],
            estimateGasAndFeesData: {},
            activeNetworkNativeTokenSymbol: '',
            activeNetworkNativeTokenDecimals: 0,
            smartSwapQuoteData: {
                quotePrice: 0,
                quotePriceInUsd: 0,
                quoteEstimatedFee: 0                
            },
            fromChainId: null,
            toChainId: null,
            toChainNativeTokenSymbol: "",
            amountToSwap: 0
        }

        axiosSource = axios.CancelToken.source();
        this.updateCrossChainQuotePrice = this.updateCrossChainQuotePrice.bind(this);
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        if (this._componentMounted) {
            await this.getNetworkList();
            
            if(window?.ethereum !== undefined){
                // detect Network account change
                window.ethereum.on(EthereumEvents.CHAIN_CHANGED, async (chainId) => {
                    console.log(EthereumEvents.CHAIN_CHANGED, chainId);
                });
    
                window.ethereum.on(EthereumEvents.ACCOUNTS_CHANGED, async (accounts) => {
                    console.log(EthereumEvents.ACCOUNTS_CHANGED, accounts[0]);
                });
    
                window.ethereum.on(EthereumEvents.CONNECT, async (error) => {
                    console.log(EthereumEvents.CONNECT);
                });
    
                window.ethereum.on(EthereumEvents.DISCONNECT, async (error) => {
                    console.log(EthereumEvents.DISCONNECT);
                });
            } else {
                console.error('Metamask is not installed');
            }

        }
    }

    componentDidUpdate() {}

    componentWillUnmount() {
        this._componentMounted = false;
        if (axiosSource) {
            axiosSource.cancel("Nativeswap Component unmounted");
        }
    }

    getNetworkList = async () => {
        try {
            const {
                response,
                error,
                code
            } = await SmartswapApiHelper.getNetworkList(axiosSource.token);

            if (this._componentMounted === true) {
                if (code === 200) {
                    if (this._componentMounted === true) {
                        this.setState({
                            networks: response
                        });
                        this.props.setNetworkList(response, "native-tokens");
                    }
                } else {
                    console.error(error)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    toggleSlippageMode = (slippageMode) => {

        let changeSlippageMode = null;
        
        if(slippageMode === SLIPPAGE_MODES[0]){
            changeSlippageMode = SLIPPAGE_MODES[1]
        }

        if(slippageMode === SLIPPAGE_MODES[1]){
            changeSlippageMode = SLIPPAGE_MODES[0]
        }
        
        console.log(slippageMode, changeSlippageMode);
        if(this._componentMounted){
            this.setState({
                slippageMode: changeSlippageMode
            });
        }
    }

    toggleInputMode = (inputMode) => {

        let changeInputMode = null;
        
        if(inputMode === INPUT_MODES[0]){
            changeInputMode = INPUT_MODES[1]
        }

        if(inputMode === INPUT_MODES[1]){
            changeInputMode = INPUT_MODES[0]
        }
        
        console.log(inputMode, changeInputMode);
        if(this._componentMounted){
            this.setState({
                inputMode: changeInputMode
            });
        }
    }

    updateEstimatedGasAndFees = (estimateGasAndFeesData, activeNetworkNativeTokenSymbol, decimalPoints) => {
        if(this._componentMounted){
            this.setState({
                estimateGasAndFeesData: estimateGasAndFeesData,
                activeNetworkNativeTokenSymbol: activeNetworkNativeTokenSymbol,
                activeNetworkNativeTokenDecimals: decimalPoints
            });
        }
    }

    updateCrossChainQuotePrice = (fromChainId, toChainId, toChainNativeTokenSymbol, amountToSwap, smartSwapQuoteData) => {
        if(this._componentMounted){
            this.setState({
                fromChainId: fromChainId,
                toChainId: toChainId,
                toChainNativeTokenSymbol: toChainNativeTokenSymbol,
                amountToSwap: amountToSwap,
                smartSwapQuoteData: smartSwapQuoteData,
            });
        }
    }

    render() {

        return (
            <>
                <div className="native-icons">
                    <a href="#" onClick={(e) => e.preventDefault()}><img height="13" alt="filters" src={Filter} /></a>
                    <a href="#" className='nativeToggle' onClick={() => this.props.closeSideBar()}><img height="14" src={Doller} alt="3rd-parties-rates" /></a>
                </div>
                <div id="slippage-mode">
                    {this.state.slippageMode === SLIPPAGE_MODES[0] && 
                        <SmartSwap
                            tokensUsdPrice={this.props.tokensUsdPrice}
                            networks={this.state.networks}
                            slippageModes={SLIPPAGE_MODES}
                            inputModes={INPUT_MODES}
                            selectedSlippageMode={this.state.slippageMode} 
                            selectedInputMode={this.state.inputMode}
                            onGasFeeUpdate={this.updateEstimatedGasAndFees}
                            openLedger={this.props.openLedger}
                            updateCrossChainQuotePrice={this.updateCrossChainQuotePrice}
                        ></SmartSwap>                
                    }

                    {this.state.slippageMode === SLIPPAGE_MODES[1] && 
                        <DagenSwap
                            networks={this.state.networks}
                            slippageModes={SLIPPAGE_MODES}
                            inputModes={INPUT_MODES}
                            selectedSlippageMode={this.state.slippageMode} 
                            selectedInputMode={this.state.inputMode}
                        ></DagenSwap>
                    }                   
                </div>

                { /** sidebar */}
                <Sidebar 
                    showSidebar={this.props.showSidebar} 
                    smartSwapQuoteData={this.state.smartSwapQuoteData} 
                    fromChainId={this.state.fromChainId}
                    toChainId={this.state.toChainId}
                    toChainNativeTokenSymbol={this.state.toChainNativeTokenSymbol}
                    amountToSwap={this.state.amountToSwap}
                ></Sidebar>

                { /** Bottom bar */}
                <div className="bottom-action-bar">
                    <div className="swap-Textlink">
                        <div className="powertextBX">
                            <p className='poweredBy'>Powered by <img src={SmartExchange} alt="smartexchange"/></p>
                            <div className="powertextBX-links">
                                <Link to='/freelisting'>Free listing</Link>
                                <span>|</span>
                                <a href={CONSTANT.APPLY_FOR_LICENSING_ACTION} target="_blank">Apply for licensing</a>
                            </div>
                            <div className='powertextBX-links estimated'>
                                <p>
                                    Estimated gas and fees:
                                    &nbsp;
                                    <i className="help-circle">
                                        <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Slippage free trades carry higher gas costs than slippage trades. Gas and fees are 100% reimbursed" aria-hidden="true"></i>
                                    </i>
                                    &nbsp;
                                    <span className="protip" data-pt-position="top" data-pt-title={Number(this.state.estimateGasAndFeesData?.result ?? 0).toFixed(this.state.activeNetworkNativeTokenDecimals) + this.state.activeNetworkNativeTokenSymbol} aria-hidden="true">
                                        {Number(this.state.estimateGasAndFeesData?.result ?? 0).toFixed(6)}
                                    </span>
                                    &nbsp;{this.state.activeNetworkNativeTokenSymbol}
                                    {/* Max length should be 8 */}
                                </p>
                            </div>
                        </div> 
                        <label className="switch-container input-mode-switcher">
                            <p className={`${this.state.inputMode === INPUT_MODES[1] ? "" : "active"}`} style={{ paddingRight: "8px" }}>Dollar amount </p>
                            <Switch
                                checked={this.state.inputMode === INPUT_MODES[1] ? true : false}
                                onChange={(e) => this.toggleInputMode(this.state.inputMode)}
                                handleDiameter={14}
                                offColor="#2e303a"
                                onColor="#2e303a"
                                offHandleColor="#91dc27"
                                onHandleColor="#91dc27"
                                height={18}
                                width={32}
                                borderRadius={0}
                                activeBoxShadow="0px 0px 0px 0px #fffc35"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                className="react-switch"
                                id="input-mode"
                            />
                            <p className={`${this.state.inputMode === INPUT_MODES[1] ? "active" : ""}`} style={{ paddingLeft: "8px" }}>Token amount</p>
                        </label>
                        <label className="switch-container slippage-switcher">
                            <p className={`${this.state.slippageMode === SLIPPAGE_MODES[1] ? "" : "active"}`} style={{ paddingRight: "8px" }}>Slippage free </p>
                            <Switch
                                checked={this.state.slippageMode === SLIPPAGE_MODES[1] ? true : false}
                                onChange={(e) => {
                                    //this.toggleSlippageMode(this.state.slippageMode)
                                }}
                                handleDiameter={14}
                                offColor="#2e303a"
                                onColor="#2e303a"
                                offHandleColor="#91dc27"
                                onHandleColor="#91dc27"
                                height={18}
                                width={32}
                                borderRadius={0}
                                activeBoxShadow="0px 0px 0px 0px #fffc35"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                className="react-switch"
                                id="slippage-mode"
                            />
                            <p className={`${this.state.slippageMode === SLIPPAGE_MODES[1] ? "active" : ""}`} style={{ paddingLeft: "8px" }}>Best slippage</p>
                        </label>
                    </div>
                </div>
            </>


        )
    }
}

NativeSwap.contextType = WalletContext;