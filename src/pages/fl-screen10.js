import React, { PureComponent, lazy, Suspense } from "react";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import _ from "lodash";
import Lineimg from "../assets/freelisting-images/line01.png";
import BridgeApiHelper from "../helper/bridgeApiHelper";
import { ethers } from "ethers";
const $ = window.$;


export default class Screen10 extends PureComponent {
  pendingSignMessageRequest = false;  
  constructor(props) {
    super();
    this.state = {
      wrappedTokens:[],
      selectedWrappedToken: [],
      ownershipTransferRequested: false,
      btnClicked: false
    };
  }

  componentDidMount() {
    this.getWrappedTokens(null, this.props.accountAddress, false);
  }

  selectToken = (id) => {    
    if(this.state.selectedWrappedToken.includes(id)){
      this.setState({selectedWrappedToken: this.state.selectedWrappedToken.filter(function(_id) { 
        return id !== _id
      })});
    } else {
      this.setState(prevState => ({
        selectedWrappedToken: [...prevState.selectedWrappedToken, id]
      }));
    }
  }

  async getWrappedTokens(sourceTokenChainId = null, creatorAddress = null, all = false) {
    try {
      const {
        response,
        error,
        code
      } = await BridgeApiHelper.getWrappedTokens(sourceTokenChainId, creatorAddress, all);

      if (code === 200) {
        this.setState({
          wrappedTokens: response
        });
      } else {
        console.error(error)
      }

    } catch (error) {
      console.error(error)
    }
  }

  async makeTransferWrapTokenOwnershipRequest(){
    if(this.pendingSignMessageRequest === false){
      this.setState({
        btnClicked: true
      });
      if(this.state.ownershipTransferRequested === false){
        if(this.state.selectedWrappedToken.length > 0){
          const signedMessage = await this.signData();
          console.log({
            signedMessage: signedMessage
          });
          if(signedMessage !== false){
            this.state.selectedWrappedToken.forEach(async(selectedWrappedTokenId) => {
              const wrappedToken = _.find(this.state.wrappedTokens, {_id: selectedWrappedTokenId});
              if(wrappedToken !== null){
                const networkConfig = _.find(this.props.networks, { chainId: wrappedToken.chainId });
                await BridgeApiHelper.makeTransferWrapTokenOwnershipRequest(
                  wrappedToken.tokenSymbol,
                  networkConfig.name,
                  wrappedToken.chainId,            
                  this.props.accountAddress,
                  signedMessage
                );
              }
            });
            this.setState({
              ownershipTransferRequested: true,
              btnClicked: false
            });
          } else {
            notificationConfig.error("Something went wrong when signing message.");
            this.setState({
              btnClicked: false
            });
          }
        } else {
          notificationConfig.error('Select a token');
          this.setState({
            btnClicked: false
          });
        }
      } else {
        this.setState({
          btnClicked: false
        });
      }
    } else {
      notificationConfig.info('A sing message request is pending. Check metamask.');
    }
  }

  async signData() {
    try {
      this.pendingSignMessageRequest = true;
      const signer = this.props.web3Instance.getSigner();

      console.log({
        signer: signer
      });
  
      const message = process.env.REACT_APP_SIGN_MESSAGE;

      console.log({
        message: message
      })

      const signature = await signer.signMessage(message);
      const address = ethers.utils.verifyMessage(message, signature);
  
      if(address === this.props.accountAddress){
        console.log('AUTHORIZED USER');
        this.pendingSignMessageRequest = false;
        return signature;
      } else {
        console.log('UNAUTHORIZED USER'); 
        this.pendingSignMessageRequest = false;
        return false;
      }
    } catch(error){
      console.error({
        signDataError: error.message
      });
      this.pendingSignMessageRequest = false;
      return false;
    }
  }

  onBackButtonClicked = () => {
    if(this.pendingSignMessageRequest === false){
      this.props.onBackButtonClicked(9);
    } else {
      notificationConfig.info('A sing message request is pending. Check metamask and decline request to go back.');
    }
  }

  render() {
    
    let usersWrappedTokens = [];
    this.state.wrappedTokens.forEach(wrappedToken => {
      const originalToken = _.find(this.props.tokens, {symbol: wrappedToken.tokenSymbol});
      const networkConfig = _.find(this.props.networks, { chainId: wrappedToken.chainId });
      if (networkConfig !== undefined) {      
        wrappedToken['chain'] = networkConfig['name'];
        wrappedToken['icon'] = originalToken['icon'];
        usersWrappedTokens.push(wrappedToken);
      }
    });

    return (
      <>
        <main id="main" className="smartSwap">
          <div className="main">
            <MContainer>
              <CMbx>
                <ProgressBar> <span style={{ width: '100%' }}></span> </ProgressBar>
                {
                  usersWrappedTokens.length > 0 && (
                    <ProGTitle01>Transfer deployer ownership on existing bridges</ProGTitle01>
                  )
                }

                {
                  usersWrappedTokens.length === 0 && (
                    <ProGTitle01>You've not wrapped any token yet.</ProGTitle01>
                  )
                }
                <ProICOMbx01>
                  <ProICOMbx02>

                    {
                      usersWrappedTokens.length > 0 && usersWrappedTokens.map(function (wrappedToken, i) {
                      return (
                        <ProICOSbx01 
                          onClick={() => this.selectToken(wrappedToken._id)} 
                          disabled={this.state.btnClicked}
                          key={wrappedToken._id} 
                          className={this.state.selectedWrappedToken.includes(wrappedToken._id) ? 'selected' : 'pending'}
                        >
                          <i className="fa fa-check-circle" aria-hidden="true"></i>
                          <ProICOSbx02> 
                            <img src={'/images/free-listing/tokens/' + wrappedToken.icon} /> 
                            {wrappedToken.tokenSymbol}
                          </ProICOSbx02>
                          <ProICOSbx02> {wrappedToken.chain} </ProICOSbx02>
                        </ProICOSbx01>                         
                      )
                     }.bind(this))
                    }


                  </ProICOMbx02>
                </ProICOMbx01>
                <BtnMbox>
                  <button onClick={() => this.onBackButtonClicked()} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  {this.state.ownershipTransferRequested === false && 
                    <button onClick={() => this.makeTransferWrapTokenOwnershipRequest()} className="Btn01">TRANSFER DEPLOYER OWNERSHIP</button>                
                  }

                  {this.state.ownershipTransferRequested === true && 
                    <button onClick={() => this.props.onOwnershipTransfered(11)} className="Btn01">FINISH</button>                
                  }
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
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:114px;

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
    align-items:flex-start; justify-content: flex-start; margin:0 -18px 0 -18px;
`
const ProICOSbx01 = styled.button`
  width:calc(25% - 36px); margin:0 18px 30px 18px; background-color:#21232b; height:60px; border:0px; outline:none; padding:0; position: relative;
  display: flex; align-items: center; justify-content: flex-start;
  :hover{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
  &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  
    i { opacity: 1; color: #91dc27; }
  }
  &.pending{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  
    i { opacity: 1; color: #ccc; }        
  }
  i {
    color: #fff; font-size: 18px; margin-left: 18px; opacity: 0;
  }
` 
const ProICOSbx02 = styled(FlexDiv)`
  width:50%; padding:0 18px; justify-content:flex-start; font-size:14px; font-weight:400; color:#fff;
  img{ margin-right:15px;}
  &:nth-of-type(1){ background-image:url(${Lineimg}); background-repeat:no-repeat; background-position:right 50%;} 
`
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;

  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}

`






