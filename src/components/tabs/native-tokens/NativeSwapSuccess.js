import { PureComponent } from "react";

export default class NativeSwapSuccess extends PureComponent {
    render() {
        return (
            <>
                <div className="wrap-Box">
                    <div
                        className="swap-Wrap grey-Box wow fadeInRight"
                        data-wow-delay="0.3s"
                    >
                        <div className="swap-Box swap-Successful">
                            <div className="swap-Input">
                                <div className="swap-Title">
                                    <div className="swap-Amt">
                                        <span className="currecy">$</span>
                                        <input
                                            type="text"
                                            id="input04"
                                            value={this.props.sendFundAmount}
                                        />
                                        <i className="recCurIcon">
                                            <img
                                                src={
                                                    "images/receiveCurrencies/" +
                                                    this.props.selectedSendCurrency +
                                                    ".png"
                                                }
                                            />
                                        </i>
                                    </div>
                                </div>
                                <div className="swap-Title">
                                    <div className="swap-Amt">
                                        <span className="currecy">$</span>
                                        <input
                                            type="text"
                                            value={this.props.sendFundAmount}
                                            readOnly
                                        />
                                        <i className="recCurIcon">
                                            <img
                                                src={
                                                    "images/receiveCurrencies/" +
                                                    this.props.selectedReceiveCurrency +
                                                    ".png"
                                                }
                                            />
                                        </i>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="swap-Icon">
                                <a
                                  href="javascript:void(0);"
                                  className="faux-Link ani-1"
                                >
                                  <img
                                    src="images/swap-Icon.png"
                                    alt=""
                                    className="ani-1"
                                  />
                                </a>
                              </div> */}
                            <div className="successMesg01">
                                <div className="icon-Box">
                                    <i className="fas fa-check"></i>
                                </div>
                                Swap sent successfully
                                <a
                                    href="javascript:void(0);"
                                    onClick={() => {
                                        this.scrollToLedger();
                                    }}
                                >
                                    Check the ledger below
                                </a>
                            </div>
                            {/* <div className="successMesg01 yellow-Color"><div className="icon-Box"><img src="images/transaction-img.png" alt="" className="ani-1" /></div>
                                            73.69% of the swap completed successfully
                                            <a href="javascript:void(0);">26.31% still pending<span><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="After you type your BTC wallet address and click the CLAIM BTC button, every pending swap will automatically deposit to your BTC wallet address. NO FURTHER ACTION IS REQUIRED"></i></span></a>
                                            </div> */}
                        </div>
                        <div className="swap-Textlink">
                            <div className="swap-Link03">
                                <a
                                    href="javascript:void(0);"
                                    className="yellow-Color"
                                    onClick={() => this.changeWrapBox("swap")}
                                >
                                    Start a new swap
                                </a>
                                {/* |  <a href="javascript:void();">P2C</a>   |   <a href="javascript:void();">P2G</a>   |   <a href="javascript:void();">P2P</a> */}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}