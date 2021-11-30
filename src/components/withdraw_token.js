import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";

export default class WithDrawToken extends PureComponent {
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
            <div className="main-Popup wallet-Popup" id="WithdrawToken">

                <div className="container-Grid">
 
                        
                        <div className="wtMBX">
                        <div class="peerTitle01">Withdraw Token</div>
                            <div class="gwFormSbox01">
                                <div class="gwFormTitle01">Tokens name</div>
                                    <select name="fontStyle" id="fontStyle" class="subdomain" style={{padding: '20px 15px',  width: '100%',  backgroundColor: 'rgb(39, 30, 58)', color: 'rgb(255, 255, 255)', border: '0px'}} >
                                        <option value="a">Token Name A</option>
                                        <option value="b">Token Name B</option> 
                                    </select>
                            </div>
                            <div class="gwFormSbox01">
                                <div class="gwFormTitle01">Tokens to withdraw</div>
                                    <input name="fontStyle" id="fontStyle" class="subdomain" style={{padding: '20px 15px',  width: '100%',  backgroundColor: 'rgb(39, 30, 58)', color: 'rgb(255, 255, 255)', border: '0px'}} > 
                                    </input>
                                    <div class="smlInfotxt01" style={{textAlign: 'left'}}>Max 7,589.653 SMART</div>
                            </div>
                            <div class="gwFormSFormbox03"><button class="gwFormBTN01 blackBack">WITHDRAW</button></div>




                        </div>
 

                </div>

                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("WithdrawToken") }} className="close-Icon"></a>
            </div>
        )

    }

}