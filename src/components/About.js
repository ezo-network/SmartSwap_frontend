import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";
import Collapse from "@kunukn/react-collapse";
import "../assets/AboutPopup.css"

export default class About extends PureComponent {
    constructor(props) {
        super();
        this.state = {
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
            <div className="main-Popup wallet-Popup" id="About">
                <div className="container-Grid">
                    <div className="LiProTitle01">About Us</div>
                    <div className="ppAboutText01"> Smart.exchange is a decentralized organization managed by a DAO community and created by Atom Foundation early 2017. The first published patent was in 2018 when there was no DeFi awareness. At this time, investors did not even know what slippage was so the solution pre-dated the problem. Now, with the emergence of AMMs, SmartSwap solves a known need in the industry.</div>


                    <section id="team-Block">
                        <div className="advisor-team-Box">
                            <div className="wrapper">
                                <div className="s20TeamContainer clearfix" id="our_advisor">
                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20ttextbox02">Our Advisors</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="mailto:dee@jointer.io" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-01.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/4/t2-ss_nNs3qoe.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/4/t2-ss_nNs3qoe.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Dee Hock</span>Founder and former CEO of Visa Credit Card Association</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="mailto:david@jointer.io" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-02.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/5/t3-ss_X2yzDCr.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/5/t3-ss_X2yzDCr.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>David Weild IV</span>V. Chairman at NASDAQ and the “father” of the JOBS Act</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="mailto:mike@jointer.io" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-03.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/6/t4-ss_cODnYZo.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/6/t4-ss_cODnYZo.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span> Mike Lorrey</span>CTO Advisor<br />
                                            The co-creator of the prototype of Bitcoin</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="mailto:ken@jointer.io" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-04.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/8/t6-ss_PqgnxCI.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/8/t6-ss_PqgnxCI.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Ken Goldman</span>Former Chief Financial Officer of Yahoo! </div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/bourgi87/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-05.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/10/sam_burgin_icon_HVcCc9e.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/10/sam_burgin_icon_HVcCc9e.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span> Sam Bourgi</span> Chief Editor Hacked.com</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-105500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-106500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/koen-maris-3791811/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-06.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/33/01_cT0OyEA_6fmgSuE.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/33/01_cT0OyEA_6fmgSuE.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Koen Maris</span>IOTA Advisor Cybersecurity</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-106000-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-107000-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/alongoren/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-07.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Alon Goren</span>Founding Partner at Goren Holm Ventures</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-106500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-107500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/robertneivert/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-08.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img data-src="https://www.elementzero.network/api/private/mainSite/teamMember/36/500-logo.png" src="https://www.elementzero.network/api/private/mainSite/teamMember/36/500-logo.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Robert Neivert</span>Venture Partner at 500 Startups Head of blockchain program</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="previous-advisor-team-Box">
                            <div className="wrapper">
                                <div className="s20TeamContainer clearfix" id="previous_advisor">
                                    <div className="s20Teambox01 clearfix" data-102500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-103500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20ttextbox02">PREVIOUS Advisors</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-103000-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-104000-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="# " target="_blank" rel="noopener noreferrer" className="teamLinkIcon"> </a>
                                                <div className="teamImgNPbox"><img className="  mCS_img_loaded" alt="" src="images/team/teamImg-09.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img className="lozad mCS_img_loaded" data-src="https://www.jointer.io/images/jntr_about/advisors001_logo.png" alt=" " src="https://www.jointer.io/images/jntr_about/advisors001_logo.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Professor Eric S. Maskin</span>Harvard University Nobel Memorial Prize in Economics Mechanism Design Expert </div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-103500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-104500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="# " target="_blank" className="teamLinkIcon" rel="noopener noreferrer"> </a>
                                                <div className="teamImgNPbox"><img className=" mCS_img_loaded" alt="" src="images/team/teamImg-010.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img className="lozad mCS_img_loaded" data-src="https://www.jointer.io/images/jntr_about/advisors001_logo.png" alt="" src="https://www.jointer.io/images/jntr_about/advisors001_logo.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Professor Alvin E. Roth</span>Stanford University Nobel Memorial Prize in Economics Market Design expert</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-104500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-105500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com" target="_blank" className="teamLinkIcon" rel="noopener noreferrer"> </a>
                                                <div className="teamImgNPbox"><img className="lozad mCS_img_loaded" alt="" src="images/team/teamImg-011.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img className="lozad mCS_img_loaded" data-src="https://www.jointer.io/images/jntr_about/t5-ss-V2.png" alt="" src="https://www.jointer.io/images/jntr_about/t5-ss-V2.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Chris Cox</span>Former Chairman of the U.S. Securities and Exchange Comission [SEC] former U.S. Congress Member </div>
                                    </div>
                                    <div className="s20Teambox01 clearfix">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/daniel-p-ahn-7283967/" target="_blank" rel="noopener noreferrer" className="teamLinkIcon"> </a>
                                                <div className="teamImgNPbox"><img className="lozad mCS_img_loaded" alt="" src="images/team/teamImg-012.png" /></div>
                                            </div>
                                            <div className="afterLogo"><img className="lozad mCS_img_loaded" data-src="https://www.elementzero.network/api/private/mainSite/teamMember/7/t5-ss.png" alt="" src="https://www.elementzero.network/api/private/mainSite/teamMember/7/t5-ss.png" /> </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Daniel P. Ahn PhD</span>Chief Economist<br />
                                            U.S. Department of State </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="management-team-Box">
                            <div className="wrapper">
                                <div className="s20TeamContainer clearfix npSMfix01" id="managment">
                                    <div className="s20Teambox01 clearfix">
                                        <div className="s20ttextbox02">Management</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-123000-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-124000-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/jude-g-regev-09110214/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-013.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Yoda G Regev<br />
                                            CEO & CTO</span>Serial Entrepreneur with 5 Startups and 3 exits</div>
                                    </div>
                                    <div className="s20Teambox01 clearfix" data-122500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-123500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/kylewhitepr/" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-014.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Kyle White<br />
                                            CMO</span>Venture Marketing Advisor totaling $16B market cap</div>
                                    </div>

                                    {/* <div className="s20Teambox01 clearfix" data-121500-start="opacity:0; transform: scale(1.3) translate(0px, 0px);" data-122500-start="opacity:1; transform: scale(1) translate(0px, 0px);">
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="https://www.linkedin.com/in/debbierosenblum" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img  alt="" src="images/team/teamImg-015.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Debbie Rosenblum<br />
												CPO</span>People Architect, Strategic Leader + Decisive Doer</div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="operation-team-Box">
                            <div className="wrapper">
                                <div className="s20TeamContainer clearfix " id="operations">
                                    <div className="s20Teambox01 clearfix">
                                        <div className="s20ttextbox02">Operations</div>
                                    </div>

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-016.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Amber Urquhart</span>Investment LP</div>
                                    </div>


                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-017.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Dan Mahoney</span>Fundraising Manager</div>
                                    </div>

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/blankUser.jpg" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Max Dier</span>PDO DAO Manager</div>
                                    </div>

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/ahmad-bancin.jpg" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Ahmad Bancin</span>Community Admin</div>
                                    </div>

                                    {/* <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-020.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Verlin Auliane</span>Graphic Designer</div>
                                    </div> */}

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-021.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Joe Meinen</span>Social Specialist</div>
                                    </div>

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-022.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Corlynne O’Sullivan</span>Crypto Marketing</div>
                                    </div>

                                    <div className="s20Teambox01 clearfix" >
                                        <div className="s20tImgbox ani-5">
                                            <div className="s20RotaterBox"><a href="#" target="_blank" className="teamLinkIcon"></a>
                                                <div className="teamImgNPbox"><img alt="" src="images/team/teamImg-023.png" /></div>
                                            </div>
                                        </div>
                                        <div className="s20ttextbox"> <span>Joyce Hanson</span>Writer</div>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </section>


                    <div className='VPMainBX'>
                        <div className='VPSubBX01'>
                            <div className="ventureBXTitle01">Venture Partners </div>
                        </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-01.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-02.png" alt="" />Hassan (Hatu) Sheikh </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-03.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-04.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/bitangels.png" alt="" />Michael Terpin </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-05.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/silent.png" alt="" />Andrea Castiglione</div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-07.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-08.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-09.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-010.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/mexc.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-012.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-013.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/fairum.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-014.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-015.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-016.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-017.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-018.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-019.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-020.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-021.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-022.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-023.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-024.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-025.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-026.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-027.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-029.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-030.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-031.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-032.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-033.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-034.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-035.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-036.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-037.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-038.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-039.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-040.png" alt="" /> </div>
                        <div className='VPSubBX01'>  <img src="images/venture-partners/legion.png" alt="" /> </div>





                    </div>





                </div>














                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("About") }} className="close-Icon"></a>
            </div>
        )

    }

}