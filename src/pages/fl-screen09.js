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

import ImgIco01 from "../assets/freelisting-images/s2ICO-01.png";
import ImgIco02 from "../assets/freelisting-images/s2ICO-02.png";
import ImgIco03 from "../assets/freelisting-images/s2ICO-03.png";
import ImgIco04 from "../assets/freelisting-images/s2ICO-04.png";
import ImgIco05 from "../assets/freelisting-images/s2ICO-05.png";
import ImgIco06 from "../assets/freelisting-images/s2ICO-06.png";
import Lineimg from "../assets/freelisting-images/line01.png";




const $ = window.$;
export default class Screen8 extends PureComponent {
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
                <ProgressBar> <span style={{ width: '66.66%' }}></span> </ProgressBar>

                <ProGTitle01>To become a validator, download the validator file and place it in AWS Lambda</ProGTitle01>

                 
                <ProInputbx className="FirstChild"> 
                    <label><i>1</i> 
                    <ProFileNBtn>
                      <ProFile><p>
                        <span><em class="fa fa-file-code"></em> SMART validator V.1</span> Latest update 09/08/2022</p>
                        <ProbxLink>Instructions <em class="fas fa-external-link-alt"></em></ProbxLink>

                      </ProFile>
                      <ProBtn>
                        <button className="Btn01">DOWNLOAD VALIDATOR FILE</button> 
                      </ProBtn>
                    </ProFileNBtn>
                    </label>   
                </ProInputbx>
                <ProInputbx> 
                    <label htmlFor="input01"><i>2</i> Type the validator address to activate master validator status</label>   
                    <input type="text" id="input01" className="v2"  /> 
                </ProInputbx>
            
                <BtnMbox>
                    <button className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                    <button className="Btn01"> ACTIVE VALIDATOR</button> 
                </BtnMbox> 
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
  width:100%;  margin-top:90px;
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:55px;

    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
`



const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; 
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px;  } 
`
const ProInputbx = styled(FlexDiv)`
    width:100%;
    &.FirstChild {
      border-bottom: 1px solid #303030; 
      padding-bottom: 30px; margin-bottom: 40px;
    }
    label{width:100%; font-size:18px; font-weight:700; margin-bottom:18px;
    
        i{ width:30px; height:30px; background-color:#fff; color:#0d0e13; display:inline-flex; align-items:center; justify-content:center; font-style:normal; margin-right:16px;}

        
    }
    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400;
    
        &.v2{ margin-left:50px;}
    }
` 
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px; margin-bottom:20px;


  &.v2{ border-top:none; border-bottom:1px solid #303030; padding-top:0; padding-bottom:48px; margin-bottom:40px; }

  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700;  -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}

`
const ProFileNBtn = styled.div `
    display: inline-flex; padding-left: 4px;
    width: calc(100% - 46px); align-items: center;
    p {color: #aaaaaa; font-weight: normal; font-size: 14px; display: inline-block;
      span {color:#91dc27; font-size: 18px}
      em {
        margin-right: 10px;
      }
    }
`
const ProbxLink = styled.a `
  display: table; margin: -6px 0 0 30px; font-weight: normal;
  font-size: 12px; color: #aaa; 
  em {color:#91dc27; margin-left: 2px;}
`

const ProFile = styled.div `

`
const ProBtn = styled.div `
    display: flex; align-items: center;
    margin-left: auto;
    .Btn01{ color:#fff; background-color:#0d0e13; width:430px; max-width:100%; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700;  -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
`





