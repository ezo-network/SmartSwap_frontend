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
        return (
            <>
                <h3><b>Original Token</b> <i className="fas fa-chevron-right"></i></h3>
                <h4>
                    {web3.utils.fromWei(this.props.value)} {this.props.tokenSymbol} ({this.props.fromNetworkConfig.chain})
                </h4>
                {/* <p>Feb 2. 2019, 9:21am PST</p> */}
                <p>{moment(this.props.depositOn).format("MMM D[. ]YYYY[, ]h[:]mma zz")}</p>
                <div className="ledger-box">
                    <h5><i><img src="../images/tick.png" width="18px"></img></i>
                    Transaction Submitted </h5>
                    <p>{textMasking(this.props.tranactionHash)}</p>
                    <div className="flex">
                        <a className="cursor" href onClick={() => checkTransactionOnExplorer(this.props.fromNetworkConfig?.explorerUrl, this.props.tranactionHash)}>View transaction</a>
                    </div>
                </div>
            </>
        )
    }

}