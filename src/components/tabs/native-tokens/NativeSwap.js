import {WalletContext} from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import { LoopCircleLoading } from "react-loadingg";
import web3Js from "web3";
import axios from "axios";
import Switch from "react-switch";
import Validation from "../../../helper/validation";
import constantConfig from "../../../config/constantConfig";
import data from "../../../config/constantConfig";
import web3Config from "../../../config/web3Config";
import CONSTANT from "../../../constants";
import notificationConfig from "../../../config/notificationConfig";
import SwapFactoryContract from "../../../helper/swapFactoryContract";
import LedgerHistory from "../../../components/LedgerHistory/LedgerHistory";
import SmartExchange from "../../../../src/assets/images/smart-exchange.png";


// images
import Filter from "../../../../src/assets/images/filter.png";
import Doller from "../../../../src/assets/images/doller.png";
import Swap from "../../../../src/assets/images/swap-arrow.png";
import SSIco from "../../../../src/assets/images/ss.png";
import SUSIco from "../../../../src/assets/images/sus.png";
import MUCIco from "../../../../src/assets/images/muc.png";


export default class NativeSwap extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            swapLoading: false,
            approveLoading: false,
            showSidebar: false,
            sendFundAmount: "",
            actualSendFundAmount: 0,
            estimatedGasFee: "0",
            selectedSendCurrency: "BNB",
            selectedReceiveCurrency: "ETH",
            currencyPrices: {},
            approxReceiveFundAmount: 0,
            tokenBalances: {
                JNTR: 0,
                "JNTR/b": 0,
                "JNTR/e": 0,
                JNTR_APPROVED: 0,
                "JNTR/b_APPROVED": 0,
                "JNTR/e_APPROVED": 0,
            },            
        }
        
        this.receivedToken = this.receivedToken.bind(this);
        this.expedite = this.expedite.bind(this);
    }
    
    componentDidMount() {
        let wallet = this.context;
    }

    componentDidUpdate(){

    }

    componentWillUnmount() {
        let wallet = this.context;
        /* ... */
    }

    async receivedToken(e) {
        let dollarAmount = Number(e.target.value);
        this.setState(
            {
                sendFundAmount: dollarAmount,
            },
            async () => {
                await this.setAmount(dollarAmount);
            }
        );
    }

    async estimateGasAndFee() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null) return 0;
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        let { sendFundAmount } = this.state;
        if (sendFundAmount === "" || sendFundAmount === 0) {
            notificationConfig.error("Enter value to swap");
            return;
        }
        let actualSendFundAmount = (
            await this.getActualAmount(
                sendFundAmount,
                this.state.selectedSendCurrency
            )
        ).toString();
        let value = 0,
            swapAmount = 0,
            allFees = await this.calculateSwapFees(actualSendFundAmount);

        try {
            value = web3Js.utils.toWei(actualSendFundAmount.toString());
        } catch (e) {
            value = (actualSendFundAmount * 10 ** 18).toFixed(0);
        }
        swapAmount = value;
        if (
            constantConfig.tokenDetails[this.state.selectedSendCurrency]
                .approveRequire
        ) {
            value = 0;
        }
        await swapFactory.estimateSwapGasFee(
            CONSTANT.currencyAddresses[this.state.selectedSendCurrency],
            CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency],
            value,
            swapAmount,
            allFees,
            this.state.licenseeAddress[networkId],
            "270000",
            (estGas) => {
                this.setState({
                    estimatedGasFee: Number(estGas) + Number(web3Js.utils.fromWei((allFees.totalFees).toString())),
                });
            }
        );
    }    

    async setAmount(dollarAmount) {
        this.setState(
            {
                actualSendFundAmount: await this.getActualAmount(
                    dollarAmount,
                    this.state.selectedSendCurrency
                ),
                approxReceiveFundAmount: await this.getActualAmount(
                    dollarAmount,
                    this.state.selectedReceiveCurrency
                ),
            },
            async () => {
                await this.estimateGasAndFee();
            }
        );
    }

    async getActualAmount(dollarAmount, currency) {
        if (dollarAmount <= 0) return 0;
        else return dollarAmount / this.state.currencyPrices[currency];
    }    

    changeCurrency(check) {
        // if(check && this.state.web3 === null){
        let { selectedSendCurrency, selectedReceiveCurrency, selectedOptionSend, selectedOptionReceive, selectedNetworkOptionSend, selectedNetworkOptionReceive } = this.state;

        this.setState(
            {
                selectedSendCurrency: selectedReceiveCurrency,
                selectedReceiveCurrency: selectedSendCurrency,
                selectedOptionSend: selectedOptionReceive,
                selectedOptionReceive: selectedOptionSend,
                selectedNetworkOptionSend: selectedNetworkOptionReceive,
                selectedNetworkOptionReceive: selectedNetworkOptionSend,
                selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedReceiveCurrency, selectedSendCurrency),
                sendFundAmount: "",
                estimatedGasFee: "0"
            },
            async () => {
                this.forceUpdate();
            }
        );
        // } else if(this.state.web3 !== null && check) {
        //     notificationConfig.warning("Please change metamask network!")
        // }
    }

    async connectWallet() {
        const wallet = this.context;
        wallet.connectWallet();

        // this.setState({ btnClick: true });
        // await web3Config.connectWallet(0);
        // let networkId = web3Config.getNetworkId();
        // let selectedCurId = constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId;
        // if (!constantConfig.allowedNetwork.includes(networkId)) {
        //     //notificationConfig.error("Please Select Ethereum or BSC or Polygon Main Network"); // Notice - Please move native token swap UI to seperate component because it creates conflicts as we're working on common UI. ex - BridgeSwap
        //     this.setState({ btnClick: false });
        //     return;
        // }
        // if (selectedCurId !== networkId) {
        //     //notificationConfig.warning("Change metamask network to " + CONSTANT.NETWORK_ID[selectedCurId] + "!"); // Notice - Please move native token swap UI to seperate component because it creates conflicts as we're working on common UI. ex - BridgeSwap
        //     return;
        // }
        // // if (
        // //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
        // //   networkId &&
        // //   (networkId === 97 || networkId === 56)
        // // ) {
        // //   notificationConfig.warning("Change metamask network to Ethereum!");
        // //   return;
        // // } else if (
        // //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
        // //   networkId &&
        // //   (networkId === 42 || networkId === 1)
        // // ) {
        // //   notificationConfig.warning("Change metamask network to Binance!");
        // //   return;
        // // } else if (
        // //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
        // //   networkId &&
        // //   (networkId === 80001 || networkId === 137)
        // // ) {
        // //   notificationConfig.warning("Change metamask network to Polygon!");
        // //   return;
        // // }
        // this.setState(
        //     {
        //         web3: web3Config.getWeb3(),
        //         btnClick: false,
        //     },
        //     async () => {
        //         await this.fetchedUserTransaction(web3Config.getAddress());
        //         setInterval(async () => {
        //             await this.fetchedUserTransaction(web3Config.getAddress());
        //         }, 60000);
        //         // await this.getData([web3Config.getAddress()])
        //         // this.changeCurrency(false)
        //         this.updateUserBalance();
        //         setInterval(() => {
        //             this.updateUserBalance();
        //         }, 10000);
        //     }
        // );
    }

    async fetchedUserTransaction(address) {
        // var userTxs = StableCoinStore.getFetchedUserTxs();
        this.setState({ loadingHistory: true })
        let url = process.env.REACT_APP_LEDGER_HOST + 'ledgers/' + (address).toLocaleLowerCase();
        console.log(process.env.REACT_APP_LEDGER_HOST)

        let json;
        await axios
            .get(url)
            .then((res) => {
                console.log(res)
                json = res.data;
            })
            .catch((err) => {
                console.log('error', err);
            });
        // const response = await fetch(url);
        // const json = await response.json();

        var userTxs = (json.data).reverse();
        var userTxsUI = [];
        var userPendingTxsUI = [];

        if (userTxs.length > 0) {
            userTxs.map(async (element, key) => {
                let sentTxTime = "";
                let recivedTxTime = "";

                sentTxTime = new Date(Number(element.srTime + "000")).toUTCString()
                recivedTxTime = new Date(Number(element.approveTime + "000")).toUTCString()

                element["sentCurrency"] =
                    constantConfig.addressByToken[element.tokenA].symbol;
                element["recivedCurrency"] =
                    constantConfig.addressByToken[element.tokenB].symbol;

                element["sentTxLink"] =
                    constantConfig[Number(element.chainId)].explorer +
                    "/tx/" +
                    element.txHash;

                if (element.relationship.claim.approveHash !== undefined && element.relationship.claim.approveHash !== null) {
                    element["recivedTxLink"] =
                        constantConfig[Number(element.crossChainId)].explorer +
                        "/tx/" +
                        element.relationship.claim.approveHash;
                    element["oracleTx"] = element.relationship.claim.approveHash;
                }



                // element["recivedAmount"] = web3Js.utils.fromWei(element.estimatedForeignAmount);
                // element.counterParties.map(async (elementCounterParties, key) => {
                //   let rcAmount = web3Js.utils.fromWei(elementCounterParties.crossAmountA) * (elementCounterParties.tokenAPrice / elementCounterParties.tokenBPrice)
                //   element["recivedAmount"] = Number(element["recivedAmount"]) + Number(rcAmount);
                // })

                if (element.status === "FULFILLED" && element.relationship.claim.approveHash !== null) {
                    userTxsUI.push(
                        // <LedgerHistory />
                        <LedgerHistory
                            processAmount={web3Js.utils.fromWei(element.processAmount)}
                            claimedAmount={web3Js.utils.fromWei(element.claimedAmount)}
                            sentCurrency={element.sentCurrency}
                            sentAPrice={element.sentAPrice}
                            txHash={element.txHash}
                            sentTxLink={element.sentTxLink}
                            tokenBPrices={element.tokenBPrices.prices[0]}
                            estimatedForeignAmount={web3Js.utils.fromWei(element.estimatedForeignAmount)}
                            recivedCurrency={element.recivedCurrency}
                            oracleTx={element.oracleTx}
                            recivedTxLink={element.recivedTxLink}
                            sentTxTime={sentTxTime}
                            recivedTxTime={recivedTxTime.toString()}
                            tokenAPrices={element.tokenAPrices.prices[0]}
                            chainId={element.chainId}
                            expedite={this.expedite}
                            isExpedited={element.isExpedited}
                            crossChainId={element.crossChainId}
                        />
                    );
                } else {
                    userPendingTxsUI.push(
                        // <LedgerHistory />
                        <LedgerHistory
                            processAmount={web3Js.utils.fromWei(element.processAmount)}
                            claimedAmount={web3Js.utils.fromWei(element.claimedAmount)}
                            sentCurrency={element.sentCurrency}
                            sentAPrice={element.sentAPrice}
                            txHash={element.txHash}
                            sentTxLink={element.sentTxLink}
                            tokenBPrices={element.tokenBPrices.prices[0]}
                            estimatedForeignAmount={web3Js.utils.fromWei(element.estimatedForeignAmount)}
                            recivedCurrency={element.recivedCurrency}
                            oracleTx={element.oracleTx}
                            recivedTxLink={element.recivedTxLink}
                            sentTxTime={sentTxTime}
                            recivedTxTime={recivedTxTime.toString()}
                            tokenAPrices={element.tokenAPrices.prices[0]}
                            chainId={element.chainId}
                            expedite={this.expedite}
                            canExpedite={element.canExpedite}
                            isExpedited={element.isExpedited}
                            crossChainId={element.crossChainId}
                        />
                    );
                }
            });
            if (userTxsUI.length <= 0) {
                userTxsUI.push(
                    <div style={{ textAlign: "center" }}>
                        <h2>No transaction</h2>
                    </div>
                );
            }
            if (userPendingTxsUI <= 0) {
                userPendingTxsUI.push(
                    <div style={{ textAlign: "center" }}>
                        <h2>No transaction</h2>
                    </div>
                );
            }
        } else {
            userTxsUI.push(
                <div style={{ textAlign: "center" }}>
                    <h2>No transaction</h2>
                </div>
            );
            userPendingTxsUI.push(
                <div style={{ textAlign: "center" }}>
                    <h2>No transaction</h2>
                </div>
            );
        }
        this.setState(
            {
                allTxHistoryUI: userTxsUI,
                allPendingTxHistoryUI: userPendingTxsUI,
            },
            async () => {
                await this.forceUpdate();
                await this.stopLoadingHist();
            }
        );
    } 

    async expedite(currentTxExpediteData) {
        const {
            txHash,
            processAmount,
            chainId,
            crossChainId
        } = currentTxExpediteData;
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        console.log(networkId)
        let address = web3Config.getAddress();
        if (web3 === null) return 0;

        if (chainId !== networkId) {
            notificationConfig.warning("Change metamask network to " + CONSTANT.NETWORK_ID[chainId] + "!");
            return;
        }

        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);

        // let allFees = await this.calculateSwapFees(processAmount);

        // await swapFactory.expedite(txHash, (((Number(allFees.processingFees) * 0.10 + Number(allFees.processingFees))) * 10 ** 18).toFixed(),

        let url = process.env.REACT_APP_LEDGER_HOST + "processing-fee/" + chainId + "-" + crossChainId;

        let json;
        await axios
            .get(url)
            .then((res) => {
                console.log(res)
                json = res.data;
            })
            .catch((err) => {
                console.log('error', err);
            });

        console.log(json.result * 1.1)

        await swapFactory.expedite(txHash, ((json.result * 1.1) * 10 ** 18).toFixed(),
            (hash) => {
                this.setState({
                    allowCurrentTxExpedite: 2
                    // swapLoading: true,
                    // txIdSent: hash,
                    // txLinkSend: data[networkId].explorer + "/tx/" + hash,
                });
            },
            async (receipt) => {
                this.setState({
                    allowCurrentTxExpedite: 3
                })
                // this.init()
                // setTimeout(async () => {
                //   await this.fetchTransactionStatus(receipt.transactionHash);
                // }, 120000);

                // this.setState({
                //   swapLoading: false,
                //   showLedger: true,
                //   wrapBox: "success",
                // });
                await this.fetchedUserTransaction(web3Config.getAddress());
                notificationConfig.success("Expedite Success");
            }
        );
    }

    render() {

        let wallet = this.context;

        return (
            <>
                <div className="native-icons">
                    <a href onClick={(e) => e.preventDefault()}><img height="13" src={Filter} /></a>
                    <a className='nativeToggle' href onClick={() => this.props.closeSideBar()}><img height="14" src={Doller} /></a>
                </div>
                <div className=" form-group-n  items-center-n">
                    <div className="flex-1 w-100-sm flex-auto-sm">
                        <div className="inputs-wrap light-controls-n">
                            <div className="inputs-wrap-control">
                                <div className="input-box1">
                                    <label htmlFor="" className="form-label">from</label>
                                    <div className="i-outer">
                                        <input
                                            type="text"
                                            className="form-control-n"
                                            placeholder="0"
                                            id="input04"
                                            value={this.state.sendFundAmount}
                                            onKeyDown={(e) => Validation.floatOnly(e)}
                                            onChange={(e) => this.receivedToken(e)}
                                            autoComplete="off"
                                        />
                                        <span className="currency-ic-n">
                                            $
                                        </span>
                                    </div>
                                </div>

                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    {/* <button className="ani-1"><img src="images/bnb.png" alt="" /> BSC</button> */}
                                    <button><img src="../images/coin-icon03.png"></img>BSC</button>
                                    {/* <Select
                value={this.state.selectedNetworkOptionSend}
                onChange={this.handleChange.bind(this, "sendNetwork")}
                options={this.state.sendNetworkList}
                styles={{
                    control: (styles) => ({ ...styles, backgroundColor: '#EDECEF', height: '50px', borderRadius: '0', fontWeight: "bold", border: "2px solid #ffffff", borderRight: "0px", fontSize: "16px" }),
                    singleValue: (provided, state) => ({
                    ...provided,
                    color: "black",
                    // fontSize: state.selectProps.myFontSize
                    }),
                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                    // const color = chroma(data.color);
                    console.log({ data, isDisabled, isFocused, isSelected });
                    return {
                        ...styles,
                        backgroundColor: isFocused ? "#999999" : null,
                        color: "black",
                        fontWeight: "bold"
                    };
                    },
                    indicatorSeparator: (styles) => ({ display: 'none' })
                }}
                /> */}
                                </div>
                                {/* <div className='custom-dropdown'>
                <button onClick={() => { setIsOpen(state => !state); onToggleClick(); }} className={showActive ? 'active' : ''}>BNB <i className="fa fa-caret-down"></i></button>
                <Collapse onInit={onInit} isOpen={isOpen}>
                <div className='nn-list'>
                    <p>ETH</p>
                </div>
                </Collapse>
            </div> */}
                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    {/* <button className="border-left-0 ani-1"><img src="images/bnb.png" alt="" /> BNB</button> */}
                                    <button><img src="../../images/coin-icon03.png"></img>BNB</button>
                                    {/* <Select
                value={this.state.selectedOptionSend}
                onChange={this.handleChange.bind(this, "send")}
                options={this.state.sendCurrencyList}
                styles={{
                    control: (styles) => ({ ...styles, backgroundColor: '#EDECEF', height: '50px', borderRadius: '0', fontWeight: "bold", border: "2px solid #ffffff", fontSize: "16px" }),
                    singleValue: (provided, state) => ({
                    ...provided,
                    color: "black",
                    // fontSize: state.selectProps.myFontSize
                    }),
                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                    // const color = chroma(data.color);
                    console.log({ data, isDisabled, isFocused, isSelected });
                    return {
                        ...styles,
                        backgroundColor: isFocused ? "#999999" : null,
                        color: "black",
                        fontWeight: "bold"
                    };
                    },
                    indicatorSeparator: (styles) => ({ display: 'none' })
                }}
                /> */}
                                </div>
                                {/* <div className="relative select-item-wrap curICPL"> */}
                                {/* <img src={
                "images/currencies/" +
                data.tokenDetails[
                    this.state.selectedSendCurrency
                ].iconName +
                ".png"
                } />{this.state.selectedSendCurrency} */}
                                {/* <Select
                value={this.state.selectedOptionSend}
                onChange={this.handleChange.bind(this, "send")}
                options={this.state.sendCurrencyList}
                /> */}
                                {/* <select> */}
                                {/* <option
                    value={this.state.selectedSendCurrency}
                    data-icon={
                    "images/currencies/" +
                    this.state.selectedSendCurrency +
                    ".png"
                    }
                > {this.state.selectedSendCurrency}</option>
                {

                    getTokenList().map((ele) => {
                    if (ele.symbol !== this.state.selectedSendCurrency && ele.symbol !== this.state.selectedReceiveCurrency) {
                        return <option
                        value={ele.symbol}
                        data-icon={
                            "images/currencies/" +
                            ele.iconName +
                            ".png"
                        }
                        > {ele.symbol}</option>
                    }
                    })
                } */}
                                {/* <option value="btc" data-icon="images/bnb.png"> BNB</option>
                <option value="eth" data-icon="images/eth.png"> ETH</option>
                <option
                    value={this.state.selectedSendCurrency}
                    data-icon={
                    "images/currencies/" +
                    data.tokenDetails[
                        this.state.selectedSendCurrency
                    ].iconName +
                    ".png"
                    }
                > {this.state.selectedSendCurrency}</option> */}
                                {/* </select> */}
                                {/* </div> */}
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {this.state.actualSendFundAmount.toFixed(5)} | 1 {this.state.selectedSendCurrency} : ${this.state.currencyPrices[this.state.selectedSendCurrency]}</p>
                            {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                            <p className="form-label font-normal mb-0">
                                Balance: BNB&nbsp;<span className="color-green">MAX</span>
                            </p>
                        </div>
                    </div>
                    <div className="form-ic">
                        <a className="grey-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.changeCurrency(true);
                            }}
                        >
                            <img width="22" src={Swap} alt="" />
                        </a>
                        <a className="green-arrow"
                            href
                            onClick={(e) => {
                                e.preventDefault();
                                this.changeCurrency(true);
                            }}
                        >
                            <img width="22" src={Swap} alt="" />
                        </a>
                    </div>
                    <div className="flex-1 w-100-sm flex-auto-sm">
                        <div className="inputs-wrap dark-controls-n">
                            <div className="inputs-wrap-control">
                                <div className="input-box1 ver2">
                                    <label htmlFor="" className="form-label">to</label>
                                    <div className="i-outer">
                                        <input
                                            type="text"
                                            className="form-control-n"
                                            placeholder="0"
                                            readOnly=""
                                            disabled
                                            value={this.state.sendFundAmount}
                                        />
                                        <span className="currency-ic-n ver2">
                                            $
                                        </span>
                                    </div>
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    {/* <button className="ani-1"><img src="images/eth-icon.png" alt="" /> Ethereum</button> */}
                                    <button><img src="../images/coin-icon13.png"></img>Ethereum</button>
                                    {/* <Select
                value={this.state.selectedNetworkOptionReceive}
                onChange={this.handleChange.bind(this, "receiveNetwork")}
                options={this.state.recieveNetworkList}
                styles={{
                    control: (styles) => ({ ...styles, backgroundColor: '#20232A', color: 'white', height: '50px', borderRadius: '0', fontWeight: "bold", border: "2px solid #0D0E13", borderRight: "0px", fontSize: "16px" }),
                    singleValue: (provided, state) => ({
                    ...provided,
                    color: "white",
                    // fontSize: state.selectProps.myFontSize
                    }),
                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                    // const color = chroma(data.color);
                    console.log({ data, isDisabled, isFocused, isSelected });
                    return {
                        ...styles,
                        backgroundColor: isFocused ? "#999999" : null,
                        color: "black",
                        fontWeight: "bold"
                    };
                    },
                    indicatorSeparator: (styles) => ({ display: 'none' })
                }}
                /> */}

                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">TOKEN</label>
                                    {/* <button className="border-left-0 ani-1"><img src="images/eth-icon.png" alt="" /> ETH</button> */}
                                    <button><img src="../images/coin-icon13.png"></img>ETH</button>
                                    {/* <Select
                value={this.state.selectedOptionReceive}
                onChange={this.handleChange.bind(this, "receive")}
                options={this.state.recieveCurrencyList}
                styles={{
                    control: (styles) => ({ ...styles, backgroundColor: '#20232A', color: "white", height: '50px', borderRadius: '0', fontWeight: "bold", border: "2px solid #0D0E13", fontSize: "16px" }),
                    singleValue: (provided, state) => ({
                    ...provided,
                    color: "white",
                    // fontSize: state.selectProps.myFontSize
                    }),
                    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                    // const color = chroma(data.color);
                    console.log({ data, isDisabled, isFocused, isSelected });
                    return {
                        ...styles,
                        backgroundColor: isFocused ? "#999999" : null,
                        color: "black",
                        fontWeight: "bold",
                        borderRadius: "0"
                    };
                    },
                    indicatorSeparator: (styles) => ({ display: 'none' }),
                }}
                /> */}
                                </div>
                                {/* <div className="relative select-item-wrap curICPL02"> */}
                                {/* <Select
                value={this.state.selectedOptionReceive}
                onChange={this.handleChange.bind(this, "receive")}
                options={this.state.recieveCurrencyList}
                /> */}
                                {/* <select>
                <option
                    value={this.state.selectedReceiveCurrency}
                    data-icon={
                    "images/currencies/" +
                    this.state.selectedReceiveCurrency +
                    ".png"
                    }
                > {this.state.selectedReceiveCurrency}</option>
                {
                    getTokenList().map((ele) => {
                    if (ele.symbol !== this.state.selectedSendCurrency && ele.symbol !== this.state.selectedReceiveCurrency) {
                        return <option
                        value={ele.symbol}
                        data-icon={
                            "images/currencies/" +
                            ele.iconName +
                            ".png"
                        }
                        > {ele.symbol}</option>
                    }
                    })
                }
                </select> */}
                                {/* </div> */}
                            </div>
                        </div>
                        <div className="d-flex jc-sb">
                            <p className="form-label font-normal mb-0">≈ {this.state.approxReceiveFundAmount.toFixed(5)} | 1 {this.state.selectedReceiveCurrency} : ${this.state.currencyPrices[this.state.selectedReceiveCurrency]}</p>
                            {/* <p className="form-label font-normal mb-0">~ $39,075</p> */}
                        </div>
                    </div>
                </div>
                <div className="text-center ">
                    {this.state.web3 === null ||
                        constantConfig.tokenDetails[
                            this.state.selectedSendCurrency
                        ].networkId !== web3Config.getNetworkId() ? (
                        <button className="native-btn ani-1 connect" onClick={this.connectWallet.bind(this)}><span>
                            <i
                                className={
                                    data.tokenDetails[
                                        this.state.selectedSendCurrency
                                    ].networkId ===
                                        CONSTANT.NETWORK_ID.ETHEREUM
                                        ? "ETH"
                                        : "BNB"
                                }
                            ></i>
                        </span>
                            <span className="currency"><img src={"images/receiveCurrencies/" + this.state.selectedSendCurrency + ".png"} alt="" /></span> CONNECT YOUR WALLET</button>

                    ) : constantConfig.tokenDetails[
                        this.state.selectedSendCurrency
                    ].approveRequire &&
                        this.state.tokenBalances[
                        this.state.selectedSendCurrency + "_APPROVED"
                        ] <= this.state.actualSendFundAmount ? (
                        this.state.approveLoading ? (
                            <button className="btn-primary-n ani-1 connect swap"><LoopCircleLoading
                                height={"20px"}
                                width={"20px"}
                                color={"#ffffff"}
                            /></button>
                        ) : (
                            <button className="btn-primary-n ani-1 connect swap" onClick={() => {
                                this.approve();
                            }}>Approve</button>
                        )
                    ) : this.state.swapLoading ? (
                        <button className="btn-primary-n ani-1 connect swap"><LoopCircleLoading
                            height={"20px"}
                            width={"20px"}
                            color={"#ffffff"}
                        /></button>
                    ) : (
                        <button className="btn-primary-n ani-1 connect swap swapBtn" onClick={() => {
                            this.swap();
                        }}>SWAP</button>
                    )}
                    <div className="swap-outer">
                        {this.state.sendFundAmount > 0 && this.state.sendFundAmount !== "" ?
                            <p className="font-11 color-light-n">You are swapping ${this.state.sendFundAmount} of {this.state.selectedSendCurrency} to ${this.state.sendFundAmount} of {this.state.selectedReceiveCurrency}
                                <> |  Estimated swap time: <span className="color-red">1-15 minutes</span> <i className="help-circle"><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i></i></></p>
                            : null}
                        {/* New Updated Design */}
                        {/* <p className="font-11 color-light-n">You are swapping <span className="color-white">$100</span> of BNB to <span className="color-white">$100</span> of ETH  |  Estimated swap time: <span className="color-red">1-15 minutes</span> <i className="help-circle"><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i></i></p> */}
                        {/* <p className="font-11 color-light-n">Estimated swap time: <span className="color-green">Instant</span></p> */}
                        {/* <p className="font-11 color-light-n">26.31% still pending <i className="help-circle"><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="Help Text"></i></i> | &nbsp;&nbsp;<a href="#" className="color-light-n">Start new swap</a></p> */}
                    </div>

                </div>
                {/* <div className="success-msg">
    <i className="fas fa-check"></i>
    <h4>Swap sent successfully</h4>
    <p>Check the ledger below</p>
    </div> */}

            { /** sidebar */ }
                <div className={`side-pannel ${this.state.showSidebar ? '' : ''}`}>
                    <h4>Best cross chain prices</h4>
                    <div className="">
                        <h5><span>1. <img src={SSIco} /></span>SmartSwap
                            <b><strong>0.06015 ETH</strong> [$1662.44]</b>
                            <p>Estimated fees: $0 <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="The slippage option finds the best price in the market with a slippage limit option under your trade options" aria-hidden="true"></i></i></p>
                            <p className="color-green mt-1">Super bonus 145.37% <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="The slippage option finds the best price in the market with a slippage limit option under your trade options" aria-hidden="true"></i></i></p>
                        </h5>
                        <h5><span>2. <img src={SUSIco} /></span>Sushiswap
                            <b><strong>0.05892 ETH</strong> [$1599.78]</b>
                            <p>Estimated fees: <span className="color-red">-$5.37</span></p>
                        </h5>
                        <h5><span>3. <img src={MUCIco} /></span>Multichain
                            <b><strong>0.05882 ETH</strong> [$1593.78]</b>
                            <p>Estimated fees: <span className="color-red">-$5.37</span></p>
                        </h5>
                    </div>
                </div>
                
                { /** Bottom bar */ }
                <div className="bottom-action-bar">
                    <div className="swap-Textlink">
                        <div className="powertextBX">
                            <p className='poweredBy'>Powered by <img src={SmartExchange} /></p>
                            <div class="powertextBX-links"><a href="/freelisting">Free listing</a><span>|</span><a href="">Apply for licensing</a></div>
                            <div className='powertextBX-links estimated'>
                                <p>
                                    Estimated gas and fees: <i class="help-circle"><i class="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Slippage free trades carry higher gas costs than slippage trades. Gas and fees are 100% reimbursed" aria-hidden="true"></i></i> <span>&nbsp; {Number(this.state.estimatedGasFee).toFixed(5)}&nbsp; </span> {this.state.selectedSendCurrency}
                                </p>
                            </div>
                        </div> 
                        <label className="slippage-outer">
                            <p className="active" style={{ paddingRight: "8px" }}>Dollar amount </p>
                            <Switch
                                checked={true}
                                onChange={(e) => e.preventDefault()}
                                handleDiameter={14}
                                offColor="#2e303a"
                                onColor="#2e303a"
                                offHandleColor="#91dc27"
                                onHandleColor="#91dc27"
                                height={18}
                                width={32}
                                borderRadius={0}
                                activeBoxShadow="0px 0px 0px 0px #fffc35"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                className="react-switch"
                                id="small-radius-switch"
                                disabled={true}
                            />
                            <p style={{ paddingLeft: "10px" }}>Token amount</p>
                        </label>
                        <label className="slippage-outer">
                            <p className="active" style={{ paddingRight: "10px" }}>Slippage free </p>
                            <Switch
                                checked={true}
                                onChange={(e) => e.preventDefault()}
                                handleDiameter={14}
                                offColor="#2e303a"
                                onColor="#2e303a"
                                offHandleColor="#91dc27"
                                onHandleColor="#91dc27"
                                height={18}
                                width={32}
                                borderRadius={0}
                                activeBoxShadow="0px 0px 0px 0px #fffc35"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                className="react-switch"
                                id="small-radius-switch"
                                disabled={true}
                            />
                            <p style={{ paddingLeft: "10px" }}>Best slippage</p>
                        </label>
                    </div>
                </div>
            </>



        )
    }
}

NativeSwap.contextType = WalletContext;