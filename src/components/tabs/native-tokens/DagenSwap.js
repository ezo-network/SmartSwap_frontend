import { WalletContext, EthereumEvents } from '../../../context/WalletProvider';
import React, { PureComponent, lazy, Suspense } from "react";
import Swap from "../../../../src/assets/images/swap-arrow.png";
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


export default class DagenSwap extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            networks: [],
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
        this.connectWallet = this.connectWallet.bind(this);     
    }

    componentDidMount() {
        console.log('Dagen UI mounted');
    }

    async connectWallet() {
        const wallet = this.context;
        await wallet.connectWallet();
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
        return (
            <>
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
                                        {/* <span className="currency-ic-n">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img width={20} src="/images/free-listing/chains/eth.png"></img>
                                            }
                                        </span> */}
                                    </div>
                                </div>

                                <div className="input-box2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    {/* <button className="ani-1"><img src="images/bnb.png" alt="" /> BSC</button> */}
                                    <button>
                                        <img width={20} src="/images/free-listing/chains/eth.png"></img>ETH
                                    </button>
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
                                    <button>
                                        <img width={20} src="/images/free-listing/tokens/eth.png"></img>ETH
                                    </button>
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
                                        {/* <span className="currency-ic-n ver2">
                                            {
                                                this.props.selectedInputMode === this.props.inputModes[0]
                                                    ? '$'
                                                    : <img width={20} src="/images/free-listing/chains/bsc.png"></img>
                                            }
                                        </span> */}
                                    </div>
                                </div>
                                <div className="input-box2 ver2">
                                    <label htmlFor="" className="form-label">BLOCKCHAIN</label>
                                    {/* <button className="ani-1"><img src="images/eth-icon.png" alt="" /> Ethereum</button> */}
                                    <button>
                                        <img width={20} src="/images/free-listing/chains/bsc.png"></img>BSC
                                    </button>
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
                                    <button>
                                        <img width={20} src="/images/free-listing/tokens/bnb.png"></img>BNB
                                    </button>
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
                    <button className="native-btn ani-1 connect-wallet" onClick={(e) => e.preventDefault()}>
                        CONNECT YOUR WALLET
                    </button>
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
            </>
        )
    }
}

DagenSwap.contextType = WalletContext;