import React, { PureComponent } from "react";
import data, { tokenDetails } from "../../config/constantConfig";

const $ = window.$;

export default class PeerPopup extends PureComponent {
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
        $("#PeerPopup .tab-Link").hover(function () {
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
            <div className="main-Popup wallet-Popup" id="PeerPopup">
                <div className="container-Grid"> 
                <div className="MainTabBox">
                    <div className="tab-Nav">
                        <a href className="tab-Link" onClick={(e) => {e.preventDefault();}} data-id="tab-1">Peer to Contract</a>
                        <a href className="tab-Link" onClick={(e) =>{e.preventDefault();}} data-id="tab-2">Peer to Peer</a>
                        <a href className="tab-Link" onClick={(e) =>{e.preventDefault();}} data-id="tab-3">Peer to Contract and Group</a>
                    </div> 


                    <div className={"tab-Content " + this.props.popId} id="tab-1">
                         <div className="peerTitle01">Peer to Contract</div>
                         <div className="peerText01">SmartSwap holds liquidity pools with locked LP funds, executing P2C (Peer-to-Contract) swaps. The liquidity pools execute swap orders when there is no counter party. Users that provide liquidity receive spread + SMART rewards in both native tokens and major cryptocurrencies like BNB or ETH.</div>

                    </div> 
                    <div className={"tab-Content " + this.props.popId} id="tab-2">
                         <div className="peerTitle01">Peer to Peer</div>
                         <div className="peerText01">P2P has two distinct processes. First, SmartSwap defaults to the P2P swap to check if there is someone that wants to swap against the order placed. Second, SmartSwap P2P allows users to generate a transaction ID that can be sent directly to a specific person they want to swap with. The transaction ID is created and the users send their digital assets to that transaction ID. Once the swap takes place, SmartSwap swaps for the same face value. If there is any delta it will be returned to the appropriate party.</div>

                    </div> 
                    <div className={"tab-Content " + this.props.popId} id="tab-3">
                         <div className="peerTitle01">Peer to Contract and Group</div>
                         <div className="peerText01">If the liquidity contract does not have enough liquidity, the swap turns into a P2P&C swap, which means the swap partially executes and the rest remains pending until the contract rebalances itself through counterparties or liquidity providers (CEX or OTC) using a CeFi gateway that acts as a decentralized FLASH Swap. SmartSwap utilizes the Peer-to-Contract and Group (P2P&C) to search for as many counterparties as needed to cover the full face value of the transaction.</div>

                    </div> 

                    </div> 

                </div>
               
               
               
               
               
               
               
               
               
               
               
                <a href  onClick={(e) => { e.preventDefault(); this.props.closePopup("PeerPopup") }} className="close-Icon"></a>
            </div>
        )

    }

}