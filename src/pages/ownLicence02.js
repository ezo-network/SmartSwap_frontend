import React, { PureComponent, lazy, Suspense } from "react";
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
import Header from "../components/Header/Header";
import RightSideMenu from "../components/Navigations/RightSideMenu";
import WalletPopup from "../components/popups/WalletPopup";
import CoinPopup from "../components/popups/CoinPopup";
import SidePopup from "../components/popups/SidePopup";
const $ = window.$;
export default class ownLicence02 extends PureComponent {
    constructor(props) {
        super();
        this.setSendCurrency = this.setSendCurrency.bind(this)
        this.setReceiveCurrency = this.setReceiveCurrency.bind(this)
        this.state = {
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
                    <RightSideMenu web3={this.state.web3} web3Config={web3Config}></RightSideMenu>
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
                                                <div className="gwFormTitle01" >Choose the fees that you want to charge your users
                                                <i class="help-circle"> <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i></div>
                                                <div className="gwFormSFormbox01">
                                                    <input type="text" /> <span>%</span>
                                                </div>
                                            </div>
                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Add your native token smart contract</div>
                                                <div className="gwFormSFormbox01">
                                                    <input type="text" /> <span>JNTR</span>
                                                </div>
                                            </div>
                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Deposit amount of tokens to cover the reimbursement <i class="help-circle">
                                                    <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i></i></div>
                                                <div className="gwFormSFormbox01">
                                                    <input type="text" /> <span>JNTR</span>
                                                </div>
                                            </div>
                                            <div className="gwFormSbox01">
                                                <div className="gwFormSFormbox02">
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio148" name="stepin52" value="option146" />
                                                        <label htmlFor="radio148">Display all tokens <i class="help-circle">
                                                            <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio149" name="stepin52" value="option145" />
                                                        <label htmlFor="radio149">Display token lists <i class="help-circle">
                                                            <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='gwFormRMbox'>
                                            <div className='gwFormSTitle01'><span>2</span>Set up your design </div>
                                            <div className="gwFormSbox01">
                                                <div className="gwFormTitle01" >Type of license </div>
                                                <div className="gwFormSFormbox02">
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio145" name="stepin50" value="option146" />
                                                        <label htmlFor="radio145">Zero integration <i class="help-circle">
                                                            <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                    <div className="md-radio md-radio-inline">
                                                        <input type="radio" id="radio146" checked name="stepin50" value="option145" />
                                                        <label htmlFor="radio146">Smart contract integration <i class="help-circle">
                                                            <i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                                                        </i></label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="colorPlateMBox">
                                                <div class="colorPlateTitle01">swapMulti</div>
                                                <div className='settingCodeBx'>
                                                    function swapMulti ( <br />
                                                IERC20[] memory tokens,<br />
                                                uint256 amounts,<br />
                                                uint256 minReturn,<br />
                                                uint256[] memory distribution,<br />
                                                uint256[] memory flags <br />
                                                ) public payable returns (uint256)
                                                </div>
                                                <div className='settingCodeBxText01'>
                                                    Swap <span>amount</span> first element of <span>tokens</span> of the latest element. The length of <span>flags</span> array should be 1 element less than <span>tokens</span> array length. Each element from <span>flags</span> arrau corresponds to 2 neighboring elements from <span>tokens</span> array.
                                                </div>
                                                <div className='setCodeTable'>
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="10">
                                                        <tbody>
                                                            <tr>
                                                                <th align="left" valign="middle" scope="col">Params</th>
                                                                <th align="left" valign="middle" scope="col">Type</th>
                                                                <th align="left" valign="middle" scope="col">Description</th>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" valign="middle">tokens</td>
                                                                <td align="left" valign="middle">IERC20[]</td>
                                                                <td align="left" valign="middle">Addresses of tokens or <span>address(0)</span> for Ether</td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" valign="middle">amount</td>
                                                                <td align="left" valign="middle">uint256</td>
                                                                <td align="left" valign="middle">Amount of tokens</td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" valign="middle">minReturn</td>
                                                                <td align="left" valign="middle">uint256</td>
                                                                <td align="left" valign="middle">Minimum expected return, else revert transaction</td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" valign="middle">distribution</td>
                                                                <td align="left" valign="middle">uint256[]</td>
                                                                <td align="left" valign="middle">Array of weights for volume distribution (returned by <span>getRespectReturn</span>)<br /></td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left" valign="middle">flags</td>
                                                                <td align="left" valign="middle">uint256[]</td>
                                                                <td align="left" valign="middle">The sequence of flags for enabling and disabling some features (default: <span>0</span>), see flags description</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="gwFormSFormbox03">
                                        <button className="gwFormBTN01">GET YOUR OWN LICENSE FOR FREE</button>
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