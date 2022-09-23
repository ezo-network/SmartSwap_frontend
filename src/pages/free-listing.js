import React, { PureComponent, lazy, Suspense } from "react";
import web3Config from "../config/web3Config";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import HeadFreeListing from "../components/Header02";
import _ from "lodash";

import Screen01 from "./fl-screen01";
import Screen02 from "./fl-screen02";
import Screen03 from "./fl-screen03";
import Screen04 from "./fl-screen04";
import Screen05 from "./fl-screen05";
import Screen06 from "./fl-screen06";
import Screen07 from "./fl-screen07";
import Screen08 from "./fl-screen08";
import Screen09 from "./fl-screen09";
import Screen10 from "./fl-screen10";
import Screen11 from "./fl-screen11";
import AddCustomToken from "./addCustomToken"

import BridgeApiHelper from "../helper/bridgeApiHelper";

const $ = window.$;
export default class Projects extends PureComponent {
  constructor(props) {
    super();

    this.state = {
      web3Instance: null,
      walletConnected: false,
      accountAddress: null,
      chainId: null,
      isSourceTokenSelected: false,
      bridgeAddress: null,
      isProjectExist: null,
      projectId: null,
      sourceTokenData: {
        name: null,
        address: null,
        icon: null,
        chainIcon: null,
        chainId: null,
        chain: null,
        explorerUrl: null,
        txHash: null
      },
      filteredDestinationNetworks: [],
      isdestinationNetworksFiltered: false,
      networks: [],
      tokens: [],
      filteredTokens: [],
      wrappedTokens: [],
      showWrappedToken: false,
      claimDeployerOwnerShip: false,
      isEmailAddressExist: false,
      validatorAdded: false,
      ownershipTransfered: false,
      addCustomToken: false,
      addNewBridge: false,
      wantToBecomeMasterValidator: false
    };

    this.connectWallet = this.connectWallet.bind(this);
    this.walletConnectCallback = this.walletConnectCallback.bind(this);
    this.walletAlreadyConnectedCallback = this.walletAlreadyConnectedCallback.bind(this);
    this.startHereButtonClickedCallback = this.startHereButtonClickedCallback.bind(this);
    this.sourceTokenSelectedCallback = this.sourceTokenSelectedCallback.bind(this);
    this.tokenAddedOnSourceChainCallback = this.tokenAddedOnSourceChainCallback.bind(this);
    this.wrappedTokenFetchedCallback = this.wrappedTokenFetchedCallback.bind(this);
    this.destinationNetworksSelectedCallback = this.destinationNetworksSelectedCallback.bind(this)
    this.switchNetworkCallback = this.switchNetworkCallback.bind(this)
    this.backButtonClickedCallback = this.backButtonClickedCallback.bind(this);
    this.finishButtonClicked = this.finishButtonClicked.bind(this);
    this.addMoreBridgeButtonClicked = this.addMoreBridgeButtonClicked.bind(this)
    this.emailAddressExistCallback = this.emailAddressExistCallback.bind(this)
    this.addCustomTokenCallback = this.addCustomTokenCallback.bind(this)
  }

  async componentDidMount() {
    await this.getNetworkList();
    await this.getTokenList();
    await this.connectWallet();
  }

  componentDidUpdate(newProps) {
    if (typeof window.ethereum !== 'undefined') {
        // detect Network account change
        window.ethereum.on('chainChanged', networkId => {
            //console.log('chainChanged', networkId);
            this.connectWallet();
        });

        window.ethereum.on('accountsChanged', async(accounts) => {          
            //console.log('accountChanged', accounts);
            if(accounts.length > 0){
              await web3Config.connectWallet(0);
              this.walletConnectCallback(true, web3Config.getWeb3());
            } else {
              this.walletConnectCallback(false, null);              
            }
        });

        window.ethereum.on('disconnect', (error) => {
          this.walletConnectCallback(false, null);          
        });
    }
  }

  async connectWallet() {
    
    if (typeof window.ethereum == 'undefined') {
      console.log('MetaMask is not installed!');
      notificationConfig.error('Metamask not found.');
      return;
    }

    await web3Config.connectWallet(0).then(async(response) => {
      if(window.ethereum.isConnected() === true){
        if(response === true){
          this.walletConnectCallback(true, web3Config.getWeb3());
          //notificationConfig.success('Wallet connected');
        } else {
          notificationConfig.info('Wallet not connected to metamask');                  
        }
      } else {
        notificationConfig.info('Wallet not connected to metamask');        
      }
    }).catch(error => {
      console.log({
        error:error
      });
    });
  }

  walletConnectCallback(walletConnected, web3Instance) {
    this.setState({
      walletConnected: walletConnected,
      web3Instance: web3Instance,
      chainId: web3Config.getNetworkId(),
      accountAddress: web3Config.getAddress()
    });
  }

  walletAlreadyConnectedCallback(type){
    if(type === 1){
      this.setState({
        addNewBridge: true
      })    
    }    

    if(type === 2){
      this.setState({
        wantToBecomeMasterValidator: true
      })    
    }    

  }

  startHereButtonClickedCallback(){
    this.setState({
      claimDeployerOwnerShip: true
    })
  }

  emailAddressExistCallback(){
    this.setState({
      isEmailAddressExist: true
    });
  }

  addCustomTokenCallback(){
    this.setState({
      addCustomToken: true
    });
  }

  async sourceTokenSelectedCallback(sourceToken, sourceTokenAddress, sourceTokenIcon, sourceChain, sourceChainId, sourceChainIcon, explorerUrl) {
    await this.getBridge(sourceChainId).then(async () => {
      if (this.state.bridgeAddress !== null) {
        await this.isProjectExist(sourceChainId, sourceTokenAddress).then(async () => {

          this.setState(prevState => {
            const sourceTokenData = prevState.sourceTokenData;
            sourceTokenData['name'] = sourceToken;
            sourceTokenData['address'] = sourceTokenAddress;
            sourceTokenData['icon'] = sourceTokenIcon;
            sourceTokenData['chain'] = sourceChain;
            sourceTokenData['chainId'] = sourceChainId;
            sourceTokenData['chainIcon'] = sourceChainIcon;
            sourceTokenData['explorerUrl'] = explorerUrl;
            return {
              isSourceTokenSelected: true,
              sourceTokenData,
            };
          });

        });
      } else {
        notificationConfig.error('Bridge not found for selected network.');
      }
    });
  }

  async backButtonClickedCallback(onStep){

    if(onStep === 1){
      this.setState({
        addNewBridge: false
      });
    }

    if(onStep === 3){
      this.setState({
        isSourceTokenSelected: false,
        bridgeAddress: null,
        addCustomToken: false
      });
    }

    if(onStep === 2){
      this.setState({
        isSourceTokenSelected: false,
        addCustomToken: false
      });
      await this.getTokenList();
    }

    if(onStep === 4){
      this.setState({
        isdestinationNetworksFiltered: false,
        //filteredDestinationNetworks: []
      });
    }

    if(onStep === 8){
      this.setState({
        isEmailAddressExist: false
      });
    }

    if(onStep === 9){
      this.setState({
        validatorAdded: false,
        //filteredDestinationNetworks: []
      });
    }

    if(onStep === 10){
      this.setState({
        validatorAdded: true,
        //filteredDestinationNetworks: []
      });
    }

    if(onStep === 11){
      this.setState({
        ownershipTransfered: true
      });
    }
  }

  finishButtonClicked() {
    this.setState({
      showWrappedToken: true
    })
  }

  addMoreBridgeButtonClicked() {
    this.setState({
      isSourceTokenSelected: false,
      isdestinationNetworksFiltered: false,
      bridgeAddress: null,
      showWrappedToken: false,
      wrappedTokens: []
    });
  }

  async wrappedTokenFetchedCallback(wrappedTokens){
    this.setState({
      wrappedTokens: wrappedTokens
    });
  }
  
  async tokenAddedOnSourceChainCallback(txHash) {
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.createNewProject(
        this.state.accountAddress,
        this.state.sourceTokenData.name,
        this.state.sourceTokenData.address,
        this.state.sourceTokenData.chain,
        this.state.sourceTokenData.chainId,
        txHash
      );

      if(code === 201){
        console.log({
          createNewProject: response
        });
        this.setState({
          projectId: response
        });
        await this.isProjectExist(this.state.sourceTokenData.chainId, this.state.sourceTokenData.address);
      } else {
        console.error(error)
      }

    } catch (error){
      console.error(error)
    }    
  }

  destinationNetworksSelectedCallback(filteredDestinationNetworks){
    this.setState({
      filteredDestinationNetworks: filteredDestinationNetworks,
      isdestinationNetworksFiltered: true
    });
  }

  async switchNetworkCallback(chainId){
    await this.getBridge(chainId);
  }

  async getNetworkList(){
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.getNetworkList();
  
      if(code === 200){
        this.setState({
          networks: response
        });
      } else {
        console.error(error)
      }
    } catch (error){
      console.error(error)
    }
  }

  async getTokenList(){
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.getTokenList();
      
      if(code === 200){
        this.setState({
          tokens: response
        });
      } else {
        console.error(error)
      }

    } catch (error){
      console.error(error)
    }    
  }

  async getBridge(sourceTokenChainId){
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.getBridge(sourceTokenChainId);
  
      if(code === 200){
        this.setState({
          bridgeAddress: response.address
        });
      } else {
        console.error(error)
      }
    } catch (error){
      console.error(error)
    }
  }

  async isProjectExist(sourceTokenChainId, sourceTokenAddress) {
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.isProjectExist(sourceTokenChainId, sourceTokenAddress);
      
      if(code === 200){
        this.setState({
          isProjectExist: response
        });

        if(response === true){
          await this.getProject(sourceTokenChainId, sourceTokenAddress);
        }
      } else {
        console.error(error)
      }

    } catch (error){
      console.error(error)
    }
  }

  async getProject(sourceTokenChainId, sourceTokenAddress) {
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.getProject(sourceTokenChainId, sourceTokenAddress);
      
      if(code === 200){
        this.setState({
          projectId: response._id
        });

        this.setState(prevState => {
          const sourceTokenData = prevState.sourceTokenData;
          sourceTokenData['txHash'] = response.txHash;
          return {
            sourceTokenData,
          };
        });
      } else {
        console.error(error)
      }

    } catch (error){
      console.error(error)
    }
  }

  render() {
    return (
      <>
          <main id="main" className="smartSwap">
           
            <div className="main">  
                <HeadFreeListing />

                {this.state.addNewBridge === false && this.state.claimDeployerOwnerShip === false &&
                <Screen01
                  onWalletConnectButtonClick={this.connectWallet}
                  walletConnected={this.state.walletConnected}
                  claimDeployerOwnerShip={this.state.claimDeployerOwnerShip}
                  onStartHereButtonClick={this.startHereButtonClickedCallback}
                  onWalletAlreadyConnectButtonClick={this.walletAlreadyConnectedCallback}
                />
                }

                {
                  this.state.walletConnected === true && 
                  this.state.web3Instance !== null && 
                  this.state.isSourceTokenSelected === false &&
                  this.state.claimDeployerOwnerShip === false &&
                  this.state.addCustomToken ===  false &&
                  this.state.addNewBridge === true &&
                  <Screen02 
                    chainId={this.state.chainId} 
                    web3Instance={this.state.web3Instance} 
                    accountAddress={this.state.accountAddress}
                    onSourceTokenSelected={this.sourceTokenSelectedCallback}
                    networks={this.state.networks}
                    tokens={this.state.tokens}
                    onAddCustomTokenClicked={this.addCustomTokenCallback}
                    onBackButtonClicked={this.backButtonClickedCallback}
                  />
                }

                {
                  this.state.walletConnected === true &&
                  this.state.web3Instance !== null &&
                  this.state.isSourceTokenSelected === false &&
                  this.state.claimDeployerOwnerShip === false &&
                  this.state.addCustomToken ===  true &&
                  <AddCustomToken
                    chainId={this.state.chainId}
                    web3Instance={this.state.web3Instance}
                    accountAddress={this.state.accountAddress}
                    bridgeContractAddress={this.state.bridgeAddress}
                    networks={this.state.networks}
                    tokens={this.state.tokens}
                    onBackButtonClicked={this.backButtonClickedCallback}
                    onSourceTokenSelected={this.sourceTokenSelectedCallback}
                  />
                }

                {
                  this.state.walletConnected === true &&
                  this.state.web3Instance !== null &&
                  this.state.isSourceTokenSelected === true &&
                  this.state.isProjectExist === false &&
                  this.state.claimDeployerOwnerShip === false &&
                  <Screen03
                    chainId={this.state.chainId}
                    web3Instance={this.state.web3Instance}
                    bridgeContractAddress={this.state.bridgeAddress}
                    selectedSourceTokenData={this.state.sourceTokenData}
                    onBackButtonClicked={this.backButtonClickedCallback}
                    onTokenAddedSuccessfully={this.tokenAddedOnSourceChainCallback}
                  />
                }

                {
                  this.state.walletConnected === true &&
                  this.state.web3Instance !== null &&
                  this.state.isSourceTokenSelected === true &&
                  this.state.isProjectExist === true &&
                  this.state.isdestinationNetworksFiltered === false &&
                  this.state.claimDeployerOwnerShip === false &&
                  <Screen04
                    chainId={this.state.chainId}
                    web3Instance={this.state.web3Instance}
                    projectId={this.state.projectId}
                    networks={this.state.networks}
                    selectedSourceTokenChainId={this.state.sourceTokenData.chainId}
                    onBackButtonClicked={this.backButtonClickedCallback}
                    onDestinationNetworksSelected={this.destinationNetworksSelectedCallback}
                  />
                }


                {
                  this.state.walletConnected === true &&
                  this.state.web3Instance !== null &&
                  this.state.isSourceTokenSelected === true &&
                  this.state.isProjectExist === true &&
                  this.state.isdestinationNetworksFiltered === true &&
                  this.state.showWrappedToken === false &&
                  this.state.claimDeployerOwnerShip === false &&
                  <Screen05
                    chainId={this.state.chainId} 
                    web3Instance={this.state.web3Instance}
                    bridgeContractAddress={this.state.bridgeAddress}
                    accountAddress={this.state.accountAddress}
                    projectId={this.state.projectId}
                    networks={this.state.networks}
                    tokens={this.state.tokens}
                    selectedSourceTokenData={this.state.sourceTokenData}
                    selectedDestinationNetworks={this.state.filteredDestinationNetworks}
                    onWrappedTokensFetched={this.wrappedTokenFetchedCallback}
                    wrappedTokens={this.state.wrappedTokens}
                    onBackButtonClicked={this.backButtonClickedCallback}
                    onSwitchNetwork={this.switchNetworkCallback}
                    onFinishButtonClicked={this.finishButtonClicked}
                  />
                }


                {
                  this.state.walletConnected === true &&
                  this.state.web3Instance !== null &&
                  this.state.isSourceTokenSelected === true &&
                  this.state.isProjectExist === true &&
                  this.state.isdestinationNetworksFiltered === true &&
                  this.state.showWrappedToken === true &&
                  this.state.claimDeployerOwnerShip === false &&
                  <Screen06
                    chainId={this.state.chainId} 
                    web3Instance={this.state.web3Instance}
                    accountAddress={this.state.accountAddress}
                    projectId={this.state.projectId}
                    networks={this.state.networks}
                    wrappedTokens={this.state.wrappedTokens}
                    onAddMoreBridgeButtonClicked={this.addMoreBridgeButtonClicked}
                  />
                }


              {
                this.state.claimDeployerOwnerShip === true &&
                this.state.wantToBecomeMasterValidator === false &&
                <Screen07
                  onWalletConnectButtonClick={this.connectWallet}
                  walletConnected={this.state.walletConnected}
                  claimDeployerOwnerShip={this.state.claimDeployerOwnerShip}
                  wantToBecomeMasterValidator={this.state.wantToBecomeMasterValidator}
                  onWalletAlreadyConnectButtonClick={this.walletAlreadyConnectedCallback}
                />                  
              }

              {
                this.state.walletConnected === true && 
                this.state.claimDeployerOwnerShip === true &&
                this.state.wantToBecomeMasterValidator === true &&
                this.state.isEmailAddressExist === false &&
                <Screen08
                  wantToBecomeMasterValidator={this.state.wantToBecomeMasterValidator}
                  claimDeployerOwnerShip={this.state.claimDeployerOwnerShip}
                  accountAddress={this.state.accountAddress}
                  onEmailAddressExist={this.emailAddressExistCallback}
                />                  
              }

              {
                this.state.walletConnected === true && 
                this.state.claimDeployerOwnerShip === true &&
                this.state.isEmailAddressExist === true &&
                this.state.validatorAdded === false &&
                <Screen09
                  accountAddress={this.state.accountAddress}
                  onEmailAddressExist={this.emailAddressExistCallback}
                  onActiveValidatorButtonClick={this.backButtonClickedCallback}
                  onBackButtonClicked={this.backButtonClickedCallback}
                />                  
              }

              {
                this.state.walletConnected === true && 
                this.state.claimDeployerOwnerShip === true &&
                this.state.isEmailAddressExist === true &&
                this.state.validatorAdded === true &&
                this.state.ownershipTransfered === false &&
                <Screen10
                  web3Instance={this.state.web3Instance}
                  networks={this.state.networks}
                  tokens={this.state.tokens}
                  accountAddress={this.state.accountAddress}
                  onOwnershipTransfered={this.backButtonClickedCallback}
                  onBackButtonClicked={this.backButtonClickedCallback}
                />
              }

              {
                this.state.walletConnected === true && 
                this.state.claimDeployerOwnerShip === true &&
                this.state.isEmailAddressExist === true &&
                this.state.validatorAdded === true &&
                this.state.ownershipTransfered === true &&
                <Screen11/>
              }

            </div>
          </main>
      </>
    );
  }
}

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;
 