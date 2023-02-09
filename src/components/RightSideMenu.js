import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import web3Config from "../config/web3Config";

const $ = window.$;
export default class RightSideMenu extends PureComponent {
  constructor(props) {
    super();
    this.showWithId = this.showWithId.bind(this);
    this.state = {
      web3: props.web3,
      web3Config: props.web3Config,
    };
  }

  componentWillReceiveProps(newProps) {
    // this.setState({
    //   web3: newProps.web3,
    //   web3Config: newProps.web3Config,
    // });
    // remove this line when stop testing on swap provider
    //this.props.openPopup("LiquidityProvider")
  }

  showWithId(popup, id) {
    this.props.openPopup(popup);
    $("[data-id=" + this.state.currentTab + "]").removeClass("active");
    $(".tab-Link").removeClass("active");
    $("[data-id=" + id + "]").addClass("active");
    $(".tab-Content").hide();
    $("#" + id).fadeIn("slow");
    this.setState({
      currentTab: id,
    });
  }

  render() {
    return (
      <>
        {this.props.show && (
          <div
            className="menuSideBar"
            style={{
              // right: "-100%",
              // opacity: "0",
              // fontFamily: 'Default'
            }}
          >
            <div className="menuSideBarContainer">
              <div className="msb-Waddress">
                <span className="waltFix01">
                  {/* { masked account } */}
                </span>
                <a
                  href="#"
                  onClick={(e) => this.props.onMenuButtonClicked()}
                  className="rmDotLink active MenuClose"
                >
                  {/* <i className="fas fa-times"></i> */}
                  <img src="images/menu-close.png" alt="" />
                </a>
              </div>
              <div className="leftMenu mobile-block">
                <Link to='/' className="active">SMARTSWAP</Link>
                <Link to='/extension'>SMARTBRIDGE EXTENSION</Link>
                <Link to='/projects'>SMARTBRIDGE FOR PROJECTS</Link>
              </div>
              <div className="msb-Linkbox01">
                <Link to="/ownLicence">Launch Branded SmartSwap</Link>
                {/* <a
                  href="#"
                  onClick={() => {
                    this.props.openPopup("LiquidityProvider");
                  }}
                >
                  Become an Swap Provider (SP){" "}
                </a> */}
                <a href="#">Buy SMART</a>
              </div>
              <div className="msb-Linkbox02">
                <a
                  href="#"
                  className="active"
                  data-toggle="n-collapse"
                  data-target="#msbSL-01"
                  aria-expanded="false"
                  aria-controls="msbSL-01"
                >
                  Learn <i className="fas fa-caret-down"></i>
                </a>
                <div className="msbLinkSubBox n-collapse in" id="msbSL-01">
                  <a
                    href="#"
                    onClick={(e) => {
                      this.showWithId("HowItWorks", "tab-4");
                    }}
                  >
                    How it Works{" "}
                  </a>
                  <a
                    href="#"
                    onClick={(ev) => {
                      this.showWithId("HowItWorks", "tab-5");
                    }}
                  >
                    SmartSwap vs Atomic Swap
                  </a>
                  <a
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      this.showWithId("CefiToDefi", "tab-7");
                    }}
                  >
                    Decentralize CEX: CeFi {"<>"} DeFi
                  </a>
                  <a
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      this.showWithId("CefiToDefi", "tab-8");
                    }}
                  >
                    What is a Swap Provider
                  </a>
                  <a
                    href="#"
                    onClick={() => {
                      this.props.openPopup("LiquidityFountainSP");
                    }}
                  >
                    Liquidity Fountain for SPs
                  </a>
                  <a
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      this.showWithId("CefiToDefi", "tab-9");
                    }}
                  >
                    SmartSwap Liquidity Process
                  </a>
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>Ledger</a>
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>100% Fee Reimbursement</a>
                </div>
              </div>
              <div className="msb-Linkbox02">
                <a
                  href="#" onClick={(ev) => { ev.preventDefault();}}
                  className="active"
                  data-toggle="n-collapse"
                  data-target="#msbSL-02"
                  aria-expanded="false"
                  aria-controls="msbSL-02"
                >
                  Library <i className="fas fa-caret-down"></i>
                </a>
                <div className="msbLinkSubBox n-collapse in" id="msbSL-02">
                  {/* <a href="javascript:void(0);">GitHub</a> */}
                  <a
                    href="https://docsend.com/view/24h32qhisbiunjqk"
                    target="_blank"
                  >
                    Whitepaper
                  </a>
                  {/* <a href="javascript:void(0);">Light Paper</a> */}
                  {/* <a href="javascript:void(0);">Technical Documentation</a> */}
                  {/* <a href="javascript:void(0);">Pitch Deck</a> */}
                  <a
                    href="https://docsend.com/view/24h32qhisbiunjqk"
                    target="_blank"
                  >
                    One Page
                  </a>
                </div>
              </div>
              {/* <div className="msb-Linkbox02">
                        <a href="javascript:void(0);" className="active" data-toggle="n-collapse" data-target="#msbSL-03"
                            aria-expanded="false" aria-controls="msbSL-03">Library <i className="fas fa-caret-down"></i></a>
                        <div className="msbLinkSubBox n-collapse in" id="msbSL-03">
                            <a href="javascript:void(0);">SmartSwap</a>
                            <a href="javascript:void(0);">Branded Social Currency</a>
                        </div>
                    </div> */}
              {/* <div className="msb-Linkbox02">
                        <a href="javascript:void(0);" className="active" data-toggle="n-collapse" data-target="#msbSL-04"
                            aria-expanded="false" aria-controls="msbSL-04">Apply for License <i
                                className="fas fa-caret-down"></i></a>
                        <div className="msbLinkSubBox n-collapse in" id="msbSL-04">
                            <a href="javascript:void(0);">SmartSwap</a>
                            <a href="javascript:void(0);">Branded Social Currency</a>
                        </div>
                    </div> */}
              <div className="msb-Linkbox02">
                <a
                  href="#" onClick={(ev) => { ev.preventDefault();}}
                  className="active"
                  data-toggle="n-collapse"
                  data-target="#msbSL-05"
                  aria-expanded="false"
                  aria-controls="msbSL-05"
                >
                  Community <i className="fas fa-caret-down"></i>
                </a>
                <div className="msbLinkSubBox n-collapse in" id="msbSL-05">
                  {/*   */}
                  <a href="https://twitter.com/SmartSwapEx" target="_blank">
                    <i className="fab fa-twitter"></i>Twitter
                  </a>
                  <a href="https://t.me/smartswap_exchange" target="_blank">
                    <i className="fab fa-telegram"></i>Telegram
                  </a>
                </div>
              </div>
              <div className="msb-Linkbox02">
                {/* <a
                  href="#" onClick={(ev) => { ev.preventDefault();}}
                  className="active"
                  data-toggle="n-collapse"
                  data-target="#msbSL-06"
                  aria-expanded="false"
                  aria-controls="msbSL-06"
                >
                  About <i className="fas fa-caret-down"></i>
                </a> */}
                <div className="msbLinkSubBox n-collapse in" id="msbSL-06">
                  {/* <a
                    href="#"
                    onClick={(ev) => {
                      ev.preventDefault();
                      this.props.openPopup("About");
                    }}
                  >
                    About Us
                  </a> */}
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>Privacy Policy</a>
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>Terms of Use</a>
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>Cookie Policy</a>
                  <div className="footerV2-LanBoxM">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="footerV2-LanBoxLink n-collapsed"
                      data-toggle="n-collapse"
                      data-target="#langBox"
                      aria-expanded="false"
                      aria-controls="langBox"
                    >
                      <i>
                        {" "}
                        <img src="images/l-Icon01.png" alt="" />{" "}
                      </i>
                      English
                    </a>
                  </div>
                </div>
              </div>
              <div className="auditLogo">
                <a href="#" onClick={(ev) => { ev.preventDefault();}}>
                  <img src="images/callistoLogo.png" alt="" />
                </a>
              </div>
              {/* <div className="msb-Linkbox02">
                        <a href="javascript:void(0);" className="active" data-toggle="n-collapse" data-target="#msbSL-07"
                            aria-expanded="false" aria-controls="msbSL-07">Help <i className="fas fa-caret-down"></i></a>
                        <div className="msbLinkSubBox n-collapse in" id="msbSL-07">
                            <a href="javascript:void(0);">Start Tutorial</a>
                            <a href="javascript:void(0);">Report an Issue</a>
                            <a href="javascript:void(0);">Contact Request</a>
                            <a href="javascript:void(0);">Help Center</a>
                            
                        </div>
                    </div> */}
              <div className="footer-Bottom">
                <div className="footer-Logo">
                  <a href="#" onClick={(ev) => { ev.preventDefault();}}>
                    <img src="images/menu-rb-logo.png" alt="" />
                  </a>
                </div>
                <p>© 2021 SmartSwap Exchange All rights reserved</p>
                <div className="footer-Text">
                  <p className="pob">
                    Powered by <img src="images/atomFoundation-logo.png" alt="" />
                  </p>
                  <p>
                    Atom Foundation is a Decentralized Financial (DeFi) liquidity ecosystem powered by proprietary protocols which underlines zero volatility platforms, a NFT (Non-fungible token) and altcoin marketplace with downside protection, post dex offerings (PDO), a dynamic AMM with multiple swap exchanges, cross network aggregation, as well as a CBDC alternative and price support game theoretic model.{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
