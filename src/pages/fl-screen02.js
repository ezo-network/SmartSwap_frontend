import React, { PureComponent, lazy, Suspense } from "react";
import Web3 from 'web3';
import _ from "lodash";
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
export default class Screen2 extends PureComponent {
  constructor(props) {
    super();

    this.state = {
      filteredToken: "",   
      selectedSource: {
        token: null,
        tokenAddress: null,
        tokenIcon: null,
        chain: null,
        chainId: null,
        chainIcon: null,
        explorerUrl: null
      }
    };

  }

  async switchNetwork(token, tokenAddress, tokenIcon, chain, chainId, chainIcon, explorerUrl) {
    const sourceObject = {
      selectedSource: {
        token: token,
        tokenAddress: tokenAddress,
        tokenIcon: tokenIcon,
        chain: chain,
        chainId: chainId,
        chainIcon: chainIcon,
        explorerUrl: explorerUrl
      }      
    }
    if(Number(this.props.chainId) !== Number(chainId)){
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(chainId)}],
      }).then(response => {
        this.setState(sourceObject);
      }).catch(error => {
        console.error(error);
      });
    } else {
      this.setState(sourceObject);
    }
  }

  setSourceToken(){

    if(
      this.state.selectedSource.token == null
      ||
      this.state.selectedSource.tokenAddress == null
      ||
      this.state.selectedSource.tokenIcon == null
      ||
      this.state.selectedSource.chain == null
      ||
      this.state.selectedSource.chainId == null
      ||
      this.state.selectedSource.chainIcon == null
      ||
      this.state.selectedSource.explorerUrl == null
    ){
      notificationConfig.error('Please select a token first.');
      return;
    }

    this.props.onSourceTokenSelected(
      this.state.selectedSource.token,
      this.state.selectedSource.tokenAddress, 
      this.state.selectedSource.tokenIcon, 
      this.state.selectedSource.chain,
      this.state.selectedSource.chainId,
      this.state.selectedSource.chainIcon,
      this.state.selectedSource.explorerUrl
    );

  }

  filterTokens = (token) => {
    this.setState({ filteredToken: token });
  };

  render() {

    let finalFilteredTokens = [];
    const filteredTokens = this.props.tokens.filter(token => {
      if(token.name.match(new RegExp(this.state.filteredToken, "i"))){
        return token;
      }
    });


    filteredTokens.forEach(token => {
      const network = _.find(this.props.networks, { chainId: token.chainId });
      if(network !== undefined){
        token['chain'] = network.name;
        token['chainIcon'] = network.icon;
        token['explorerUrl'] = network.explorerUrl;
      }
      finalFilteredTokens.push(token);        
    });

    return (
      <>
        <main id="main" className="smartSwap">

          <div className="main">
            <MContainer>
              <CMbx>
                <ProgressBar> <span style={{ width: '25%' }}></span> </ProgressBar>

                <ProGTitle01> <i>1</i> Select the token to bridge</ProGTitle01>
                <ProInputbx> 
                  <input 
                    onChange={e => this.filterTokens(e.target.value)}
                    type="text"
                    placeholder="Search tokens"
                    value={this.state.filteredToken}
                  />
                </ProInputbx>
                <ProICOMbx01>
                  <ProICOMbx02>
                  
                    {finalFilteredTokens.length > 0 && finalFilteredTokens.map((token, i) => {
                      return (
                      <ProICOSbx01 
                        key={i} 
                        chainId={token.chainId} 
                        className={(this.state.selectedSource.tokenAddress === null ? '' : this.state.selectedSource.tokenAddress).toLowerCase() === (token.address).toLowerCase() ? 'selected' : ''}
                        onClick={() => this.switchNetwork(
                          token.symbol, 
                          token.address, 
                          token.icon,
                          token.chain, 
                          token.chainId,
                          token.chainIcon,
                          token.explorerUrl
                        )}
                      >
                        <ProICOSbx02> 
                          <img src={window.location.href + '/images/free-listing/tokens/' + ((token.icon).toString()).toLowerCase()} />{token.symbol}
                        </ProICOSbx02>
                        <ProICOSbx02> 
                            <img src={window.location.href + '/images/free-listing/chains/' + ((token.chainIcon).toString()).toLowerCase()} />{token.chain}
                        </ProICOSbx02>
                      </ProICOSbx01>
                      )
                    })}

                  </ProICOMbx02>
                </ProICOMbx01>

                <BtnMbox>
                  <button className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  <button onClick={() => this.setSourceToken()} className="Btn01"> NEXT STEP</button>
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






