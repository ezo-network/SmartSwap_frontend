import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";

export default class CoinPopup extends PureComponent {
    constructor(props){
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config,
            coinList: tokenDetails
        }
    }

    componentWillReceiveProps(newProps){
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        })
    }

    componentDidMount(){
        // console.log(this.state.coinList)
    }

    render() {

        return (
            <div className="main-Popup wallet-Popup" id={this.props.popId}>
                <div className="container-Grid">
                    {/* <div className="tab-Nav">
                        <a href="javascript:void(0)" className={"tab-Link ani-1 active" + this.props.popId} data-id="tab-01">Tokens</a>
                        <a href="javascript:void(0)" className={"tab-Link ani-1 hideMobile" + this.props.popId} data-id="tab-02">LP Tokens</a>
                    </div> */}
                    <div className={"tab-Content" + this.props.popId} id="tab-01">
                        <div className="wallet-popupBlock">
                            {/* <div className="search-Mbx">
                                <div className="popupViewFMbox">
                                    <a href="#"><i className="fas fa-square"></i></a>
                                    <a href="#" className="active"><i className="fas fa-th-list"></i></a>
                                </div>

                                <div className="search-Bx"> <a href="javascript:void(0);"><span className="icon-Box"><i
                                                className="fas fa-search"></i></span></a>
                                    <input type="text" placeholder="Search by symbol or coin name" />
                                </div>
                            </div> */}
                            <div className="wallet-boxWrap">
                                {
                                    Object.keys(this.state.coinList).map((key) => {
                                        // [Number(key), obj[key]]
                                        if(key === this.props.opositeSelectedCurrrency || this.state.coinList[key].networkId === this.state.coinList[this.props.opositeSelectedCurrrency].networkId){
                                            return null
                                        } else {
                                            return (
                                                <div className="wallet-Bx ani-1">
                                                    <div className="img-Box">
                                                        <span className="round-Bg">
                                                            <span className="icon-Box icon16">
                                                                <img src={PrePath+"/images/currencies/"+ this.state.coinList[key].iconName +".png"}/>
                                                            </span>
                                                        </span>
                                                        <div className="title-Name">{key}</div>
                                                    </div>
                                                    <a href="javascript:void(0);" className="faux-Link" onClick={()=>this.props.setCurrency(key)}></a>
                                                </div>
                                            )
                                        }
                                    })   
                                }
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon16"></span></span>
                                        <div className="title-Name">SMART</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon01"></span></span>
                                        <div className="title-Name">ZERO/1</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon02"></span></span>
                                        <div className="title-Name">Secured Tether USD</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon05"></span></span>
                                        <div className="title-Name">Paxos Standard</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon06"></span></span>
                                        <div className="title-Name">StatusNetwork</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon07"></span></span>
                                        <div className="title-Name">HuobiToken</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon08"></span></span>
                                        <div className="title-Name">ChainLink Token</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon09"></span></span>
                                        <div className="title-Name">OmiseGO</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon10"></span></span>
                                        <div className="title-Name">BAT</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon11"></span></span>
                                        <div className="title-Name">IOSToken</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                                <div className="wallet-Bx ani-1 coming-Soon">
                                    <div className="img-Box"><span className="round-Bg"><span
                                                className="icon-Box icon12"></span></span>
                                        <div className="title-Name">Dai Stablecoin v1.0</div>
                                    </div>
                                    <a href="javascript:void(0);" className="faux-Link"></a>
                                </div>
                            </div>
                        </div>
                    </div> 
                     
                </div>
                <a href="javascript:void(0);" className="close-Icon"></a>
            </div>
        )

    }

}