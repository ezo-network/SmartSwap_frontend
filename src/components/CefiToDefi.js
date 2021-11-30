import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";
import Collapse from "@kunukn/react-collapse";

const $ = window.$;

export default class CefiToDefi extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config,
            coinList: tokenDetails,
            isOpen1: false,
            isOpen2: false
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        })
    }

    componentDidMount() {
        $("#CefiToDefi .tab-Link").hover(function () {
            $(".tab-Link").removeClass("active")
            $(this).addClass("active")
            $(".tab-Content").hide();
            $("#" + $(this).attr("data-id")).show();
        });

    }

    toggle = index => {
        let collapse = "isOpen" + index;

        this.setState(prevState => ({ [collapse]: !prevState[collapse] }));
    };


    render() {

        return (
            <div className="main-Popup wallet-Popup" id="CefiToDefi">
                <div className="container-Grid">
                    <div className="MainTabBox">
                        <div className="tab-Nav">
                            <a href="javascript:void(0)" className="tab-Link" onClick={ev => { ev.preventDefault(); }} data-id="tab-7">
                                CeFi to DeFi</a>
                            <a href="javascript:void(0)" className="tab-Link hideMobile" onClick={ev => { ev.preventDefault(); }} data-id="tab-8">What is a Swap Provider</a>
                            <a href="javascript:void(0)" className="tab-Link hideMobile" onClick={ev => { ev.preventDefault(); }} data-id="tab-9">SmartSwap Liquidity Process</a>
                        </div>

                        <div className={"tab-Content " + this.props.popId} id="tab-7">
                            <div className="peerTitle01">DECENTRALIZED CeFi {'<>'} DeFi BRIDGE</div>
                            <div className="peerText01">Now, without signing up to a CEX, doing time-consuming KYC on multiple platforms, or dealing with order book volatility, users can still benefit from CEX liquidity through SmartSwap. SmartSwap provides a true bridge between CeFi and DeFi with one simple click access to liquidity, even while keeping self custody of the assets.</div>
                        </div>

                        <div className="tab-Nav showMobile " style={{ width: '100%' }} >
                            <a href="javascript:void(0)" className="tab-Link" onClick={ev => { ev.preventDefault(); }} data-id="tab-8">
                                What is a Swap Provider</a>
                        </div>


                        <div className={"tab-Content " + this.props.popId} id="tab-8">

                            <div className="peerTitle01">What is a Swap Provider?</div>
                            <div className="peerText01">SmartSwap allows anyone with a Centralized Exchange account, like Binance, to utilize a simple decentralized API and become an Swap Provider (SP). The SP’s drive liquidity into SmartSwap allows the SP to earn automatic spread on their favorite tokens.<br />

                            </div>

                            <div className="lpBTNBar01">
                                <button className="ssBtn02" onClick={() => { this.props.closePopup("CefiToDefi"); this.props.openPopup("LiquidityProvider") }}>BECOME AN SP</button> </div>
                        </div>

                        <div className="tab-Nav showMobile " style={{ width: '100%' }} >
                            <a href="javascript:void(0)" className="tab-Link" onClick={ev => { ev.preventDefault(); }} data-id="tab-9">SmartSwap Liquidity Process</a>
                        </div>
                        <div className={"tab-Content " + this.props.popId} id="tab-9">
                            <div className="peerTitle01">SmartSwap Liquidity Process</div>
                            <div className="peerText01-v2"><i>1</i> User initiates a swap order </div>
                            <div className="peerText01-v2"><i>2</i> SmartSwap searches for a counterparty (Peer-to-Peer) </div>
                            <div className="peerText01-v2"><i>3</i> If there is not enough liquidity, the swap order automatically triggers the liquidity from Swap Providers  </div>
                            <div className="peerText01-v2"><i>4</i> If a counterparty is not found and there is not enough liquidity from Swap Providers, the swap will remain pending until the Swap Providers recycle their liquidity like a fountain.</div>
                            <div className="peerText01-v2"><i>5</i> If pending orders execute at a later time, users receive in return the exact same face value at the time of execution. </div>
                        </div>
                    </div>

                </div>
                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("CefiToDefi") }} className="close-Icon"></a>
            </div>
        )

    }

}