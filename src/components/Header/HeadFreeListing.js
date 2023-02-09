import React, { PureComponent } from "react";
import styled from 'styled-components';
import { Link } from "react-router-dom";
import LogoM from '../../assets/freelisting-images/logo.png'
import JPico from '../../assets/freelisting-images/jackpot.png'
import RightSideMenu from "../Navigations/RightSideMenu";
import { WalletContext } from '../../context/WalletProvider';

// popups
import WalletPopup from "../popups/WalletPopup";
// import CoinPopup from "../popups/CoinPopup";
import SidePopup from "../popups/SidePopup";
import LiquidityFountainSP from "../popups/liquidity_fountain_for_SPs";
import About from "../popups/About";
import PeerPopup from "../popups/PeerPopup";
import HowItWorks from "../popups/HowItWorks";
import CefiToDefi from "../popups/CefiToDefi";
import NoDomain from "../popups/NoDomain";

const $ = window.$;


export class CounterBox extends PureComponent {
    render() {
        return (
            <>
                {/* <a href="#" onClick={(e) => e.preventDefault()} className="jackpot cursor"><img src={JPico} alt='Jackpot' /> </a>
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
                <a href="#" onClick={(e) => e.preventDefault()} className="link01 hideOnMobile cursor">Rewards program</a> */}
            </>
        );
    }
}

export default class HeadFreeListing extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            sideMenu: false
        };
        this.toggleSideMenu = this.toggleSideMenu.bind(this);
    }

    openPopup(id) {
        $("#" + id).fadeIn();
    }

    closePopup(id) {
        $("#" + id).fadeOut();
    }

    toggleSideMenu() {
        this.setState({
            sideMenu: !this.state.sideMenu
        });
    }

    render() {

        return (
            <>

                <LHead>

                    <Logo> <img src={LogoM} alt="logo" /></Logo>

                    <Nav className="deskNav">
                        <Link className="c-soon" to=''>SmartExtension</Link> <span>|</span>
                        <Link to='/freelisting'>SmartBridge</Link><span>|</span>
                        <Link className="active" to='/'>SmartSwap</Link><span>|</span>
                        <Link className="c-soon" to=''>SmartPayment</Link><span>|</span>
                        <Link className="c-soon" to=''>SmartWallet</Link>
                        {/* <Link to='/freelisting' className="active">FREE Listing</Link> */}
                    </Nav>
                    <Nav className="mobNav">
                        <Link to='/freelisting' className="active">FREE Listing<i className="fas fa-caret-down"></i></Link>
                    </Nav>
                    <RMbox>
                        <CounterBox />
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); this.toggleSideMenu() }} 
                            className={`rmDotLink02 cursor ${this.state.sideMenu ? "active" : ""}`}
                        ></a>
                    </RMbox>
                </LHead>

                {/* <!--======================= RIGHT SIDE MENU =====================--> */}
                <RightSideMenu
                    web3={this.context.web3}
                    openPopup={this.openPopup}
                    show={this.state.sideMenu}
                    onMenuButtonClicked={this.toggleSideMenu}
                ></RightSideMenu>
                {/* <!--======================= RIGHT SIDE MENU END  =====================--> */}

                {/* <!--======================= Sidebar menu popups =====================--> */}
                <WalletPopup></WalletPopup>

                {/* <CoinPopup
                popId={"sendCurPop"}
                web3={this.state.web3}
                web3Config={web3Config}
                setCurrency=""
                opositeSelectedCurrrency=""
                selectedCurrrency=""
              ></CoinPopup>
              
              <CoinPopup
                popId={"receiveCurPop"}
                web3={this.state.web3}
                web3Config={web3Config}
                setCurrency=""
                opositeSelectedCurrrency=""
                selectedCurrrency=""
              ></CoinPopup> */}

                <LiquidityFountainSP
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                />

                <About
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                ></About>

                <PeerPopup
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                ></PeerPopup>

                <HowItWorks
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                ></HowItWorks>

                <CefiToDefi
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                ></CefiToDefi>

                <NoDomain
                    closePopup={this.closePopup}
                    openPopup={this.openPopup}
                    subDomainName={this.state.subDomainName}
                ></NoDomain>

                <SidePopup
                    closePopup={() => { this.setState({ sideBar: false }) }}
                    openPopup={this.openPopup}
                    sideBar={this.state.sideBar}
                ></SidePopup>
                {/* <!--======================= Sidebar menu popups =====================--> */}
            </>
        );
    }
}


HeadFreeListing.contextType = WalletContext;

const FlexDiv = styled.div`
    display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;


const LHead = styled(FlexDiv)` 
    /* padding:14px 40px; */ padding: 18px 42px; justify-content:flex-start;  width: 100%; position: relative; 
    @media screen and (max-width: 1600px){
        padding-bottom: 50px; padding-top: 10px;
    }
    @media screen and (max-width: 1370px){
        padding-bottom: 0;
    }
    @media screen and (max-width: 991px){
        padding-right: 15px;  padding-left  : 15px;  z-index: 1000; 
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
    @media screen and (max-width: 640px){
        width: 42px; margin: -4px 0 0 7px;
        img {width: 100%}
    }    
`
const Nav = styled(FlexDiv)`
    font-size:16px; font-weight:400; 
    span{ font-size: 29px; font-weight:200; color: #3c3c3c; margin: 0 14px;} 
    &.deskNav {
        .c-soon {
            position: relative;
            &:after {content: "Coming Soon"; position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; opacity: 0;}
            &:hover {color: transparent; &:after {opacity: 1; color: #91dc27;}}
        }
    }
    &.mobNav {display: none;
        i {margin-left: 27px;}
    }
    a{ color: #aaaaaa; 
        :hover{ color: #91dc27;}
        &.active{ color: #fff; font-weight:700; text-decoration: underline}
    }
    @media screen and (max-width: 1650px){
        font-size: 15px;
        span {margin:0 10px; font-size:15px;}
    }
    @media screen and (max-width: 1390px){
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
    .rmDotLink02.active {opacity: 0; }
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
    @media screen and (max-width: 640px){
        flex-flow: row;
        .jackpot { width: 120px; margin: 0 -20px 0 -60px; }
    }
`
const Rtimer = styled(FlexDiv)`
    font-size:14px; font-weight:700; color: #fff; line-height:24px;
    span{ display: inline-block; background-color: #222222; border:1px solid #da9732; width:18px; text-align:center; margin:0 2px}
    @media screen and (max-width: 640px) {
        font-size: 9px; margin: 0 -5px 0 0; line-height: 17px;
        span {width: 12px; line-height: 1.5; margin: 0 1px;}
    }
`