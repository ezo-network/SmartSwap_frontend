import React, { PureComponent } from "react";
import data, { tokenDetails } from "../../config/constantConfig";

export default class LiquidityFountainSP extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            value: 45000,
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
        // console.log(this.state.coinList)
    }

    toggle = index => {
        let collapse = "isOpen" + index;
        this.setState(prevState => ({ [collapse]: !prevState[collapse] }));
    };

    render() {

        return (
            <div className="main-Popup wallet-Popup" id="LiquidityFountainSP">

                <div className="container-Grid">

                    <div className="peerTitle01">Liquidity Fountain for SPs</div>
                    <div className="peerText01">When users swap tokens on SmartSwap, the protocol takes the market price. SP’s are buying those tokens on the CEX through the API integrated on their account. The API is set to buy the tokens below the average market price to gain a spread. The structure creates a send, receive, repeat loop similar to a fountain that mines for SPs more of their favorite tokens without having to lock funds or wrap any tokens.</div>


                    <div className='lfforSPIMGBX'><img src="images/lfforSP-img.png" alt="" /></div>

                </div>

                <a href="#" onClick={(e) => { e.preventDefault(); this.props.closePopup("LiquidityFountainSP") }} className="close-Icon"></a>
            </div>
        )

    }

}