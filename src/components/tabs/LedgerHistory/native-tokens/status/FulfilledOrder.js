import { PureComponent } from "react";
import web3 from "web3";
import moment from 'moment';
import _ from "lodash";

const checkTransactionOnExplorer = (explorerUrl, txHash) => {
    if(explorerUrl !== undefined){
        window.open(explorerUrl + '/tx/' + txHash, "_blank");
    }
}

const textMasking = (text, maskingChar = '.', noOfMaskingChar = 16, startingLettersLength = 25, endingLettersLength = 25) => {
    return text.substring(0, startingLettersLength) + maskingChar.repeat(noOfMaskingChar) + text.slice(-endingLettersLength)
}

export default class FulfilledOrder extends PureComponent {
    _componentMounted = false;

    constructor(props) {
        super();
        this.state = {}
    }

    componentDidMount = async () => {
        console.log("FulfilledOrder Component mounted");
        this._componentMounted = true;
        if (this._componentMounted) { }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("FulfilledOrder Component unmounted");
    }

    render() {
        return (
            <>
                <h3>
                    <b>
                        Received
                        {/* <span>(73.69%)</span> */}
                    </b>
                </h3>
                <h4>
                    {web3.utils.fromWei(this.props.receivedTokenQty)} {this.props.receivedTokenSymbol}
                    <span>&nbsp;(${Number(web3.utils.fromWei(this.props.receivedTokenQty)) * _.mean(this.props.receinvedTokenOnDollarPrice ?? [])})</span>
                </h4>
                {/* <p>Feb 2. 2019, 9:21am PST</p> */}
                <p>{moment.unix(this.props.receivedOnTime).format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <h5><i><img src="../images/tick.png" width="18px"></img></i>Funds wired to your wallet </h5>
                    <p>{textMasking(this.props.claimApprovedTranactionHash)}</p>
                    <div className="flex">
                        <a className="cursor" href onClick={() => checkTransactionOnExplorer(this.props.receivingToNetworkConfig?.explorerUrl, this.props.claimApprovedTranactionHash)}>View transaction</a>
                        {/* <a className="color-green" href="#">Fees breakdown <i className="fas fa-caret-up ml-2"></i></a> */}
                    </div>
                    {/* <table className="ledger-table">
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
                                        </table> */}
                </div>
            </>
        )
    }

}