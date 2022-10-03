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


import Screen01 from "./fl-screen01";
import Screen02 from "./fl-screen02";
import Screen03 from "./fl-screen03";
import Screen04 from "./fl-screen04";
import Screen05 from "./fl-screen05";
import Screen06 from "./fl-screen06";
import Screen07 from "./fl-screen07";
import Screen08 from "./fl-screen08";
import Screen09 from "./fl-screen09";
import Screen10 from "./fl-screen10";
import Screen11 from "./fl-screen11";

const $ = window.$;
export default class Projects extends PureComponent {
  constructor(props) {
    super();
    this.state = { checked1: false };
    
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
                <HeadFreeListing />

                {/* 
                <Screen01 /> 
                <Screen02 /> 
                <Screen03 /> 
                <Screen04 />
                <Screen05 />
                <Screen06 />
                <Screen07/>
                <Screen08/>
                <Screen09/>
                <Screen10/>
                */}
                <Screen11/>
                
            </div>
          </main>
      </>
    );
  }
}

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;
 