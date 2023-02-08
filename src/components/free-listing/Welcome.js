import {WalletContext} from '../../context/WalletProvider';
import React, { PureComponent} from "react";
import styled from 'styled-components';
import notificationConfig from "../../config/notificationConfig";
import ImgIco01 from "../../assets/freelisting-images/imgIco01.png";
import ImgIco02 from "../../assets/freelisting-images/imgIco02.png";
import { textMasking } from '../../helper/utils';
import errors from '../../helper/errorConstantsHelper';
const $ = window.$;

export default class Welcome extends PureComponent {
  constructor(props) {
    super();
  }

  connectWallet = async () => {
    try {
      const walletConnected = await this.context.connectWallet();
      if (walletConnected === false) {
        notificationConfig.error(errors.metamask.walletNotConnected);
      }
    } catch (error) {
      console.error('connectWallet', error.message)
    }
  }

  render() {
    return (
      <>
        { 
          <main id="main" className="smartSwap">           
            <div className="main">   
              <MContainer> 
                  <CMbx>
                    <Csubbx01> 
                      <CStitle01>
                        <i className="imgIco"><img src={ImgIco01} alt="Ico" /></i>
                        Create a cross-chain bridge token to any EVM blockchain in a few seconds
                        <span>It's free and open to any project or users</span>
                      </CStitle01> 
                      { 
                        this.context.isAuthenticated === false && 
                        this.props.claimDeployerOwnerShip === false &&
                        <button onClick={(e) => this.connectWallet()} className="Btn01 ani-1">CONNECT YOUR WALLET</button>
                      }
                      { 
                        this.context.isAuthenticated === true &&
                        this.props.claimDeployerOwnerShip === false &&
                        <>
                          <button onClick={() => this.props.onWalletAlreadyConnectButtonClick(1)} className="Btn01 ani-1">
                            <i className="fas fa-check-circle"></i> WALLET CONNECTED
                          </button>
                          <SmallInfo>{this.context.account?.length > 0 ? textMasking(this.context?.account, '.', 4, 5, 4) : ''}</SmallInfo>
                        </>
                      }
                    </Csubbx01>
                    <Csubbx01 className="v2"> 
                      <CStitle01>
                        <i className="imgIco"><img src={ImgIco02} alt="Ico" /></i>
                        Projects, claim the bridge deployer to become the master validator
                        <span>
                          <button onClick={() => this.props.onStartHereButtonClick()} className="Btn02 ani-1">START HERE</button>
                        </span>
                      </CStitle01> 
                    </Csubbx01> 
                  </CMbx> 
                </MContainer> 
                
            </div>
          </main>
        }
      </>
    );
  }
}

Welcome.contextType = WalletContext;

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;

const MContainer = styled(FlexDiv)` 
  width: calc(100% - 40px); max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  align-items:stretch; margin-top:90px; margin-bottom: 40px;
  @media (max-width: 991px){
		margin-top: 60px; 
	}
  
`
const Csubbx01 = styled(FlexDiv)`
  width:50%; position:relative; padding-right:70px; border-right:1px solid #303030; align-items:flex-start; justify-content: flex-start;
  &.v2{ padding-right:0; padding-left:70px; border-right:none;
    .imgIco{ margin-bottom:19px;}
  } 
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; text-align:center; padding:26px 15px; border:2px solid #91dc27; font-size:24px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); 
    &:hover{ background-color:#91dc27;}
    
  }
  .Btn02{ background-color:transparent; color:#91dc27; border:0; font-size: 18px; font-weight:700; 
    :hover{ text-decoration:underline;}
  }
  @media screen and (max-width: 991px) {
    padding-right: 30px;
    &.v2{ padding-left: 30px;}
    .Btn01{font-size: 20px;}
  }
  @media screen and (max-width: 640px) {
    width: 100%; border-right:0 solid #303030; border-bottom:1px solid #303030; padding-bottom: 30px; margin-bottom: 40px; padding-right: 0;
    &.v2{ padding-left: 0;}
    .Btn01{padding: 20px 15px;}
  }
  @media screen and (max-width: 480px) {
    .Btn01{font-size: 18px;}
    }
`
const CStitle01 = styled(FlexDiv)`
  align-items:flex-start; font-size:30px; font-weight:700; color:#fff; flex-direction:column;  text-align:left;
  line-height: 1.4;
  .imgIco{ margin-bottom:8px;}
  span{ font-size:21px; font-weight:300; text-align:left; display:block; width:100%; margin:27px 0 54px 0; }
  @media screen and (max-width: 991px) {
    font-size: 25px; 
  }
  @media screen and (max-width: 480px) {
    font-size: 24px; line-height: 36px;
    span {font-size: 16px; line-height: 30px; margin: 23px 0 35px 0;}
    .imgIco{ margin-bottom: 20px;}
  }
`
const SmallInfo = styled(FlexDiv)`
  font-size:12px; color:#a6a2b0; justify-content: flex-end; width:100%;
`