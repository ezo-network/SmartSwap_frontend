import React, { PureComponent } from "react";
import styled from 'styled-components';
import { Link } from "react-router-dom";

import LogoM from '../assets/freelisting-images/logo.png'
import JPico from '../assets/freelisting-images/jackpot.png'


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

                    <Nav>
                        <Link to=''>SmartExtension</Link> <span>|</span>
                        <Link to=''>SmartBridge</Link><span>|</span>
                        <Link to=''>SmartPayment</Link><span>|</span>
                        <Link to=''>SmartWallet</Link><span>|</span>
                        <Link to='/'>SmartSwap</Link><span>|</span>
                        <Link to='/freelisting' className="active">FREE Listing</Link>
                    </Nav>

                    <RMbox>
                        <a href="#" className=""><img src={JPico} alt='Jackpot' /> </a>
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
                        <a href="#" className="link01" >Rewards program</a>
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
    padding:14px 40px; justify-content:flex-start;   width: 100%;
`
const Logo = styled(FlexDiv)` 
    margin-right:25px;
`
const Nav = styled(FlexDiv)`
font-size:16px; font-weight:400;
    span{ font-size:18px; font-weight:200; color: #aaaaaa; margin:0 19px;} 
    a{ color: #aaaaaa;  
        :hover{ color: #91dc27;}
        &.active{ color: #91dc27; font-weight:700; text-decoration: underline}
    }
`
const RMbox = styled(FlexDiv)`
    margin-left:auto; 
    .link01{ color: #fff; font-size:14px; margin-left:36px; font-weight:700; :hover{ color: #91dc27;} }
`
const Rtimer = styled(FlexDiv)`
    font-size:14px; font-weight:700; color: #fff; line-height:24px;

    span{ display: inline-block; background-color: #222222; border:1px solid #da9732; width:18px; text-align:center; margin:0 2px}
`





