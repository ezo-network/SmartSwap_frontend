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
                <ProgressBar> <span style={{ width: '25%' }}></span> </ProgressBar>

                <ProGTitle01> <i>1</i> Select the token to bridge</ProGTitle01>
                <ProInputbx> <input type="text" placeholder="Search token by name or smart contract" /> </ProInputbx>
                <ProICOMbx01>
                  <ProICOMbx02>

                    <ProICOSbx01 className="selected">
                      <ProICOSbx02> <img src={ImgIco01} /> BSC </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco01} /> BNB </ProICOSbx02>
                    </ProICOSbx01>

                    <ProICOSbx01>
                      <ProICOSbx02> <img src={ImgIco02} /> Ethereum </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco02} /> ETH </ProICOSbx02>
                    </ProICOSbx01>

                    <ProICOSbx01>
                      <ProICOSbx02> <img src={ImgIco03} /> Polygon </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco03} /> MATIC </ProICOSbx02>
                    </ProICOSbx01>

                    <ProICOSbx01>
                      <ProICOSbx02> <img src={ImgIco01} /> BSC </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco04} /> PDO </ProICOSbx02>
                    </ProICOSbx01>

                    <ProICOSbx01>
                      <ProICOSbx02> <img src={ImgIco01} /> BSC </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco05} /> JNTR </ProICOSbx02>
                    </ProICOSbx01>

                    <ProICOSbx01>
                      <ProICOSbx02> <img src={ImgIco01} /> BSC </ProICOSbx02>
                      <ProICOSbx02> <img src={ImgIco06} /> SMART </ProICOSbx02>
                    </ProICOSbx01>

                  </ProICOMbx02>
                </ProICOMbx01>

                <BtnMbox>
                  <button className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  <button className="Btn01"> NEXT STEP</button>


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

    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
`
const ProICOMbx01 = styled.div` width:100%; `
const ProICOMbx02 = styled(FlexDiv)`
    align-items:flex-start; justify-content: flex-start; margin:30px -18px 0 -18px;
`
const ProICOSbx01 = styled.button`
  width:calc(25% - 36px); margin:0 18px 30px 18px; background-color:#21232b; height:60px; border:0px; outline:none; padding:0;
  display: flex; align-items: center; justify-content: flex-start;
  :hover{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
  &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
` 
const ProICOSbx02 = styled(FlexDiv)`
  width:50%; padding:0 18px; justify-content:flex-start; font-size:14px; font-weight:400; color:#fff;
  img{ margin-right:15px;}
  &:nth-child(01){ background-image:url(${Lineimg}); background-repeat:no-repeat; background-position:right 50%;} 
`
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;

  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}

`






