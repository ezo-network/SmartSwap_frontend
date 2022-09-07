import React, { PureComponent, lazy, Suspense } from "react";
import _ from "lodash";
import Web3 from 'web3';
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import Lineimg from "../assets/freelisting-images/line01.png";
import addImg from "../assets/images/add-chain.png";
import BridgeApiHelper from "../helper/bridgeApiHelper";
import BridgeContract from "../helper/bridgeContract";


const $ = window.$;
export default class Screen5 extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      addWrappedTokenSignedParams: []
    };
  }

  async componentDidMount() {
    await this.getWrappedTokens(this.props.projectId);
  }

  async getWrappedTokens(sourceTokenChainId) {
    try {
      const {
        response,
        error,
        code
      } = await BridgeApiHelper.getWrappedTokens(sourceTokenChainId);

      if (code === 200) {
        this.props.onWrappedTokensFetched(response);
      } else {
        console.error(error)
      }

    } catch (error) {
      console.error(error)
    }
  }

  async switchNetwork(chainId) {
    if (Number(this.props.chainId) !== Number(chainId)) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(chainId) }],
      }).then(async(response) => {
      }).catch(error => {
        console.error(error);
      });
    } else {

    }
  }

  async activeToken() {
    try {
      const { response, error, code } = await BridgeApiHelper.activateToken(
        this.props.selectedSourceTokenData.chainId,
        this.props.selectedSourceTokenData.txHash
      );

      if (code === 200) {
        this.setState({
          addWrappedTokenSignedParams: response
        });
      } else {
        console.error({
          error: error,
          code: code
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  }


  async addWrappedTokenOnDestinationChain() {
    try {
      await this.activeToken();
    } catch (err) {
      console.error(err.message);
    }
  }

  render() {

    let networksData = [];
    const selectedDestinationNetworks = this.props.selectedDestinationNetworks;
    selectedDestinationNetworks.forEach(networkId => {
      const wrappedToken = _.find(this.props.wrappedTokens, { chainId: networkId });
      const networkConfig = _.find(this.props.networks, { chainId: networkId });
      let networkData = networkConfig;
      if (wrappedToken !== undefined) {
        networkData['wrappedTokenExist'] = true;
      } else {
        networkData['wrappedTokenExist'] = false;
      }
      networksData.push(networkData);
    });

    return (
      <>
        <main id="main" className="smartSwap">

          <div className="main">
            <MContainer>
              <CMbx>
                <ProgressBar>
                  <span style={{ width: '75%' }}></span>
                </ProgressBar>

                <ProGTitle01>
                  <i>4</i> Create a bridge
                </ProGTitle01>

                {networksData.length > 0 && networksData.map(function (network, i) {
                  return (
                    <ProRow key={i}>
                      <span className="labelNo">{i + 1}</span>
                      <ProRowCol1>
                        <ProICOTitle>Current chain</ProICOTitle>
                        <ProICOSbx01 className="selected">
                          <ProICOSbx02>
                            <img src={window.location.href + '/images/free-listing/tokens/' + this.props.selectedSourceTokenData.icon} />
                            {this.props.selectedSourceTokenData.name}
                          </ProICOSbx02>
                          <ProICOSbx02>
                            <img src={window.location.href + '/images/free-listing/chains/' + this.props.selectedSourceTokenData.chainIcon} />
                            {this.props.selectedSourceTokenData.chain}
                          </ProICOSbx02>
                        </ProICOSbx01>
                        <ProColImg><img src={addImg}></img></ProColImg>
                      </ProRowCol1>
                      <ProRowCol1>
                        <ProICOTitle>Destination chain </ProICOTitle>
                        <ProICOSbx01 className="selected">
                          <ProICOSbx02>
                            <img src={window.location.href + '/images/free-listing/tokens/' + this.props.selectedSourceTokenData.icon} />
                            sb{this.props.selectedSourceTokenData.name}
                          </ProICOSbx02>
                          <ProICOSbx02>
                            <img src={window.location.href + '/images/free-listing/chains/' + network.icon} />
                            {network.name}
                          </ProICOSbx02>
                        </ProICOSbx01>
                        <ProColBtn>
                          {network.wrappedTokenExist === true && (
                            <label className="Btn02"><i className="fa fa-check" aria-hidden="true"></i> Bridge Created</label>
                          )}
                          {network.wrappedTokenExist === false && Number(network.chainId) === Number(this.props.chainId) && (
                            <button onClick={e => this.addWrappedTokenOnDestinationChain()} className="Btn01">CREATE A BRIDGE</button>
                          )}
                          {network.wrappedTokenExist === false && Number(network.chainId) !== Number(this.props.chainId) && (
                            <button onClick={e => this.switchNetwork(network.chainId)} className="Btn01">SWITCH NETWORK</button>
                          )}
                        </ProColBtn>
                      </ProRowCol1>
                    </ProRow>
                  )
                }.bind(this))}

                <BtnMbox>
                  <button onClick={() => this.props.onBackButtonClicked(4)} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  <button className="Btn01">FINISH</button>
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

  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}

`

const ProRow = styled.div`
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
const ProRowCol1 = styled.div`
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
const ProColImg = styled.div`
  flex-grow: 1;
  text-align: center;
  width: calc(50% - 36px);
  `
const ProColBtn = styled.div`
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






