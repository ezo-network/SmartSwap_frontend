import {WalletContext} from '../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import notificationConfig from "../../config/notificationConfig";
import styled from 'styled-components';
import { LoopCircleLoading } from 'react-loadingg';
import BridgeContract from "../../helper/bridgeContract";
import errors from "../../helper/errorConstantsHelper";
const $ = window.$;

export default class VerifyAndAddToken extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      btnClicked: false 
    }
  }

  addToken = async () => {
    try {
      this.setState({
        btnClicked: true
      });
      console.log({
        web3: this.context.web3,
        bridgeContractAddress: this.props.bridgeContractAddress,
        sourceTokenAddress: this.props.selectedSourceTokenData.address
      });
      const bridgeContract = new BridgeContract(this.context.web3, this.context.account, this.props.bridgeContractAddress);
      await bridgeContract.addTokenOnSourceChain(this.props.selectedSourceTokenData.address, async (hash) => {
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

          // response = {
          //     "to": "0x20451Ef7dfb23520bF08344f516229E30eAa6378",
          //     "from": "0xA03476C7a7bd9eeEAcB0F4Cea7a8093cc2827EdD",
          //     "contractAddress": null,
          //     "transactionIndex": 3,
          //     "gasUsed": {
          //         "type": "BigNumber",
          //         "hex": "0x01e871"
          //     },
          //     "logsBloom": "0x00000000000000010000008000000000800000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000010003000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          //     "blockHash": "0x1328b3a19f2998d0fb1bb481871e8f98e9c8e6d8e862462fc1df95a5072bc3f6",
          //     "transactionHash": "0xddef0352b1b39ec2d6c739bbbb9b90c11a644c6932a76adc355f13a04efe057b",
          //     "logs": [
          //         {
          //             "transactionIndex": 3,
          //             "blockNumber": 22515012,
          //             "transactionHash": "0xddef0352b1b39ec2d6c739bbbb9b90c11a644c6932a76adc355f13a04efe057b",
          //             "address": "0x20451Ef7dfb23520bF08344f516229E30eAa6378",
          //             "topics": [
          //                 "0xef4ec9b3cfaa22dd32688bf4ac3c820e8b468ffb6452f61717fb9d845f3c5263",
          //                 "0x000000000000000000000000000080383847bd75f91c168269aa74004877592f"
          //             ],
          //             "data": "0x00000000000000000000000000000000000000000000000000000000000000610000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000045a6574610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045a45544100000000000000000000000000000000000000000000000000000000",
          //             "logIndex": 22,
          //             "blockHash": "0x1328b3a19f2998d0fb1bb481871e8f98e9c8e6d8e862462fc1df95a5072bc3f6"
          //         }
          //     ],
          //     "blockNumber": 22515012,
          //     "confirmations": 4,
          //     "cumulativeGasUsed": {
          //         "type": "BigNumber",
          //         "hex": "0x0bed71"
          //     },
          //     "effectiveGasPrice": {
          //         "type": "BigNumber",
          //         "hex": "0x02540be400"
          //     },
          //     "status": 1,
          //     "type": 0,
          //     "byzantium": true
          // } 

          if (response.code === "ACTION_REJECTED"){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.reason);
          }

          if (response.code === 4001){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.message);
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

          if (response.code === -32000 || response.code === -32603){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error("Intrinsic gas too low");
          }

          if(response.code === 'NOT_A_CONTRACT'){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(errors.erc20Errors.NOT_A_CONTRACT('Bridge', this.props.bridgeContractAddress));
          }

          if(
            response.code === 'CALL_EXCEPTION' 
            || response.code === 'INSUFFICIENT_FUNDS' 
            || response.code === 'NETWORK_ERROR' 
            || response.code === 'NONCE_EXPIRED' 
            || response.code === 'REPLACEMENT_UNDERPRICED'
            || response.code === 'UNPREDICTABLE_GAS_LIMIT'
          ){
            this.setState({
              btnClicked: false
            });
            notificationConfig.error(response.reason);            
          }

          if(response.code === 'TRANSACTION_REPLACED'){
            if(response.cancelled === false && response.receipt?.transactionHash){
              await this.props.onTokenAddedSuccessfully(response.receipt.transactionHash)
            }
          }

          if (response.status === 1) {
            await this.props.onTokenAddedSuccessfully(response.transactionHash)
          }

        });

    } catch (error) {
      console.log({addTokenError: error});
      console.log(error);
    }
  }

  goToContractOnExplorer(explorerUrl, tokenAddress) {
    window.open(explorerUrl + '/address/' + tokenAddress, "_blank");
  }

  render() {
    return (
      <>
        <main id="main" className="smartSwap">

          <div className="main">
            <MContainer>
              <CMbx>
                <ProgressBar> 
                  <span style={{ width: '50%' }}></span> 
                </ProgressBar>
                <ProGTitle01> 
                  <i>2</i> Verify the smart contract address 
                </ProGTitle01>
                <ProInputbx> 
                  <input type="text" value={this.props.selectedSourceTokenData.address} readOnly={true}/>
                </ProInputbx>
                <BtnMbox02>
                  <div>
                    <button disabled={true} className="Btn03 no-effect">{this.props.selectedSourceTokenData.name} </button> | <button disabled={true} className="Btn03 no-effect">{this.props.selectedSourceTokenData.chain}</button>
                  </div>
                  <button onClick={() => this.goToContractOnExplorer(this.props.selectedSourceTokenData.explorerUrl, this.props.selectedSourceTokenData.address)} className="Btn04">Check the contract  <i className="fas fa-external-link-alt"></i></button>
                </BtnMbox02>
                <BtnMbox>
                  <button disabled={this.state.btnClicked} onClick={() => this.props.onBackButtonClicked(3)} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  <button disabled={this.state.btnClicked} onClick={() => this.addToken()} className="Btn01">
                    {
                    this.state.btnClicked === true &&
                    <LoopCircleLoading
                        height={'20px'}
                        width={'20px'}
                        color={'#ffffff'}
                    />
                    }
                    ENABLE
                  </button>
                </BtnMbox>
              </CMbx>
            </MContainer>

          </div>
        </main>
      </>
    );
  }
}

VerifyAndAddToken.contextType = WalletContext;

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;

const MContainer = styled(FlexDiv)` 
  width: calc(100% - 40px); max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  margin-top:90px;
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
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; flex-flow : row;
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px; flex-shrink: 0; } 
    @media only screen and (max-width: 640px) {
      i{margin-right: 20px;}
    }
`
const ProInputbx = styled(FlexDiv)`
    width:100%;
    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
` 
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}
  @media screen and (max-width: 640px) {
    .Btn01{max-width: 50%}
  }
  @media screen and (max-width: 480px) {
    flex-flow: column-reverse; padding-bottom: 30px; padding-top: 30px; margin-top: 0;
    .Btn01{max-width: 100%; margin-bottom: 25px;}
  }
`
const BtnMbox02 = styled(BtnMbox)`
  border-top:none; margin-top:0px; padding-top:10px; margin-bottom:15px;
  .Btn04{ background-color:transparent; color:#91dc27; border:0; font-size:14px; font-weight:400; :hover{ color:#fff;}}
  .Btn03{ background-color:transparent; color:#a6a2b0; border:0; font-size:12px; font-weight:400; :hover{ color:#91dc27;}}
  @media screen and (max-width: 480px) {
    flex-flow: row; padding-bottom: 30px; padding-top: 30px;
  }
`  