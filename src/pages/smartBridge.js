import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import CONSTANT from "../constants";
import HeadFreeListing from "../components/Header/HeadFreeListing";

import Carousel from "react-multi-carousel";
import AnimatedNumber from "react-animated-numbers";
import "react-multi-carousel/lib/styles.css";


import BannerBg from "../assets/welcome/home-bg.png";
import img02 from "../assets/images/smartBridge.png";




export default class Welcome extends PureComponent {
 


  render() {
    return (
      <>
        <WelcomeMain id="main" className="welcome-page">
            <div className="fullscreen-bg">
              <div className="fsbg_sad01"></div>
              <div className="fsbg_container">
                <video loop autoPlay muted className="fullscreen-bg__video">
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.webm?v=1.18"} type="video/webm" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.mp4?v=1.18"} type="video/mp4" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.ogv?v=1.18"} type="video/ogg" />
                </video>
              </div>
            </div>
            {/* <HeadFreeListing /> */}

            <SecImgTxt>
                <Container>
                    <SecTxt className="wow fadeInLeft" data-wow-delay="0.5s">
                        <h3>SMART BRIDGE</h3>
                        <p>Quickly create a cross-chain bridge token to any EVM blockchain. The SmartBridge option is available to projects and their users.</p>
                        <TotalNumb>
                            <strong>Total tokens: <i>45</i></strong>
                            <strong>Total bridges: <i>112</i></strong>
                        </TotalNumb> 
                        <TextContainer>
                            <BtnPrimary className="cs-btn">CREATE BRIDGE</BtnPrimary>
                        </TextContainer>
                    </SecTxt>
                    <SecImg className="wow fadeInRight" data-wow-delay="0.5s"><img src={img02} alt=""></img></SecImg>
                </Container>
            </SecImgTxt>
            
        </WelcomeMain>
      </>
    );
  }
}

const WelcomeMain = styled.main `
    min-height: 100vh;
    @media (max-width: 767px){
    }
`
const BtnPrimary = styled.a `
    background-color: inherit; color: #FFF; font-weight: 700; border: 2px solid #91dc27; box-shadow: 0px 0px 10px #91dc27; padding: 22px 24px; font-size: 24px; display: inline-block; min-width: 324px; cursor: pointer; text-align: center; transition: all 0.5s ease-in-out 0s;
    &.cs-btn {
        position: relative;
        &:after {
            position: absolute; left: 0; top: 0; right: 0; bottom: 0; content: 'COMING SOON'; padding: 22px 24px; opacity: 0; transition: all 0.5s ease-in-out 0s;
        }
        &:hover {
            color: transparent;
            &:after {opacity: 1; color: #fff;}
        }
    }
    @media (max-width: 1024px){
        min-width: 200px;
    }
    @media (max-width: 767px){
        min-width: 100%;
        padding: 23px 24px;
        font-size: 18px;
        text-transform: uppercase;
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
    p {font-size: 24px; color: #fff; line-height: 35px; margin: 0 0 30px;
        .help-circle {top: -9px;}
    }
    @media (max-width: 767px){
        /* order: 2;  text-align: center;*/  width: 100%; padding: 30px 0 50px 0;
        p {margin-bottom: 20px; line-height: 1.6;}
        h3 {margin-bottom: 13px; font-size: 30px; line-height: 1.5;}
    }
    @media (max-width: 480px){
        h3 {font-size: 24px;}
        p {font-size: 18px;}
    }
`
const TotalNumb = styled.div `
    display: flex; color: #fff; font-size: 24px; align-items: left;  width: 100%; margin: 50px 0 50px;
    i {font-style: normal; color: #91dc27;}
    strong:first-child {
        &:after {
            content:""; border-left: 1px solid #323232; height: 30px; width: 1px; display: inline-block; vertical-align: top; margin: 0 22px;
        }
    }
    @media (max-width: 767px){
        flex-flow: column; margin: 21px 0 29px;
        strong {font-size: 16px; margin: 0 0 6px 0;}
    }
`
const TextContainer = styled.div `
    display: table; 
    width: 350px; text-align: center;
    a {width: 100%}
    span {display: block; font-size: 12px; color: #aaaaaa; margin-top: 12px;}
    @media (max-width: 767px){
        width: 100%; 
    }
`