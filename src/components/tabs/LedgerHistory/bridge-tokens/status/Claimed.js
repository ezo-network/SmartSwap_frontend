import { PureComponent } from "react";
import web3 from "web3";
import moment from 'moment';
import _ from "lodash";
import {numberExponentToLarge, checkTransactionOnExplorer, textMasking} from "../../../../../helper/utils";

const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;
const wrapTokenSymbolPrefixLength = Number((wrapTokenSymbolPrefix).length);

export default class Claimed extends PureComponent {
    _componentMounted = false;

    constructor(props) {
        super();
        this.state = {}
    }

    componentDidMount = async () => {
        console.log("Claimed Component mounted");
        this._componentMounted = true;
        if (this._componentMounted) { }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("Claimed Component unmounted");
    }

    render() {

        const symbol = this.props.isWrapTokenDeposit ? this.props.tokenSymbol.substring(wrapTokenSymbolPrefixLength) : this.props.tokenSymbol;

        return (
            <>
                <h3>
                    <b>{this.props.title}</b>
                </h3>
                <h4>
                    {numberExponentToLarge(this.props.value / 10 ** this.props.decimals)} {symbol} ({this.props.toNetworkConfig.name})
                </h4>
                {/* <p>Feb 2. 2019, 9:21am PST</p> */}
                <p>{moment(this.props.claimedOn).format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <h5><i><img src="../images/tick.png" width="18px"></img></i>Funds wired to your wallet </h5>
                    <p>{this.props.claimTranactionHash !== null ? textMasking(this.props.claimTranactionHash) : ""}</p>
                    <div className="flex">
                        {this.props.claimTranactionHash !== null &&
                        <a className="cursor" href="#" onClick={() => checkTransactionOnExplorer(this.props.toNetworkConfig?.explorerUrl, this.props.claimTranactionHash)}>View transaction</a>
                        }
                    </div>
                </div>
            </>
        )
    }

}