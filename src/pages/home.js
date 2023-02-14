import React, { PureComponent } from "react";
import SmartEcoSystemTabs from "../components/tabs/SmartEcoSystemTabs";
import LicensePartners from "../components/sections/LicensePartners";
import VenturePartners from "../components/sections//VenturePartners";
import CTAButtons from "../components/sections//CTAButtons";
import CTAButtons2 from "../components/sections//CTAButtons2";
import AskMeAnythingVideo from "../components/sections//AskMeAnythingVideo";
import TokenTokenomicsStats from "../components/sections//TokenTokenomicsStats";
import SupportedBlockchainsCarousel from "../components/sections/SupportedBlockchainsCarousel";
import SmartEcoSystemFeatures from "../components/sections/SmartEcoSystemFeatures";
import HeroSectionVideoOverlay from "../components/sections/HeroSectionVideoOverlay"

const $ = window.$;

export default class Home extends PureComponent {
  constructor(props) {
    super();

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      btnClick: false,
      sideBar: false,
      locationState: undefined
    };
  }

  componentDidMount = async () => {
    if(this.props.location.state !== undefined){
      this.setState({
        locationState: this.props.location.state
      });
      window.history.replaceState({}, document.title);
    }
  };

  componentWillMount = async () => {

  };

  resetLocationState = () => {
    this.setState({
      locationState: undefined
    });
  }

  handleClick() {
    if (this.state.sideBar === true) {
      this.setState({
        sideBar: false
      });
    }
  }

  scrollToLedgerHandler() {
    $("html").animate({ scrollTop: 650 });
  }

  render() {
    return (
      <>
        <HeroSectionVideoOverlay></HeroSectionVideoOverlay>
        <div className="main">

          { /* <!--======================= HEADER START =====================--> */}
          {/* <!--======================= HEADER END =====================--> */}

          <div className="backgroundBlock" onClick={this.handleClick}>
            <div className="mainBlock">
              <div className="swap-Block">
                <div className="container-Grid">
                  <div
                    className="smeTitle01 wow fadeInUp" data-wow-delay="0.1s">
                    <span>One click</span> decentralized layer zero solutions
                  </div>
                  <div className="smvTitle02 wow fadeInUp" data-wow-delay="0.2s">
                    {/* Unlimited Liquidity CeFi to Defi Decentralized Bridge <span style={{ color: '#525252' }}>|</span> AMM Alternative */}
                    {/* Best multichain rates available with slippage free transactions or with a DeFi aggregator */}
                    Best cross-chain rates available with slippage or zero slippage transactions with P2P and CeDeFi
                  </div>
                  <>
                    <SmartEcoSystemTabs locationState={this.state.locationState} onResetLocationState={this.resetLocationState}></SmartEcoSystemTabs>
                    <CTAButtons2></CTAButtons2>
                  </>

                </div>
                <SmartEcoSystemFeatures></SmartEcoSystemFeatures>
              </div>
              {/* <!--======================= SWAP BLOCK END =====================--> */}
            </div>

            <div className="mainBlock">
              {/* <!--======================= SWAP BLOCK START =====================--> */}
              <div className="swap-Block">
                <div className="swap-textBox" style={{ paddingTop: 0 }}>
                  <div
                    className="container-Grid"
                  // onPointerEnter={() => { 
                  //   // this.updateTotalAmounts() 
                  // }}
                  >
                    <CTAButtons></CTAButtons>
                    <SupportedBlockchainsCarousel deviceType={this.props.deviceType}></SupportedBlockchainsCarousel>
                    <TokenTokenomicsStats></TokenTokenomicsStats>
                    <AskMeAnythingVideo amaLink="https://www.youtube.com/embed/LKtJ6oaFak0"></AskMeAnythingVideo>
                    <CTAButtons></CTAButtons>
                    <LicensePartners></LicensePartners>
                    <VenturePartners></VenturePartners>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}