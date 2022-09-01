import React, { PureComponent } from "react";
import styled from 'styled-components';
import { Link } from "react-router-dom";

import LogoM from '../assets/welcome/logo.png'
import Logo2 from '../assets/welcome/logo2.png'


export default class HeadFreeListing extends PureComponent {
  constructor(props) {
    super();
    this.state = { 
    };
  }
 
 

  render() {
    
    return (
        <>
        
        <LHead className="header wow fadeInDown">
            <Logo><img src={LogoM} alt="logo" />
            <img className="logo2" src={Logo2} alt="logo" /></Logo>

            <RMbox>
                <a href="javascript:void(0);" class="link01" >Rewards program</a>
                <a href="javascript:void(0);" class="headerBtn">LAUNCH APP</a>
            </RMbox>
        </LHead>
        </>
    );
  }
}

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;


const LHead = styled(FlexDiv) ` 
    padding:36px 40px; justify-content:flex-start;   width: 100%;
    position: fixed; top: 0; transition: all 0.3s ease-in-out; z-index: 100;
    &.fixed {background: rgba(0,0,0,0.8); padding: 15px 40px; }
    @media (max-width: 767px){
      padding: 16px 20px 16px 15px;
      &.fixed {padding: 16px 20px 16px 15px;}
    }
`
const Logo = styled.a ` 
    margin-right:25px;
    .logo2 {display: none;}
    @media (max-width: 767px){
      img:not(.logo2) {display: none;}
      .logo2 {display: block; height: 43px; filter: drop-shadow(0px 0px 7px #91dc27)}
      /*       overflow: hidden; width: 80px
 */    }
`
const RMbox = styled(FlexDiv) `
    margin-left:auto; 
    .link01{ color: #fff; font-size:14px; font-weight:700; :hover{ color: #91dc27;} }
    .headerBtn { background-color: inherit; color: #FFF; font-weight: 700; border: 2px solid #91dc27; box-shadow: 0px 0px 10px #91dc27; padding: 10px 24px; margin-left: 50px; transition: all 0.5s ease-in-out 0s;
      &:hover { background-color: #91dc27; }
    }
    @media (max-width: 767px){
      .headerBtn {padding: 8px 15px; margin-left: 20px;}
    }
`






