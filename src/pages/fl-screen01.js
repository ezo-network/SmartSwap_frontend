import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import web3Config from "../config/web3Config";
import constantConfig, { getTokenList, tokenDetails } from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import SwapFactoryContract from "../helper/swapFactoryContract";
import CONSTANT from "../constants";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import axios from "axios";
import { isValidAddress } from 'ethereumjs-util';
import styled from 'styled-components';
import HeadFreeListing from "../components/Header02";

import ImgIco01 from "../assets/freelisting-images/imgIco01.png";
import ImgIco02 from "../assets/freelisting-images/imgIco02.png";

const $ = window.$;
export default class Screen1 extends PureComponent {
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
          <main id="main" className="smartSwap">
           
            <div className="main">   
             <MContainer> 
                  <CMbx>
                    <Csubbx01> 
                      <CStitle01>
                        <i className="imgIco"><img src={ImgIco01} alt="Ico" /></i>
                        Create a cross-chain bridge token to any EVM blockchain by few seconds
                        <span>It's free and open to any project and their users</span>
                      </CStitle01> 
                      <button className="Btn01 ani-1">CONNECT YOUR WALLET</button> 
                    </Csubbx01>
                    <Csubbx01 className="v2"> 
                      <CStitle01>
                        <i className="imgIco"><img src={ImgIco02} alt="Ico" /></i>
                        Projects, claim the bridge deployer to become the master validator
                        <span><button className="Btn02 ani-1">START HERE</button></span>
                      </CStitle01> 
                    </Csubbx01> 
                  </CMbx> 
                </MContainer> 
                
            </div>
          </main>
      </>
    );
  }
}

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;

const MContainer = styled(FlexDiv)` 
  width:100%; max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  align-items:stretch; margin-top:90px;
`
const Csubbx01 = styled(FlexDiv)`
  width:50%; position:relative; padding-right:70px; border-right:1px solid #303030; align-items:flex-start; justify-content: flex-start;

  &.v2{ padding-right:0; padding-left:70px; border-right:none;
    .imgIco{ margin-bottom:19px;}
  } 
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; text-align:center; padding:30px 15px; border:2px solid #91dc27; font-size:24px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
  .Btn02{ background-color:transparent; color:#91dc27; border:0; font-size:24px; font-weight:700; :hover{ text-decoration:underline;}}
`
const CStitle01 = styled(FlexDiv)`
  align-items:flex-start; font-size:30px; font-weight:700; color:#fff; flex-direction:column;  text-align:left;

  .imgIco{ margin-bottom:30px;}
  span{ font-size:21px; font-weight:300;  text-align:left; display:block; width:100%; margin:40px 0 55px 0;  ;}
  
`
