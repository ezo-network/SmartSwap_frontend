import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import Web3 from 'web3';
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";
import Collapse from "@kunukn/react-collapse";
import InputRange from 'react-input-range';
import CONSTANT from '../constants';
import swapFactoryAbi from '../abis/swapFactory.json';
import constantConfig from '../config/constantConfig';
import notificationConfig from '../config/notificationConfig';
import AxiosRequest from "../helper/axiosRequest";
import SwapFactoryContract from '../helper/swapFactoryContract';
var _ = require('lodash');

export default class LiquidityProvider extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config,
            coinList: tokenDetails,
            isOpen1: false,
            isOpen2: false,
            btnClick: false,
            web3: null,
            selectedTokenA: 'ETH',
            selectedTokenB: 'BNB',
            // input fields
            spAccount: null,
            networkId: null,
            tokenA: null,
            tokenB: null,
            amountA: null,
            walletAddressToSend: null,
            walletAddressToReceive: null,
            gasAndFeeAmount: 45000,
            spProfitPercent: 0.3,
            accumulateFundsLimit: 0.3,
            stopRepeatsMode: null,
            stopRepeatsOnDate: 'April 2,2021',
            stopRepeatsAfterCalls: 200,
            withdrawMode: null,
            withdrawOnDate: 'April 2,2021',
            withdrawAfterCalls: 250,
            cexApiKey: null,
            cexApiSecret: null,
            txid: null,
            smartSwapContractAddress: 'Deploy contract to get this address.',
            confirmed: false,
            deployed: false,
            deployButtonText: "DEPLOY SMART CONTRACT"
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        })

        // detect Network account change
        window.ethereum.on('networkChanged', networkId => {
            console.log('networkChanged', networkId);
            this.setState({
                web3: null
            });
        });

    }

    componentDidMount() {
        console.log(this.state.coinList)
        this.setState({
            web3Ethereum: new Web3(
                new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
            ),
            web3Binance: new Web3(
                new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
            ),
        });

        {
            // this.openPopup('About');
        } // temporary popup on

        this.setState({
            loading: true,
            tokenA: this.state.coinList[this.state.selectedTokenA]['address'],
            tokenB: this.state.coinList[this.state.selectedTokenB]['address']
        }, async() => {
            await this.initInstance();
        });

    }

    toggle = index => {
        let collapse = "isOpen" + index;
        this.setState(prevState => ({
            [collapse]: !prevState[collapse] }));
    };

    changeTokenA(token) {
        this.setState({
            selectedTokenB: this.state.selectedTokenA,
            tokenB: this.state.coinList[this.state.selectedTokenA]['address'],
            selectedTokenA: token,
            tokenA: this.state.coinList[token]['address'],
        });
    };

    changeTokenB(token) {
        this.setState({
            selectedTokenA: this.state.selectedTokenB,
            tokenA: this.state.coinList[this.state.selectedTokenB]['address'],
            selectedTokenB: token,
            tokenB: this.state.coinList[token]['address'],
        });
    };

    async connectWallet() {
        this.setState({ btnClick: true });
        await web3Config.connectWallet(0);
        let networkId = web3Config.getNetworkId();
        if (!constantConfig.allowedNetwork.includes(networkId)) {
            notificationConfig.error('Please Select Ethereum or BSC Main Network');
            this.setState({ btnClick: false });
            return;
        }
        if (
            constantConfig.tokenDetails[this.state.selectedTokenA].networkId !==
            networkId &&
            (networkId === 97 || networkId === 56)
        ) {
            notificationConfig.warning('Change metamask network to Ethereum!');
            return;
        } else if (
            constantConfig.tokenDetails[this.state.selectedTokenA].networkId !==
            networkId &&
            (networkId === 42 || networkId === 1)
        ) {
            notificationConfig.warning('Change metamask network to Binance!');
            return;
        }
        this.setState({
            web3: web3Config.getWeb3(),
            btnClick: false,
            networkId: networkId,
            spAccount: web3Config.getAddress()
        });
    }

    async initInstance() {
        let { web3Binance, web3Ethereum } = this.state;
        let instanceSwapFactoryBinance = null;
        let instanceSwapFactoryEthereum = null;
        instanceSwapFactoryBinance = new web3Binance.eth.Contract(
            swapFactoryAbi,
            constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract
        );
        instanceSwapFactoryEthereum = new web3Ethereum.eth.Contract(
            swapFactoryAbi,
            constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract
        );

        this.setState({
            instanceSwapFactoryBinance,
            instanceSwapFactoryEthereum
        });
    }

    async deployContract(event){
        
        // set this to disable deploy button
        this.setState({
            deployed: true,
            deployButtonText: "Deploying..."
        });

        console.log(`deploying contact on network - ${web3Config.getNetworkId()}`)
        console.log(this.state.spProfitPercent);

        let args = {
            // data: {
            //     spAccount: this.state.spAccount,
            //     networkId: this.state.networkId,
            //     tokenA: this.state.tokenA,
            //     tokenB: this.state.tokenB,
            //     amountA: this.state.amountA,
            //     walletAddressToSend: this.state.walletAddressToSend,
            //     walletAddressToReceive: this.state.walletAddressToReceive,
            //     gasAndFeeAmount: this.state.gasAndFeeAmount,
            //     spProfitPercent: this.state.spProfitPercent,
            //     accumulateFundsLimit: this.state.accumulateFundsLimit,
            //     stopRepeatsMode: this.state.stopRepeatsMode,
            //     stopRepeatsOnDate: this.state.stopRepeatsOnDate,
            //     stopRepeatsAfterCalls: this.state.stopRepeatsAfterCalls,
            //     withdrawMode: this.state.withdrawMode,
            //     withdrawOnDate: this.state.withdrawOnDate,
            //     withdrawAfterCalls: this.state.withdrawAfterCalls,
            //     cexApiKey: this.state.cexApiKey,
            //     cexApiSecret: this.state.cexApiSecret
            // },
            data: {
                spAccount: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
                networkId: 42,
                tokenA: '0x0000000000000000000000000000000000000002',
                tokenB: '0x0000000000000000000000000000000000000001',
                amountA: 100,
                walletAddressToSend: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
                walletAddressToReceive: '0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8',
                gasAndFeeAmount: 10,
                spProfitPercent: 0.3,
                accumulateFundsLimit: 0.5,
                stopRepeatsMode: 3,
                stopRepeatsOnDate: 'April 2,2021',
                stopRepeatsAfterCalls: 0,
                withdrawMode: 3,
                withdrawOnDate: 'April 2,2021',
                withdrawAfterCalls: 0,
                cexApiKey: '00000000ab',
                cexApiSecret: '00000000yz'
            },            
            path: 'become-swap-provider',
            method: 'POST'
        };

        let response = await AxiosRequest.request(args);

        if(response.status == 201){
            console.log('record created!');
            let networkID = response.data.networkId;
            let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), this.state.networkId);
            swapFactory.addSwapProvider(
                response.data.tokenA.address,
                response.data.tokenB.address,
                response.data.walletAddresses.toSend,
                response.data.walletAddresses.toReceive,
                response.data.gasAndFeeAmount,
                (hash) => {
                    this.setState({
                        txid: response.data._id,
                    });
                },
                (response) => {
                    console.log({
                        "Contract response:": response
                    });
                    // this.init()
                    this.setState({
                        confirmed: true,
                        deployButtonText: "Contract Deployed"
                        // showLedger: true,
                        // wrapBox: "success"
                    });
                    notificationConfig.success('Swap provider Added');
                }
            );
        }


    }
    
    render() {

        return (
            <div className="main-Popup wallet-Popup" id="LiquidityProvider">
                <div className="container-Grid">
                    <div className="LiProTitle01">Become a Swap Provider</div>

                    <div className="LiProFormMbox">

                        <div className="LiProfSbox01">
                            <div className="LiProTitle02">SEND</div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProTitle02">RECEIVED</div>
                        </div>
                        <div className="LiProfSbox01 smFixer01">
                            <div className="LiProLable">Choose the amount of token A to sell on Smartswap</div>
                            <div className="bspMBX01 smFixer06">
                                <div className="bspSBX01">
                                    <div className="LiproInput01">
                                        <input type="text" defaultValue='' placeholder="Amount" onChange={event => this.setState({amountA: event.target.value})}  />
                                    </div>
                                </div>
                                <div className="bspSBX01">
                                    <div className="LiproDropdown">
                                        <button className='LiproDDbtn01' onClick={() => this.toggle(1)} >
                                            <div className="ddIconBX"> <span> <img src={this.state.coinList[this.state.selectedTokenA]['icon']} alt="" /></span> {this.state.coinList[this.state.selectedTokenA]['symbol']}</div>
                                            <i className="fas fa-caret-down"></i>
                                        </button>
                                        <div className="ddContainer">
                                            <Collapse isOpen={this.state.isOpen1} className={"collapse-css-transition"} >
                                                {
                                                    Object.keys(this.state.coinList).map((coin)=>(
                                                        this.state.selectedTokenA != this.state.coinList[coin]['symbol'] && 
                                                        (this.state.coinList[coin]['approveRequire'] == false) &&
                                                        <button 
                                                            onClick={() => {
                                                                this.changeTokenA(this.state.coinList[coin]['symbol']);
                                                            }}  
                                                            key={this.state.coinList[coin]['symbol']} className='LiproDDbtn01'
                                                        >
                                                            <div className="ddIconBX"> <span> <img src={this.state.coinList[coin]['icon']} alt="" /></span> {this.state.coinList[coin]['symbol']}</div>
                                                        </button>
                                                    ))
                                                }
                                            </Collapse>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="FlyICO03"> {"<>"} </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Choose token B to receive from SmartSwap</div>
                            <div className="LiproDropdown">
                                <button className='LiproDDbtn01' onClick={() => this.toggle(2)} >
                                    <div className="ddIconBX"> <span> <img src={this.state.coinList[this.state.selectedTokenB]['icon']} alt="" /></span> {this.state.coinList[this.state.selectedTokenB]['symbol']}</div>
                                    <i className="fas fa-caret-down"></i>
                                </button>
                                <div className="ddContainer">
                                    <Collapse isOpen={this.state.isOpen2} className={"collapse-css-transition"} >
                                    {
                                        Object.keys(this.state.coinList).map((coin)=>(
                                            (this.state.selectedTokenB != this.state.coinList[coin]['symbol']) && 
                                            (this.state.coinList[coin]['approveRequire'] == false) &&
                                            <button 
                                                onClick={() => {
                                                    this.changeTokenB(this.state.coinList[coin]['symbol']);
                                                }} 
                                                key={this.state.coinList[coin]['symbol']} className='LiproDDbtn01'
                                            >
                                                <div className="ddIconBX"> <span> <img src={this.state.coinList[coin]['icon']} alt="" /></span> {this.state.coinList[coin]['symbol']}</div>
                                            </button>
                                        ))
                                    }
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                        <div className="LiProfSbox01">
                            <div className="LiProLable">Wallet address that send token A<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter the wallet that will become a Swap Provider" aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input type="text" defaultValue='' onChange={event => this.setState({walletAddressToSend: event.target.value})}  />
                            </div>
                        </div>
                        <div className="LiProfSbox02">
                            <div className="LiProLable">Wallet address that receive token B<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Enter the wallet that receives SP results and rewards, on same CEX such Binacne it may be the same wallet address as the one that send token A, but on some other CEX they may have two different wallets, one to send fund our and another to receive fund in." aria-hidden="true"></i></i></div>
                            <div className="LiproInput01">
                                <input type="text" defaultValue='' onChange={event => this.setState({walletAddressToReceive: event.target.value})}   />
                            </div>
                        </div>

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">GAS AND FEES</div>
                            <div className="LiProLable mtFix01">Set the maximum amount which the smart contract is authorized to withdraw from your CEX account to cover the gas and fees. Once the total is reached, the contract stops performing until reauthorized with a new limit</div>
                            <div className="dragorInput v2">
                                <InputRange
                                    maxValue={100000}
                                    minValue={100}
                                    value={this.state.gasAndFeeAmount}
                                    formatLabel={value => `$${value}`}
                                    onChange={value => this.setState({ gasAndFeeAmount: value })} />
                            </div>

                        </div>

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">REPEAT</div>
                        </div>

                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum that you want to gain on each repeat <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Set a profit limit before funds are sent out to be swapped. </br></br>

For example, you can choose that you want your funds to swap only if it's gain 0.1% or 0.5% profits.  When you set the profit limit, take under consideration all the costs that you may pay to your CEX for such transaction" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <input type="text" defaultValue={this.state.spProfitPercent} onChange={event => this.setState({spProfitPercent: event.target.value})} />
                                    <span>%</span>
                                </div>
                                <div className="smlInfotxt01">[0.161754 BNB/ETH]</div>
                            </div>
                        </div>


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Choose the minimum funds to accumulate before calming it back  
to your CEX account<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="If you choose to accumulate 100% of the funds before withdrawing it from the smart contract to your CEX account, you will only pay gas once for one transaction. If you choose to trigger a withdraw from the smart contract to your CEX account every time there is accumulation of 10%, you should expect to pay 10x gas fees for 10 transactions " aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01 withLable01">
                                    <input type="text" defaultValue={this.state.accumulateFundsLimit} onChange={event => this.setState({accumulateFundsLimit: event.target.value})} />
                                    <span>%</span>
                                </div>
                                <div className="smlInfotxt02">Based on minimum 10% accumulation, expect to pay 10x gas cost  </div>
                            </div>
                        </div>

                        {/* <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Sell token B for token A on CEX using</div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="gwFormSFormbox02">
                                    <div className="md-radio md-radio-inline">
                                        <input type="radio" id="radio145" name="stepin50" value="option146" /><label for="radio145">
                                            Market<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text Here" aria-hidden="true"></i></i>
                                        </label>
                                    </div>

                                    <div className="md-radio md-radio-inline">
                                        <input type="radio" id="radio146" name="stepin50" value="option145" /><label for="radio146">
                                            Limit<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text Here" aria-hidden="true"></i></i>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className='spacerLine'></div>
                        <div className="LiProfSbox03">
                            <div className="LiProTitle02">WITHDRAW</div>
                        </div>

                        <div className='LiProFlexBX01 tabFixer smFixer02' style={{alignItems: 'flex-start'}}>
                            <div className="LiProfSbox01" style={{paddingTop: '10px'}}>
                                <div className="LiProLable">Stop repeat on CEX <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how many transactions you approve as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stops, there is no way to change the process besides deploying a new Swap Provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">

                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio" checked id="s01" name="s11" value="s01" onChange={event => this.setState({stopRepeatsMode: 1})} />
                                        <label htmlFor="s01"></label>
                                    </div> 
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <input type="text" defaultValue={this.state.stopRepeatsOnDate} onChange={event => this.setState({stopRepeatsOnDate: event.target.value})}  />
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s02" name="s11" value="s02" onChange={event => this.setState({stopRepeatsMode: 2})} />
                                        <label htmlFor="s02"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input type="text" defaultValue={this.state.stopRepeatsAfterCalls} onChange={event => this.setState({stopRepeatsAfterCalls: event.target.value})} />
                                            <div className="FlyICO02">Days</div>
                                            <span>Repeat</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s03" name="s11" value="s03" onChange={event => this.setState({stopRepeatsMode: 3})} />
                                        <label htmlFor="s03"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                       <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account " aria-hidden="true"></i></i></div>
                                    </div>
                                </div>
 
                            </div>
                        </div>


                        <div className='LiProFlexBX01 tabFixer smFixer02'  style={{alignItems: 'flex-start'}}>
                            <div className="LiProfSbox01" style={{paddingTop: '10px'}}>
                                <div className="LiProLable">Withdraw from Smartswap<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="This option denotes how long you wish your funds to be used as a Swap Provider. Once the limit is reached, the API stops performing any repeats. Once the repeat stop, there is no way to change it besides to deploy a new swap provider contract with new rules." aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02"> 
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio" checked id="s04" name="s12" value="s04" onChange={event => this.setState({withdrawMode: 1})} />
                                        <label htmlFor="s04"></label>
                                    </div> 
                                    <div className='LiProFlexBX01 padFixer01'>
                                        <div className="LiproInput01">
                                            <input type="text" defaultValue={this.state.withdrawOnDate} onChange={event => this.setState({withdrawOnDate: event.target.value})}/>
                                            <i class="fas fa-calendar-alt FlyICO"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s05" name="s12" value="s05" onChange={event => this.setState({withdrawMode: 2})}  />
                                        <label htmlFor="s05"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                        <div className="LiproInput01 withLable02">
                                            <input type="text" defaultValue={this.state.withdrawAfterCalls} onChange={event => this.setState({withdrawAfterCalls: event.target.value})}  />
                                            <div className="FlyICO02">Days</div>
                                            <span>Repeat</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='LipRadioFix01' >
                                    <div className="md-radio md-radio-inline ">
                                        <input type="radio"  id="s06" name="s12" value="s06" onChange={event => this.setState({withdrawMode: 3})}  />
                                        <label htmlFor="s06"></label>
                                    </div> 
                                    <div className="LiProFlexBX01 padFixer01">
                                       <div className="LipRTitle01">Never stop<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Run SP repeats non-stop as long as there is funds available in your CEX account " aria-hidden="true"></i></i></div>
                                    </div>
                                </div>
 
                            </div>
                        </div>

                        <div className='spacerLine'></div>
                        {/* <div className="LiProfSbox03">
                            <div className="LiProTitle02">WITHDRAW</div>
                        </div> */}


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">API Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific API key to the CEX of your choice" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01">
                                    <input type="text" defaultValue='' onChange={event => this.setState({cexApiKey: event.target.value})} />
                                </div>
                            </div>
                        </div>


                        <div className='LiProFlexBX01 smFixer07'>
                            <div className="LiProfSbox01">
                                <div className="LiProLable">Security Key<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Add your specific Security Key to the CEX of your choice" aria-hidden="true"></i></i></div>
                            </div>
                            <div className="LiProfSbox02">
                                <div className="LiproInput01">
                                    <input type="text" defaultValue='' onChange={event => this.setState({cexApiSecret: event.target.value})}  />
                                </div>
                            </div>
                        </div>

                        {
                            (this.state.web3 === null ||
                            constantConfig.tokenDetails[
                                this.state.selectedTokenA
                            ].networkId !== web3Config.getNetworkId())
                            ? 
                            (<div className="LiProfSbox03">
                                <div className='LiProformBTNbar'>
                                    
                                    <button onClick={this.connectWallet.bind(this)}>CONNECT YOUR WALLET</button>
                                </div>
                            </div>) 
                            : 
                            (<div className="LiProfSbox03">
                                <div className='LiProformBTNbar'>                                    
                                    <button onClick={this.deployContract.bind(this)} disabled={this.state.deployed}>
                                        {this.state.deployButtonText}
                                    </button>
                                </div>
                            </div>)
                        }
                    </div>

                    <div className='spacerLine'></div>
                    {(this.state.confirmed === true) &&
                    <div>
                        <div className="LiProTitle03">Below is your Swap Provider smart contract address
                            <span>Whitelist this smart contract address on your account on your CEX<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Follow the instructions on your CEX to whitelist the SmartSwap address below" aria-hidden="true"></i></i></span>
                        </div>

                        <div className="spContrlMBX">
                            <div className='spCountrlTitle01'>SEND <span>{this.state.selectedTokenA}</span> {'<>'} RECEIVE <span>{this.state.selectedTokenB}</span></div>
                            <div className='spContrlInputBX'>
                                <i>></i>
                                <input type="text" value={this.state.smartSwapContractAddress} /> 
                                <a href="#" class="LicCopyBTN v2"><i class="fas fa-copy"></i></a>
                            </div>
                            <div className='spContrlInfotxt'>
                            Created at April 6,2021 05:21:36pm UTC &nbsp;&nbsp;&nbsp;&nbsp; Balance:  425.563 BNB | $4,846 USDT
                                <span>Withdraw all funds back to your CEX account</span>
                            </div>
                            <div className='spContrlInfotxt02'>AUTHORIZE NEW GAS AND FEES LIMIT<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." aria-hidden="true"></i></i></div>
                            <div className='spContrlSBX'>

                                <div className='spContrlSSBX01'>
                                <div className="dragorInput v2">
                                    <InputRange
                                        maxValue={100000}
                                        minValue={100}
                                        value={this.state.gasAndFeeAmount}
                                        formatLabel={value => `$${value}`}
                                        onChange={value => this.setState({ gasAndFeeAmount: value })} />
                                </div>
                                </div>
                                <div className='spContrlSSBX02'>
                                    <button className='spContrlBTN01'>AUTHORIZE NEW LIMIT</button>
                                </div> 
                            </div> 
                        </div>
                    </div>
                    }
                    {/* <div className="spContrlMBX">
                    <div className='spCountrlTitle01'>SEND <span>{this.state.selectedTokenA}</span> {'<>'} RECEIVE <span>{this.state.selectedTokenB}</span></div>
                        <div className='spContrlInputBX'>
                            <i>2</i>
                            <input type="text" value='0xF3B3f6F15d474C92cb4051c22697C371e6e117B1' />
                            <a href="#" class="LicCopyBTN v2"><i class="fas fa-copy"></i></a>
                        </div>
                        <div className='spContrlInfotxt'>
                        Created at April 6,2021 05:21:36pm UTC &nbsp;&nbsp;&nbsp;&nbsp; Balance:  425.563 BNB | $4,846 USDT
                            <span>Withdraw all funds back to your CEX account</span>
                        </div>
                        <div className='spContrlInfotxt02'>AUTHORIZE NEW GAS AND FEES LIMIT<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Authorize more funds to gas and fees to keep your SP contract active." aria-hidden="true"></i></i></div>
                        <div className='spContrlSBX'>

                            <div className='spContrlSSBX01'>
                            <div className="dragorInput v2">  
                                <InputRange
                                    maxValue={100000}
                                    minValue={100}
                                    value={this.state.gasAndFeeAmount}
                                    formatLabel={value => `$${value}`}
                                    onChange={value => this.setState({ gasAndFeeAmount: value })} />
                            </div>
                            </div>
                            <div className='spContrlSSBX02'>
                                <button className='spContrlBTN01'>AUTHORIZE NEW LIMIT</button>
                            </div> 
                        </div> 
                    </div> */}
                </div>
                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("LiquidityProvider") }} className="close-Icon"></a>
            </div>
        )

    }

}