import React, { PureComponent } from "react";
import InputRange from 'react-input-range';

export default class SidePopup extends PureComponent {
    constructor(props){
        super();
        this.state = { 
            value: 50 
        };
    }
    
    render() {

        return (
            <div className={`side-Popup  ${this.props.sideBar && 'active'}` }>
                <div className="popup-Box">

                    <div className="sidePopup-tablink">
                        <span className="spTitle01">Swap limit </span>
                        {/* <a href="#" className="active">Swap Limit</a> */}
                    </div> 

                    {/* <!-- Gas limit Content  -->  */}


                      <div>
                        <div className="text-Wrap">
                            <div className="text-Title">Expedite swap via SP :<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="left" data-pt-title="<p>In case that there is no spread between average market price to the actual market price on CEX, user will cover expedite fees which will be deduct from the total receiving tokens. those expedite fee will be no more than 0.8% to allow the SP to buy immediately at market price. </p><p>for example, if SP is looking to gain 0.5% spread and the current spread between average market price to the market price is 0.4%, than user will cover only 0.1% expedite fee</p> <p>Any paid expedite fee will be 100% reimbursement to the user with SMART tokens</p>" aria-hidden="true"></i></i></div>
                            <div className="amt-Text">
                            <div className="apollo-element apollo-element-active apollo-field-switcher"> 
                                            <div className="apollo-fieldset">
                                                <label> <input type="checkbox"  name="shortcode[active]" value="1" data-depend-id="active" data-atts="active" />
                                                    <em data-on="on" data-off="off"></em><span></span>
                                                </label> 
                                            </div> 
                                        </div>
                                        </div>
                        </div> 

                        <div className="text-Wrap slDisable">
                            <div className="text-Title" style={{marginTop: '10px', marginBottom: 'auto'}}>Maximum spread for expedite :<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></div>
                            <div className="amt-Text">
                                <div className="dragorInput v3">
                                    <InputRange
                                        step={1}
                                        maxValue={100}
                                        minValue={0}
                                        value={this.state.value}
                                        onChange={value => this.setState({ value })}
                                        formatLabel={value => `${value}%`}
                                        onChangeComplete={value => console.log(value)}
                                    />
                                </div>
                            </div>
                        </div>
                         
                        {/* <div className="text-Wrap slDisable">
                            <div className="text-Title">Send:</div>
                            <div className="amt-Text ">
                                <span className="amtCurrecy ">$</span>
                                <input type="text" defaultValue="100" />
                            </div>
                        </div> */}

                        <div className="text-Wrap slDisable">
                            <div className="text-Title">Receive 1:1 same face value :</div>
                            <div className="cheMBX inline"> 
                                <div className="md-radio">
                                    <input type="radio"  id="rr05" name="stepin48" /> 
                                        <label htmlFor="rr05">As Market<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i> </label>
                                </div> 
                                <div className="md-radio">
                                    <input type="radio" defaultChecked id="rr06" name="stepin48" /> 
                                        <label htmlFor="rr06">As sent<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i> </label>
                                </div>
                            </div>
                        </div>

                        <div className="text-Wrap slDisable">
                            <div className="text-Title">Minimum amount to swap with :</div>
                            <div className="amt-Text ">
                                <span className="amtCurrecy ">$</span>
                                <input type="text" defaultValue="100" />
                            </div>
                        </div> 
                        {/* <div className="text-Wrap slDisable">
                            <div className="text-Title">Max users to swap with :</div>
                            <div className="amt-Text">10</div>
                        </div> */}
                        {/* <div className="text-Wrap">
                            <div className="text-Title">Ethereum gas :</div>
                            <div className="amt-Text">0.000253 ETH</div>
                        </div> */}
                        {/* <div className="text-Wrap">
                            <div className="text-Title">Bitcoin transfer commission :</div>
                            <div className="amt-Text">0.000235 BTC</div>
                        </div> */}
                        <div className="text-Wrap">
                            <div className="text-Title">Gas cost :</div>
                            <div className="amt-Text">0.000253 ETH</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">3<sup>rd</sup> party on-chain validation :</div>
                            <div className="amt-Text">0.000135 ETH</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">Transfer commission :</div>
                            <div className="amt-Text">$0</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">SmartSwap transaction fee : <i className="help-circle"><i className="fas fa-question-circle protip"
                                    data-pt-position="top" data-pt-title="80% of fees goes to support liquidity for SMART token and 20% goes to Atom Foundation to support development"
                                    aria-hidden="true"></i></i></div>
                            <div className="amt-Text">$0 / 0%</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">Slippage :</div>
                            <div className="amt-Text">$0 / 0%</div>
                        </div> 
                        <div className="text-Wrap">
                            <div className="text-Title">Estimated cost :</div>
                            <div className="amt-Text red-Color">-$5.7556 (0.01235 ETH | 0.0002 BTC)</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">1:1 SMART rebate :</div>
                            <div className="amt-Text green-Color">+$5.7556 (5.7556 ZERO/1)</div>
                        </div>
                        <div className="text-Wrap">
                            <div className="text-Title">Final cost to use SmartSwap :</div>
                            <div className="amt-Text">$0 / 0%</div>
                        </div>
                        <ul className="text-Box">
                            <li><span className="icon-Box"><i className="fas fa-exclamation-circle"></i></span><span>SmartSwap reimburses all swap fees and does not allow any loss of value due to spread or volatility. The estimated fees cost covers the swap fees and the direct cost of blockchain gas. If the user is swapping BTC, there is an additional cost for 3rd party providers to validate on-chain the exact deposit amount of BTC.</span></li>
                            <li><span> user sending BTC will deposit the maximum estimated gas cost to a temporary wallet generated by SmartSwap and 100% owned by the user. If the total gas cost at the end of the swap is less than the estimated amount, the temporary wallet returns the balance to the user’s wallet.</span></li>
                            <li><span>SmartSwap users have the option to receive 100% reimbursement for their gas and swap fees. Users are able to claim reimbursements via the reimbursement staking contract. To release reimbursements users must stake the 1:1 equal amount of SMART for one year, but will be able to release partial amounts of the reimbursement if withdrawn at any time before the 1 year period. The pending balance accumulates and the user is able to claim the rest.  </span></li>
                            <li style={{marginBottom: '0px'}}><span>Example</span></li>
                            <li><span>If over the year a user spent over $1000 or more on gas, at any time he can be reimbursed for such cost even if the SMART token value is higher due to appreciation.</span></li>
                        </ul>
                    </div>  

                    {/* <!-- swap limit Content  --> */}
                    {/* <div>
                        <div className="text-Wrap">
                            <div className="text-Title">Send :</div>
                            <div className="amt-Text">
                                <span className="amtCurrecy">$</span>
                                <input type="text" value="" />
                            </div>
                        </div>
                        <div className="sidepTitle01">Receive 1:1</div>
                        <div className="radioWrap">
                            <div className="md-radio">
                                <input type="radio" id="radio145" name="stepin50" value="option145" checked="" />
                                <label htmlFor="radio145">Same face value as market <i className="help-circle"><i className="fas fa-question-circle protip"
                                    data-pt-position="top" data-pt-title="Help Text Here"
                                    aria-hidden="true"></i></i></label>
                            </div>
                            <div className="md-radio">
                                <input type="radio" id="radio146" name="stepin50" value="option146" />
                                <label htmlFor="radio146">Same face value as sends</label>
                            </div>
                            
                        </div> 
                        <ul className="text-Box">
                            <li><span className="icon-Box"><i className="fas fa-exclamation-circle"></i></span><span>SmartSwap reimburses all swap fees and does not allow any loss of value due to spread or volatility. The estimated fees cost covers the swap fees and the direct cost of blockchain gas. If the user is swapping BTC, there is an additional cost for 3rd party providers to validate on-chain the exact deposit amount of BTC.</span></li>
                            <li><span>A user sending BTC will deposit the maximum estimated gas cost to a temporary wallet generated by SmartSwap and 100% owned by the user. If the total gas cost at the end of the swap is less than the estimated amount, the temporary wallet returns the balance to the userâ€™s wallet.</span></li>
                            <li><span>Once the final cost of gas and fees is known at the end of the swap, SmartSwap reimburses users with SMART at 100%.</span></li>
                        </ul>
                    </div> */}





                    <a href className="close-Icon" onClick={(e) => { e.preventDefault(); this.props.closePopup}}><img src="images/close-btn.png" alt=""/></a>

                </div>
            </div>       
        )

    }

}