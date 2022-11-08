import React, { PureComponent, lazy, Suspense } from "react";
import Web3 from 'web3';
import _ from "lodash";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import Lineimg from "../assets/freelisting-images/line01.png";
import { createWatcher, aggregate } from '@makerdao/multicall';
import errors from "../helper/errorConstantsHelper";


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
        explorerUrl: null,
        decimals: null
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

      
      const networkConfig = _.find(this.props.networks, {chainId: Number(chainId)});
      console.log(networkConfig);

      const config = {
        rpcUrl: networkConfig.rpc,
        multicallAddress: networkConfig.multicallContractAddress
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
      
      Object.keys(response.results.transformed).forEach((token, index) => {
        const tokenAddress = (token.substring(11)).toLowerCase();
        const isTokenExist = _.find(this.props.tokens, {
          address: tokenAddress,
          chainId: Number(chainId)
        });
        if(isTokenExist){
          console.log(`${index} ${isTokenExist.symbol}  ${isTokenExist.chainId} - ${token} - ${response.results.transformed[token]}`)
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

  async addNetworkToWallet(chainId) {
    try {

      const networkConfig = _.find(this.props.networks, {chainId: Number(chainId)});

      if(networkConfig !== undefined){
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: Web3.utils.toHex(networkConfig.chainId),
            chainName: networkConfig.name,
            nativeCurrency: {
              name: networkConfig.nativeCurrencyName,
              symbol: networkConfig.nativeCurrencySymbol,
              decimals: networkConfig.nativeCurrencyDecimals
            },
            rpcUrls: [networkConfig.rpc],
            blockExplorerUrls: [networkConfig.explorerUrl]
          }]
        }).then((response) => {
          console.log({
            addNetworkToWalletResponse: response
          })
        }).catch((error) => {
          console.error({
            addNetworkToWalletError: error
          });
        });
      } else {
        console.error({
          addNetworkToWalletError: 'networkConfig undefined'
        });        
      }
      
    } catch (error) {
      console.error({
        addNetworkToWalletCatch: error
      });
    }
  }

  async switchNetwork(token, tokenAddress, tokenIcon, chain, chainId, chainIcon, explorerUrl, decimals) {
    if(this.pendingNetworkSwitchRequest === false){
      const sourceObject = {
        selectedSource: {
          token: token,
          tokenAddress: tokenAddress,
          tokenIcon: tokenIcon,
          chain: chain,
          chainId: chainId,
          chainIcon: chainIcon,
          explorerUrl: explorerUrl,
          decimals: decimals
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
        }).catch(async(error) => {
          console.error(error);
          if(error.code === -32002){
            notificationConfig.info(errors.switchRequestPending);
            this.pendingNetworkSwitchRequest = true;
          }

          if(error.code === 4902){
            notificationConfig.error(errors.metamask.networkNotFound);
            //await this.addNetworkToWallet(chainId, chain, token, token, decimals, explorerUrl, explorerUrl);
            //https://matic-mumbai.chainstacklabs.com
            await this.addNetworkToWallet(chainId);
          }

          this.pendingNetworkSwitchRequest = false;
        });
      } else {
        this.setState(sourceObject);
      }
    } else {
      notificationConfig.info(errors.switchRequestPending);      
    }
  }

  onBackButtonClicked(){
    if(this.pendingNetworkSwitchRequest === false){
      this.props.onBackButtonClicked(1)
    } else {
      notificationConfig.info(errors.switchRequestPending);            
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
          ||
          this.state.selectedSource.decimals == null
        ){
          notificationConfig.error(errors.tokenNotSelected);
          return;
        }
    
        this.props.onSourceTokenSelected(
          this.state.selectedSource.token,
          this.state.selectedSource.tokenAddress, 
          this.state.selectedSource.tokenIcon, 
          this.state.selectedSource.chain,
          this.state.selectedSource.chainId,
          this.state.selectedSource.chainIcon,
          this.state.selectedSource.explorerUrl,
          this.state.selectedSource.decimals
        );
      } else {
        this.props.onAddCustomTokenClicked();      
      }
    } else {
      notificationConfig.info(errors.switchRequestPending);
    }
  }

  filterTokens = (token) => {
    this.setState({ filteredToken: (token).toUpperCase() });
  };

  getNetworkName = (chainId) => {
    const networkConfig = _.find(this.props.networks, {chainId: chainId});
    if(networkConfig !== undefined){
      return networkConfig.chain
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
      if(
        token.symbol.match(new RegExp(this.state.filteredToken, "i")) 
        ||
        token.address.match(new RegExp(this.state.filteredToken, "i"))
      ){
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
                    placeholder="Search tokens by symbol or smart contract"
                    value={this.state.filteredToken}
                  />
                </ProInputbx>
                <ProICOMbx01>
                  <ProICOMbx02>
                  
                    {filteredTokens.map((token, i) => {
                      const network = _.find(this.props.networks, { chainId: token.chainId });
                      if(network !== undefined){
                        token['chain'] = network.chain;
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
                          token.explorerUrl,
                          token.decimals
                        )}
                      >
                        <ProICOSbx02> 
                          <img
                            alt={token.symbol} 
                            className="token-icon" 
                            src={'/images/free-listing/tokens/' + ((token.symbol).toString() + '.png').toLowerCase()}
                            onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                          />{token.symbol}
                        </ProICOSbx02>
                        <ProICOSbx02> 
                            <img
                              alt={token.chain}
                              className="chain-icon"
                              src={'/images/free-listing/chains/' + ((token.chainIcon).toString()).toLowerCase()} 
                              onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')}
                            />{token.chain}
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
                            <img 
                              src={'/images/free-listing/chains/' + ((this.getNetworkIcon(this.props.chainId)).toString()).toLowerCase()} 
                              onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')}
                            />{this.getNetworkName(this.props.chainId)}
                        </ProICOSbx02>
                      </ProICOSbx01>
                  </ProICOMbx02>

                </ProICOMbx01>

                <BtnMbox>
                  <button onClick={() => this.onBackButtonClicked()} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
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
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px; flex-shrink: 0;  } 
    @media only screen and (max-width: 640px) {
      i{margin-right: 20px;}
    }
`
const ProInputbx = styled(FlexDiv)`
    width:100%;
    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
`
const ProICOMbx01 = styled.div` width:100%; `
const ProICOMbx02 = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); column-gap: 36px; row-gap: 30px; margin:30px 0 0;
    /* align-items:flex-start; justify-content: flex-start;  */
`
const ProICOSbx01 = styled.button`
  /* width:calc(25% - 36px);  margin:0 18px 30px 18px;*/ background-color:#21232b; height:60px; border:0px; outline:none; padding:0;
  display: flex; align-items: center; justify-content: flex-start;
  :hover{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
  &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
  /* @media screen and (max-width: 991px) {
    width:calc(33.33% - 36px);
  }
  @media screen and (max-width: 575px) {
    width:calc(50% - 36px);
  }
  @media screen and (max-width: 480px) {
    width:100%;
  } */
` 
const ProICOSbx02 = styled(FlexDiv)`
  width:50%; padding:0 18px; justify-content:flex-start; font-size:14px; font-weight:400; color:#fff; flex-flow: row;
  img{ margin-right:15px; max-width: 30px; border-radius: 30px;}
  &:nth-child(01){ background-image:url(${Lineimg}); background-repeat:no-repeat; background-position:right 50%;} 
  @media screen and (max-width: 1200px) {
    /* flex-flow: column; align-items: center; justify-content: center; */
    /* img {margin:0 0 3px;} */
  }
  @media screen and (max-width: 767px) {
    /* flex-flow: row; justify-content: flex-start; */
    img {margin:0 10px 0 0;}
  }
  @media screen and (max-width: 480px) {
    /* flex-flow: row; justify-content: flex-start; */
    img {margin:0 15px 0 0;}
  }
`
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px; padding-bottom:20px;
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:0; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}
  @media screen and (max-width: 640px) {
    .Btn01{max-width: 50%}
  }
  @media screen and (max-width: 480px) {
    flex-flow: column-reverse; padding-bottom: 30px; padding-top: 30px;
    .Btn01{max-width: 100%; margin-bottom: 25px;}
  }
`