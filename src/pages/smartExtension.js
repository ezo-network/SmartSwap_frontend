import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import CONSTANT from "../constants";
import HeadFreeListing from "../components/Header02";

import Carousel from "react-multi-carousel";
import AnimatedNumber from "react-animated-numbers";
import "react-multi-carousel/lib/styles.css";


import BannerBg from "../assets/welcome/home-bg.png";
import img02 from "../assets/images/se.png";




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
            <HeadFreeListing />

            <SecImgTxt>
                <Container>
                    <SecTxt className="wow fadeInLeft" data-wow-delay="0.5s">
                        <h3>Best Market Prices on dApps</h3>
                        <p>Super easy one click smart bridge solution allowing you to pay with any token from any blockchain to any project on any blockchain.</p>
                        <p className="color-green">Gain 145.45% super bonus <i className="help-circle"><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i></i></p>
                        <TextContainer>
                            <BtnPrimary className="cs-btn">install extension</BtnPrimary>
                            <span>One click smartextension allowing you to compare the best prices in the market </span>
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
    p {font-size: 24px; color: #fff; line-height: 30px; margin: 0 0 30px;
        .help-circle {top: -9px;}
    }
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
const TextContainer = styled.div `
    display: table; 
    width: 350px; text-align: center;
    span {display: block; font-size: 12px; color: #aaaaaa; margin-top: 12px;}
`