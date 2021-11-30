import React, { PureComponent } from "react";
import web3Config from "../config/web3Config";

export default class WalletPopup extends PureComponent {
    constructor(props){
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config
        }
    }

    componentWillReceiveProps(newProps){
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        })
    }

    render() {

        return (
            <div className="main-Popup wallet-Popup" id="wallet-Popup">
                <div className="container-Grid">
                    <div className="wallet-popupBlock">
                        <div className="search-Mbx">

                            <div className="search-Bx"> <a href="javascript:void(0);">
                                <span className="icon-Box"><i className="fas fa-search"></i></span></a>
                                <input type="text" placeholder="Search wallet by Name" />
                            </div>
                        </div>
                        <div className="wallet-boxWrap">
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon03.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Guarda</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon02.png" alt="" className="img-fluid" />
                                    <div className="title-Name">MyEtherWaCllet</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon01.png" alt="" className="img-fluid" />
                                    <div className="title-Name">MetaMask</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon04.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Mist</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon05.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Exodus</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon06.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Atomic</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon07.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Jaxx</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon08.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Ethaddress</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon09.png" alt="" className="img-fluid" />
                                    <div className="title-Name">TrustWallet</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon10.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Coinomi</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon11.png" alt="" className="img-fluid" />
                                    <div className="title-Name">Bread Wallet</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                            <div className="wallet-Bx ani-1">
                                <div className="img-Box"> <img src="images/wallet-icon12.png" alt="" className="img-fluid" />
                                    <div className="title-Name">imToken Wallet</div>
                                </div>
                                <a href="javascript:void(0);" className="faux-Link"></a>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="javascript:void(0);" className="close-Icon"></a>
            </div>
        )

    }

}