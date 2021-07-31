import React, { PureComponent, lazy, Suspense } from "react";
import InputRange from 'react-input-range';

import {
    Redirect,
} from 'react-router-dom';
import web3Js from 'web3';
import Web3 from "web3";
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import SwapFactoryContract from "../helper/swapFactoryContract";
import { LoopCircleLoading } from 'react-loadingg';
import CONSTANT from "../constants";
import data from "../config/constantConfig";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import WalletPopup from "../components/WalletPopup";
import CoinPopup from "../components/CoinPopup";
import SidePopup from "../components/SidePopup";
import Collapse from "@kunukn/react-collapse";
const $ = window.$;

export default class ownLicence extends PureComponent {
    constructor(props) {
        super();
        this.setSendCurrency = this.setSendCurrency.bind(this)
        this.setReceiveCurrency = this.setReceiveCurrency.bind(this)
        this.state = {
            value: 66,
            isOpen1: false,
            web3: null,
            web3Check: false,
            btnClick: false,
            swapFactory: null,
            swapLoading: false,
            selectedSendCurrency: "BNB",
            selectedReceiveCurrency: "ETH",
            instanceSwapFactoryBinance: null,
            instanceSwapFactoryEthereum: null,
            tokenInstance: {},
            txLink: "",
            wrapBox: "swap",
            txIdSent: null,
            txSentStatus: "pending",
            txSentTime: null,
            tokenReceive: "0",
            txReceiveTime: null,
            txIdReceive: null,
            txLinkSend: '',
            txLinkReturn: '',
            receiveFundAmount: "",
            sendFundAmount: "",
            actualSendFundAmount: 0,
            approxReceiveFundAmount: 0,
            showLedger: false,
            currencyPrices: {},
            estimatedGasFee: "0",
            tokenBalances: {
                "JNTR": 0,
                "JNTR/b": 0,
                "JNTR/e": 0,
                "JNTR_APPROVED": 0,
                "JNTR/b_APPROVED": 0,
                "JNTR/e_APPROVED": 0,
            }
        }
    }
    componentWillMount = async () => {
        await this.fetchPrice();
    }
    componentDidMount = async () => {
        this.setState({
            web3Ethereum: new Web3(new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)),
            web3Binance: new Web3(new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE))
        })
        this.setState({
            loading: true
        }, async () => {
            await this.initInstance();
        })
    };
    async initInstance() {
        let { web3Binance, web3Ethereum } = this.state;
        let instanceSwapFactoryBinance = null;
        let instanceSwapFactoryEthereum = null;
        instanceSwapFactoryBinance = new web3Binance.eth.Contract(swapFactoryAbi, constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract);
        instanceSwapFactoryEthereum = new web3Ethereum.eth.Contract(swapFactoryAbi, constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract);
        let tokenInstance = {};
        tokenInstance["JNTR"] = new web3Binance.eth.Contract(tokenAbi, "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A");
        tokenInstance["JNTR/b"] = new web3Binance.eth.Contract(tokenAbi, "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2");
        tokenInstance["JNTR/e"] = new web3Ethereum.eth.Contract(tokenAbi, "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042");
        this.setState({
            instanceSwapFactoryBinance,
            instanceSwapFactoryEthereum,
            tokenInstance
        }, () => {
            this.listenTransferEvent()
        });
    }
    updateTokenBalance = async () => {
        if (this.state.web3 !== null) {
            const { tokenInstance, tokenBalances, web3 } = this.state;
            // Balances
            tokenBalances["JNTR"] = web3Js.utils.fromWei(await tokenInstance["JNTR"].methods.balanceOf(web3Config.getAddress()).call(), "ether");
            tokenBalances["JNTR/b"] = web3Js.utils.fromWei(await tokenInstance["JNTR/b"].methods.balanceOf(web3Config.getAddress()).call(), "ether");
            tokenBalances["JNTR/e"] = web3Js.utils.fromWei(await tokenInstance["JNTR/e"].methods.balanceOf(web3Config.getAddress()).call(), "ether");
            // Approve Balances
            tokenBalances["JNTR_APPROVED"] = web3Js.utils.fromWei(await tokenInstance["JNTR"].methods.allowance(web3Config.getAddress(), "0x309208d15fba3207be6c760771ca3b4846e1be93").call(), "ether");
            tokenBalances["JNTR/b_APPROVED"] = web3Js.utils.fromWei(await tokenInstance["JNTR/b"].methods.allowance(web3Config.getAddress(), "0x309208d15fba3207be6c760771ca3b4846e1be93").call(), "ether");
            tokenBalances["JNTR/e_APPROVED"] = web3Js.utils.fromWei(await tokenInstance["JNTR/e"].methods.allowance(web3Config.getAddress(), "0xeaf41806fcc2a3893a662dbba7a111630f9f6704").call(), "ether");
            this.setState({
                tokenBalances: tokenBalances
            }, () => {
                this.forceUpdate();
                // this.updateButton()
            })
        }
    }
    async connectWallet() {
        this.setState({ btnClick: true });
        await web3Config.connectWallet(0);
        let networkId = web3Config.getNetworkId();
        if (!constantConfig.allowedNetwork.includes(networkId)) {
            notificationConfig.error("Please Select Kovan or BSC Test Network");
            this.setState({ btnClick: false });
            return
        }
        if (constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !== networkId && networkId === 97) {
            notificationConfig.warning("Change metamask network to Ethereum!")
            return
        } else if (constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !== networkId && networkId === 42) {
            notificationConfig.warning("Change metamask network to Binance!")
            return
        }
        this.setState({
            web3: web3Config.getWeb3(),
            btnClick: false
        }, () => {
            // this.changeCurrency(false)
            setInterval(() => {
                this.updateTokenBalance()
            }, 3000)
        })
    }
    async swap() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null)
            return 0
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        let { sendFundAmount } = this.state;
        if (sendFundAmount === "" || sendFundAmount === 0) {
            notificationConfig.error("Enter value to swap")
            return;
        }
        let actualSendFundAmount = (await this.getActualAmount(sendFundAmount, this.state.selectedSendCurrency)).toString()
        let value = 0, swapAmount = 0;
        try {
            value = web3Js.utils
                .toWei(actualSendFundAmount.toString());
        } catch (e) {
            value = (actualSendFundAmount * 10 ** 18).toFixed(0);
        }
        swapAmount = value;
        if (constantConfig.tokenDetails[this.state.selectedSendCurrency].approveRequire) {
            value = 0;
        }
        swapFactory.swap(CONSTANT.currencyAddresses[this.state.selectedSendCurrency], CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency], value, swapAmount, (hash) => {
            this.setState({
                swapLoading: true,
                txIdSent: hash,
                txLinkSend: data[networkId].explorer + "/tx/" + hash
            });
        }, () => {
            // this.init()
            this.setState({
                swapLoading: false,
                showLedger: true,
                wrapBox: "success"
            });
            notificationConfig.success("Swap Success");
        })
    }
    async approve() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null)
            return 0
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        swapFactory.approveJNTRTokenForSwapFactory(constantConfig.tokenDetails[this.state.selectedSendCurrency].address, constantConfig[networkId].swapFactoryContract, (hash) => {
            this.setState({
                approveLoading: true,
                // txIdSent: hash,
                // txLinkSend: data[networkId].explorer + "/tx/" + hash
            });
        }, () => {
            // this.init()
            this.setState({
                approveLoading: false,
                // showLedger: true,
                // wrapBox: "success"
            });
            notificationConfig.success("Approve Success");
        })
    }
    async estimateGasAndFee() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null)
            return 0
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        let { sendFundAmount } = this.state;
        if (sendFundAmount === "" || sendFundAmount === 0) {
            notificationConfig.error("Enter value to swap")
            return;
        }
        let actualSendFundAmount = (await this.getActualAmount(sendFundAmount, this.state.selectedSendCurrency)).toString()
        let value = 0, swapAmount = 0;
        try {
            value = web3Js.utils.toWei(actualSendFundAmount.toString());
        } catch (e) {
            value = (actualSendFundAmount * 10 ** 18).toFixed(0);
        }
        swapAmount = value;
        if (constantConfig.tokenDetails[this.state.selectedSendCurrency].approveRequire) {
            value = 0;
        }
        swapFactory.estimateSwapGasFee(CONSTANT.currencyAddresses[this.state.selectedSendCurrency], CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency], value, swapAmount, "350000", (estGas) => {
            this.setState({
                estimatedGasFee: estGas
            })
        })
    }
    async recivedToken(e) {
        let dollarAmount = Number(e.target.value)
        this.setState({
            sendFundAmount: dollarAmount
        }, () => {
            this.setAmount(dollarAmount)
        })
    }
    async setAmount(dollarAmount) {
        this.setState({
            actualSendFundAmount: await this.getActualAmount(dollarAmount, this.state.selectedSendCurrency),
            approxReceiveFundAmount: await this.getActualAmount(dollarAmount, this.state.selectedReceiveCurrency)
        }, () => {
            this.estimateGasAndFee()
        })
    }
    async getActualAmount(dollarAmount, currency) {
        if (dollarAmount <= 0)
            return 0;
        else
            return (dollarAmount / this.state.currencyPrices[currency])
    }
    async fetchPrice() {
        var { currencyPrices } = this.state;
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=usd`);
        const json = await response.json();
        currencyPrices["ETH"] = json["ethereum"]["usd"];
        currencyPrices["BNB"] = json["binancecoin"]["usd"];
        currencyPrices["JNTR/e"] = 0.062166;
        currencyPrices["JNTR/b"] = 0.054237;
        currencyPrices["JNTR"] = 0.5320;
        this.setState({
            currencyPrices
        })
    }
    changeCurrency(check) {
        // if(check && this.state.web3 === null){
        let selectedSendCurrency = this.state.selectedSendCurrency;
        let selectedReceiveCurrency = this.state.selectedReceiveCurrency;
        this.setState({
            selectedSendCurrency: selectedReceiveCurrency,
            selectedReceiveCurrency: selectedSendCurrency
        }, () => {
            if (this.state.sendFundAmount !== "")
                this.setAmount(this.state.sendFundAmount);
            this.forceUpdate()
        })
        // } else if(this.state.web3 !== null && check) {
        //     notificationConfig.warning("Please change metamask network!")
        // }
    }
    setSendCurrency(currency) {
        this.setState({ selectedSendCurrency: currency }, () => {
            this.closePopup("sendCurPop");
        })
    }
    setReceiveCurrency(currency) {
        this.setState({ selectedReceiveCurrency: currency }, () => {
            this.closePopup("receiveCurPop");
        })
    }
    openPopup(id) {
        $("#" + id).fadeIn();
    }
    closePopup(id) {
        $("#" + id).fadeOut();
    }
    changeWrapBox(which) {
        this.setState({
            wrapBox: which,
            txIdSent: null,
            txSentStatus: "pending",
            txSentTime: null,
            tokenReceive: "0",
            txReceiveTime: null,
            txIdReceive: null,
            txLinkSend: '',
            txLinkReturn: '',
            receiveFundAmount: "",
            sendFundAmount: "",
            actualSendFundAmount: 0,
            approxReceiveFundAmount: 0,
            showLedger: false
        })
    }
    async listenTransferEvent() {
        const { instanceSwapFactoryEthereum, instanceSwapFactoryBinance } = this.state;
        if (instanceSwapFactoryEthereum !== null) {
            instanceSwapFactoryEthereum.events.ClaimApprove({
                fromBlock: 'latest'
            }, function (error, event) {
                console.log(event);
            })
                .on("connected", function (subscriptionId) {
                    console.log(subscriptionId);
                })
                .on('data', function (event) {
                    console.log(event); // same results as the optional callback above
                    if ((event.returnValues.user).toLocaleLowerCase() === web3Config.getAddress().toLocaleLowerCase()) {
                        let txLinkReturn = constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].explorer + '/tx/' + event.transactionHash;
                        let returnAmount = web3Js.utils.fromWei((event.returnValues.amountA).toLocaleLowerCase());
                        this.updateLedgerAfterResponse(event.transactionHash, txLinkReturn, returnAmount)
                    }
                }.bind(this))
                .on('changed', function (event) {
                    console.log(event)
                    // remove event from local database
                })
                .on('error', function (error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    console.log(error, receipt)
                });
        }
        if (instanceSwapFactoryBinance !== null) {
            let { web3Binance } = this.state;
            let initialBlock = await web3Binance.eth.getBlockNumber();
            setInterval(async () => {
                const currentBlock = await web3Binance.eth.getBlockNumber();
                instanceSwapFactoryBinance.getPastEvents("allEvents",
                    {
                        fromBlock: initialBlock,
                        toBlock: currentBlock // You can also specify 'latest'          
                    })
                    .then(async function (result) {
                        for (let i = 0; i < result.length; i++) {
                            console.log(result[i].event)
                            if (result[i].event === "ClaimApprove") {
                                console.log(result[i])
                                if ((result[i].returnValues.user).toLocaleLowerCase() === web3Config.getAddress().toLocaleLowerCase()) {
                                    let txLinkReturn = constantConfig[CONSTANT.NETWORK_ID.BINANCE].explorer + '/tx/' + result[i].transactionHash;
                                    let returnAmount = web3Js.utils.fromWei(result[i].returnValues.amountA).toLocaleLowerCase();
                                    this.updateLedgerAfterResponse(result[i].transactionHash, txLinkReturn, returnAmount)
                                }
                            }
                        }
                    }.bind(this))
                    .catch((err) => console.error(err));
                initialBlock = currentBlock;
            }, 10000)
        }
    }
    updateLedgerAfterResponse(hash, txLinkReturn, returnAmount) {
        this.setState({
            isSendingOrder: false,
            txSentStatus: "Success",
            txSentTime: new Date().toUTCString(),
            tokenReceive: "2",
            txReceiveTime: new Date().toUTCString(),
            txIdReceive: hash,
            whichButton: "4",
            txLinkReturn: txLinkReturn,
            receiveFundAmount: returnAmount
        }, async () => {
            //   await this.enableInputs();
        })
    }
    scrollToLedger() {
        $("html").animate({ scrollTop: 650 });
    }

    toggle = index => {
        let collapse = "isOpen" + index;
        this.setState(prevState => ({ [collapse]: !prevState[collapse] }));
    };


    render() {
        return (
            <main id="main" className="smartSwap">
                <div className="fullscreen-bg">
                    <div className="fsbg_sad01"></div>
                    <div className="fsbg_container">
                        <video loop autoPlay muted className="fullscreen-bg__video" >
                            <source src="video/smartswap.webm" type="video/webm" />
                            <source src="video/smartswap.mp4" type="video/mp4" />
                            <source src="video/smartswap.ogv" type="video/ogg" />
                        </video>
                    </div>
                </div>
                <div className="main">
                    {/* <!--======================= RIGHT SIDE MENU =====================--> */}
                    <RightSideMenu web3={this.state.web3} web3Config={web3Config} ></RightSideMenu>
                    {/* <!--======================= RIGHT SIDE MENU END  =====================-->
                    <!--======================= HEADER START =====================--> */}
                    <Header web3={this.state.web3} web3Config={web3Config}></Header>
                    {/* <!--======================= HEADER END =====================--> */}
                    <div className="mainBlock">
                        {/* <!--======================= SWAP BLOCK START =====================--> */}
                        <div className="swap-Block">
                            <div className="container-Grid">
                                <div className="smeTitle01-v2">Get Your Own License For FREE</div>
                            </div>
                            <div className="swap-textBox">
                                <div className="container-Grid">
                                    <div className="gwFormMbox">
                                        <div className='gwFormLMbox'>
                                            <div className='gwFormSTitle01'><span>1</span> Set up your fees and reimbursement</div>

                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Do you want to charge your users a fee above our fee?</div>
                                                <div className="gwFormSFormbox02">
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="rr01" name="stepin46" value="option146" />
                                                        <label htmlFor="rr01">Yes </label>
                                                    </div>
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="rr02" name="stepin46" value="option145" />
                                                        <label htmlFor="rr02">No</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Choose the fees that you want to charge your users <i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i>
                                                    <span className="redTxt01">Fees will be automatedly deposit to your wallet<i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i></span>

                                                </div>
                                                <div className="gwFormSFormbox01">
                                                    <input type="text" /> <span>%</span>
                                                </div>
                                            </div>


                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Choose blockchain  <i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="You can only charge fees and reimbursement users with your tokens on blockchains that your token is deploy on. If your token is for example on one chain like Ethereum users from other chains like BSC can use your license but they will not be charged with fees or reimbursement for it" aria-hidden="true"></i> </i>

                                                </div>
                                                <div className="gwFormSCheckbx01">
                                                    <div className="md-checkbox">
                                                        <input type="checkbox" defaultChecked id="rr03" name="stepin46" />
                                                        <label htmlFor="rr03">Ethereum </label>
                                                    </div>
                                                    <div className="md-checkbox">
                                                        <input type="checkbox" id="rr04" name="stepin46" />
                                                        <label htmlFor="rr04">BSC </label>
                                                    </div>
                                                    <div className="md-checkbox">
                                                        <input type="checkbox" id="rr05" name="stepin46" />
                                                        <label htmlFor="rr05">Polygon </label>
                                                    </div>
                                                </div>

                                            </div>


                                            <div className='gwFormBRBox01'>
                                                <div className='gwFormBRTitle01'><span>Ethereum</span></div>
                                                <div className="gwFormSbox01">
                                                    <div className="gwFormTitle01" >Add your native token smart contract on Ethereum</div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" /> <span>TOKEN</span>
                                                    </div>
                                                </div>
                                                <div className="gwFormSbox01">
                                                    <div className="gwFormTitle01" >Add a pool contract between your TOKEN to ETH<i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i></div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" /> <span>TOKEN</span>
                                                    </div>
                                                </div>

                                                <div className="gwFormSbox01">
                                                    <div className="gwFormSFormbox02">
                                                        <div className="md-radio md-radio-inline">
                                                            <input type="radio" id="radio148" name="stepin52" value="option146" />
                                                            <label htmlFor="radio148">Display all tokens<i className="help-circle">
                                                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                            </i></label>
                                                        </div>
                                                        <div className="md-radio md-radio-inline">
                                                            <input type="radio" id="radio149" name="stepin52" value="option145" />
                                                            <label htmlFor="radio149">Display token lists<i className="help-circle">
                                                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                            </i></label>
                                                        </div>
                                                    </div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" placeholder='Add your token list link' style={{ width: '100%' }} />
                                                    </div> 
                                                </div>
                                                <button className="gwFormBTN02">Connect your Ethereum wallet to create a license on Ethereum </button>
                                            </div>


                                            <div className='gwFormBRBox01'>
                                                <div className='gwFormBRTitle01'><span>BSC</span></div>
                                                <div className="gwFormSbox01">
                                                    <div className="gwFormTitle01" >Add your native token smart contract on BSC</div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" /> <span>TOKEN</span>
                                                    </div>
                                                </div>
                                                <div className="gwFormSbox01">
                                                    <div className="gwFormTitle01" >Add a pool contract between your TOKEN to BNB<i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i></div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" /> <span>TOKEN</span>
                                                    </div>
                                                </div>

                                                <div className="gwFormSbox01">
                                                    <div className="gwFormSFormbox02">
                                                        <div className="md-radio md-radio-inline">
                                                            <input type="radio" id="rr08" name="stepin54" value="option146" />
                                                            <label htmlFor="rr08">Display all tokens<i className="help-circle">
                                                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                            </i></label>
                                                        </div>
                                                        <div className="md-radio md-radio-inline">
                                                            <input type="radio" id="rr09" name="stepin54" value="option145" />
                                                            <label htmlFor="rr09">Display token lists<i className="help-circle">
                                                                <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                            </i></label>
                                                        </div>
                                                    </div>
                                                    <div className="gwFormSFormbox01">
                                                        <input type="text" placeholder='Add your token list link' style={{ width: '100%' }} />
                                                    </div> 
                                                </div>
                                                <button className="gwFormBTN02 greenC"><i className="fas fa-check"></i> BSC license been created successfully</button>
                                            </div>









                                        </div>
                                        <div className='gwFormRMbox'>
                                            <div className='gwFormSTitle01'><span>2</span>Set up your design </div>
                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Choose the type of integration </div>
                                                <div className="gwFormSFormbox02">
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio145" name="stepin50" value="option146" />
                                                        <label htmlFor="radio145">Zero integration <i className="help-circle">
                                                            <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio146" name="stepin50" value="option145" />
                                                        <label htmlFor="radio146">Smart contract integration <i className="help-circle">
                                                            <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="gwFormSbox01 ">
                                                <div className="gwFormTitle01" >Choose your subdomain name </div>
                                                <div className="gwFormSFormbox01 v2 smFixer03">
                                                    <input type="text" /> <span>.smartswap.excahange </span>
                                                </div>
                                            </div>


                                            <div className="gwFormSbox01 NpDisplyFix01 ">
                                                <div className="gwFormSubBox01 smFixer04">Add logo
                                                    <div className="SSMainInputBX ">
                                                        <input placeholder="Choose file" disabled="disabled" className="ssInputtype01" />
                                                        <label className="custom-file-input" >
                                                            <input type="file" />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="gwFormSubBox01 smFixer04">Add a URL link behind your logo
                                                    <div className="SSMainInputBX">
                                                        <input placeholder="Choose file" placeholder="http:///www.yourwebsite.com" style={{ width: '100%', color: 'white' }} className="ssInputtype01" />

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="gwFormSbox01 NpDisplyFix01 smFixer04">
                                                <div className="gwFormSubBox01">Add new background
                                                    <div className="SSMainInputBX">
                                                        <input placeholder="Choose file" disabled="disabled" className="ssInputtype01" />
                                                        <label className="custom-file-input" >
                                                            <input type="file" />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="gwFormSubBox01">Background dark layer


                                                    <div className="dragorInput">
                                                        <InputRange
                                                            maxValue={100}
                                                            minValue={0}
                                                            value={this.state.value}
                                                            formatLabel={value => `${value}%`}
                                                            onChange={value => this.setState({ value })} />
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="gwFormSbox01 smFixer04">
                                                <div className="gwFormTitle01" >Change button and text</div>
                                                <div className="gwFormSFormbox02">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="radio11" name="stepin55" value="option146" />
                                                        <label htmlFor="radio11">Yes</label>
                                                    </div>
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="radio12" name="stepin55" value="option145" />
                                                        <label htmlFor="radio12">No </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01">Select font style</div>
                                                <div className="LiproDropdown">
                                                    <button className='LiproDDbtn01' onClick={() => this.toggle(1)} >
                                                        <div className="ddIconBX">Default</div>
                                                        <i className="fas fa-caret-down"></i>
                                                    </button>
                                                    <div className="ddContainer">
                                                        <Collapse isOpen={this.state.isOpen1} className={"collapse-css-transition"} >
                                                            <button className='LiproDDbtn01'  >
                                                                <div className="ddIconBX">Font  01</div>
                                                            </button>
                                                            <button className='LiproDDbtn01'  >
                                                                <div className="ddIconBX">Font  02</div>
                                                            </button>
                                                        </Collapse>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="colorPlateMBox npFixer05">
                                                <div className="colorPlateTitle01">Text color</div>
                                                <div className="colorPlateSBox01">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" checked id="s01" name="s11" value="s11" />
                                                        <label htmlFor="s01"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        Current color  <div className='ColorBX' style={{ backgroundColor: '#91dc27' }}></div>
                                                    </div>
                                                    <div className="chevrBox"><i className="fas fa-chevron-right"></i></div>
                                                </div>
                                                <div className="colorPlateSBox02">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" checked id="s02" name="s11" value="s11" />
                                                        <label htmlFor="s02"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        New color
                                                        <span className="colorPlaterSbx"><div className='ColorBX' style={{ backgroundColor: '#27dcab' }}></div>
                                                            <button>  <i className="fas fa-sort-down"></i> </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="colorPlateMBox npFixer05">
                                                <div className="colorPlateTitle01">Connect your wallet button</div>
                                                <div className="colorPlateSBox01">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="s05" name="s13" value="s13" />
                                                        <label htmlFor="s05"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        Current color  <div className='ColorBX' style={{ backgroundColor: '#593a93' }}></div>
                                                    </div>
                                                    <div className="chevrBox"><i className="fas fa-chevron-right"></i></div>
                                                </div>
                                                <div className="colorPlateSBox02">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="s06" name="s13" value="s13" checked />
                                                        <label htmlFor="s06"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        New color
                                                        <span className="colorPlaterSbx"><div className='ColorBX' style={{ backgroundColor: '#27dcab' }}></div>
                                                            <button>  <i className="fas fa-sort-down"></i> </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="colorPlateMBox npFixer05">
                                                <div className="colorPlateTitle01">Swap button</div>
                                                <div className="colorPlateSBox01">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="s07" name="s14" value="s14" />
                                                        <label htmlFor="s07"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        Current color  <div className='ColorBX' style={{ backgroundColor: '#dc7c27' }}></div>
                                                    </div>
                                                    <div className="chevrBox"><i className="fas fa-chevron-right"></i></div>
                                                </div>
                                                <div className="colorPlateSBox02">
                                                    <div className="md-radio md-radio-inline ">
                                                        <input type="radio" id="s08" name="s14" value="s14" checked />
                                                        <label htmlFor="s08"></label>
                                                    </div>
                                                    <div className="colorPlater">
                                                        New color
                                                        <span className="colorPlaterSbx"><div className='ColorBX' style={{ backgroundColor: '#91dc27' }}></div>
                                                            <button>  <i className="fas fa-sort-down"></i> </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="colorPlateMBox">
                                                <div className="colorPlateTitle01">
                                                    <button>Preview</button>
                                                </div>
                                            </div>



                                        </div>
                                    </div>


                                    <div className="gwFormSFormbox03">
                                        <button className="gwFormBTN01">GET YOUR OWN LICENSE FOR FREE</button>
                                    </div>

                                    <div className="spacerLine02"></div>



                                {/*     First Popup Part

                                    <div className='smeTitle01-v3'>Below is Your License URL and Smart Contract</div>

                                    <div className='LicMbx'>
                                        Your licensee sub domain
                                        <div className='LicInputBX01'>
                                        <input type="text" value="http://yourwebsite.smartswap.exchange" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div>
                                    </div>

                                    <div className='LicMbx'>
                                    Your licensee smart contract for Ethereum
                                        <div className='LicInputBX01'>
                                        <input type="text" value="0x084374b068Eb3db504178b4909eDC26D01226a80" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div>
                                        <div className='LicInfoBX'> 
                                            <span className='greenC'>Deposit your reimbursement TOKEN to this smart contract</span> |  <span className='redC'>Withdraw your reimbursement tokens</span> 
                                        </div>
                                    </div>

                                    <div className='LicMbx'>
                                    Your licensee smart contract for BSC
                                        <div className='LicInputBX01'>
                                        <input type="text" value="0x084374b068Eb3db504178b4909eDC26D01226a80" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div>
                                        <div className='LicInfoBX'> 
                                            <span className='greenC'>Deposit your reimbursement TOKEN to this smart contract</span> |  <span className='redC'>Withdraw your reimbursement tokens</span> 
                                        </div>
                                    </div>


                                    <div className='LicMbx'>
                                    Your licensee smart contract for Polygon
                                        <div className='LicInputBX01'>
                                        <input type="text" value="0x084374b068Eb3db504178b4909eDC26D01226a80" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div>
                                        <div className='LicInfoBX'> 
                                            <span className='greenC'>Deposit your reimbursement TOKEN to this smart contract</span> |  <span className='redC'>Withdraw your reimbursement tokens</span> 
                                        </div>
                                    </div>
*/}



{/* Second Popup Part */}

<div className='smeTitle01-v3'>Below is Your License URL and Integration Instruction</div>

                                    <div className='LicMbx'>
                                    Your licensee sub domain
                                        <div className='LicInputBX01'>
                                        <input type="text" value="http://yourwebsite.smartswap.exchange" /> 
                                        </div>
                                    </div>

                                    <div className='LicMbx'>
                                    You need to  call this function in SmartSwap contract  <a href='#' className='LicCopyBTN v2'><i class="fas fa-copy"></i></a>

                                    <div className='settingCodeBx'> 
                                                        //user should approve tokens transfer before calling this function. <br />
    //if no licensee set it to address(0) <br />
    function swap( <br />
        address tokenA, // token that user send to swap ( address(1) for BNB, address(2) for ETH) <br />
        address tokenB, // token that user want to receive ( address(1) for BNB, address(2) for ETH) <br />
        address receiver, // address that will receive tokens on other chain (user's wallet address) <br />
        uint256 amountA,  // amount of tokens user sends to swap <br />
        address licensee,   // for now, = address(0) <br />
        bool isInvestment,  // for now, = false <br />
        uint128 minimumAmountToClaim,   // do not claim on user behalf less of this amount. Only exception if order fulfilled. For now, = 0 <br />
        uint128 limitPice   // Do not match user if token A price less this limit. For now, = 0 <br />
    ) <br />
        external <br />
        payable <br />
        returns (bool)
                                                </div>

                                        <button class="LicSBTN01">Download ABI of smart contract file</button>


                                    </div>

                                    <div className='LicMbx'>
                                    Smart contract address BSC
                                        <div className='LicInputBX01'>
                                        <input type="text" value="0x084374b068Eb3db504178b4909eDC26D01226a80" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div> 
                                    </div>

                                    <div className='LicMbx'>
                                    Smart contract address Ethereum
                                        <div className='LicInputBX01'>
                                        <input type="text" value="0x084374b068Eb3db504178b4909eDC26D01226a80" />
                                        <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                                        </div> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!--======================= SWAP BLOCK END =====================--> */}
                    </div>
                    {/* <!--======================= WALLET POPUP START =====================--> */}
                    <WalletPopup web3={this.state.web3} web3Config={web3Config}></WalletPopup>
                    {/* <!--======================= WALLET POPUP END =====================-->
                    <!--======================= COIN POPUP START =====================--> */}
                    <CoinPopup web3={this.state.web3} web3Config={web3Config} setCurrency={this.setSendCurrency} popId={"sendCurPop"} opositeSelectedCurrrency={this.state.selectedReceiveCurrency} selectedCurrrency={this.state.selectedSendCurrency}></CoinPopup>
                    <CoinPopup web3={this.state.web3} web3Config={web3Config} setCurrency={this.setReceiveCurrency} popId={"receiveCurPop"} opositeSelectedCurrrency={this.state.selectedSendCurrency} selectedCurrrency={this.state.selectedReceiveCurrency}></CoinPopup>
                    {/* <!--======================= COIN POPUP END =====================-->
                    <!--======================= SIDE POPUP START =====================--> */}
                    <SidePopup web3={this.state.web3} web3Config={web3Config}></SidePopup>
                    {/* <!--======================= SIDE POPUP END =====================--> */}
                    {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/gnaJlUA20lk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> */}
                </div>
            </main>
        )
    }
}