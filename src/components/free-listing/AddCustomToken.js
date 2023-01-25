import {WalletContext} from '../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import _ from "lodash";
import web3Js from 'web3';
import notificationConfig from "../../config/notificationConfig";
import styled from 'styled-components';
import { LoopCircleLoading } from 'react-loadingg';
import ERC20TokenContract from "../../helper/erc20TokenContract";
import { goToExplorer } from '../../helper/utils';
const $ = window.$;


export default class AddCustomToken extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      btnClicked: false,
      networks: props.networks,
      selectedSourceTokenData: {
        name: null,
        address: '',
        icon: null,
        chain: null,
        chainName: null,
        chainId: null,
        chainIcon: null,
        explorerUrl: null,
        decimals: null
      },
      isTokenExist: false
    }
  }

  componentDidMount() {
    const networkConfig = this.getNetworkConfig(this.context.chainIdNumber);
    if(networkConfig === undefined){
      notificationConfig.error('Current network not supported.');
      this.props.onBackButtonClicked(3);
      return;
    }

    this.setState({
      selectedSourceTokenData: { 
        name: 'CUSTOM',
        address: "",
        icon: 'default.png',
        chain: networkConfig.chain,
        chainName: networkConfig.name,
        chainId: networkConfig.chainId,
        chainIcon: networkConfig.icon,
        explorerUrl: networkConfig.explorerUrl,
        decimals: null
      }
    });
  }

  componentDidUpdate(){
    if(this.state.selectedSourceTokenData.chainId !== null){
      if(this.context.chainIdNumber !== this.state.selectedSourceTokenData.chainId){
        const networkConfig = this.getNetworkConfig(this.context.chainIdNumber);
        if(networkConfig === undefined){
          if(this.context.chainIdNumber === null){
            notificationConfig.warning('Reconnecting network');
          } else {
            notificationConfig.error('Current network not supported.');
          }
          this.props.onBackButtonClicked(3);
          return;
        }
    
        this.setState({
          selectedSourceTokenData: { 
            name: 'CUSTOM',
            address: "",
            icon: 'default.png',
            chain: networkConfig.chain,
            chainName: networkConfig.name,
            chainId: networkConfig.chainId,
            chainIcon: networkConfig.icon,
            explorerUrl: networkConfig.explorerUrl,
            decimals: null
          }
        });
      }
    }
  }

  setSourceTokenAddress(address) {
    if(web3Js.utils.isAddress(address)){
      this.setState(prevState => {
        const selectedSourceTokenData = prevState.selectedSourceTokenData;
        selectedSourceTokenData['address'] = address
        return {
          selectedSourceTokenData,
        };
      });        
    } else {
      this.setState(prevState => {
        const selectedSourceTokenData = prevState.selectedSourceTokenData;
        selectedSourceTokenData['address'] = ''
        return {
          selectedSourceTokenData,
        };
      });
      notificationConfig.error('Invalid Etherium Address.'); 
    }
  }

  getNetworkConfig = (chainId) => {
    const networkConfig = _.find(this.state.networks, {chainId: chainId});
    if(networkConfig !== undefined){
      return networkConfig
    }
  }

  getTokenInfo = async () => {
    try {
      if(web3Js.utils.isAddress(this.state.selectedSourceTokenData.address)){
        this.setState({
          btnClicked: true
        });
        console.log({
          web3: this.context.web3,
          sourceTokenAddress: this.state.selectedSourceTokenData.address
        });
        const erc20TokenContract = new ERC20TokenContract(this.context.web3, this.context.account, this.state.selectedSourceTokenData.address);
        await erc20TokenContract.getTokenInfo((response) => {
            console.log({
              getTokenInfoResponse: response
            });
            this.setState(prevState => {
              const selectedSourceTokenData = prevState.selectedSourceTokenData;
              selectedSourceTokenData['name'] = response.symbol;
              selectedSourceTokenData['decimals'] = response.decimals;
              return {
                btnClicked: false,
                selectedSourceTokenData,
                isTokenExist: true
              };
            });
        }, (error) => {
          console.log({
            getTokenInfoError: error
          });        
          this.setState({
            btnClicked: false
          });
          notificationConfig.error(error.error);
        });
      } else {
        notificationConfig.error('Invalid Etherium Address.'); 
      }

    } catch (error) {
      console.log(error);
    }
  }

  goToContractOnExplorer(explorerUrl, tokenAddress) {
    const isValidAddress = goToExplorer(explorerUrl, tokenAddress);
    if(isValidAddress === false){
      notificationConfig.error('Invalid Etherium Address.'); 
    }
  }

  setSourceToken(){
      if(
        this.state.selectedSourceTokenData.name == null
        ||
        this.state.selectedSourceTokenData.address == null
        ||
        this.state.selectedSourceTokenData.icon == null
        ||
        this.state.selectedSourceTokenData.chain == null
        ||
        this.state.selectedSourceTokenData.chainName == null        
        ||
        this.state.selectedSourceTokenData.chainId == null
        ||
        this.state.selectedSourceTokenData.chainIcon == null
        ||
        this.state.selectedSourceTokenData.explorerUrl == null
        ||
        this.state.selectedSourceTokenData.decimals == null
      ){
        notificationConfig.error('Please select a token first.');
        return;
      }
      
      this.setState({
        btnClicked: true
      });

      this.props.onSourceTokenSelected(
        this.state.selectedSourceTokenData.name,
        this.state.selectedSourceTokenData.address, 
        this.state.selectedSourceTokenData.icon, 
        this.state.selectedSourceTokenData.chain,
        this.state.selectedSourceTokenData.chainName,
        this.state.selectedSourceTokenData.chainId,
        this.state.selectedSourceTokenData.chainIcon,
        this.state.selectedSourceTokenData.explorerUrl,
        this.state.selectedSourceTokenData.decimals
      );
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
                  <i>2</i> Add the smart contract address of custom token
                </ProGTitle01>
                <ProInputbx> 
                  <input type="text" onChange={e => this.setSourceTokenAddress(e.target.value)} placeholder={this.state.selectedSourceTokenData.address} /> 
                </ProInputbx>
                <BtnMbox02>
                  <div>
                    <button className="Btn03">{this.state.selectedSourceTokenData.name} </button> | <button className="Btn03">{this.state.selectedSourceTokenData.chainName}</button>
                  </div>
                  <button onClick={() => this.goToContractOnExplorer(this.state.selectedSourceTokenData.explorerUrl, this.state.selectedSourceTokenData.address)} className="Btn04">Check the contract  <i className="fas fa-external-link-alt"></i></button>
                </BtnMbox02>
                <BtnMbox>
                  <button disabled={this.state.btnClicked} onClick={() => this.props.onBackButtonClicked(3)} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  
                  {this.state.isTokenExist === false &&
                  <button disabled={this.state.btnClicked} onClick={() => this.getTokenInfo()} className="Btn01">
                    {
                    this.state.btnClicked === true &&
                    <LoopCircleLoading
                        height={'20px'}
                        width={'20px'}
                        color={'#ffffff'}
                    />
                    }
                    GET TOKEN
                  </button>
                  }

                  {this.state.isTokenExist === true &&
                  <button onClick={() => this.setSourceToken()} className="Btn01">
                    USE TOKEN
                  </button>
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

AddCustomToken.contextType = WalletContext;

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;

const MContainer = styled(FlexDiv)` 
  width: calc(100% - 40px); max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  margin-top:90px;
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:55px;

    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
`

const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; flex-flow : row;
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px; flex-shrink: 0; } 
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
    flex-flow: column-reverse; padding-bottom: 30px; padding-top: 30px;
    .Btn01{max-width: 100%; margin-bottom: 25px;}
  }

`
const BtnMbox02 = styled(BtnMbox)`

border-top:none;   margin-top:0px;  padding-top:10px; margin-bottom:15px;

    .Btn04{ background-color:transparent; color:#91dc27; border:0; font-size:14px; font-weight:400; :hover{ color:#fff;}}
    .Btn03{ background-color:transparent; color:#a6a2b0; border:0; font-size:12px; font-weight:400; :hover{ color:#91dc27;}}

`


