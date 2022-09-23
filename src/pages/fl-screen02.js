import React, { PureComponent, lazy, Suspense } from "react";
import Web3 from 'web3';
import _ from "lodash";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import Lineimg from "../assets/freelisting-images/line01.png";
import { createWatcher, aggregate } from '@makerdao/multicall';

const multicallContractAddress = {
  1: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  3: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  4: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  5: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',  
  42: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
  137: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507',
  80001: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
  56: '0x41263cba59eb80dc200f3e2544eda4ed6a90e76c',
  97: '0xae11C5B5f29A6a25e955F0CB8ddCc416f522AF5C'
}

const rpcUrl = {
  1: 'https://mainnet.infura.io/v3/bf51999b809848e8811c620334a5e041',
  3: 'https://ropsten.infura.io/v3/bf51999b809848e8811c620334a5e041',
  4: 'https://rinkeby.infura.io/v3/bf51999b809848e8811c620334a5e041',
  5: 'https://goerli.infura.io/v3/bf51999b809848e8811c620334a5e041',
  42: 'https://kovan.infura.io/v3/bf51999b809848e8811c620334a5e041',
  137: 'https://polygon-mainnet.infura.io/v3/9e6392781fcc48af8e29b195fdf0ee77',
  80001: 'https://matic-mumbai.chainstacklabs.com',
  56: 'https://cold-white-glitter.bsc.quiknode.pro/f9c8b2b4bac83d7154566b17b7b054d61b0468ee',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545'  
}

const $ = window.$;
export default class Screen2 extends PureComponent {
  pendingNetworkSwitchRequest = false;
  constructor(props) {
    super();

    this.state = {
      tokens: [],
      filteredToken: "",
      selectedSource: {
        token: null,
        tokenAddress: null,
        tokenIcon: null,
        chain: null,
        chainId: null,
        chainIcon: null,
        explorerUrl: null
      },
      addCustomToken: false
    };

  }

  componentDidMount(){
    this.filterTokenByWalletBalance();
  }

  aggregateBalanceOfMultiCall = async(chainId, tokenAddresses = [], accountAddress) => {
    try {
      //accountAddress = '0x084374b068Eb3db504178b4909eDC26D01226a80';
      const config = {
        rpcUrl: rpcUrl[chainId],
        multicallAddress: multicallContractAddress[chainId]
      };
  
      const multicallTokensConfig = [];
      tokenAddresses.forEach(tokenAddress => {
          // will only work with erc20 token addresses
          var obj = {
            target: tokenAddress,
            call: ['balanceOf(address)(uint256)', accountAddress],
            returns: [['BALANCE_OF_' + tokenAddress, val => val / 10 ** 18]]
          }
          multicallTokensConfig.push(obj);
      });
  
      console.log(multicallTokensConfig);
      
      const response = await aggregate(
        multicallTokensConfig,
        config
      );
      
      Object.keys(response.results.transformed).forEach(token => {
        console.log(`${token} - ${response.results.transformed[token]}`)
        const tokenAddress = (token.substring(11)).toLowerCase();
        const isTokenExist = _.find(this.props.tokens, {
          address: tokenAddress,
          chainId: Number(chainId)
        });
        if(isTokenExist){
          if(response.results.transformed[token] > 0){
            this.setState(prevState => ({
              tokens: [...prevState.tokens, isTokenExist]
            }))
          }
        }
      });  
    } catch(error){
      console.error(error.message);
    }
  }

  async filterTokenByWalletBalance(){
    try {
      const groupedTokenByNetwork = this.props.tokens.reduce(function (r, token) {
          r[token.chainId] = r[token.chainId] || [];
          r[token.chainId].push(token.address);
          return r;
      }, Object.create(null));

      Object.keys(groupedTokenByNetwork).forEach(async(network) => {
        await this.aggregateBalanceOfMultiCall(network, groupedTokenByNetwork[network], this.props.accountAddress);
      });
    } catch(error) {
      console.error(error.message);
    }
  }

  async switchNetwork(token, tokenAddress, tokenIcon, chain, chainId, chainIcon, explorerUrl) {
    if(this.pendingNetworkSwitchRequest === false){
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
        this.pendingNetworkSwitchRequest = true;
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Web3.utils.toHex(chainId)}],
        }).then(response => {
          this.setState(sourceObject);
          this.pendingNetworkSwitchRequest = false;
        }).catch(error => {
          console.error(error);
          if(error.code === -32002){
            notificationConfig.info('A switch network request is pending. Check metamask.');
            this.pendingNetworkSwitchRequest = true;
          }
          this.pendingNetworkSwitchRequest = false;
        });
      } else {
        this.setState(sourceObject);
      }
    } else {
      notificationConfig.info('A switch network request is pending. Check metamask.');      
    }
  }

  setSourceToken(){
    if(this.pendingNetworkSwitchRequest === false){
      if(this.state.addCustomToken === false){
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
      } else {
        this.props.onAddCustomTokenClicked();      
      }
    } else {
      notificationConfig.info('A switch network request is pending. Check metamask.');            
    }
  }

  filterTokens = (token) => {
    this.setState({ filteredToken: (token).toUpperCase() });
  };

  getNetworkName = (chainId) => {
    const networkConfig = _.find(this.props.networks, {chainId: chainId});
    if(networkConfig !== undefined){
      return networkConfig.name
    } else {
      return 'CUSTOM'
    }
  }

  getNetworkIcon = (chainId) => {
    const networkConfig = _.find(this.props.networks, {chainId: chainId});
    if(networkConfig !== undefined){
      return networkConfig.icon
    } else {
      return 'default.png'
    }
  }

  addCustomTokenButtonClickedHandler = () => {
    this.setState({
      addCustomToken: !this.state.addCustomToken
    })     
  }

  render() {

    const filteredTokens = this.state.tokens.filter(token => {
      if(token.symbol.match(new RegExp(this.state.filteredToken, "i"))){
        return token;
      }
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
                  
                    {filteredTokens.map((token, i) => {
                      const network = _.find(this.props.networks, { chainId: token.chainId });
                      if(network !== undefined){
                        token['chain'] = network.name;
                        token['chainIcon'] = network.icon;
                        token['explorerUrl'] = network.explorerUrl;
                      }
                      var isSelectedToken = this.state.selectedSource.tokenAddress === null ? '' : ( 
                        (this.state.selectedSource.tokenAddress).toLowerCase() === (token.address).toLowerCase()
                        && 
                        Number(this.state.selectedSource.chainId) === Number(token.chainId)
                      ) ? 'selected' : '';
                      var isFeaturedToken = token.featured === true ? 'featured': 'not-featured';
                      var isFilteredToken = token.symbol.includes(this.state.filteredToken.length > 0 ? this.state.filteredToken : undefined) ? 'filtered-token' : '';
                      return (
                      <ProICOSbx01 
                        key={i} 
                        chainId={token.chainId} 
                        //className={`${isSelectedToken} ${isFeaturedToken} ${isFilteredToken}`}
                        className={`${isSelectedToken}`}
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
                          <img src={'/images/free-listing/tokens/' + ((token.icon).toString()).toLowerCase()} />{token.symbol}
                        </ProICOSbx02>
                        <ProICOSbx02> 
                            <img src={'/images/free-listing/chains/' + ((token.chainIcon).toString()).toLowerCase()} />{token.chain}
                        </ProICOSbx02>
                      </ProICOSbx01>
                      )
                    })}

                      <ProICOSbx01
                        key={this.state.tokens.length}
                        onClick={() => this.addCustomTokenButtonClickedHandler()}
                        className={this.state.addCustomToken === true ? 'selected' : ''}
                      >
                        <ProICOSbx02>
                          <img src={'/images/free-listing/tokens/' + (('default.png').toString()).toLowerCase()} />CUSTOM
                        </ProICOSbx02>
                        <ProICOSbx02> 
                            <img src={'/images/free-listing/chains/' + ((this.getNetworkIcon(this.props.chainId)).toString()).toLowerCase()} />{this.getNetworkName(this.props.chainId)}
                        </ProICOSbx02>
                      </ProICOSbx01>
                  </ProICOMbx02>

                </ProICOMbx01>

                <BtnMbox>
                  <button onClick={() => this.props.onBackButtonClicked(1)} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
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
  &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }, 
  &.featured{ display: flex;}
  &.not-featured{ display: none;}
  &.filtered-token{ display: flex;}
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






