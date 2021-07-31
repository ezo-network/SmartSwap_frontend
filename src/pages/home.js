import React, { PureComponent, lazy, Suspense } from 'react';
import { Link, Redirect } from 'react-router-dom';
import web3Js from 'web3';
import Web3 from 'web3';
import web3Config from '../config/web3Config';
import Validation from '../helper/validation';
import swapFactoryAbi from '../abis/swapFactory.json';
import tokenAbi from '../abis/tokenAbi.json';
import constantConfig from '../config/constantConfig';
import notificationConfig from '../config/notificationConfig';
import SwapFactoryContract from '../helper/swapFactoryContract';
import { LoopCircleLoading } from 'react-loadingg';
import CONSTANT from '../constants';
import data from '../config/constantConfig';
import Header from '../components/Header';
import RightSideMenu from '../components/RightSideMenu';
import WalletPopup from '../components/WalletPopup';
import CoinPopup from '../components/CoinPopup';
import SidePopup from '../components/SidePopup';
import LiquidityProvider from '../components/LiquidityProvider';
import LiquidityFountainSP from '../components/liquidity_fountain_for_SPs';
import About from '../components/About';
import PeerPopup from "../components/PeerPopup";
import HowItWorks from "../components/HowItWorks";
import CefiToDefi from "../components/CefiToDefi";
import axios from 'axios';
import LedgerHistory from '../components/LedgerHistory';

const $ = window.$;
export default class Home extends PureComponent {
    constructor(props) {
        super();
        this.setSendCurrency = this.setSendCurrency.bind(this);
        this.setReceiveCurrency = this.setReceiveCurrency.bind(this);
        this.state = {
            web3: null,
            web3Check: false,
            btnClick: false,
            swapFactory: null,
            swapLoading: false,
            selectedSendCurrency: 'BNB',
            selectedReceiveCurrency: 'ETH',
            instanceSwapFactoryBinance: null,
            instanceSwapFactoryEthereum: null,
            tokenInstance: {},
            txLink: '',
            wrapBox: 'swap',
            txIdSent: null,
            txSentStatus: 'pending',
            txSentTime: null,
            tokenReceive: '0',
            txReceiveTime: null,
            txIdReceive: null,
            txLinkSend: '',
            txLinkReturn: '',
            receiveFundAmount: '',
            sendFundAmount: '',
            actualSendFundAmount: 0,
            approxReceiveFundAmount: 0,
            allTxHistoryUI: null,
            allPendingTxHistoryUI: null,
            showTxHistory: false,
            showLedger: false,
            currencyPrices: {},
            estimatedGasFee: '0',
            tableData: [],
            isSearchTable: false,
            tableSearchResult: [],
            tableDataToDisplay: [],
            liveETHPrice: 0,
            wbnbPrice: 0,
            tokenBalances: {
                JNTR: 0,
                'JNTR/b': 0,
                'JNTR/e': 0,
                JNTR_APPROVED: 0,
                'JNTR/b_APPROVED': 0,
                'JNTR/e_APPROVED': 0,
            },
        };
    }
    componentWillMount = async () => {
        await this.fetchPrice();
    };
    componentDidMount = async () => {
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

        this.setState(
            {
                loading: true,
            },
            async () => {
                await this.initInstance();
            }
        );

        // this.fetchTransactionStatus()
    };
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
        let tokenInstance = {};
        tokenInstance['JNTR'] = new web3Binance.eth.Contract(
            tokenAbi,
            '0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A'
        );
        tokenInstance['JNTR/b'] = new web3Binance.eth.Contract(
            tokenAbi,
            '0x001667842cc59cadb0a335bf7c7f77b3c75f41c2'
        );
        tokenInstance['JNTR/e'] = new web3Ethereum.eth.Contract(
            tokenAbi,
            '0x40a99d086d517f06f9d1ed564f51ef75b8f7f042'
        );
        this.setState(
            {
                instanceSwapFactoryBinance,
                instanceSwapFactoryEthereum,
                tokenInstance,
            },
            () => {
                // this.listenTransferEvent();
            }
        );
    }
    updateTokenBalance = async () => {
        if (this.state.web3 !== null) {
            const { tokenInstance, tokenBalances, web3 } = this.state;
            // Balances
            tokenBalances['JNTR'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR'].methods
                    .balanceOf(web3Config.getAddress())
                    .call(),
                'ether'
            );
            tokenBalances['JNTR/b'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR/b'].methods
                    .balanceOf(web3Config.getAddress())
                    .call(),
                'ether'
            );
            tokenBalances['JNTR/e'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR/e'].methods
                    .balanceOf(web3Config.getAddress())
                    .call(),
                'ether'
            );
            // Approve Balances
            tokenBalances['JNTR_APPROVED'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR'].methods
                    .allowance(
                        web3Config.getAddress(),
                        '0x309208d15fba3207be6c760771ca3b4846e1be93'
                    )
                    .call(),
                'ether'
            );
            tokenBalances['JNTR/b_APPROVED'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR/b'].methods
                    .allowance(
                        web3Config.getAddress(),
                        '0x309208d15fba3207be6c760771ca3b4846e1be93'
                    )
                    .call(),
                'ether'
            );
            tokenBalances['JNTR/e_APPROVED'] = web3Js.utils.fromWei(
                await tokenInstance['JNTR/e'].methods
                    .allowance(
                        web3Config.getAddress(),
                        '0xeaf41806fcc2a3893a662dbba7a111630f9f6704'
                    )
                    .call(),
                'ether'
            );
            this.setState(
                {
                    tokenBalances: tokenBalances,
                },
                () => {
                    this.forceUpdate();
                    // this.updateButton()
                }
            );
        }
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
            constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
            networkId &&
            (networkId === 97 || networkId === 56)
        ) {
            notificationConfig.warning('Change metamask network to Ethereum!');
            return;
        } else if (
            constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
            networkId &&
            (networkId === 42 || networkId === 1)
        ) {
            notificationConfig.warning('Change metamask network to Binance!');
            return;
        }
        this.setState(
            {
                web3: web3Config.getWeb3(),
                btnClick: false,
            },
            async () => {
                await this.fetchedUserTransaction(web3Config.getAddress())
                // this.changeCurrency(false)
                // setInterval(() => {
                //     this.updateTokenBalance();
                // }, 3000);
            }
        );
    }
    async swap() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null) return 0;
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        let { sendFundAmount } = this.state;
        if (sendFundAmount === '' || sendFundAmount === 0) {
            notificationConfig.error('Enter value to swap');
            return;
        }
        let actualSendFundAmount = (
            await this.getActualAmount(
                sendFundAmount,
                this.state.selectedSendCurrency
            )
        ).toString();
        let value = 0, swapAmount = 0, fee = await this.calculateSwapFees();
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
        // console.log(actualSendFundAmount)
        // console.log(value)
        // console.log(Number(Number(value) * 0.003).toFixed())
        // fee = Number(fee) + Number(Number(Number(value) * 0.003).toFixed());
        // console.log(fee)
        swapFactory.swap(
            CONSTANT.currencyAddresses[this.state.selectedSendCurrency],
            CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency],
            value,
            swapAmount,
            fee,
            (hash) => {
                this.setState({
                    swapLoading: true,
                    txIdSent: hash,
                    txLinkSend: data[networkId].explorer + '/tx/' + hash,
                });
            },
            (receipt) => {
                // this.init()
                setTimeout(async () => {
                    await this.fetchTransactionStatus(receipt.transactionHash)
                }, 120000)

                this.setState({
                    swapLoading: false,
                    showLedger: true,
                    wrapBox: 'success',
                });
                notificationConfig.success('Swap Success');
            }
        );
    }

    async fetchTransactionStatus(hash) {

        // let url = CONSTANT.API_URL + "/ledger/" + "0xcaba174a8ec3edd18e14d7dfc79e68fd0ae4193f";

        let url = CONSTANT.API_URL + "/ledger/tx/" + hash;

        console.log(url)

        var txCheckInterval = setInterval(async () => {
            console.log(" interval called ")
            await axios
                .get(url)
                .then((res) => {
                    // console.log(res.data)
                    let result = res.data;
                    console.log(result)
                    if (result.resp_code === 1) {
                        console.log(result.data)
                        // if (result.data.length > 0) {
                        //     result.data.map((ele) => {
                        //         console.log(ele.sentTx)

                        //     })
                        // }
                        if (result.data.sentTx === this.state.txIdSent) {
                            console.log("in end")
                            console.log("oracle tx start")
                            console.log(result.data.oracleTx)
                            if (result.data.oracleTx !== undefined) {
                                let txLinkReturn =
                                    constantConfig[result.data.recivedChainId].explorer +
                                    '/tx/' +
                                    result.data.oracleTx;

                                this.updateLedgerAfterResponse(
                                    result.data.oracleTx,
                                    txLinkReturn,
                                    result.data.recivedAmount
                                );
                                clearInterval(txCheckInterval);
                            }

                            console.log("oracle tx end")
                        }
                    }
                })
                .catch((err) => {
                    console.log('error', err);
                });

        }, 60000)

        // setInterval(async () => {
        //     await axios
        //         .get(CONSTANT.API_URL + web3Config.getAddress())
        //         .then((res) => {
        //             console.log(res.data)
        //         })
        //         .catch((err) => {
        //             console.log('error', err);
        //         });
        // }, 5000)

    }

    async approve() {
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();
        if (web3 === null) return 0;
        let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);
        swapFactory.approveJNTRTokenForSwapFactory(
            constantConfig.tokenDetails[this.state.selectedSendCurrency].address,
            constantConfig[networkId].swapFactoryContract,
            (hash) => {
                this.setState({
                    approveLoading: true,
                    // txIdSent: hash,
                    // txLinkSend: data[networkId].explorer + "/tx/" + hash
                });
            },
            () => {
                // this.init()
                this.setState({
                    approveLoading: false,
                    // showLedger: true,
                    // wrapBox: "success"
                });
                notificationConfig.success('Approve Success');
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
        if (sendFundAmount === '' || sendFundAmount === 0) {
            notificationConfig.error('Enter value to swap');
            return;
        }
        let actualSendFundAmount = (
            await this.getActualAmount(
                sendFundAmount,
                this.state.selectedSendCurrency
            )
        ).toString();
        let value = 0, swapAmount = 0, fee = await this.calculateSwapFees();
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
        swapFactory.estimateSwapGasFee(
            CONSTANT.currencyAddresses[this.state.selectedSendCurrency],
            CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency],
            value,
            swapAmount,
            fee,
            '120000',
            (estGas) => {
                this.setState({
                    estimatedGasFee: estGas,
                });
            }
        );
    }
    async recivedToken(e) {
        let dollarAmount = Number(e.target.value);
        this.setState(
            {
                sendFundAmount: dollarAmount,
            },
            () => {
                this.setAmount(dollarAmount);
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
            () => {
                this.estimateGasAndFee();
            }
        );
    }
    async getActualAmount(dollarAmount, currency) {
        if (dollarAmount <= 0) return 0;
        else return dollarAmount / this.state.currencyPrices[currency];
    }

    async calculateSwapFees() {
        let networkId = web3Config.getNetworkId();
        if (networkId === 56 || networkId === 97) {
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            let gasPrice = (json.fast / 10).toString();
            return Number((330000 * web3Js.utils.toWei(gasPrice, "gwei") * (this.state.currencyPrices["ETH"] / this.state.currencyPrices["BNB"])).toFixed())
        } else if (networkId === 1 || networkId === 42) {
            return Number((330000 * web3Js.utils.toWei("5", "gwei") * (this.state.currencyPrices["BNB"] / this.state.currencyPrices["ETH"]))).toFixed()
        }
    }

    tableSearchHandler = (e) => {
        let value = e.target.value;
        if (value.length > 2) {
            let res = this.state.tableData.filter((list, i) => {
                return (
                    list.fullName.toLowerCase().substr(0, value.length) ===
                    value.toLowerCase() ||
                    list.shortName.toLowerCase().substr(0, value.length) ===
                    value.toLowerCase()
                );
            });
            this.setState((prevState) => {
                return {
                    ...prevState,
                    tableDataToDisplay: res,
                };
            });
        } else {
            this.setState((prevState) => {
                return {
                    ...prevState,
                    tableDataToDisplay: prevState.tableData,
                };
            });
        }
    };

    async dropDownSearch(e) {
        let Uniobj = {};
        let Panobj = {};
        let value = e.target.value;
        let datTosort = this.state.tableData;
        let wbnbPrice = this.state.wbnbPrice;

        //ETH
        Uniobj.ETH = this.state.liveETHPrice;
        //WBTC
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.BTC = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //USDT
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.USDT = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //BNB
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0x0a5cc39d43a12540ddbab43af588033a224fb764',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.BNB = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //ADA
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0xbe05aef285711e0ae4925d4fabd8485f054ec2e1',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.ADA = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //DOT
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0x5bcfa1765c790ff25170a0dc4b0f783b329a00fe',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.DOT = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //XRP : 0x4d931ed705622decbcb96d5e0736acabc65553e0
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0x4d931ed705622decbcb96d5e0736acabc65553e0',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.XRP = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        //UNI : 0xd3d2e2692501a5c9ca623199d38826e513033a17
        await axios
            .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`, {
                pairId: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
                id: '1',
                price: value,
            })
            .then((res) => {
                if (res.data.responseCode === 200) {
                    Uniobj.UNI = res.data.afterSlippage;
                } else {
                }
            })
            .catch((err) => {
                console.log('error', err);
            });

        let pancakeswapValue = {};
        let obj = datTosort.map((data) => {
            if (data.shortName === 'BNB') {
                pancakeswapValue = {
                    usdValue: wbnbPrice,
                    quote_volume: data.pancakeswapValue.quote_volume,
                    base_volume: data.pancakeswapValue.base_volume,
                };
            } else if (data.shortName === 'UNI') {
                pancakeswapValue = {
                    usdValue:
                        wbnbPrice *
                        ((parseFloat(data.pancakeswapValue.base_volume) +
                            parseFloat(value)) /
                            (parseFloat(data.pancakeswapValue.quote_volume) +
                                parseFloat(value))),

                    quote_volume: data.pancakeswapValue.quote_volume,
                    base_volume: data.pancakeswapValue.base_volume,
                };
            } else {
                pancakeswapValue = {
                    usdValue:
                        wbnbPrice /
                        ((parseFloat(data.pancakeswapValue.base_volume) +
                            parseFloat(value)) /
                            (parseFloat(data.pancakeswapValue.quote_volume) +
                                parseFloat(value))),

                    quote_volume: data.pancakeswapValue.quote_volume,
                    base_volume: data.pancakeswapValue.base_volume,
                };
            }
            return {
                shortName: data.shortName,
                fullName: data.fullName,
                priceUsd: data.priceUsd,
                Volume_24: data.Volume_24,
                market_cap: data.market_cap,
                symbol: data.symbol,
                coingeckoValue: data.coingeckoValue,
                coinMarketCapValue: data.coinMarketCapValue,
                uniswapValue: Uniobj[data.shortName],
                pancakeswapValue: pancakeswapValue,
            };
        });

        console.log('obj', obj);

        this.setState((prevState) => {
            return {
                ...prevState,
                tableDataToDisplay: obj,
            };
        });
    }

    async fetchPrice() {
        let MarketCap = [];
        let tableDataLocal = [];
        let tableDataLocalcoingecko = [];
        let Uniobj = {};
        let Panobj = {};
        var { currencyPrices } = this.state;
        let wbnbPrice = 0;

        let liveETHPrice = 0;

        // await axios
        //     .get(`https://api.pancakeswap.info/api/v2/tokens`)
        //     .then((res) => {
        //         wbnbPrice = parseFloat(
        //             res.data.data['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'].price
        //         );

        //         if (res.data.responseCode === 200) {
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // await axios
        //     .get(
        //         `https://ehtereum-developer-api.mobiloitte.com/api/v1/user/getLiveETHPrice`
        //     )
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             liveETHPrice = res.data.responseResult.data.bundle.ethPrice;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });
        // //pancakeswap
        // await axios
        //     .get(`https://api.pancakeswap.info/api/v2/pairs`)
        //     .then((res) => {
        //         if (res.status === 200) {
        //             Panobj = {
        //                 BTC: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },
        //                 ETH: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x2170Ed0880ac9A755fd29B2688956BD959F933F8_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x2170Ed0880ac9A755fd29B2688956BD959F933F8_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x2170Ed0880ac9A755fd29B2688956BD959F933F8_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },
        //                 USDT: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x55d398326f99059fF775485246999027B3197955_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x55d398326f99059fF775485246999027B3197955_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x55d398326f99059fF775485246999027B3197955_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },

        //                 BNB: { usdValue: wbnbPrice },
        //                 ADA: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },

        //                 DOT: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },

        //                 XRP: {
        //                     usdValue:
        //                         res.data.data[
        //                             '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].price * wbnbPrice,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        //                         ].base_volume,
        //                 },

        //                 UNI: {
        //                     usdValue:
        //                         wbnbPrice /
        //                         res.data.data[
        //                             '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xBf5140A22578168FD562DCcF235E5D43A02ce9B1'
        //                         ].price,
        //                     quote_volume:
        //                         res.data.data[
        //                             '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xBf5140A22578168FD562DCcF235E5D43A02ce9B1'
        //                         ].quote_volume,
        //                     base_volume:
        //                         res.data.data[
        //                             '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c_0xBf5140A22578168FD562DCcF235E5D43A02ce9B1'
        //                         ].base_volume,
        //                 },
        //             };
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // await axios
        //     .get(`https://ehtereum-developer-api.mobiloitte.com/api/v1/user/getMarketCap`)
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             let obj = res.data.responseResult.data;
        //             MarketCap = res.data.responseResult.data;

        //             tableDataLocal = Object.entries(obj);
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //ETH

        // Uniobj.ETH = liveETHPrice;

        // //WBTC
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.BTC = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //USDT
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.USDT = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //BNB
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0x0a5cc39d43a12540ddbab43af588033a224fb764',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.BNB = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //ADA
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0xbe05aef285711e0ae4925d4fabd8485f054ec2e1',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.ADA = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //DOT
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0x5bcfa1765c790ff25170a0dc4b0f783b329a00fe',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.DOT = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //XRP : 0x4d931ed705622decbcb96d5e0736acabc65553e0
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0x4d931ed705622decbcb96d5e0736acabc65553e0',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.XRP = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // //UNI : 0xd3d2e2692501a5c9ca623199d38826e513033a17
        // await axios
        //     .post(`https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/beforeSlippage`, {
        //         pairId: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
        //         id: '1',
        //         // price: '1000',
        //     })
        //     .then((res) => {
        //         if (res.data.responseCode === 200) {
        //             Uniobj.UNI = res.data.beforeSlippage;
        //         } else {
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // await axios
        //     .get(
        //         `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
        //     )
        //     .then((res) => {
        //         tableDataLocalcoingecko = res.data;
        //     })
        //     .catch((err) => {
        //         console.log('error', err);
        //     });

        // currencyPrices['ETH'] =
        //     MarketCap.length !== 0
        //         ? parseFloat(MarketCap.ETH.quote.USD.price) >
        //             parseFloat(tableDataLocalcoingecko['ethereum']['usd'])
        //             ? parseFloat(MarketCap.ETH.quote.USD.price)
        //             : tableDataLocalcoingecko['ethereum']['usd']
        //         : tableDataLocalcoingecko['ethereum']['usd'];

        // currencyPrices['BNB'] =
        //     MarketCap.length !== 0
        //         ? parseFloat(MarketCap.BNB.quote.USD.price) >
        //             parseFloat(tableDataLocalcoingecko['binancecoin']['usd'])
        //             ? parseFloat(MarketCap.BNB.quote.USD.price)
        //             : tableDataLocalcoingecko['binancecoin']['usd']
        //         : tableDataLocalcoingecko['binancecoin']['usd'];

        // currencyPrices['JNTR/e'] = 0.062166;
        // currencyPrices['JNTR/b'] = 0.054237;
        // currencyPrices['JNTR'] = 0.532;

        // let obj = tableDataLocal.map((data) => {
        //     let tableDataLocalcoingeckoSingle =
        //         tableDataLocalcoingecko[data[1].name.toLocaleLowerCase()];

        //     if (typeof tableDataLocalcoingeckoSingle === 'undefined') {
        //         if (data[1].name.toLocaleLowerCase() === 'binance coin') {
        //             tableDataLocalcoingeckoSingle = tableDataLocalcoingecko.binancecoin;
        //         }
        //     }

        //     if (typeof tableDataLocalcoingeckoSingle !== 'undefined') {
        //         return {
        //             shortName: data[0],
        //             fullName: data[1].name,
        //             priceUsd:
        //                 tableDataLocalcoingeckoSingle.usd > data[1].quote.USD.price
        //                     ? tableDataLocalcoingeckoSingle.usd
        //                     : data[1].quote.USD.price,
        //             Volume_24:
        //                 tableDataLocalcoingeckoSingle.usd_24h_vol >
        //                     data[1].quote.USD.volume_24h
        //                     ? tableDataLocalcoingeckoSingle.usd_24h_vol
        //                     : data[1].quote.USD.volume_24h,
        //             market_cap:
        //                 tableDataLocalcoingeckoSingle.usd_market_cap >
        //                     data[1].quote.USD.market_cap
        //                     ? tableDataLocalcoingeckoSingle.usd_market_cap
        //                     : data[1].quote.USD.market_cap,
        //             symbol: data[1].symbol,
        //             coingeckoValue: tableDataLocalcoingeckoSingle.usd,
        //             coinMarketCapValue: data[1].quote.USD.price,
        //             uniswapValue: Uniobj[data[0]],
        //             pancakeswapValue: Panobj[data[0]],
        //         };
        //     } else {
        //         return {
        //             shortName: data[0],
        //             fullName: data[1].name,
        //             priceUsd: data[1].quote.USD.price,
        //             Volume_24: data[1].quote.USD.volume_24h,
        //             market_cap: data[1].quote.USD.market_cap,
        //             symbol: data[1].symbol,
        //             coingeckoValue: data[1].quote.USD.price,
        //             coinMarketCapValue: data[1].quote.USD.price,
        //             uniswapValue: Uniobj[data[0]],
        //             pancakeswapValue: Panobj[data[0]],
        //         };
        //     }
        // });

        // obj.sort(function (a, b) {
        //     return b.market_cap - a.market_cap;
        // });

        // console.log('obj', obj);

        // this.setState((prevState) => {
        //     return {
        //         ...prevState,
        //         currencyPrices: currencyPrices,
        //         tableData: obj,
        //         liveETHPrice: liveETHPrice,
        //         wbnbPrice: wbnbPrice,
        //         tableDataToDisplay: obj,
        //     };
        // });

        await axios
            .get(
                `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
            )
            .then((res) => {
                tableDataLocalcoingecko = res.data;
            })
            .catch((err) => {
                console.log('error', err);
            });

        currencyPrices['ETH'] = tableDataLocalcoingecko['ethereum']['usd']

        currencyPrices['BNB'] = tableDataLocalcoingecko['binancecoin']['usd']

        currencyPrices['JNTR/e'] = 0.062166;
        currencyPrices['JNTR/b'] = 0.054237;
        currencyPrices['JNTR'] = 0.532;

        this.setState({
            currencyPrices: currencyPrices
        }, () => {
            this.forceUpdate()
        });
    }
    changeCurrency(check) {
        // if(check && this.state.web3 === null){
        let selectedSendCurrency = this.state.selectedSendCurrency;
        let selectedReceiveCurrency = this.state.selectedReceiveCurrency;
        this.setState(
            {
                selectedSendCurrency: selectedReceiveCurrency,
                selectedReceiveCurrency: selectedSendCurrency,
            },
            () => {
                if (this.state.sendFundAmount !== '')
                    this.setAmount(this.state.sendFundAmount);
                this.forceUpdate();
            }
        );
        // } else if(this.state.web3 !== null && check) {
        //     notificationConfig.warning("Please change metamask network!")
        // }
    }
    setSendCurrency(currency) {
        this.setState({ selectedSendCurrency: currency }, () => {
            this.closePopup('sendCurPop');
        });
    }
    setReceiveCurrency(currency) {
        this.setState({ selectedReceiveCurrency: currency }, () => {
            this.closePopup('receiveCurPop');
        });
    }
    openPopup(id) {
        $('#' + id).fadeIn();
    }
    closePopup(id) {
        $('#' + id).fadeOut();
    }
    changeWrapBox(which) {
        this.setState({
            wrapBox: which,
            txIdSent: null,
            txSentStatus: 'pending',
            txSentTime: null,
            tokenReceive: '0',
            txReceiveTime: null,
            txIdReceive: null,
            txLinkSend: '',
            txLinkReturn: '',
            receiveFundAmount: '',
            sendFundAmount: '',
            actualSendFundAmount: 0,
            approxReceiveFundAmount: 0,
            showLedger: false,
        });
    }
    async listenTransferEvent() {
        const {
            instanceSwapFactoryEthereum,
            instanceSwapFactoryBinance,
        } = this.state;
        if (instanceSwapFactoryEthereum !== null) {
            instanceSwapFactoryEthereum.events
                .ClaimApprove(
                    {
                        fromBlock: 'latest',
                    },
                    function (error, event) {
                        console.log(event);
                    }
                )
                .on('connected', function (subscriptionId) {
                    console.log(subscriptionId);
                })
                .on(
                    'data',
                    function (event) {
                        console.log(event); // same results as the optional callback above
                        if (
                            event.returnValues.user.toLocaleLowerCase() ===
                            web3Config.getAddress().toLocaleLowerCase()
                        ) {
                            let txLinkReturn =
                                constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].explorer +
                                '/tx/' +
                                event.transactionHash;
                            let returnAmount = web3Js.utils.fromWei(
                                event.returnValues.amountA.toLocaleLowerCase()
                            );
                            this.updateLedgerAfterResponse(
                                event.transactionHash,
                                txLinkReturn,
                                returnAmount
                            );
                        }
                    }.bind(this)
                )
                .on('changed', function (event) {
                    console.log(event);
                    // remove event from local database
                })
                .on('error', function (error, receipt) {
                    // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    console.log(error, receipt);
                });
        }
        if (instanceSwapFactoryBinance !== null) {
            let { web3Binance } = this.state;
            let initialBlock = await web3Binance.eth.getBlockNumber();
            setInterval(async () => {
                const currentBlock = await web3Binance.eth.getBlockNumber();
                instanceSwapFactoryBinance
                    .getPastEvents('allEvents', {
                        fromBlock: initialBlock,
                        toBlock: currentBlock, // You can also specify 'latest'
                    })
                    .then(
                        async function (result) {
                            for (let i = 0; i < result.length; i++) {
                                console.log(result[i].event);
                                if (result[i].event === 'ClaimApprove') {
                                    console.log(result[i]);
                                    if (
                                        result[i].returnValues.user.toLocaleLowerCase() ===
                                        web3Config.getAddress().toLocaleLowerCase()
                                    ) {
                                        let txLinkReturn =
                                            constantConfig[CONSTANT.NETWORK_ID.BINANCE].explorer +
                                            '/tx/' +
                                            result[i].transactionHash;
                                        let returnAmount = web3Js.utils
                                            .fromWei(result[i].returnValues.amountA)
                                            .toLocaleLowerCase();
                                        this.updateLedgerAfterResponse(
                                            result[i].transactionHash,
                                            txLinkReturn,
                                            returnAmount
                                        );
                                    }
                                }
                            }
                        }.bind(this)
                    )
                    .catch((err) => console.error(err));
                initialBlock = currentBlock;
            }, 10000);
        }
    }
    updateLedgerAfterResponse(hash, txLinkReturn, returnAmount) {
        this.setState(
            {
                isSendingOrder: false,
                txSentStatus: 'Success',
                txSentTime: new Date().toUTCString(),
                tokenReceive: '2',
                txReceiveTime: new Date().toUTCString(),
                txIdReceive: hash,
                whichButton: '4',
                txLinkReturn: txLinkReturn,
                receiveFundAmount: returnAmount,
            },
            async () => {
                //   await this.enableInputs();
            }
        );
    }
    scrollToLedger() {
        $('html').animate({ scrollTop: 650 });
    }

    async fetchedUserTransaction(address) {

        // var userTxs = StableCoinStore.getFetchedUserTxs();
        let url = `https://api.smartswap.exchange/ledger/` + address;
        const response = await fetch(url);
        const json = await response.json();

        var userTxs = json.data;
        var userTxsUI = [];
        var userPendingTxsUI = [];


        if (userTxs.length > 0) {

            userTxs.map(async (element, key) => {
                let sentTxTime = '';
                let recivedTxTime = '';

                // sent transaction time calculation
                if (element.sentChainId === 1) {
                    sentTxTime = new Date(Number((((await this.state.web3Ethereum.eth.getBlock(element.sendBlock)).timestamp).toString()) + "000"));
                } else if (element.sentChainId === 56) {
                    sentTxTime = new Date(Number((((await this.state.web3Binance.eth.getBlock(element.sendBlock)).timestamp).toString()) + "000"));
                }
                // received transaction time calculation
                if (element.oracleTx !== undefined || element.oracleTx !== null) {
                    if (element.recivedChainId === 1) {
                        recivedTxTime = new Date(Number((((await this.state.web3Ethereum.eth.getBlock(element.oracleBlock)).timestamp).toString()) + "000"));
                    } else if (element.recivedChainId === 56) {
                        recivedTxTime = new Date(Number((((await this.state.web3Binance.eth.getBlock(element.oracleBlock)).timestamp).toString()) + "000"));
                    }
                }
                element["sentCurrency"] = constantConfig.addressByToken[element.tokenA].symbol;
                element["recivedCurrency"] = constantConfig.addressByToken[element.tokenB].symbol;

                element["sentTxLink"] = constantConfig[element.sentChainId].explorer + "/tx/" + element.sentTx;
                element["recivedTxLink"] = constantConfig[element.recivedChainId].explorer + "/tx/" + element.oracleTx;


                userTxsUI.push(
                    // <LedgerHistory />
                    <LedgerHistory sentAmount={element.sentAmount} sentCurrency={element.sentCurrency} sentAPrice={element.sentAPrice}
                        sentTx={element.sentTx} sentTxLink={element.sentTxLink} recivedBPrice={element.recivedBPrice}
                        recivedAmount={element.recivedAmount} recivedCurrency={element.recivedCurrency}
                        oracleTx={element.oracleTx} recivedTxLink={element.recivedTxLink}
                        sentTxTime={sentTxTime.toString()} recivedTxTime={recivedTxTime.toString()}
                        recivedAPrice={element.recivedAPrice}
                    />
                );
                if (element.oracleTx === undefined || element.oracleTx === null) {
                    userPendingTxsUI.push(
                        // <LedgerHistory />
                        <LedgerHistory sentAmount={element.sentAmount} sentCurrency={element.sentCurrency} sentAPrice={element.sentAPrice}
                            sentTx={element.sentTx} sentTxLink={element.sentTxLink} recivedBPrice={element.recivedBPrice}
                            recivedAmount={element.recivedAmount} recivedCurrency={element.recivedCurrency}
                            oracleTx={element.oracleTx} recivedTxLink={element.recivedTxLink}
                            sentTxTime={sentTxTime.toString()} recivedTxTime={recivedTxTime.toString()}
                            recivedAPrice={element.recivedAPrice}
                        />
                    );
                }
            })
        } else {
            userTxsUI.push(
                <div style={{ textAlign: "center" }}><h2>No transaction</h2></div>
            )
            userPendingTxsUI.push(
                <div style={{ textAlign: "center" }}><h2>No transaction</h2></div>
            )
        }
        this.setState({
            allTxHistoryUI: userTxsUI,
            allPendingTxHistoryUI: userPendingTxsUI
        }, async () => {
            await this.forceUpdate()
        })
    };

    showHistory = (which, show) => {
        this.setState({
            showTxHistory: show,
            showAllTx: which === "all" ? true : false,
        }, () => {
            if (show) {
                $('html, body').animate({ scrollTop: 620 }, 'slow')
            }
        });
    };

    render() {
        return (
            <main id="main" className="smartSwap">
                <div className="fullscreen-bg">
                    <div className="fsbg_sad01"></div>
                    <div className="fsbg_container">
                        <video loop autoPlay muted className="fullscreen-bg__video">
                            <source src="video/smartswap.webm" type="video/webm" />
                            <source src="video/smartswap.mp4" type="video/mp4" />
                            <source src="video/smartswap.ogv" type="video/ogg" />
                        </video>
                    </div>
                </div>
                <div className="main">
                    {/* <!--======================= RIGHT SIDE MENU =====================--> */}
                    <RightSideMenu
                        web3={this.state.web3}
                        openPopup={this.openPopup}
                        web3Config={web3Config}
                    ></RightSideMenu>
                    {/* <!--======================= RIGHT SIDE MENU END  =====================-->
                    <!--======================= HEADER START =====================--> */}
                    <Header web3={this.state.web3} web3Config={web3Config}></Header>
                    {/* <!--======================= HEADER END =====================--> */}
                    <div className="mainBlock">
                        {/* <div className="error-Msg">
                            <label>
                                For BSC testnet use this RPC
                                URL:https://data-seed-prebsc-2-s3.binance.org:8545
              </label>
                        </div> */}
                        {/* <br />
                        <br /> */}
                        {/* <!--======================= SWAP BLOCK START =====================--> */}
                        <div className="swap-Block">
                            <div className="container-Grid">
                                <div
                                    className="smeTitle01"
                                // onClick={() => {
                                //     this.openPopup('About');
                                // }}
                                >
                                    <span>One click</span> slippage-free cross-chain swap
                                </div>
                                <div className="smvTitle02">
                                    Unlimited liquidity with CEX and OTC decentralized bridge
                                </div>
                                {this.state.wrapBox === 'swap' ? (
                                    <div className="wrap-Box">
                                        <div
                                            className="swap-Wrap wow fadeInRight"
                                            data-wow-delay="0.3s"
                                        >
                                            <div className="swap-Box">
                                                <div className="swap-Input">
                                                    <div className="swap-Title">
                                                        <div className="swap-Amt">
                                                            <span className="currecy">$</span>
                                                            <input
                                                                type="text"
                                                                id="input04"
                                                                placeholder="Send"
                                                                value={this.state.sendFundAmount}
                                                                onKeyDown={(e) => Validation.floatOnly(e)}
                                                                onChange={this.recivedToken.bind(this)}
                                                                autoComplete="off"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="swap-Title">
                                                        <div className="swap-Amt">
                                                            <span className="currecy">$</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Receive"
                                                                readOnly=""
                                                                disabled
                                                                style={{ background: '#3d3d3d' }}
                                                                value={this.state.sendFundAmount}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="coin-Box">
                                                    <div className="coin-Box01">
                                                        <div className="swap-Coin ani-1">
                                                            {/* <div className="overlay-Bg">
                                                                Change Assets{' '}
                                                                <i
                                                                    className="fa fa-caret-down"
                                                                    aria-hidden="true"
                                                                ></i>
                                                            </div> */}
                                                            <img
                                                                src={
                                                                    'images/currencies/' +
                                                                    data.tokenDetails[
                                                                        this.state.selectedSendCurrency
                                                                    ].iconName +
                                                                    '.png'
                                                                }
                                                                alt=""
                                                                className="ani-1"
                                                            />
                                                        </div>
                                                        <div className="total-Amt">
                                                            {this.state.selectedSendCurrency}
                                                        </div>
                                                        {this.state.approxReceiveFundAmount > 0 ? (
                                                            <p className="estAmount">
                                                                ≈{this.state.actualSendFundAmount.toFixed(5)}
                                                            </p>
                                                        ) : null}
                                                        <div
                                                            className="total-Amt"
                                                            style={{ paddingTop: 0 }}
                                                        >
                                                            <p>
                                                                [1 {this.state.selectedSendCurrency} : ${' '}
                                                                {parseFloat(
                                                                    this.state.currencyPrices[this.state.selectedSendCurrency]
                                                                ).toFixed(2)}
                                                                ]
                                                            </p>
                                                        </div>
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="faux-Link"
                                                            id="change-Market"
                                                            onClick={() => {
                                                                this.openPopup('sendCurPop');
                                                            }}
                                                        ></a>
                                                    </div>
                                                    <div className="swap-Icon">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="faux-Link ani-1"
                                                            onClick={() => {
                                                                this.changeCurrency(true);
                                                            }}
                                                        ></a>
                                                    </div>
                                                    <div className="coin-Box01">
                                                        <div className="swap-Coin ani-1">
                                                            {/* <div className="overlay-Bg">
                                                                Change Assets{' '}
                                                                <i
                                                                    className="fa fa-caret-down"
                                                                    aria-hidden="true"
                                                                ></i>
                                                            </div> */}
                                                            <img
                                                                src={
                                                                    'images/currencies/' +
                                                                    data.tokenDetails[
                                                                        this.state.selectedReceiveCurrency
                                                                    ].iconName +
                                                                    '.png'
                                                                }
                                                                alt=""
                                                                className="ani-1"
                                                            />
                                                        </div>
                                                        <div className="total-Amt">
                                                            {this.state.selectedReceiveCurrency}
                                                        </div>
                                                        {this.state.approxReceiveFundAmount > 0 ? (
                                                            <p className="estAmount">
                                                                ≈{this.state.approxReceiveFundAmount.toFixed(5)}
                                                            </p>
                                                        ) : null}
                                                        <div
                                                            className="total-Amt"
                                                            style={{ paddingTop: 0 }}
                                                        >
                                                            <p>
                                                                [1 {this.state.selectedReceiveCurrency} : ${' '}
                                                                {parseFloat(
                                                                    this.state.currencyPrices[this.state.selectedReceiveCurrency]
                                                                ).toFixed(2)}
                                                                ]
                                                            </p>
                                                        </div>
                                                        {/* <!-- <div className="total-Amt"> <span className="slippageText">~ ~</span> 3.202 EZO </div> --> */}
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="faux-Link"
                                                            onClick={() => {
                                                                this.openPopup('receiveCurPop');
                                                            }}
                                                        ></a>
                                                    </div>
                                                </div>
                                                {/* <!-- <div className="swap-Btn"><a href="javascript:void(0);" id="lrlock-btn" className="btn btn-large ani-1">Swap</a></div> -->
                                            <!-- <div className="swap-Btn"><a href="javascript:void(0);" className="btn btn-large greyScale ani-1"><span><i></i></span>CONNECT YOUR WALLET</a></div> -->
                                            <!-- <div className="swap-Btn"><a href="javascript:void(0);" className="btn btn-large greyScale waiting ani-1"><span className="dots"></span>THE order is waiting for A match</a></div> --> */}
                                                {/* <div className="wrap-Btn"> */}
                                                {this.state.web3 === null ||
                                                    constantConfig.tokenDetails[
                                                        this.state.selectedSendCurrency
                                                    ].networkId !== web3Config.getNetworkId() ? (
                                                    <div className="swap-Btn">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="btn btn-large greyScale ani-1"
                                                            onClick={this.connectWallet.bind(this)}
                                                        >
                                                            <span>
                                                                <i
                                                                    className={
                                                                        data.tokenDetails[
                                                                            this.state.selectedSendCurrency
                                                                        ].networkId === CONSTANT.NETWORK_ID.ETHEREUM
                                                                            ? 'ETH'
                                                                            : 'BNB'
                                                                    }
                                                                ></i>
                                                            </span>
                                                            CONNECT YOUR WALLET
                                                        </a>
                                                    </div>
                                                ) : constantConfig.tokenDetails[
                                                    this.state.selectedSendCurrency
                                                ].approveRequire &&
                                                    this.state.tokenBalances[
                                                    this.state.selectedSendCurrency + '_APPROVED'
                                                    ] <= this.state.actualSendFundAmount ? (
                                                    this.state.approveLoading ? (
                                                        <div className="swap-Btn">
                                                            <a
                                                                href="javascript:void(0);"
                                                                id="lrlock-btn"
                                                                className="btn btn-large ani-1"
                                                            >
                                                                <LoopCircleLoading
                                                                    height={'20px'}
                                                                    width={'20px'}
                                                                    color={'#ffffff'}
                                                                />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="swap-Btn">
                                                            <a
                                                                href="javascript:void(0);"
                                                                id="lrlock-btn"
                                                                className="btn btn-large ani-1"
                                                                onClick={() => {
                                                                    this.approve();
                                                                }}
                                                            >
                                                                Approve
                                                            </a>
                                                        </div>
                                                    )
                                                ) : this.state.swapLoading ? (
                                                    <div className="swap-Btn">
                                                        <a
                                                            href="javascript:void(0);"
                                                            id="lrlock-btn"
                                                            className="btn btn-large ani-1"
                                                        >
                                                            <LoopCircleLoading
                                                                height={'20px'}
                                                                width={'20px'}
                                                                color={'#ffffff'}
                                                            />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="swap-Btn">
                                                        <a
                                                            href="javascript:void(0);"
                                                            id="lrlock-btn"
                                                            className="btn btn-large ani-1"
                                                            onClick={() => {
                                                                this.swap();
                                                            }}
                                                        >
                                                            Swap
                                                        </a>
                                                    </div>
                                                )}
                                                {/* { this.state.txLink !== "" ?
                                                    <div>
                                                        <br/>
                                                        <a href={this.state.txLink} target="_blank" style={{color:"white"}}>Check transaction here</a>
                                                    </div> 
                                                    : 
                                                    null
                                                } */}
                                                {/* <div className="qr-Id">
                                                    <div className="qr-Wrap">
                                                        <a href="javascript:void(0);" className="qr-Scan"><img
                                                                src="images/qr-scan.png"
                                                                alt=""/></a><span>aDKsd1in12063abt12!NJn192oF</span>
                                                        <!-- <a href="javascript:void(0);" className="qr-Scan grey-Img"><img
                                                                src="images/qr-scan.png" alt=""/></a><input type="text"
                                                            placeholder="Type here your BTC wallet"> -->
                                                    </div>
                                                </div> */}
                                                {/* <div className="swap-Btn"><a href="javascript:void(0);"
                                                        className="btn btn-large copy-Btn ani-1">SWAP</a></div> */}
                                                {/* <!-- <div className="swap-Btn"><a href="javascript:void(0);" className="btn btn-large copy-Btn ani-1">COPY</a></div> -->
                                                <!-- <div className="swap-Btn"><a href="javascript:void(0);" className="btn btn-large copy-Btn blue-Bg ani-1">COPY</a></div> --> */}
                                                {/* <div className="qr-boxPopup" tabindex="-1">
                                                    <div className="img-Box"><img src="images/qr-code.jpg" alt=""/></div>
                                                    <div className="copy-Text"><a href="javascript:void(0);"><i
                                                                className="fas fa-copy"></i><span>Copy</span></a></div>
                                                </div> */}
                                                {/* </div> */}
                                                {/* <!-- <p className="red-Color">Please keep your browser open during the swap <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></p> -->
                                            <!-- <div className="small-Text">Share this transaction ID with a specific person you want to swap with</div> --> */}
                                                {/* <div className="Text01">Send <span className="orange-Color">0.12653</span> BTC to this vault
                                                address <i className="help-circle"><i className="fas fa-question-circle protip"
                                                        data-pt-position="top" data-pt-title="Help Text Here"
                                                        aria-hidden="true"></i></i></div> */}
                                                <div className="estimate-Popup">
                                                    <div className="popup-Box">
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                Minimum amount to swap with :
                                                            </div>
                                                            <div className="amt-Text">
                                                                <input type="text" value="$100" />
                                                            </div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                Max users to swap with :
                                                            </div>
                                                            <div className="amt-Text">10</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">Ethereum gas :</div>
                                                            <div className="amt-Text">0.000253 ETH</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                Bitcoin transfer commission :
                                                            </div>
                                                            <div className="amt-Text">0.000235 BTC</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                3rd party on-chain validation :
                                                            </div>
                                                            <div className="amt-Text">0.000135 ETH</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">Slippage :</div>
                                                            <div className="amt-Text">$0 / 0%</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">Spread :</div>
                                                            <div className="amt-Text">$0 / 0%</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                SmartSwap transaction fee :
                                                            </div>
                                                            <div className="amt-Text">$0 / 0%</div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                Max estimate cost :
                                                            </div>
                                                            <div className="amt-Text red-Color">
                                                                -$5.7556 (0.01235 ETH | 0.0002 BTC)
                                                            </div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                1:1 ZERO/1 rebate :
                                                            </div>
                                                            <div className="amt-Text green-Color">
                                                                +$5.7556 (5.7556 ZERO/1)
                                                            </div>
                                                        </div>
                                                        <div className="text-Wrap">
                                                            <div className="text-Title">
                                                                Final cost to use SmartSwap :
                                                            </div>
                                                            <div className="amt-Text">$0 / 0%</div>
                                                        </div>
                                                        <a href="javascript:void" className="close-Icon">
                                                            <img src="images/closeBTN.png" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swap-Textlink">
                                                {this.state.web3 !== null ? (
                                                    <div className="swap-Link01">
                                                        <a
                                                            className="icon-Box Setting"
                                                            id="new-Swap"
                                                            href="javascript:void(0);"
                                                        >
                                                            <i className="fas fa-cog"></i>
                                                        </a>
                                                        Estimated gas and fees:
                                                        {Number(this.state.estimatedGasFee).toFixed(5)}{' '}
                                                        {this.state.selectedSendCurrency}{' '}
                                                        <a href="javascript:void(0);" className="gas-Est">
                                                            <i
                                                                className="fas fa-question-circle"
                                                                aria-hidden="true"
                                                            ></i>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="powertextBX">
                                                        Powered by <img src="images/smLOGO.png" />{' '}
                                                    </div>
                                                )}
                                                {/* <div className="swap-Link03">
                                                <a href="javascript:void();">P2C</a> | <a href="javascript:void();">P2G</a> | <a
                                                    href="javascript:void();">P2P</a>
                                            </div>
                                            <div className="text-Popup" tabindex="-1">
                                                <span className="icon-Box"><i className="fas fa-exclamation-circle"></i></span>
                                                <div className="text-content">
                                                    <p>Element Zero SmartSwap reimburses all swap fees and does not allow any
                                                        loss of value due to spread or volatility. The max estimated gas cost
                                                        covers the direct cost of blockchain gas. If the user is swapping BTC,
                                                        there is an additional cost for 3rd party providers such as provable.xyz
                                                        and blockcypher.com to validate on-chain the exact deposit amount of
                                                        BTC.</p>
                                                    <p>A user sending BTC will deposit the maximum estimated gas cost to a
                                                        temporary wallet generated by SmartSwap and 100% owned by the user. If
                                                        the total gas cost at the end of the swap is less than the estimated
                                                        amount, the temporary wallet returns the balance to the user’s wallet.
                                                    </p>
                                                    <p>Once the final cost of gas and fees is known at the end of the swap,
                                                        SmartSwap reimburses users with ZERO/1 at 100%.</p>
                                                </div>
                                            </div> */}
                                            </div>
                                        </div>
                                    </div>
                                ) : this.state.wrapBox === 'success' ? (
                                    <div className="wrap-Box">
                                        <div
                                            className="swap-Wrap grey-Box wow fadeInRight"
                                            data-wow-delay="0.3s"
                                        >
                                            <div className="swap-Box swap-Successful">
                                                <div className="swap-Input">
                                                    <div className="swap-Title">
                                                        <div className="swap-Amt">
                                                            <span className="currecy">$</span>
                                                            <input
                                                                type="text"
                                                                id="input04"
                                                                value={this.state.sendFundAmount}
                                                            />
                                                            <i className="recCurIcon">
                                                                <img
                                                                    src={
                                                                        'images/receiveCurrencies/' +
                                                                        this.state.selectedSendCurrency +
                                                                        '.png'
                                                                    }
                                                                />
                                                            </i>
                                                        </div>
                                                    </div>
                                                    <div className="swap-Title">
                                                        <div className="swap-Amt">
                                                            <span className="currecy">$</span>
                                                            <input
                                                                type="text"
                                                                value={this.state.sendFundAmount}
                                                                readOnly
                                                            />
                                                            <i className="recCurIcon">
                                                                <img
                                                                    src={
                                                                        'images/receiveCurrencies/' +
                                                                        this.state.selectedReceiveCurrency +
                                                                        '.png'
                                                                    }
                                                                />
                                                            </i>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="swap-Icon">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="faux-Link ani-1"
                                                    >
                                                        <img
                                                            src="images/swap-Icon.png"
                                                            alt=""
                                                            className="ani-1"
                                                        />
                                                    </a>
                                                </div>
                                                <div className="successMesg01">
                                                    <div className="icon-Box">
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                    100% of the swap completed successfully
                                                    <a
                                                        href="javascript:void(0);"
                                                        onClick={() => {
                                                            this.scrollToLedger();
                                                        }}
                                                    >
                                                        Check the ledger below
                                                    </a>
                                                </div>
                                                {/* <div className="successMesg01 yellow-Color"><div className="icon-Box"><img src="images/transaction-img.png" alt="" className="ani-1" /></div>
                                            73.69% of the swap completed successfully
                                            <a href="javascript:void(0);">26.31% still pending<span><i className="fas cust-fas fa-question-circle protip" data-pt-gravity="top" data-pt-title="After you type your BTC wallet address and click the CLAIM BTC button, every pending swap will automatically deposit to your BTC wallet address. NO FURTHER ACTION IS REQUIRED"></i></span></a>
                                            </div> */}
                                            </div>
                                            <div className="swap-Textlink">
                                                <div className="swap-Link03">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="yellow-Color"
                                                        onClick={() => this.changeWrapBox('swap')}
                                                    >
                                                        Start a new swap
                                                    </a>
                                                    {/* |  <a href="javascript:void();">P2C</a>   |   <a href="javascript:void();">P2G</a>   |   <a href="javascript:void();">P2P</a> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {this.state.showLedger ? (
                                <div className="bb-traHSection">
                                    <div className="transaction-History">
                                        <div className="container-Grid">
                                            <div
                                                className="Title01 wow fadeInDown"
                                                data-wow-delay="0.3s"
                                            >
                                                <a
                                                    href="javascript:void(0)"
                                                    className="historyBTN-01 active"
                                                    data-toggle="n-collapse"
                                                    data-target="#ledgerDetailBox"
                                                    aria-expanded="false"
                                                    aria-controls="ledgerDetailBox"
                                                >
                                                    Ledger <i className="fas fa-sort-down"></i>
                                                </a>
                                            </div>
                                            <div className="n-collapse in" id="ledgerDetailBox">
                                                {/* <div className="bb-traHistoryBTNbar ">
                                                <a href="javascript:void(0);" className="">All</a> 
                                                <a href="javascript:void(0);" className="">Completed</a>
                                                <a href="javascript:void(0);" className="active">Pending</a>
                                            </div> */}
                                                <div className="transaction-histroryWrap">
                                                    <div className="transaction-histroryBox">
                                                        <div className="Title02 orange-Color">Send</div>
                                                        <div className="trasaction-Amt">
                                                            {this.state.actualSendFundAmount}{' '}
                                                            {this.state.selectedSendCurrency}
                                                            <span>({this.state.sendFundAmount})</span>
                                                        </div>
                                                        <div className="trasaction-Date">
                                                            {this.state.txSentTime}
                                                        </div>
                                                        <div className="trasaction-Box">
                                                            <div className="trasaction-Status">
                                                                <span className="icon-Box">
                                                                    <i className="fas fa-check-circle"></i>
                                                                </span>
                                                                Transaction Submitted
                                                            </div>
                                                            <div className="trans-Id">
                                                                {this.state.txIdSent}
                                                            </div>
                                                            <a
                                                                href={this.state.txLinkSend}
                                                                className="view-Trans ani-1"
                                                                target="_blank"
                                                            >
                                                                View transaction
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="arrow-Box"></div>
                                                    <div className="transaction-histroryBox">
                                                        {this.state.txSentStatus === 'Success' ? (
                                                            <div>
                                                                <div className="Title02 green-Color">
                                                                    Received <span></span>
                                                                </div>
                                                                <div className="trasaction-Amt">
                                                                    {this.state.receiveFundAmount}{' '}
                                                                    {this.state.selectedReceiveCurrency}
                                                                    {/* <span>(${this.state.sendFundAmount})</span>  */}
                                                                </div>
                                                                <div className="trasaction-Date">
                                                                    {this.state.txReceiveTime}
                                                                </div>
                                                                <div className="trasaction-Box">
                                                                    <div className="trasaction-Status">
                                                                        <span className="icon-Box">
                                                                            <i className="fas fa-check-circle"></i>
                                                                        </span>
                                                                        Funds wired to your wallet{' '}
                                                                    </div>
                                                                    <div className="trans-Id">
                                                                        {this.state.txIdReceive}
                                                                    </div>
                                                                    <div className="tsb-LinkBox">
                                                                        <a
                                                                            href={this.state.txLinkReturn}
                                                                            className="view-Trans ani-1"
                                                                            target="_blank"
                                                                        >
                                                                            View transaction
                                                                        </a>
                                                                        {/* <a href="javascript:void(0);" className="view-Trans02 ani-1" data-toggle="n-collapse" data-target="#trsBox01" aria-expanded="false" aria-controls="trsBox01">Break down fees <i className="fas fa-sort-down"></i></a> */}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="Title02 pending">
                                                                    Pending <span></span>
                                                                </div>
                                                                <div className="trasaction-Amt">
                                                                    ... {this.state.selectedReceiveCurrency}{' '}
                                                                </div>
                                                                <div className="trasaction-Box pendingColor">
                                                                    <div className="trasaction-Status pending-Text">
                                                                        Pending{' '}
                                                                        <span className="pending-loader">
                                                                            <img src="images/loader2.gif" />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p>
                                                                    {/* <span>
                                                                <a href="javascript:void(0);"><i className="fas fa-cog"></i></a>
                                                            </span> */}
                                                                    <a
                                                                        href="javascript:void(0);"
                                                                        className="ani-1"
                                                                    >
                                                                        Wait until few blocks confirmation
                                                                    </a>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            <div className="bb-traHSection">
                                <div className="container-Grid">
                                    {/* <div class="bb-traHistoryBTNbar ">
                                        <a href="javascript:void(0);" class="">All</a>
                                        <a href="javascript:void(0);" class="">Completed</a>
                                        <a href="javascript:void(0);" class="active">Pending</a>
                                    </div> */}
                                    {web3Config.getAddress() !== null ? !this.state.showTxHistory ? (
                                        <div class="bb-traHistoryBTNbar">
                                            <a href="javascript:void(0)" className="ssbtn05" onClick={() => this.showHistory('all', true)}><h4 className="orange-Color">History</h4></a>
                                        </div>
                                    ) : (
                                        <div class="bb-traHistoryBTNbar">
                                            <a href="javascript:void(0)" onClick={() => this.showHistory('all', false)}><h4 className="orange-Color">Hide</h4></a>&nbsp;
                                            <a href="javascript:void(0)" onClick={() => this.showHistory('all', true)}><h4 className="orange-Color">All</h4></a>&nbsp;
                                            <a href="javascript:void(0)" onClick={() => this.showHistory('pending', true)}><h4 className="orange-Color">Pending</h4></a>&nbsp;
                                        </div>
                                    ) : null}

                                    {this.state.showTxHistory ? this.state.showAllTx ? this.state.allTxHistoryUI : this.state.allPendingTxHistoryUI : null}

                                    {/* {this.state.allTxHistoryUI !== null ? this.state.allTxHistoryUI : null} */}

                                </div>
                            </div>

                            {/* <div className="bb-traHSection">
                                <div className="container-Grid">
                                <div class="bb-traHistoryBTNbar ">
                                    <a href="javascript:void(0);" class="">All</a> 
                                    <a href="javascript:void(0);" class="">Completed</a>
                                    <a href="javascript:void(0);" class="active">Pending</a>
                                </div>
                                    <div className="transaction-histroryWrap">
                                        <div className="transaction-histroryBox">
                                            <div className="Title02 orange-Color">Send</div>
                                            <div className="trasaction-Amt"> 50 ETH <span>($10,000)</span> </div>
                                            <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
                                            <div className="trasaction-Box">
                                                <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Transaction Submitted</div>
                                                <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
                                                <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
                                            </div>
                                        </div>
                                        <div className="arrow-Box"></div>
                                        <div className="transaction-histroryBox">
                                            <div className="Title02 green-Color">Received <span>(73.69%)</span></div>
                                            <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
                                            <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
                                            <div className="trasaction-Box">
                                                <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
                                                <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
                                                <div className="tsb-LinkBox">
                                                    <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
                                                    <a href="javascript:void(0);" className="view-Trans02 ani-1 active" data-toggle="n-collapse" data-target="#trsBox01" aria-expanded="true" aria-controls="trsBox01">Break down fees <i className="fas fa-sort-down"></i></a>
                                                </div>
                                                <div className="clearfix n-collapse in" id="trsBox01" aria-expanded="true" >
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
                                            <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
                                            <div className="trasaction-Box">
                                                <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
                                                <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
                                                <div className="tsb-LinkBox">
                                                    <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
                                                    <a href="javascript:void(0);" className="view-Trans02 ani-1" data-toggle="n-collapse" data-target="#trsBox02" aria-expanded="false" aria-controls="trsBox02">Break down fees <i className="fas fa-sort-down"></i></a>
                                                </div>
                                                <div className="n-collapse clearfix" id="trsBox02">
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
                                            <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
                                            <div className="trasaction-Box">
                                                <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
                                                <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
                                                <div className="tsb-LinkBox">
                                                    <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
                                                    <a href="javascript:void(0);" className="view-Trans02 ani-1" data-toggle="n-collapse" data-target="#trsBox03" aria-expanded="false" aria-controls="trsBox03">Break down fees <i className="fas fa-sort-down"></i></a>
                                                </div>
                                                <div className="n-collapse clearfix" id="trsBox03">
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                    <div className="tsb-transHistoryBox">
                                                        <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
                                                        <span>0.00910955 Ether ($3.43)</span>
                                                        <span><a href="javascript:void(0);">View transaction</a></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="Title02 pending">Pending <span>(73.69%)</span></div>
                                            <div className="trasaction-Amt">10 ETH  <span>($2,500)</span></div>
                                            <div className="trasaction-Box pendingColor">
                                                <div className="trasaction-Status pending-Text">Pending <span className="pending-loader"><img src="images/loader2.gif" /></span></div>
                                            </div>
                                            <p><span><a href="javascript:void(0);"><i className="fas fa-cog"></i></a></span><a href="javascript:void(0);" className="ani-1">Wait until a match will be found or cancel and redeem the 10 ETH pending to your wallet</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            <div className="swap-textBox">
                                <div className="container-Grid">
                                    <div
                                        className="swap-boxWrap wow fadeInUp"
                                        data-wow-delay="0.3s"
                                    >
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon04"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br /> cross-chain
                                                </div>
                                                <p>
                                                    No wraps, no side-chain, no light chain, no
                                                    validators, 100% true one-click swap between all
                                                    blockchains{' '}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon01"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br />
                                                    value match
                                                </div>
                                                <p>
                                                    Receive new crypto equal to the exact value you sent
                                                    with zero slippage
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon02"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100%
                                                    <br />
                                                    safe
                                                </div>
                                                <p>
                                                    No hot wallet, no deposits, no accounts, no custodial
                                                    wallets
                                                    <i className="help-circle">
                                                        <i
                                                            className="fas fa-question-circle protip"
                                                            data-pt-position="top"
                                                            data-pt-title="All transactions take place on-chain via the blockchains swapping through trustless smart contracts"
                                                            aria-hidden="true"
                                                        ></i>
                                                    </i>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon03"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100%
                                                    <br />
                                                    reimbursement
                                                </div>
                                                <p>
                                                    Fees and gas reimbursed fully with SMART{' '}
                                                    <i className="help-circle">
                                                        <i
                                                            className="fas fa-question-circle protip"
                                                            data-pt-position="top-right-corner"
                                                            data-pt-title="#reimburTip"
                                                            data-pt-width="402"
                                                            aria-hidden="true"
                                                        ></i>
                                                    </i>
                                                </p>
                                            </div>
                                            <div id="reimburTip" style={{ display: 'none' }}>
                                                <p>
                                                    At the end of the swap, once the final cost for each
                                                    user (sender / receiver) is known, the SmartSwap will
                                                    send both users SMART at the same face value to rebate
                                                    user’s fees and gas 100% paid throughout the swap.
                                                    Users must join the bus to receive the reimbursement.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon05"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br /> free license
                                                </div>
                                                <p>
                                                    Build your own SmartSwap at no cost or become an
                                                    affiliate
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon06"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br /> anonymous
                                                </div>
                                                <p>Complete privacy guard with no KYC / AML needed </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon07"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br /> scalable
                                                </div>
                                                <p>
                                                    No LP, no pools, true decentralized CEX and OTC
                                                    liquidity bridge{' '}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="swap-Box01">
                                            <div className="icon-Box icon09"></div>
                                            <div className="text-Content">
                                                <div className="text-Title">
                                                    100% <br /> decentralized
                                                </div>
                                                <p>
                                                    DAO approach with a closed system lacking any single
                                                    point of failure privilege{' '}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ssText01">
                                        SmartSwap is the world's first smart decentralized exchange
                                        (SDEX) providing a one-click slippage-free cross-chain swap
                                        in a simple layer that decentralizes the access to all CEX
                                        (Centralize exchanges) and OTC (Over-the-counter) industry.
                                        The best way to think of SDEX is like PayPal creating a
                                        simple one-click layer on top of banks to send and receive
                                        funds.
                                    </div>
                                    <div className="ssTitle01">
                                        SmartSwap AMA Series:
                                        <span>
                                            Alon Goren (Draper-Goren-Holm) and Yoda (Jude) Regev
                                        </span>
                                    </div>
                                    <div className="videoMcontent">
                                        <div className="video-responsive">
                                            <iframe
                                                width="560"
                                                height="315"
                                                src="https://www.youtube.com/embed/gnaJlUA20lk"
                                                title="YouTube video player"
                                                frameborder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowfullscreen
                                            ></iframe>
                                        </div>
                                    </div>
                                    <div className="ssBTNbar01" style={{ justifyContent: 'center' }}>
                                        <Link to="/ownLicence" className="ssBtn02">
                                            GET YOUR OWN LICENSE FOR FREE{' '}
                                        </Link>
                                        {/* <Link to="/SmartSwapLicence" className="ssBtn02">
                                            become a partner{' '}
                                        </Link> */}
                                    </div>
                                    {/* <div className="ssTitle01">Market Prices </div>
                                    <div className="ssSearchBox">
                                        <div className="ssSearchMBox01">
                                            <i class="fas fa-search"></i>
                                            <input
                                                type="text"
                                                placeholder="Search coin name or token name"
                                                onChange={(e) => this.tableSearchHandler(e)}
                                            />
                                        </div>
                                        <div className="ssSearchMBox02">
                                            Choose amount of token to compare prices
                      <div class="sswapSelectbx">
                                                <select
                                                    name="slct"
                                                    id="slct"
                                                    onChange={(e) => this.dropDownSearch(e)}
                                                >
                                                    <option value="1">1</option>
                                                    <option value="100">100</option>
                                                    <option value="1000">1000</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sswapTable01">
                                        <table
                                            width="100%"
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="10"
                                        >
                                            <tbody>
                                                <tr>
                                                    <th
                                                        colspan="3"
                                                        align="left"
                                                        valign="middle"
                                                        scope="col"
                                                        style={{ backgroundColor: '#0e0424' }}
                                                    >
                                                        <div className="TableBTN01">
                                                            Select: <button className="active">BUY</button>{' '}
                                                            <button>SELL</button>
                                                        </div>
                                                    </th>
                                                    <th align="left" valign="middle" scope="col">
                                                        Smart.Exchange
                          </th>
                                                    <th align="left" valign="middle" scope="col">
                                                        CoinGecko
                          </th>
                                                    <th align="left" valign="middle" scope="col">
                                                        CoinMarketCap
                          </th>
                                                    <th align="left" valign="middle" scope="col">
                                                        UniSwap
                          </th>
                                                    <th align="left" valign="middle" scope="col">
                                                        PancakeSwap
                          </th>
                                                </tr>
                                                <tr>
                                                    <td
                                                        width="50"
                                                        align="center"
                                                        valign="middle"
                                                        scope="col"
                                                    >
                                                        #
                          </td>
                                                    <td align="left" valign="middle" scope="col">
                                                        <b>Coin</b>
                                                    </td>
                                                    <td align="left" valign="middle" scope="col">
                                                        <b>Symbol</b>
                                                    </td>
                                                    <td align="left" valign="middle">
                                                        <strong>Final Cost</strong>
                                                    </td>
                                                    <td align="left" valign="middle">
                                                        <strong>Final Cost</strong>
                                                    </td>
                                                    <td align="left" valign="middle">
                                                        <strong>Final Cost</strong>
                                                    </td>
                                                    <td align="left" valign="middle">
                                                        <strong>Final Cost</strong>
                                                    </td>
                                                    <td align="left" valign="middle">
                                                        <strong>Final Cost</strong>
                                                    </td>
                                                </tr>

                                                {this.state.tableDataToDisplay.length > 0 &&
                                                    this.state.tableDataToDisplay.map((data, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                <td
                                                                    data-label="#"
                                                                    align="center"
                                                                    valign="middle"
                                                                >
                                                                    {i + 1}
                                                                </td>
                                                                <td
                                                                    data-label="Coin"
                                                                    align="left"
                                                                    valign="middle"
                                                                >
                                                                    <div className="coinBX">
                                                                        {' '}
                                                                        <i>
                                                                            <img
                                                                                src={`images/coins/${data.fullName}.png`}
                                                                            />
                                                                        </i>{' '}
                                                                        {data.fullName}{' '}
                                                                    </div>
                                                                </td>
                                                                <td
                                                                    data-label="Symbol"
                                                                    align="left"
                                                                    valign="middle"
                                                                >
                                                                    {data.shortName}
                                                                </td>
                                                                <td align="left" valign="middle">
                                                                    ${parseFloat(data.priceUsd).toFixed(4)}
                                                                </td>
                                                                <td align="left" valign="middle">
                                                                    ${parseFloat(data.coingeckoValue).toFixed(4)}
                                                                </td>
                                                                <td align="left" valign="middle">
                                                                    $
                                  {parseFloat(data.coinMarketCapValue).toFixed(
                                                                    4
                                                                )}
                                                                </td>
                                                                <td align="left" valign="middle">
                                                                    ${parseFloat(data.uniswapValue).toFixed(4)}
                                                                </td>
                                                                <td align="left" valign="middle">
                                                                    $
                                  {parseFloat(
                                                                    data.pancakeswapValue.usdValue
                                                                ).toFixed(4)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="sswapInfoBXM">
                                        <div className="sswapText">
                                            All prices before fees and reimbursement
                    </div>

                                        <div className="sswapPowerdBOX">
                                            Powered by{' '}
                                            <a href="#">
                                                {' '}
                                                <img src="images/coinGecko-logo.png"></img>{' '}
                                            </a>{' '}
                      |
                      <a href="#">
                                                {' '}
                                                <img src="images/coinMarketcap-logo01.png"></img>{' '}
                                            </a>{' '}
                      |
                      <a href="#">
                                                {' '}
                                                <img src="images/uniswap-logo.png"></img>{' '}
                                            </a>{' '}
                      |
                      <a href="#">
                                                {' '}
                                                <img src="images/pancake-logo.png"></img>{' '}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="sswapBreadCome">
                                        <a href="#">
                                            <i class="fas fa-angle-left"></i>
                                        </a>
                                        <a href="#" className="active">
                                            1
                    </a>
                                        <a href="#">2</a>
                                        <a href="#">3</a>
                                        <a href="#">4</a>
                                        <a href="#">5</a>
                    ...
                    <a href="#">45</a>
                                        <a href="#">
                                            <i class="fas fa-angle-right"></i>
                                        </a>
                                    </div> */}

                                    {/* <div className="ssBTNbar01">
                                        <Link to="/ownLicence" className="ssBtn02">
                                            Get your own free license{' '}
                                        </Link>
                                        <Link to="/SmartSwapLicence" className="ssBtn03">
                                            become a partner{' '}
                                        </Link>
                                    </div> */}

                                    <div className="ssTitle01">Venture Partners</div>

                                    <div className="VPMainBX">

                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-01.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-02.png" alt="" />Hassan (Hatu) Sheikh </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-03.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-04.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-05.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-06.png" alt="" />  Andrea Castiglione</div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-07.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-08.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-09.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-010.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-011.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-012.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-013.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-014.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-015.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-016.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-017.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-018.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-019.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-020.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-021.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-022.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-023.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-024.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-025.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-026.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-027.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-028.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-029.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-030.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-031.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-032.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-033.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-034.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-035.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-036.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-037.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-038.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-039.png" alt="" /> </div>
                                        <div className='VPSubBX01'>  <img src="images/venture-partners/vpICON-040.png" alt="" /> </div>
                                    </div>


                                    <div className='smrtSwapNewsletterBX'>

                                            <div className='smrtSwapNewslSBX'>
                                                <input type="text" value='smartswap.exchange/ref/917Ak92j06noRka' />
                                                <button className='submitBTN'>COPY LINK</button>
                                            </div>

                                            <div className='smrtSwapInfoSBX'>
                                            Share your link and receive 0.1% with SAMRT tokens for each swap you refer <i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i> </i>  |    Total commission:  <span>4526.32</span> SMART
                                            </div>
                                    </div>




                                </div>
                            </div>
                        </div>
                        {/* <!--======================= SWAP BLOCK END =====================--> */}
                    </div>
                    {/* <!--======================= WALLET POPUP START =====================--> */}
                    <WalletPopup
                        web3={this.state.web3}
                        web3Config={web3Config}
                    ></WalletPopup>
                    {/* <!--======================= WALLET POPUP END =====================-->
                    <!--======================= COIN POPUP START =====================--> */}
                    <CoinPopup
                        web3={this.state.web3}
                        web3Config={web3Config}
                        setCurrency={this.setSendCurrency}
                        popId={'sendCurPop'}
                        opositeSelectedCurrrency={this.state.selectedReceiveCurrency}
                        selectedCurrrency={this.state.selectedSendCurrency}
                    ></CoinPopup>
                    <CoinPopup
                        web3={this.state.web3}
                        web3Config={web3Config}
                        setCurrency={this.setReceiveCurrency}
                        popId={'receiveCurPop'}
                        opositeSelectedCurrrency={this.state.selectedSendCurrency}
                        selectedCurrrency={this.state.selectedReceiveCurrency}
                    ></CoinPopup>

                    <LiquidityProvider
                        closePopup={this.closePopup} openPopup={this.openPopup}
                    ></LiquidityProvider>

                    <LiquidityFountainSP closePopup={this.closePopup} openPopup={this.openPopup} />
                    <About
                        closePopup={this.closePopup}
                        openPopup={this.openPopup}
                    ></About>
                    <PeerPopup closePopup={this.closePopup} openPopup={this.openPopup}  ></PeerPopup>
                    <HowItWorks closePopup={this.closePopup} openPopup={this.openPopup}  ></HowItWorks>
                    <CefiToDefi closePopup={this.closePopup} openPopup={this.openPopup}  ></CefiToDefi>
                    {/* <!--======================= COIN POPUP END =====================-->
                    <!--======================= SIDE POPUP START =====================--> */}
                    <SidePopup web3={this.state.web3} web3Config={web3Config} closePopup={this.closePopup} openPopup={this.openPopup}></SidePopup>
                    {/* <!--======================= SIDE POPUP END =====================--> */}
                    {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/gnaJlUA20lk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> */}
                </div>
            </main>
        );
    }
}
