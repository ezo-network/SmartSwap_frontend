import React, { PureComponent } from "react";
import styled from 'styled-components';
import { Link } from "react-router-dom";
import LogoM from '../assets/freelisting-images/logo.png'
import JPico from '../assets/freelisting-images/jackpot.png'

export class CounterBox extends PureComponent {
    render() {
        return (
            <>
                <a className="jackpot"><img src={JPico} alt='Jackpot' /> </a>
                <Rtimer>
                    <span>1</span>  
                    <span>1</span>:    
                    <span>2</span>    
                    <span>4</span>:    
                    <span>5</span>    
                    <span>6</span>:   
                    <span>3</span>    
                    <span>4</span>:
                    <span>3</span>    
                    <span>4</span>    
                </Rtimer>
                <a className="link01 hideOnMobile">Rewards program</a>
            </>
        );
    }
}

export default class HeadFreeListing extends PureComponent {
    constructor(props) {
        super();
        this.state = {
        };
    }


    render() {
        return (
            <>
                <LHead>
                    <Logo> <img src={LogoM} alt="logo" /></Logo>
                    <Nav className="deskNav">
                        <Link to=''>SmartExtension</Link> <span>|</span>
                        <Link to=''>SmartBridge</Link><span>|</span>
                        <Link to=''>SmartPayment</Link><span>|</span>
                        <Link to=''>SmartWallet</Link><span>|</span>
                        <Link to=''>SmartSwap</Link><span>|</span>
                        <Link to='' className="active">FREE Listing</Link>
                    </Nav>
                    <Nav className="mobNav"> 
                        <Link to='' className="active">FREE Listing<i className="fas fa-caret-down"></i></Link> 
                    </Nav>
                    <RMbox>
                        <CounterBox/>
                        {/* <a href="#" className="link01" >Rewards program</a> */}
                        <a href="#" className="rmDotLink02"></a>
                    </RMbox>
                </LHead>
            </>
        );
    }
}

const FlexDiv = styled.div`
    display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;


const LHead = styled(FlexDiv)` 
    padding:14px 40px; justify-content:flex-start;   width: 100%; position: relative; 
    @media screen and (max-width: 1600px){
        padding-bottom: 50px; padding-top: 10px;
    }
    @media screen and (max-width: 1370px){
        padding-bottom: 0;
    }
    @media screen and (max-width: 991px){
        padding-right: 15px;  padding-left  : 15px;
    }
    @media screen and (max-width: 767px){
        padding:14px 10px;
    }
    @media screen and (max-width: 430px){
        flex-flow: row;
    }
`
const Logo = styled(FlexDiv)` 
    margin-right:25px;
`
const Nav = styled(FlexDiv) `
    font-size:16px; font-weight:400; 
    span{ font-size:18px; font-weight:200; color: #aaaaaa; margin:0 19px;} 
    &.deskNav {}
    &.mobNav {display: none;
        i {margin-left: 27px;}
    }
    a{ color: #aaaaaa; 
        :hover{ color: #91dc27;}
        &.active{ color: #91dc27; font-weight:700; text-decoration: underline}
    }
    @media screen and (max-width: 1650px){
        font-size: 15px;
        span {margin:0 10px; font-size:15px;}
    }
    @media screen and (max-width: 1550px){
        position: absolute;
        left:0; right: 0; top: 130px;
    }
    @media screen and (max-width: 1370px){
        position: static;
        &.deskNav {display: none;}
        &.mobNav {display: flex; flex-flow: column;}
    }
    @media screen and (max-width: 991px){
        font-size:15px; 
        span {margin:0 8px; font-size:15px;}
        &.mobNav {display: none;}
    }
    @media screen and (max-width: 767px){
        /* display: none; flex-flow: column; position: absolute; top: 100%; left: 0; background: #0d0e13; right: 0; box-shadow: 0 10px 10px rgb(0 0 0 / 50%); padding: 20px 0; */
        & > span {display: none;}
        & > a {padding: 8px 0; width: 100%; text-align: center;}
        &.showMenu {display: flex;}
    }
`
const RMbox = styled(FlexDiv)`
    margin-left:auto; 
    .link01{ color: #fff; font-size:14px; margin-left:36px; font-weight:700; :hover{ color: #91dc27;} }
    .hideOnMobile {display: flex; align-items: center;}
    .hamburger {display: none; font-size: 30px; color: #fff; text-shadow: 0 0 12px rgba(145, 220, 39, 1);}
    @media screen and (max-width: 1680px){
        .rmDotLink02 {margin-right: 0;}
        .link01{ margin-left: 28px; }
    }
    @media screen and (max-width: 767px){
        .hideOnMobile {display: none;}
        .hamburger {display: block;}
        .rmDotLink02 {margin-right: 16px; margin-left: 20px;}
        .jackpot { width: 140px; margin: 0 -20px 0 -60px;
            img {max-width: 100%;}
        }
    }
    @media screen and (max-width: 400px){
        flex-flow: row;
        .jackpot { width: 120px; margin: 0 -20px 0 -60px; }
    }
`
const Rtimer = styled(FlexDiv)`
    font-size:14px; font-weight:700; color: #fff; line-height:24px;

    span{ display: inline-block; background-color: #222222; border:1px solid #da9732; width:18px; text-align:center; margin:0 2px}
    @media screen and (max-width: 450px) {
        font-size: 9px; margin: 0 -5px 0 0; line-height: 17px;
        span {width:13px;}
    }
`
