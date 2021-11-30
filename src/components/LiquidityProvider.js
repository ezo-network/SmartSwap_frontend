import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";
import Collapse from "@kunukn/react-collapse";
import InputRange from 'react-input-range';

export default class LiquidityProvider extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            value:10,
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
            <div className="main-Popup wallet-Popup" id="LiquidityProvider">
                <div className="container-Grid">
                    <div className="LiProTitle01">Become a Swap Provider</div>

                    <div className="LiProFormMbox">

                        <div className="LiProfSbox01">
                            <div className="LiProTitle02">SEND</div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProTitle02">RECEIVED</div>
                        </div>
                        <div className="LiProfSbox01 smFixer01">
                            <div className="LiProLable">Choose the amount of token A to sell on Smartswap</div>
                            <div className="bspMBX01 smFixer06">
                                <div className="bspSBX01">
                                <div className="LiproInput01 withLable01"><span>$</span><input type="text" value="" /></div> 
                                </div>
                                <div className="bspSBX01">
                                    <div className="LiproDropdown">
                                        <button className='LiproDDbtn01' onClick={() => this.toggle(1)} >
                                            <div className="ddIconBX"> <span> <img src="images/ddETH-icon.png" alt="" /></span> ETH</div>
                                            <i className="fas fa-caret-down"></i>
                                        </button>
                                        <div className="ddContainer">
                                            <Collapse isOpen={this.state.isOpen1} className={"collapse-css-transition"} >
                                                <button className='LiproDDbtn01'  >
                                                    <div className="ddIconBX"> <span> <img src="images/ddETH-icon.png" alt="" /></span> ETH</div>
                                                </button>
                                                <button className='LiproDDbtn01'  >
                                                    <div className="ddIconBX"> <span> <img src="images/ddBNB-icon.png" alt="" /></span> ETH</div>
                                                </button>
                                            </Collapse>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="FlyICO03"> {"<>"} </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Choose token B to receive from SmartSwap</div>
                            <div className="LiproDropdown">
                                <button className='LiproDDbtn01' onClick={() => this.toggle(2)} >
                                    <div className="ddIconBX"> <span> <img src="images/ddBNB-icon.png" alt="" /></span> BNB</div>
                                    <i className="fas fa-caret-down"></i>
                                </button>
                                <div className="ddContainer">
                                    <Collapse isOpen={this.state.isOpen2} className={"collapse-css-transition"} >
                                        <button className='LiproDDbtn01'  >
                                            <div className="ddIconBX"> <span> <img src="images/ddETH-icon.png" alt="" /></span> ETH</div>
                                        </button>
                                        <button className='LiproDDbtn01'  >
                                            <div className="ddIconBX"> <span> <img src="images/ddBNB-icon.png" alt="" /></span> ETH</div>
                                        </button>
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                        <div className="LiProfSbox01">
                            <div className="LiProLable">Wallet address that send token A<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter the wallet that will become a Swap Provider" aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input type="text" defaultValue='' />
                            </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Wallet address that receive token B<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter the wallet that receives SP results and rewards, on same CEX such Binacne it may be the same wallet address as the one that send token A, but on some other CEX they may have two different wallets, one to send fund our and another to receive fund in." aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input type="text" defaultValue='' />
                            </div>
                        </div>

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">GAS AND FEES</div>
                            <div className="LiProLable mtFix01">Set the maximum amount which the smart contract is authorized to withdraw from your CEX account to cover the gas and fees. Once the total is reached, the contract stops performing until reauthorized with a new limit</div>
                            <div className="dragorInput v2">
                                <InputRange
                                    maxValue={100}
                                    minValue={1}
                                    value={this.state.value}
                                    formatLabel={value => `${value} BNB`}
                                    onChange={value => this.setState({ value })} />
                            </div>

                        </div>

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">REPEAT</div>
                        </div>

                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum that you want to gain on each repeat <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Set a profit limit before funds are sent out to be swapped. </br></br>

For example, you can choose that you want your funds to swap only if it's gain 0.1% or 0.5% profits.  When you set the profit limit, take under consideration all the costs that you may pay to your CEX for such transaction" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <input type="text" defaultValue='0.3' />
                                    <span>%</span>
                                </div>
                                <div className="smlInfotxt01">[0.161754 BNB/ETH]</div>
                            </div>
                        </div>


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum funds to accumulate before calming it back  
to your CEX account<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="If you choose to accumulate 100% of the funds before withdrawing it from the smart contract to your CEX account, you will only pay gas once for one transaction. If you choose to trigger a withdraw from the smart contract to your CEX account every time there is accumulation of 10%, you should expect to pay 10x gas fees for 10 transactions " aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <input type="text" defaultValue='10' />
                                    <span>%</span>
                                </div>
                                <div className="smlInfotxt02">Based on minimum 10% accumulation, expect to pay 10x gas cost  </div>
                            </div>
                        </div>

                        {/* <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Sell token B for token A on CEX using</div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="gwFormSFormbox02">
                                    <div className="md-radio md-radio-inline">
                                        <input type="radio" id="radio145" name="stepin50" value="option146" /><label for="radio145">
                                            Market<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text Here" aria-hidden="true"></i></i>
                                        </label>
                                    </div>

                                    <div className="md-radio md-radio-inline">
                                        <input type="radio" id="radio146" name="stepin50" value="option145" /><label for="radio146">
                                            Limit<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text Here" aria-hidden="true"></i></i>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">WITHDRAW</div>
                        </div>

                        <div className='LiProFlexBX01 tabFixer smFixer02' style={{alignItems: 'flex-start'}}>
                            <div className="LiProfSbox01" style={{paddingTop: '10px'}}>
                                <div className="LiProLable">Stop repeat on CEX <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how many transactions you approve as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stops, there is no way to change the process besides deploying a new Swap Provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">

                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio" checked id="s01" name="s11" value="s01" />
                                        <label htmlFor="s01"></label>
                                    </div> 
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <input type="text" defaultValue='April 1,2021' />
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s02" name="s11" value="s02" />
                                        <label htmlFor="s02"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input type="text" defaultValue='100' />
                                            <div className="FlyICO02">Days</div>
                                            <span>Repeat</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s03" name="s11" value="s03" />
                                        <label htmlFor="s03"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                       <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account " aria-hidden="true"></i></i></div>
                                    </div>
                                </div>
 
                            </div>
                        </div>


                        <div className='LiProFlexBX01 tabFixer smFixer02'  style={{alignItems: 'flex-start'}}>
                            <div className="LiProfSbox01" style={{paddingTop: '10px'}}>
                                <div className="LiProLable">Withdraw from Smartswap<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how long you wish your funds to be used as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stop, there is no way to change it besides to deploy a new swap provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02"> 
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio" checked id="s04" name="s12" value="s04" />
                                        <label htmlFor="s04"></label>
                                    </div> 
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <input type="text" defaultValue='April 1,2021' />
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s05" name="s12" value="s05" />
                                        <label htmlFor="s05"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input type="text" defaultValue='100' />
                                            <div className="FlyICO02">Days</div>
                                            <span>Repeat</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s06" name="s12" value="s06" />
                                        <label htmlFor="s06"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                       <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account " aria-hidden="true"></i></i></div>
                                    </div>
                                </div>
 
                            </div>
                        </div>

                        <div className='spacerLine'></div>
                        {/* <div className="LiProfSbox03">
                            <div className="LiProTitle02">WITHDRAW</div>
                        </div> */}


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">API Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific API key to the CEX of your choice" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">

                                <div className="LiproInput01">
                                    <input type="text" defaultValue='' />
                                </div>
                            </div>
                        </div>


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Security Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific Security Key to the CEX of your choice" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">

                                <div className="LiproInput01">
                                    <input type="text" defaultValue='' />
                                </div>
                            </div>
                        </div>

                        <div className="LiProfSbox03">
                            <div className='LiProformBTNbar'>
                                <button>DEPLOY SMART CONTRACT</button>
                            </div>
                        </div>
 

                    </div>

 
                    <div className='spacerLine'></div>

                    <div className="LiProTitle03">Below is your Swap Provider smart contract address
                        <span>Whitelist this smart contract address on your account on your CEX<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Follow the instructions on your CEX to whitelist the SmartSwap address below" aria-hidden="true"></i></i></span>
                    </div>

                    <div className="spContrlMBX">
                        <div className='spCountrlTitle01'>SEND <span>BNB</span> {'<>'} RECEIVE <span>ETH</span></div>
                        <div className='spContrlInputBX'>
                            <i>1</i>
                            <input type="text" value='0xF3B3f6F15d474C92cb4051c22697C371e6e117B1' /> 
                            <a href="#" class="LicCopyBTN v2"><i class="fas fa-copy"></i></a>
                        </div>
                        <div className='spContrlInfotxt'>
                        Created at April 6,2021 05:21:36pm UTC &nbsp;&nbsp;&nbsp;&nbsp; Balance:  425.563 BNB | $4,846 USDT
                            <span>Withdraw all funds back to your CEX account</span>
                        </div>
                        <div className='spContrlInfotxt02'>AUTHORIZE NEW GAS AND FEES LIMIT<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." aria-hidden="true"></i></i></div>
                        <div className='spContrlSBX'>

                            <div className='spContrlSSBX01'>
                            <div className="dragorInput v2">
                                <InputRange
                                    maxValue={100000}
                                    minValue={100}
                                    value={this.state.value}
                                    formatLabel={value => `$${value}`}
                                    onChange={value => this.setState({ value })} />
                            </div>
                            </div>
                            <div className='spContrlSSBX02'>
                                <button className='spContrlBTN01'>AUTHORIZE NEW LIMIT</button>
                            </div> 
                        </div> 
                    </div>

                    <div className="spContrlMBX">
                    <div className='spCountrlTitle01'>SEND <span>ETH</span> {'<>'} RECEIVE <span>BNB</span></div>
                        <div className='spContrlInputBX'>
                            <i>2</i>
                            <input type="text" value='0xF3B3f6F15d474C92cb4051c22697C371e6e117B1' />
                            <a href="#" class="LicCopyBTN v2"><i class="fas fa-copy"></i></a>
                        </div>
                        <div className='spContrlInfotxt'>
                        Created at April 6,2021 05:21:36pm UTC &nbsp;&nbsp;&nbsp;&nbsp; Balance:  425.563 BNB | $4,846 USDT
                            <span>Withdraw all funds back to your CEX account</span>
                        </div>
                        <div className='spContrlInfotxt02'>CHANGE THE MINIMUM SPREAD YOU WANT TO GAIN ON EACH SWAP<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." aria-hidden="true"></i></i></div>
                        <div className='spContrlSBX'>

                            <div className='spContrlSSBX01'>
                            <div className="dragorInput v2">  
                                <InputRange
                                    maxValue={100000}
                                    minValue={100}
                                    value={this.state.value}
                                    formatLabel={value => `$${value}`}
                                    onChange={value => this.setState({ value })} />
                            </div>
                            </div>
                            <div className='spContrlSSBX02'>
                                <button className='spContrlBTN01'>AUTHORIZE NEW LIMIT</button>
                            </div> 
                        </div> 
                    </div>








                </div>











                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("LiquidityProvider") }} className="close-Icon"></a>
            </div>
        )

    }

}