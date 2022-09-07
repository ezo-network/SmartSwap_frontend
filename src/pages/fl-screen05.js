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
      }).then((response) => {
        this.props.onSwitchNetwork(Number(chainId));
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
      const bridgeContract = new BridgeContract(this.props.web3Instance, this.props.bridgeContractAddress);
      await bridgeContract.addWrappedTokenOnDestinationChain(
        this.state.addWrappedTokenSignedParams.token,
        this.state.addWrappedTokenSignedParams.chainID,
        this.state.addWrappedTokenSignedParams.decimals,
        this.state.addWrappedTokenSignedParams.name,
        this.state.addWrappedTokenSignedParams.symbol,
        this.state.addWrappedTokenSignedParams.signature,
        async (hash) => {
          console.log({
            hash: hash
          });

          if (hash !== null || hash !== undefined) {
            // update tx hash to db
          }
        },
        async (response) => {
          
          // handle response 
          console.log({
            "Contract response:": response
          });

          response = {
              "to": "0x20451Ef7dfb23520bF08344f516229E30eAa6378",
              "from": "0xA03476C7a7bd9eeEAcB0F4Cea7a8093cc2827EdD",
              "contractAddress": null,
              "transactionIndex": 3,
              "gasUsed": {
                  "type": "BigNumber",
                  "hex": "0x01e871"
              },
              "logsBloom": "0x00000000000000010000008000000000800000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000010003000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
              "blockHash": "0x1328b3a19f2998d0fb1bb481871e8f98e9c8e6d8e862462fc1df95a5072bc3f6",
              "transactionHash": "0xddef0352b1b39ec2d6c739bbbb9b90c11a644c6932a76adc355f13a04efe057b",
              "logs": [
                  {
                      "transactionIndex": 3,
                      "blockNumber": 22515012,
                      "transactionHash": "0xddef0352b1b39ec2d6c739bbbb9b90c11a644c6932a76adc355f13a04efe057b",
                      "address": "0x20451Ef7dfb23520bF08344f516229E30eAa6378",
                      "topics": [
                          "0xef4ec9b3cfaa22dd32688bf4ac3c820e8b468ffb6452f61717fb9d845f3c5263",
                          "0x000000000000000000000000000080383847bd75f91c168269aa74004877592f"
                      ],
                      "data": "0x00000000000000000000000000000000000000000000000000000000000000610000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000045a6574610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045a45544100000000000000000000000000000000000000000000000000000000",
                      "logIndex": 22,
                      "blockHash": "0x1328b3a19f2998d0fb1bb481871e8f98e9c8e6d8e862462fc1df95a5072bc3f6"
                  }
              ],
              "blockNumber": 22515012,
              "confirmations": 4,
              "cumulativeGasUsed": {
                  "type": "BigNumber",
                  "hex": "0x0bed71"
              },
              "effectiveGasPrice": {
                  "type": "BigNumber",
                  "hex": "0x02540be400"
              },
              "status": 1,
              "type": 0,
              "byzantium": true
          } 

          if (response.code === "ACTION_REJECTED"){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.reason);
          }
          
          if (response.code === "UNPREDICTABLE_GAS_LIMIT"){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.reason);
          }

          if (response.code === -32016){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.message);
          }

          if (response.status === 1) {
            await this.props.onTokenAddedSuccessfully(response.transactionHash)
          }

      });
    } catch (err) {
      console.error(err.message);
    }
  }

  async attachWrapToken(projectId = null, tokenName = null, chain = null, chainId = null) {
    try { 
      if(
        projectId == null
        ||
        tokenName == null
        ||
        chain == null
        ||
        chainId == null
      ){
        notificationConfig.error('Could not saved wrapped token.');
        return;
      }
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






