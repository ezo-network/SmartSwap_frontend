import React, { PureComponent, lazy, Suspense } from "react";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import _ from "lodash";
import Lineimg from "../assets/freelisting-images/line01.png";
import BridgeApiHelper from "../helper/bridgeApiHelper";
import { ethers } from "ethers";
const $ = window.$;


export default class Screen10 extends PureComponent {
  pendingDeploymentRequestCount = 0;
  pendingSignMessageRequest = false;  
  constructor(props) {
    super();
    this.state = {
      wrappedTokens:[],
      selectedWrappedToken: [],
      ownershipTransferRequested: false,
      btnClicked: false,
      ownershipRequests: []
    };
  }

  componentDidMount() {
    this.getWrappedTokens(null, this.props.accountAddress, false);
    this.getOwnershipRequests(this.props.accountAddress);
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

  async getWrappedTokens(projectId = null, creatorAddress = null, all = false) {
    try {
      const {
        response,
        error,
        code
      } = await BridgeApiHelper.getWrappedTokens(projectId, creatorAddress, all);

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

  async getOwnershipRequests() {
    try {
      const {
        response,
        error,
        code
      } = await BridgeApiHelper.getOwnershipRequests(this.props.accountAddress);

      if (code === 200) {
        this.setState({
          ownershipRequests: response
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
      if(this.state.selectedWrappedToken.length > 0){
        const signedMessage = await this.signData();
        console.log({
          signedMessage: signedMessage
        });
        if(signedMessage !== false){
          for await (const selectedWrappedTokenId of this.state.selectedWrappedToken) {
            const wrappedToken = _.find(this.state.wrappedTokens, {_id: selectedWrappedTokenId});
            if(wrappedToken !== null){
              const networkConfig = _.find(this.props.networks, { chainId: wrappedToken.toChainId });
              await BridgeApiHelper.makeTransferWrapTokenOwnershipRequest(
                wrappedToken.tokenSymbol,
                networkConfig.chain,
                wrappedToken.toChainId,
                this.props.accountAddress,
                signedMessage
              );
            }
          }
          this.setState({
            ownershipTransferRequested: true,
            btnClicked: false,
            selectedWrappedToken: []
          });
          await this.getOwnershipRequests(this.props.accountAddress);
          this.pendingDeploymentRequestCount = 0;
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

    this.pendingDeploymentRequestCount = 0;
    let usersWrappedTokens = [];
    this.state.wrappedTokens.forEach(wrappedToken => {
      //const originalToken = _.find(this.props.tokens, {symbol: wrappedToken.tokenSymbol.slice(2)});
      const networkConfig = _.find(this.props.networks, { chainId: wrappedToken.toChainId });
      if (networkConfig !== undefined) {
        wrappedToken['chain'] = networkConfig['chain'];
        usersWrappedTokens.push(wrappedToken);
      }
    });

    const wrapTokenGroupBySymbol = _.mapValues(_.groupBy(usersWrappedTokens, 'tokenSymbol'));


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

                {
                  Object.keys(wrapTokenGroupBySymbol).map(function(wrapTokenListKey, i){
                    return <ProICOMbx01 key={wrapTokenListKey + '_' + i} className='v2'>
                      <ProICOMbx02 key={wrapTokenListKey + '_' + i}>
                      {
                        Object.keys(wrapTokenGroupBySymbol[wrapTokenListKey]).map(function(wrappedTokenKey, i){
                          
                          let wrappedToken = wrapTokenGroupBySymbol[wrapTokenListKey][wrappedTokenKey];
                          
                          let ownershipRequestExist = _.find(this.state.ownershipRequests, {
                            token: (wrappedToken.tokenSymbol).toUpperCase(),
                            chainId: Number(wrappedToken.toChainId)
                          });

                          ownershipRequestExist = ownershipRequestExist !== undefined ? true : false;

                          const isSelected = this.state.selectedWrappedToken.includes(wrappedToken._id) ? 'selected' : 'pending';
                          const isDisabled = ownershipRequestExist ? 'disabled' : '';

                          if(ownershipRequestExist === false){
                            this.pendingDeploymentRequestCount = this.pendingDeploymentRequestCount + 1;
                          }

                          return (
                            <ProICOSbx01 
                              onClick={(e) => ownershipRequestExist ? e.preventDefault : this.selectToken(wrappedToken._id)}
                              key={wrappedToken._id}
                              className={`${isSelected} ${isDisabled}`}
                              disabled={ownershipRequestExist}
                            >
                              {ownershipRequestExist ? false : true && <i className="fa fa-check-circle" aria-hidden="true"></i>}
                              <ProICOSbx02>
                                <img 
                                  src={'/images/free-listing/tokens/' + (wrappedToken.tokenSymbol.substring(2) + '.png').toLowerCase()}
                                  onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                />
                                {(wrappedToken.tokenSymbol.substring(-2, 2)).toLowerCase()}
                                {(wrappedToken.tokenSymbol.substring(2)).toUpperCase()}                                
                              </ProICOSbx02>
                              <ProICOSbx02>{wrappedToken.chain}</ProICOSbx02>
                            </ProICOSbx01>
                          )
                        }.bind(this))
                      }
                      </ProICOMbx02>
                    </ProICOMbx01>
                  }.bind(this))
                }

                <BtnMbox>
                  <button onClick={() => this.onBackButtonClicked()} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  {this.pendingDeploymentRequestCount > 0 && 
                    <button onClick={() => this.makeTransferWrapTokenOwnershipRequest()} className="Btn01">TRANSFER DEPLOYER OWNERSHIP</button>                
                  }

                  {this.pendingDeploymentRequestCount === 0 &&
                    <button onClick={() => this.props.onOwnershipTransfered(11)} className="Btn01">FINISH</button>                
                  }

                  <SmallInfo>
                    <p>Total bridges to transfer: <span>{this.state.selectedWrappedToken.length}</span></p>
                  </SmallInfo>

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
  width:100%;  margin-top:90px; margin-bottom: 40px;
  @media (max-width: 991px){
		margin-top: 60px;
	}
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:114px;
    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
    @media screen and (max-width: 640px) {
      margin-bottom: 40px;
    }
`

const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; 
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px;  } 
`
const ProInputbx = styled(FlexDiv)`
    width:100%;
    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
`
const ProICOMbx01 = styled.div` 
  width:100%; 
  &.v2{ border-top: 2px solid #303030; padding-top:36px;}
`
const ProICOMbx02 = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); column-gap: 36px; row-gap: 30px; margin:0 0 30px; 
  input[type=checkbox] {opacity: 0; position: absolute;}
`
const ProICOSbx01 = styled.label`
  background-color:#21232b; height:60px; border:0px; outline:none; padding:0 0 0 35px; position: relative; display: flex; align-items: center; justify-content: flex-start; margin: 0;
  .disable{filter: grayscale(100%); }
  :hover{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
    &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  
      i { opacity: 1; color: #91dc27; }
  }
  input[type=checkbox] + &:after {content: ""; width: 20px; height: 20px; background: #464646; border-radius: 2px; cursor: pointer; transition: background .3s; border-radius: 25px; position: absolute; left: 10px; }
  input[type=checkbox] + & {position: relative;}
  input[type=checkbox] + &:before {content: ""; transform: rotate(-45deg); left: 15px; border: 3px solid #21232b; border-top-style: none; border-right-style: none; width: 10px; height: 7px; position: absolute; z-index: 1; opacity: 0; top: calc(50% - 4px);}
  input[type=checkbox]:checked + & {box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); }
  input[type=checkbox]:checked + &:after {background: #92db28;}
  input[type=checkbox]:checked + &:before {opacity: 1;}
  i {
    color: #fff; font-size: 18px; margin-left: 18px; opacity: 0;
  }
` 
const ProICOSbx02 = styled(FlexDiv)`
  width:50%; padding:0 18px; justify-content:flex-start; font-size:14px; font-weight:400; color:#fff; flex-flow: row;
  
  img{ margin-right:15px;}
  &:nth-of-type(1){ background-image:url(${Lineimg}); background-repeat:no-repeat; background-position:right 50%;} 
  @media screen and (max-width: 1200px) {
    img {margin:0 10px 0 0;}
  }
`
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}
  @media screen and (max-width: 640px) {
    .Btn01{max-width: 65%}
  }
  @media screen and (max-width: 480px) {
    flex-flow: column-reverse; padding-bottom: 30px; padding-top: 30px;
    .Btn01{max-width: 100%; margin-bottom: 25px;}
  }
`

const SmallInfo = styled(FlexDiv)`
  font-size:12px; color:#a6a2b0; justify-content: flex-end; width:100%; margin-bottom:10px;
  p{ margin:0; padding:0; text-align:left; width:100%; max-width:430px;}
  span{ color:#fff; padding:0 0 0 3px;}
  @media screen and (max-width: 640px) {
    .Btn01{max-width: 65%}
    p {max-width: 65%;}
  }
  @media screen and (max-width: 480px) {
    p {max-width: 100%; text-align: center; margin-bottom: 10px;}
  }
`