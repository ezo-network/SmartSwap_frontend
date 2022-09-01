import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import HeaderWC from "../components/Header03";

import Carousel from "react-multi-carousel";
import AnimatedNumber from "react-animated-numbers";
import "react-multi-carousel/lib/styles.css";


import BannerBg from "../assets/welcome/home-bg.png";
import img01 from "../assets/welcome/img01.png";
import img02 from "../assets/welcome/img02.png";
import img03 from "../assets/welcome/img03.png";
import img04 from "../assets/welcome/img04.png";
import icon1 from "../assets/welcome/icon1.png";
import icon2 from "../assets/welcome/icon2.png";
import icon3 from "../assets/welcome/icon3.png";
import listico1 from "../assets/welcome/listico1.png";
import listico2 from "../assets/welcome/listico2.png";
import listico3 from "../assets/welcome/listico3.png";
import listico4 from "../assets/welcome/listico4.png";
import listico5 from "../assets/welcome/listico5.png";
import listico6 from "../assets/welcome/listico6.png";
import listico7 from "../assets/welcome/listico7.png";
import listico8 from "../assets/welcome/listico8.png";

import SBLogo01 from "../assets/images/sb-ICO-01.png";
import SBLogo02 from "../assets/images/sb-ICO-02.png";
import SBLogo03 from "../assets/images/sb-ICO-03.png";
import SBLogo04 from "../assets/images/sb-ICO-04.png";
import SBLogo05 from "../assets/images/sb-ICO-05.png";
import SBLogo06 from "../assets/images/sb-ICO-06.png";
import SBLogo07 from "../assets/images/sb-ICO-07.png";
import SBLogo08 from "../assets/images/sb-ICO-08.png";
import SBLogo09 from "../assets/images/sb-ICO-09.png";
import SBLogo010 from "../assets/images/sb-ICO-010.png";
import SBLogo011 from "../assets/images/sb-ICO-011.png";

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1600 },
      items: 10,
      slidesToSlide: 1, // optional, default to 1.
    },
    desktop2: {
      breakpoint: { max: 1600, min: 1250 },
      items: 9,
      slidesToSlide: 1, // optional, default to 1.
    },
    desktop3: {
      breakpoint: { max: 1250, min: 1024 },
      items: 8,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 4,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

const $ = window.$;
export default class Welcome extends PureComponent {
  constructor(props) {
    super();
    this.state = {

    };

    this.state = {
      web3: null,
      web3Check: false,
    };
  }


  render() {
    return (
      <>
        <WelcomeMain id="main" className="welcome-page">
            <HeaderWC />

            <BannerSec>
                <Container className="justify-center">
                    <BannerHD className="wow fadeInUp" data-wow-delay="0.2s"><span>one click</span> decentralized layer zero solutions</BannerHD>
                    <p className="wow fadeInUp" data-wow-delay="0.3s">Cross-chain layer 0 based for Native Tokens | Bridge Tokens | W3B | dFX | dSTOCKS <br></br>
    Slippage and slippage free via P2C | P2P | CeDeFi</p>
                    <BtnPrimary className="wow fadeInUp btnLg" data-wow-delay="0.4s">FREE LISTING</BtnPrimary>
                </Container>
            </BannerSec>

            <SecImgTxt>
                <Container>
                    <SecImg className="wow fadeInLeft" data-wow-delay="0.5s"><img src={img01} alt=""></img></SecImg>
                    <SecTxt className="wow fadeInRight" data-wow-delay="0.5s">
                        <h3>1. SmartExtension</h3>
                        <p>SmartExtension is a layer on top of wallets which is designed to turn the wallet into an interoperable payment solution while simultaneously showing users the best price across all of DeFi. </p>
                        <BtnPrimary>INSTALL EXTENSION</BtnPrimary>
                    </SecTxt>
                </Container>
            </SecImgTxt>
            <SecImgTxt>
                <Container>
                    <SecTxt className="wow fadeInLeft" data-wow-delay="0.2s">
                        <h3>2. SmartPayment </h3>
                        <p>SmartPayment is a layer on top of wallets which is designed to turn the wallet into an interoperable payment solution. The SmartPayment solution helps allow projects to host their contract on their preferred blockchain without worrying about losing out on opportunities from more popular chains. </p>
                        <BtnPrimary>INTEGRATE SMARTPAYMENT</BtnPrimary>
                    </SecTxt>
                    <SecImg className="wow fadeInRight" data-wow-delay="0.2s"><img src={img02} alt=""></img>
                        
                    </SecImg>
                </Container>
            </SecImgTxt>
            <SecImgTxt>
                <Container>
                    <SecImg className="wow fadeInLeft" data-wow-delay="0.2s"><img src={img03} alt=""></img>
                        <TotalNumb>
                            <strong>Total tokens: <i>45</i></strong>
                            <strong>Total bridges: <i>112</i></strong>
                        </TotalNumb> 
                    </SecImg>
                    <SecTxt className="wow fadeInRight" data-wow-delay="0.2s">
                        <h3>3. SmartBridge</h3>
                        <p>Quickly create a cross-chain bridge token to any EVM blockchain. The SmartBridge option is available to projects and their users. </p>
                        <BtnPrimary>CREATE A BRIDGE</BtnPrimary>
                    </SecTxt>
                </Container>
            </SecImgTxt>
            <SecImgTxt>
                <Container>
                    <SecTxt className="wow fadeInLeft" data-wow-delay="0.2s">
                        <h3>4. SmartSwap</h3>
                        <p>Smartswap’s contract utilizes a zero volatility patent pending method which prevents slippage and wholly reimburses users fees and gas costs. Unlike a Decentralized Exchange (DEX) or Automated Market Maker (AMM), SmartSwap asks users the USD face value of the tokens they want to swap, rather than the token amount they want to receive. </p>
                        <BtnPrimary>LAUNCH APP</BtnPrimary>
                    </SecTxt>
                    <SecImg className="wow fadeInRight" data-wow-delay="0.2s"><img src={img04} alt=""></img></SecImg>
                </Container>
            </SecImgTxt>

            <DetailsRow>
                <Container> 
                    <DetailsBox className="wow fadeInUp" data-wow-delay="0.1s">
                        <DetailsLogo><img src={icon1}></img></DetailsLogo>
                        <h4>Free Listing</h4>
                        <p>Quickly create and list a cross-chain bridge token to any EVM blockchain. </p>
                        <BtnPrimary>FREE LISTING</BtnPrimary>
                    </DetailsBox>
                    <DetailsBox className="wow fadeInUp" data-wow-delay="0.2s">
                        <DetailsLogo><img src={icon2}></img></DetailsLogo>
                        <h4>Free licensing </h4>
                        <p>Any can create a free license of SmartSwap. Also, swap fees can be added on top of SmartSwap’s fee as long as users are reimbursed for the fees.</p>
                        <BtnPrimary>FREE LICENSING</BtnPrimary>
                    </DetailsBox>
                    <DetailsBox className="wow fadeInUp" data-wow-delay="0.3s">
                        <DetailsLogo><img src={icon3}></img></DetailsLogo>
                        <h4>Become A Swap Provider</h4>
                        <p>Earn fees on trades while helping users expedite swaps by connecting a Centralized Exchange account using Swap Provider API</p>
                        <BtnPrimary>BECOME A SWAP PROVIDER</BtnPrimary>
                    </DetailsBox>
                </Container>
            </DetailsRow>
            
            <NumberSec>
                <Container>
                    <div className="number-column wow fadeInLeft" data-wow-delay="0.2s">
                        <h3>Total Value Locked</h3>
                        <NumberGreen>
                            <sup>$</sup>0
                        </NumberGreen>
                        <p>All funds are held 100% by users. No funds are exposed on the SmartSwap system.</p>
                    </div>
                    <div className="divider"></div>
                    <div className="number-column wow fadeInRight" data-wow-delay="0.2s">
                        <h3>Unlimited validators</h3>
                        <NumberGreen>
                            100<sup>%</sup>
                        </NumberGreen>
                        <p>All token bridges are designed for project control, allowing them master validator control and access.</p>
                    </div>
                </Container>
            </NumberSec>

            <WelcomeList>
                <Container className="mob-p0">
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico1}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> multichain </strong>
                            <p>100% true one-click swap between all blockchains </p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico2}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> value match </strong>
                            <p>Select the slippage free option to receive new crypto equal to the exact value you sent<i className="help-circle">
                                  <i
                                    className="fas fa-question-circle protip"
                                    data-pt-position="top"
                                    data-pt-title="The slippage option finds the best price in the market with a slippage limit option under your trade options"
                                    aria-hidden="true"
                                  ></i>
                                </i></p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico3}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> safe </strong>
                            <p>No hot wallet, no deposits, no accounts, no custodial wallets
                            <i className="help-circle">
                                <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="All transactions take place on-chain via the blockchains swapping through trustless smart contracts"
                                aria-hidden="true"
                                ></i>
                            </i>
                            </p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico4}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> reimbursement </strong>
                            <p>Fees and gas reimbursed fully with SMART
                                <i className="help-circle">
                                    <i
                                    className="fas fa-question-circle protip"
                                    data-pt-position="top-right-corner"
                                    data-pt-title="#reimburTip"
                                    data-pt-width="402"
                                    aria-hidden="true"
                                    ></i>
                                </i>
                            </p>
                            <div id="reimburTip" style={{ display: "none" }}>
                              <p style={{ marginTop: '0px' }}>SmartSwap users have the option to receive 100% reimbursement for their gas and swap fees. Users are able to claim reimbursements via the reimbursement staking contract. To release reimbursements users must stake the 1:1 equal amount of SMART for one year, but will be able to release partial amounts of the reimbursement if withdrawn at any time before the 1 year period . The pending balance accumulates and the user is able to claim the rest.</p>
                              <p style={{ marginBottom: '0px' }}>Example </p>
                              <p style={{ marginTop: '0px', marginBottom: '0px' }}>If over the year a user spent over $1000 or more on gas, at any time he can be reimbursed for such cost even if the SMART token value is higher due to appreciation. </p>
                            </div>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico5}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> free license </strong>
                            <p>Build your own license at no cost or become an affiliate</p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico6}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> anonymous </strong>
                            <p>Complete privacy guard with no KYC / AML needed</p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico7}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> scalable </strong>
                            <p>No LP, no pools, true decentralized CEX and OTC liquidity bridge </p>
                        </div>
                    </WelcomeListItems>
                    <WelcomeListItems className="wow fadeInUp" data-wow-delay="0.2s">
                        <span><img src={listico8}></img></span>
                        <div className="itemRight">
                            <strong>100% <br></br> decentralized </strong>
                            <p>DAO approach with a closed system lacking any single point of failure privilege</p>
                        </div>
                    </WelcomeListItems>
                </Container>
            </WelcomeList>

            <Tokenomics>
                <Container>
                    <h2>SMART Tokenomics in Action</h2>
                    <p>Since there are no pools or LP,  the fee use as a buy pressure to buyback the SMART token </p>
                    <TokenRow>
                        <TokenBox><span>Total Amount Swapped</span>
                            <b>$
                            <AnimatedNumber
                            includeComma
                            animateToNumber="1000000000"
                            fontStyle={{ fontSize: 25 }}
                            configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber>
                            </b>
                        </TokenBox>
                        <TokenBox><span>Fees Generated</span>
                            <b>$<AnimatedNumber
                            includeComma
                            animateToNumber="3000000"
                            fontStyle={{ fontSize: 25 }}
                            configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber></b>
                        </TokenBox>
                        <TokenBox><span>Smart Bought and Burned</span>
                        <b><AnimatedNumber
                            includeComma
                            animateToNumber="450000343"
                            fontStyle={{ fontSize: 25 }}
                            configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber></b>
                        </TokenBox>
                        <TokenBox><span>Total Fees Reimbursed</span>
                            <b>$<AnimatedNumber
                            includeComma
                            animateToNumber="10000000"
                            fontStyle={{ fontSize: 25 }}
                            configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber></b>
                        </TokenBox>
                        <TokenBox><span>Total reimbursement staking</span>
                            <b><AnimatedNumber
                            includeComma
                            animateToNumber="100000000"
                            fontStyle={{ fontSize: 25 }}
                            configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber></b>
                        </TokenBox>
                    </TokenRow>

                </Container>
            </Tokenomics>
            <Container className="no-flex">
            <div className="ssTitle01 wow fadeInRight" data-wow-delay="0.2s">Supporting blockchains</div>
                <Carousel className="wow fadeInRight caro-1" data-wow-delay="0.3s"
                    swipeable={false}
                    draggable={false}
                    showDots={false}
                    responsive={responsive}
                    ssr={true} // means to render carousel on server-side.
                    infinite={true}
                    autoPlay={false}
                    autoPlaySpeed={5000}
                    keyBoardControl={true}
                    customTransition="all 1sec"
                    transitionDuration={900}
                    containerclassName="carousel-container ani-1"
                    // removeArrowOnDeviceType={["tablet", "mobile"]}
                    deviceType={this.props.deviceType}
                    dotListclassName="custom-dot-list-style"
                    itemclassName="carousel-item-padding-40-px"
                >
                    <div className="sbSlide">
                    {" "}
                    <img src={SBLogo01} alt="" />{" "}
                    </div>
                    <div className="sbSlide">
                    {" "}
                    <img src={SBLogo02} alt="" />{" "}
                    </div>
                    <div className="sbSlide">
                    {" "}
                    <img src={SBLogo03} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo04} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo05} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo06} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo07} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo08} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo09} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo010} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo011} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo03} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo04} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo05} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo06} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo07} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo08} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo09} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo010} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                    {" "}
                    <img src={SBLogo011} alt="" />{" "}
                    </div>
                </Carousel>

                <div className="ssTitle01 wow fadeInLeft" data-wow-delay="0.2s">
                    SmartSwap AMA Series:
                    <span>
                    Alon Goren (Draper-Goren-Holm) and Yoda (Jude) Regev
                    </span>
                </div>
                <div className="videoMcontent wow fadeInLeft" data-wow-delay="0.4s">
                    <div className="video-responsive">
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/LKtJ6oaFak0"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    </div>
                </div>

                <div className="ssTitle01 wow fadeInUp mb-10" data-wow-delay="0.2s">Partners</div>
                <div
                    className="VPMainBX wow fadeInUp" data-wow-delay="0.4s"
                    style={{
                    justifyContent: "center",
                    marginBottom: "80px",
                    }}
                >
                    <div className="VPSubBX01">
                    {" "}
                    <img src="images/lp-logo01.png" alt="" />{" "}
                    </div>
                    <div className="VPSubBX01">
                    {" "}
                    <img src="images/venture-partners/vpICON-039.png" alt="" />{" "}
                    </div>
                </div>

                <div className="ssTitle01 wow fadeInUp mb-10" data-wow-delay="0.2s">Venture Partners</div>
                <div className="VPMainBX wow fadeInUp" data-wow-delay="0.4s">
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-01.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-02.png?v1"
                        alt=""
                    />
                    Hassan (Hatu) Sheikh
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-03.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/bitangels.png"
                        alt=""
                    />
                    Michael Terpin
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-04.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-05.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/silent.png"
                        alt=""
                    />
                    Andrea Castiglione
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-07.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-08.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-09.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-010.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/mexc.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-012.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-013.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/fairum.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-014.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-015.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-016.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-017.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-018.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-019.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-020.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-021.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-022.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-023.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-024.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-025.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-026.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-027.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-029.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-030.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-031V2.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-032.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-033.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-034.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-035.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-036.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-037.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-038.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-039.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/vpICON-040.png"
                        alt=""
                    />
                    </div>
                    <div className="VPSubBX01">
                    <img
                        src="images/venture-partners/legion.png"
                        alt=""
                    />
                    </div>
                </div>
            </Container>
        </WelcomeMain>
      </>
    );
  }
}

const WelcomeMain = styled.main `
    background: url(${BannerBg}) no-repeat top center; background-size: 100%; 
    @media (max-width: 767px){
        background-size: 170%; 
    }
`
const BannerSec = styled.section `
    padding: 249px 0 225px 0;
    /* padding: 114px 0 225px 0; */
    width: 100%; min-height: 300px; text-align: center;
    p {
        color: #fff; font-size: 24px; line-height: 1.8; margin: 0 0 39px 0;
    }
    @media (max-width: 991px){
        p {
            br {display: none;}
        }
    }
    @media (max-width: 767px){
        min-height: 100vh; padding: 165px 0; display: flex; align-items: center; justify-content: center;
        p {font-size: 20px;}
    }
    @media (max-width: 480px){
        p {font-size: 18px;}
    }
`
const BannerHD = styled.h3 `
    font-size: 42px; color: white; font-weight: bold; text-transform: uppercase;
    margin: 0 0 18px 0;
    span {color: #91dc27;}
    @media (max-width: 767px){
        font-size: 32px;
    }
    @media (max-width: 480px){
        font-size: 28px;
    }
`
const BtnPrimary = styled.a `
    background-color: inherit; color: #FFF; font-weight: 700; border: 2px solid #91dc27; box-shadow: 0px 0px 10px #91dc27; padding: 22px 24px; font-size: 18px; display: inline-block; min-width: 324px; cursor: pointer; text-align: center; transition: all 0.5s ease-in-out 0s;
    @media (max-width: 1024px){
        min-width: 200px;
    }
    @media (max-width: 767px){
        min-width: 200px;
        padding: 18px 24px;
        font-size: 16px;
    }
    &.btnLg {min-width: 428px; padding: 26px 50px; font-size: 24px;
        @media (max-width: 767px){
            max-width: 100%; min-width: 200px; padding: 20px 50px; font-size: 18px;
        }
    }
    &:hover {background-color: #91dc27;}
`

const Container = styled.div `
    width: 100%; max-width: 1353px; margin: 0 auto; display: flex; flex-flow: wrap;
    &.no-flex {display: block;}
    &.justify-center {justify-content: center;}
    &.mob-p0 {padding: 0;}
    @media (max-width: 1300px){
        padding: 0 20px;
    }
`
const SecImgTxt = styled.section `
    width: 100%; padding: 73px 0 100px 0; 
    & > div[class^='Container'] {align-items: center; justify-content: space-between;}
    @media (max-width: 767px){
        padding: 0px 0 60px 0;
    }
`
const SecImg = styled.div `
    max-width: 50%; text-align: center; min-width: 37%;
    & + div {padding: 0 0 0 26px;}
    img {max-width: 100%;}
    @media (max-width: 767px){
        order: 1; max-width: 100%;
        width: 100%; text-align: center; padding-bottom: 20px;
        & + div {padding: 0;}
    }
`
const SecTxt = styled.div `
    width: 50%; padding: 0 0 0 0;
    h3 {font-size: 36px; margin: 0 0 36px; }
    p {font-size: 18px; color: #a6a2b0; line-height: 30px; margin: 0 0 53px;}
    @media (max-width: 767px){
        order: 2;  text-align: center; width: 100%; padding: 0;
        p {margin-bottom: 20px;}
        h3 {margin-bottom: 20px; font-size: 30px;}
    }
    @media (max-width: 480px){
        h3 {font-size: 28px;}
        p {font-size: 16px;}
    }
`
const TotalNumb = styled.div `
    display: flex; color: #fff; font-size: 16px; align-items: center; justify-content:center; width: 100%; margin: 16px 0 0;
    i {font-style: normal; color: #91dc27;}
    strong:first-child {
        &:after {
            content:""; border-left: 1px solid #323232; height: 20px; width: 1px; display: inline-block; vertical-align: top; margin: 0 22px;
        }
    }
`

const DetailsRow = styled.div `
    padding: 123px 0 100px 0;
    @media (max-width: 767px){
        padding: 60px 0 60px 0;
    }
`
const DetailsBox = styled.div `
    width: 33.33%; padding-right: 36px; padding-bottom: 0;
    display: flex; flex-flow: column; align-items: flex-start;
    h4 {font-size:30px; margin: 0;}
    p {
        font-size: 18px; color: #a6a2b0;
        line-height: 30px; margin: 16px 0 52px;
    }
    a {
        margin-top: auto;
    }
    @media (max-width: 767px){
        width: 100%; text-align: center; align-items: center; padding-right:0; padding-bottom: 60px;
        p {margin: 16px 0 30px;}
    }
    @media (max-width: 480px){
        h4 {font-size: 28px;}
        p {font-size: 16px; margin-bottom: 24px;}
    }
`
const DetailsLogo = styled.div `
    min-height: 177px; display: flex; align-items: center; 
    @media (max-width: 767px){
        min-height: inherit;
        img {height: 100px;}
    }
`
const NumberSec = styled.div `
    padding: 88px 0 88px; text-align: center;
    h3 {font-size:36px; color: #fff; font-weight: bold; margin: 0 0 30px 0;}
    .number-column {width: calc(50% - 51px);}
    p {font-size: 21px; color: #a6a2b0; margin: 5px 0 0 0; line-height: 36px;}
    .divider {border-left: 1px solid #000; border-right: 1px solid #1c1d25; width: 0;
    margin: 0 50px; height: 342px; align-self: center;}
    @media (max-width: 767px){ 
        padding: 0 0 60px;
        .number-column {width: 100%; padding-bottom: 60px; }
        .divider {display: none;}
    }
    @media (max-width: 480px){ 
        h3 {font-size: 28px;}
        p {font-size: 18px; line-height: 1.5;}
    }
`
const NumberGreen = styled.div `
    font-size: 200px; color: #91dc27; font-weight: bold; line-height: 1; text-shadow: 0px 0px 25px rgba(145, 220, 39, 0.70);
    sup { font-size: 18%; top: -3.2em;}
    @media (max-width: 1024px){ 
        font-size: 140px;
    } 
    @media (max-width: 767px){  
        font-size: 30vw; text-shadow: 0px 0px 20px rgba(145, 220, 39, 0.70);
    }
    @media (max-width: 480px){  
        font-size: 24vw; text-shadow: 0px 0px 15px rgba(145, 220, 39, 0.70);
    }
`

const WelcomeList = styled.section `
    padding: 101px 0 0;
    @media (max-width: 767px){  padding: 0 10px 80px;
        
    }
`
const WelcomeListItems = styled.div `
    width: 25%; display: flex; padding: 0 35px 75px 0;
    span {width: 60px}
    strong {font-size: 24px; }
    p {font-size: 14px; color: #a6a2b0; line-height: 24px; margin: 12px 0 0 0;}
    .itemRight {padding-left: 20px;}
    @media (max-width: 1024px){  
        width: 33.33%;
    }
    @media (max-width: 767px){  
        width: 50%; flex-flow: column; padding: 0 10px 40px;
        .itemRight {padding-left: 0;}
    }
    @media (max-width: 767px){
        span {width: 50px; margin-bottom: 5px;
            img {max-width: 100%; max-height: 40px}
        }
        strong {font-size: 20px; }
    }  
`

const Tokenomics = styled.section `
    padding: 108px 0 228px; text-align: center;
    h2 {width: 100%; font-size: 36px; font-weight: bold; margin: 0 0 36px 0; }
    p {width: 100%; color: #a6a2b0; font-size: 21px; margin: 0;}
    @media (max-width: 767px){  
        padding: 0 0 100px;
        h2 {font-size: 30px;}
    }
    @media (max-width: 480px){  
        h2 {font-size: 24px; margin-bottom: 20px;}
        p {font-size: 16px;}
    }
`
const TokenRow = styled.div `
    display: flex; width: calc(100% + 22px); padding: 60px 0 0; margin-left: -11px; margin-right: -11px;
    @media (max-width: 1024px){ 
        flex-flow: wrap;
    }  
    @media (max-width: 767px){   
        margin: 0; width: 100%;
    }
    @media (max-width: 480px){   
        padding: 20px 0 0;
    }
`
const TokenBox = styled.div `
    border: 1px solid #3b3e4b; display: flex; flex-flow: column;
    width: 100%; margin: 0 11px; 
    span {background: #3b3e4b; height: 60px; font-size: 14px; font-weight: bold; display: flex; align-items: center; justify-content: center;}
    b {font-size: 24px; font-weight: bold; padding: 19px 0; display: flex; align-items: center; justify-content: center;}
    @media (max-width: 1024px){ 
        width: calc(33.33% - 22px); margin-bottom: 22px;
    } 
    @media (max-width: 767px){ 
        margin: 0 0 22px; width: 100%;
    }
`