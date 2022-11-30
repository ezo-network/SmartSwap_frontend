import { PureComponent } from "react";

export default class LedgerHistory extends PureComponent {
    render() {
        return (
            <>
                <div className="dropdown">
                    <h4 className="dropdown-title" data-toggle="n-collapse"
                        data-target="#ledgerDetailBoxMain"
                        aria-expanded="false"
                        aria-controls="ledgerDetailBoxMain">Ledger</h4>
                </div>
                <div id="ledgerDetailBoxMain" className="n-collapse">
                    <nav className="tab-nav">
                        <a className="active" onClick={(e) => e.preventDefault()}>All</a>
                        <a href onClick={(e) => e.preventDefault()}>Completed</a>
                        <a href onClick={(e) => e.preventDefault()}>Pending</a>
                    </nav>
                    <div className="ledger-tab">
                        <div className="ledger-half">
                            <h3><b>Sent</b> <i className="fas fa-chevron-right"></i></h3>
                            <h4>50 ETH <span>($10,000)</span></h4>
                            <p>Feb 2. 2019, 9:21am PST</p>
                            <div className="ledger-box">
                                <h5><i><img src="../images/tick.png" width="18px"></img></i> Transaction Submitted</h5>
                                <p>X0456c19d5A61AeA886E6D657EsEF8849565</p>
                                <a href="#">View transaction</a>
                            </div>
                        </div>
                        <div className="ledger-half">
                            <h3><b>Received <span>(73.69%)</span></b></h3>
                            <h4>0.25 BTC <span>($2,500)</span></h4>
                            <p>Feb 2. 2019, 9:21am PST</p>
                            <div className="ledger-box">
                                <h5><i><img src="../images/tick.png" width="18px"></img></i>Funds wired to your wallet </h5>
                                <p>X0456c19d5A61AeA886E6D657EsEF8849565</p>
                                <div className="flex">
                                    <a href="#">View transaction</a>
                                    <a className="color-green" href="#">Fees breakdown <i className="fas fa-caret-up ml-2"></i></a>
                                </div>
                                <table className="ledger-table">
                                    <tbody>
                                        <tr>
                                            <td>Network gas: <i className="help-circle">
                                                <i
                                                    className="fas fa-question-circle protip"
                                                    data-pt-position="top"
                                                    data-pt-title="Gas fees are paid to the corresponding blockchain network"
                                                    aria-hidden="true"
                                                ></i>
                                            </i></td>
                                            <td>0.00910955 Ether ($3.43)</td>
                                            <td><a href="">View transaction</a></td>
                                        </tr>
                                        <tr>
                                            <td>3<sup>rd</sup> party validators fees: <i className="help-circle">
                                                <i
                                                    className="fas fa-question-circle protip"
                                                    data-pt-position="top"
                                                    data-pt-title="Validators include Chainlink and other similar oracles"
                                                    aria-hidden="true"
                                                ></i></i></td>
                                            <td>0.01978784 Ether ($7.46)</td>
                                            <td><a href="">View transaction</a></td>
                                        </tr>
                                        <tr>
                                            <td>Transfer tokens: <i className="help-circle">
                                                <i
                                                    className="fas fa-question-circle protip"
                                                    data-pt-position="top"
                                                    data-pt-title="Info"
                                                    aria-hidden="true"
                                                ></i></i></td>
                                            <td>0.01978784 Ether ($7.46)</td>
                                            <td><a href="">View transaction</a></td>
                                        </tr>
                                        <tr>
                                            <td>SmartSwap fee: <i className="help-circle">
                                                <i
                                                    className="fas fa-question-circle protip"
                                                    data-pt-position="top"
                                                    data-pt-title="80% of the SmartSwap fee goes to buy SMART for the market"
                                                    aria-hidden="true"
                                                ></i></i></td>
                                            <td>0.3% ($0.005457)</td>
                                            <td><a href="">View transaction</a></td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td>SMART Rebate: <i className="help-circle">
                                                <i
                                                    className="fas fa-question-circle protip"
                                                    data-pt-position="top"
                                                    data-pt-title="Info"
                                                    aria-hidden="true"
                                                ></i></i></td>
                                            <td>0.1819 SMART ($0.1819) </td>
                                            <td><a href="">View transaction</a></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <h4>0.25 BTC <span>($2,500)</span></h4>
                            <p>Feb 2. 2019, 9:21am PST</p>
                            <div className="ledger-box">
                                <h5><i><img src="../images/tick.png" width="18px"></img></i>Funds wired to your wallet </h5>
                                <p>X0456c19d5A61AeA886E6D657EsEF8849565</p>
                                <div className="flex">
                                    <a href="#">View transaction</a>
                                    <a className="color-green" href="#">Fees breakdown <i className="fas fa-caret-down ml-2"></i></a>
                                </div>

                            </div>

                            <h4>0.25 BTC <span>($2,500)</span></h4>
                            <p>Feb 2. 2019, 9:21am PST</p>
                            <div className="ledger-box">
                                <h5><i><img src="../images/tick.png" width="18px"></img></i>Funds wired to your wallet </h5>
                                <p>X0456c19d5A61AeA886E6D657EsEF8849565</p>
                                <div className="flex">
                                    <a href="#">View transaction</a>
                                    <a className="color-green" href="#">Fees breakdown <i className="fas fa-caret-down ml-2"></i></a>
                                </div>
                            </div>

                            <h3><b>Pending <span>(73.69%)</span></b></h3>
                            <h4>10 ETH <span>($2,500)</span></h4>
                            <div className="ledger-box">
                                <div className="pending-text">Pending <div className="loader">Loading...</div></div>
                            </div>
                            <div className="pending-bottom">
                                <i className="fas fa-cog color-green"></i>
                                <span>Wait until a match is found or cancel the transaction to redeem the 10 ETH pending to your wallet</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}