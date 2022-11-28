import React, { PureComponent } from "react";
import data, { tokenDetails } from "../../config/constantConfig";

const $ = window.$;

export default class HowItWorks extends PureComponent {
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
        $("#HowItWorks .tab-Link").hover(function () {
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
            <div className="main-Popup wallet-Popup" id="HowItWorks">
                <div className="container-Grid">
                    <div className="MainTabBox" style={{ paddingTop: '80px' }}>
                        <div className="tab-Nav">
                            <a href className="tab-Link" onClick={ev => { ev.preventDefault(); }} data-id="tab-4">How it Works</a>
                            <a href className="tab-Link hideMobile" onClick={ev => { ev.preventDefault(); }} data-id="tab-5">SmartSwap vs Atomic Swap & Other Swaps</a>
                        </div>


                        <div className={"tab-Content " + this.props.popId} id="tab-4">
                            <div className="peerTitle01">How it Works</div>
                            <div className="peerText01">
                                <p>Smartswap’s contract utilizes a zero volatility patent pending method which prevents slippage and wholly reimburses users fees and gas costs. The swap works by letting users choose a token they want to swap (Token A) and then select a receiving token (Token B). Unlike a Decentralized Exchange (DEX) or Automated Market Maker (AMM), SmartSwap asks users the USD face value of the tokens they want to swap, rather than the token amount they want to receive.</p>

                                <p>Subsequently, with SmartSwap, users do not choose the value of Token A or how many tokens of Token B they want to receive. Instead, SmartSwap prices Token A and Token B based on the current average market price between multiple reliable exchanges.</p>

                                <p>Furthermore, when the user sends $1000 face value of Token A to receive Token B there is no possibility for them to receive $999 or $1001. SmartSwap executes the order with the exact same face value. In the case of an unmatched swap (due to counterparty different order amount or market volatility) the SmartSwap alters the order to receive less of Token B in order to match the face value, or alternatively return any excess to the user of which it belongs.</p>

                                <p>Unlike AMM such uniswap, smartswap doesn't have any liquidity pools or liquidity providers (LP) structure. instead the smartswap work as a decentralized P2P with unique swap providers (SP) solution like a fountain driving liquidity from centralized exchanges </p>

                            </div>
                        </div>

                        <div className="tab-Nav showMobile " style={{ width: '100%' }}>
                            <a href className="tab-Link " onClick={ev => { ev.preventDefault(); }} data-id="tab-5">SmartSwap vs Atomic Swap & Other Swaps</a>
                        </div>
                        <div className={"tab-Content " + this.props.popId} id="tab-5">
                            <div className="peerTitle01">SmartSwap vs Atomic Swap</div>
                            <div className="peerText01"> SmartSwap utilizes technology that allows cross-chain swaps between two assets without validator risk, wrapping, or side-chain utilization. The cross-chain swap is a true one-click swap between blockchain networks. The cross-chain swap has the ability to act like a bridge between blockchain networks based smart contracts such as Ethereum<br /><br />

                                At the moment, SmartSwap supports swaps between BNB {'<>'} ETH and ERC20{'<>'}BEP20. SmartSwap capabilities present the first one-click swap that is not considered an atomic swap or reliant on time-locked swaps.

                            </div>
                            <div className='smrtvsatoTable01'>

                                <table width="100%" border="0" cellSpacing="0" cellPadding="10">
                                    <tbody>
                                        <tr>
                                            <th scope="col">&nbsp;</th>
                                            <th align="center" valign="middle" scope="col">DEXs <br />
                                                <span>(Uniswap, Pancake, etc)</span></th>
                                            <th align="center" valign="middle" scope="col">Binance Bridge</th>
                                            <th align="center" valign="middle" scope="col">
                                                <img src="images/menu-rb-logo.png" alt="" />
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Decentralized cross-chain</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>One click cross-chain</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Unlimited liquidity</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Slippage free</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Fee reimbursement</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Gas reimbursement</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Token price correlated to platform usage</td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-times"></i></td>
                                            <td align="center" valign="middle"><i className="fas fa-check"></i></td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>





                        </div>
                    </div>

                </div>











                <a href onClick={(e) => { e.preventDefault(); this.props.closePopup("HowItWorks") }} className="close-Icon"></a>
            </div>
        )

    }

}