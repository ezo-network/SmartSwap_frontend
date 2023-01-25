import { PureComponent } from "react";
import moment from 'moment';
import _ from "lodash";
import {numberExponentToLarge, checkTransactionOnExplorer, textMasking} from "../../../../helper/utils";

const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;
const wrapTokenSymbolPrefixLength = Number((wrapTokenSymbolPrefix).length);

export default class OrderInformation extends PureComponent {
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

        const symbol = this.props.isWrapTokenDeposit ? this.props.tokenSymbol.substring(wrapTokenSymbolPrefixLength) : this.props.tokenSymbol;

        return (
            <>
                <h3>
                    <b>{this.props.title}</b>
                    <i className="fas fa-chevron-right"></i>
                </h3>
                <h4>
                    {numberExponentToLarge(this.props.value / 10 ** this.props.decimals)} {symbol} ({this.props.fromNetworkConfig.name})
                </h4>
                {/* <p>Feb 2. 2019, 9:21am PST</p> */}
                <p>{moment(this.props.depositOn).format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <h5><i><img src="../images/tick.png" width="18px"></img></i>
                    Transaction Submitted </h5>
                    <p>{textMasking(this.props.tranactionHash)}</p>
                    <div className="flex">
                        <a className="cursor" href="#" onClick={() => checkTransactionOnExplorer(this.props.fromNetworkConfig?.explorerUrl, this.props.tranactionHash)}>View transaction</a>
                    </div>
                </div>
            </>
        )
    }

}