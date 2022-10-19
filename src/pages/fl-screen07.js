import React, { PureComponent, lazy, Suspense } from "react";
import styled from 'styled-components';
import Lineimg from "../assets/freelisting-images/line01.png";
import Badge from "../assets/freelisting-images/imgIco02.png";
const $ = window.$;

export default class Screen7 extends PureComponent {
  constructor(props) {
    super();
    this.state = {

    };
  }

  render() {
    return (
      <>
        <main id="main" className="smartSwap">
          <div className="main">
            <MContainer>
              <CMbx>
                <ProGTitle01> <i className="hasImg"><img alt="badge" src={Badge}></img></i> Project, claim the deployer ownership and become a master validator for your own token</ProGTitle01>
                <ProPera>No need for projects to trust cross-chain solutions for bridging needs. SmartBridge allows projects to become a must validators meaning no transaction takes place without other validators consensus to the project.</ProPera>
                <ProPera>Further, SmartBridge allows projects to take ownership of the deployer, leaving them fully in control of project tokens on any chain.</ProPera>
                <BtnMbox>
                  <BtnRight>
                    { 
                    this.props.walletConnected === false && 
                    this.props.claimDeployerOwnerShip === true &&
                      <>
                        <button onClick={() => this.props.onWalletConnectButtonClick()} className="Btn01">CONNECT YOUR WALLET</button>
                        <p>Connect with the wallet used to deploy the original token</p>
                      </>
                    }

                    { 
                    this.props.walletConnected === true && 
                    this.props.claimDeployerOwnerShip === true &&
                    this.props.wantToBecomeMasterValidator === false &&
                      <>
                        <button onClick={() => this.props.onWalletAlreadyConnectButtonClick(2)} className="Btn01">CONTINUE</button>
                        <p>Connected with the wallet used to deploy the original token</p>
                      </>
                    }

                  </BtnRight>
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
  width: calc(100% - 40px); max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  margin-top:90px; margin-bottom:90px;
  @media (max-width: 991px){
		margin-top: 60px;
	}
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:55px;

    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
    @media screen and (max-width: 640px) {
      margin-bottom: 40px;
    }
`

const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; flex-flow: row;
    i::not(.hasImg){ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px;  
    } 
    .hasImg {
        margin-right: 25px;
        margin-bottom: -18px;
        img {
            width:63px;
        }
    }
    @media only screen and (max-width: 640px) {
      flex-flow: column; 
      .hasImg {margin-bottom: 0; margin-right: auto;}
    }
`

const ProICOMbx01 = styled.div` width:100%; `
const ProICOMbx02 = styled(FlexDiv)`
    align-items:flex-start; justify-content: flex-start; margin:30px -18px 0 -18px;
`
const ProICOSbx01 = styled.button`
  width:calc(25% - 36px); margin:0 18px 30px 18px; background-color:#21232b; height:60px; border:0px; outline:none; padding:0; position: relative;
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

  .Btn01{ color:#fff; background-color:#0d0e13; width: 430px; max-width:100%; text-align:center; padding:18px 30px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}
`

const ProRow = styled.div `
  display: flex;
  width: 100%;
  align-items: center;
  padding: 40px 0 0 0;
  margin: 0 0 50px;
  .labelNo {
    width:30px;
    height:30px;
    line-height: 30px;
    text-align: center;
    font-size: 18px;
    background: #fff;
    color: #000;
    font-weight: bold;
    margin-right: 25px;
  }
  `
const ProRowCol1 = styled.div `
  display: flex;
  width: 50%;
  align-items: center;
  position: relative;
  button {
    width: calc(50% - 36px);
    margin: 0;
    flex-grow: 1;
  }
`
const ProColImg = styled.div `
  flex-grow: 1;
  text-align: center;
  width: calc(50% - 36px);
  `
const ProColBtn = styled.div `
  flex-grow: 1;
  width: calc(50% - 36px);
  padding-left: 30px;
  button {
    color:#fff; background-color:#0d0e13; width: 100%;  text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); 
    &:hover{ background-color:#91dc27;}
  }
  .Btn02 {
    color: #91dc27;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    display: block;
    .fa {
      margin-right: 10px;
    }
  }
`
const ProICOTitle = styled.span`
  position: absolute;
  font-size: 18px;
  color: #fff;
  bottom: 100%;
  margin-bottom: 15px;
  font-weight: bold;
`

const ProPera = styled.p `
    width: 100%;
    color: #aaaaaa;
    font-size: 18px;
    line-height: 30px;
    margin: 0 0 30px;
    `

    const BtnRight = styled.div `
        margin-left: auto;
        min-width: 430px;
        text-align: center;
        p {
            font-size: 12px;
            margin: -5px 0 0 0;
            color: #aaa;
        }
        @media only screen and (max-width: 640px) {
          width: 100%; min-width: inherit;
          .Btn01 {width: 100%;}
        }
    `



