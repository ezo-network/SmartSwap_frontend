import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import Loader from "react-loader-spinner";
import web3Js from "web3";
import Web3 from "web3";
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig, { getTokenList, tokenDetails } from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import SwapFactoryContract from "../helper/swapFactoryContract";
import { LoopCircleLoading } from "react-loadingg";
import CONSTANT from "../constants";
import data from "../config/constantConfig";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import WalletPopup from "../components/WalletPopup";
import CoinPopup from "../components/CoinPopup";
import SidePopup from "../components/SidePopup";
import LiquidityProvider from "../components/LiquidityProvider/LiquidityProvider";
import LiquidityFountainSP from "../components/liquidity_fountain_for_SPs";
import About from "../components/About";
import PeerPopup from "../components/PeerPopup";
import HowItWorks from "../components/HowItWorks";
import DepositToken from "../components/Deposit-withdraw";
import CefiToDefi from "../components/CefiToDefi";
import axios from "axios";
import LedgerHistory from "../components/LedgerHistory";
import NoDomain from "../components/NoDomain";
import Carousel from "react-multi-carousel";
import AnimatedNumber from "react-animated-numbers";
import "react-multi-carousel/lib/styles.css";
import { isValidAddress } from 'ethereumjs-util';
import reimbursementAbi from "../abis/reimbursementAbi.json";
import SelectToken from "./select_token"

import SBLogo01 from "../assets/images/sb-ICO-01.png";
import SBLogo02 from "../assets/images/sb-ICO-02.png";
import SBLogo03 from "../assets/images/sb-ICO-03.png";
import SBLogo04 from "../assets/images/sb-ICO-04.png";
import SBLogo05 from "../assets/images/sb-ICO-05.png";
import SBLogo06 from "../assets/images/sb-ICO-06.png";
import SBLogo07 from "../assets/images/sb-ICO-07.png";
import SBLogo08 from "../assets/images/sb-ICO-08.png";
import SBLogo09 from "../assets/images/sb-ICO-09.png";
import SBLogo010 from "../assets/images/sb-ICO-010.png";
import SBLogo011 from "../assets/images/sb-ICO-011.png";
import BigNumber from "big-number/big-number";
import Select from 'react-select';
import Switch from "react-switch";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1600 },
    items: 10,
    slidesToSlide: 1, // optional, default to 1.
  },
  desktop2: {
    breakpoint: { max: 1600, min: 1250 },
    items: 9,
    slidesToSlide: 1, // optional, default to 1.
  },
  desktop3: {
    breakpoint: { max: 1250, min: 1024 },
    items: 8,
    slidesToSlide: 1, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 4,
    slidesToSlide: 1, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
};

const $ = window.$;
export default class Home extends PureComponent {
  constructor(props) {
    super();
    this.state = { checked1: false };
    this.handleChange1 = this.handleChange1.bind(this);
    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
    this.setSendCurrency = this.setSendCurrency.bind(this);
    this.setReceiveCurrency = this.setReceiveCurrency.bind(this);
    this.updateCloneData = this.updateCloneData.bind(this);
    this.clearPreview = this.clearPreview.bind(this);
    this.getData = this.getData.bind(this);
    this.expedite = this.expedite.bind(this);
    const { match, location, history } = props;
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
      instanceSwapFactoryPolygon: null,
      instanceReimbursementBinance: null,
      instanceReimbursementEthereum: null,
      tokenInstance: {},
      txLink: "",
      wrapBox: "swap",
      txIdSent: null,
      txSentStatus: "pending",
      txSentTime: null,
      tokenReceive: "0",
      txReceiveTime: null,
      txIdReceive: null,
      txLinkSend: "",
      txLinkReturn: "",
      receiveFundAmount: "",
      sendFundAmount: "",
      actualSendFundAmount: 0,
      approxReceiveFundAmount: 0,
      allTxHistoryUI: null,
      allPendingTxHistoryUI: null,
      showTxHistory: false,
      showLedger: false,
      currencyPrices: {},
      estimatedGasFee: "0",
      tableData: [],
      isSearchTable: false,
      tableSearchResult: [],
      tableDataToDisplay: [],
      liveETHPrice: 0,
      wbnbPrice: 0,
      sideBar: false,
      tokenBalances: {
        JNTR: 0,
        "JNTR/b": 0,
        "JNTR/e": 0,
        JNTR_APPROVED: 0,
        "JNTR/b_APPROVED": 0,
        "JNTR/e_APPROVED": 0,
      },
      cloneData:
        typeof location.state === "undefined"
          ? {}
          : location.state.cloneData
            ? location.state.cloneData
            : {},
      isloading: false,
      isSubdomain: false,
      noSubDomain: false,
      subDomainName: "",
      amounts: {
        totalAmountSwapped: 0,
        feesGenerated: 0,
        smartBoughtBurned: 0,
        totalFeesReimbursed: 0,
        totalReimbursementStaking: 0
      },
      licenseeAddress: {
        56: "0x0000000000000000000000000000000000000000",
        1: "0x0000000000000000000000000000000000000000",
        97: "0x0000000000000000000000000000000000000000",
        42: "0x0000000000000000000000000000000000000000",
        80001: "0x0000000000000000000000000000000000000000",
        137: "0x0000000000000000000000000000000000000000",
      },
      loadingHistory: false,
      selectedOptionSend: { value: tokenDetails.BNB.symbol, label: tokenDetails.BNB.symbol, networkId: tokenDetails.BNB.networkId },
      selectedOptionReceive: { value: tokenDetails.ETH.symbol, label: tokenDetails.ETH.symbol, networkId: tokenDetails.ETH.networkId },
      selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs("BNB", "ETH"),
      sendCurrencyList: getTokenList().filter(function (value, index, arr) {
        return value.label !== "ETH" && value.label !== "BNB";
      }),
      recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
        return value.label !== "BNB" && value.label !== "ETH";
      }),
      web3Provider: {
        [process.env.REACT_APP_ETH_CHAIN_ID]: null,
        [process.env.REACT_APP_BSC_CHAIN_ID]: null,
        [process.env.REACT_APP_POLYGON_CHAIN_ID]: null,
      }
    };
  }

  handleChange1(checked1) {
    this.setState({ checked1 });
  }

  handleClick() {
    if (this.state.sideBar == true) {
      this.setState({
        sideBar: false
      });
    }
  }
  updateCloneData = (data) => {
    this.setState({
      cloneData: data,
    });
  };

  clearPreview = () => {
    const r = document.querySelector(":root");
    r.style.removeProperty("--text-color");
    r.style.removeProperty("--button-bg-color");
    r.style.removeProperty("--req-bg");
    this.setState({
      cloneData: {},
    });
    this.props.history.push({
      pathname: "",
      state: {
        cloneData: {},
      },
    });
  };
  componentWillMount = async () => {
    await this.fetchPrice();
    // setInterval(async () => {
    //   await this.fetchPrice();
    // }, 300000)

  };
  componentDidMount = async () => {
    let web3Provider = {};
    web3Provider[process.env.REACT_APP_ETH_CHAIN_ID] = new Web3(
      new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
    );
    web3Provider[process.env.REACT_APP_BSC_CHAIN_ID] = new Web3(
      new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
    );
    web3Provider[process.env.REACT_APP_POLYGON_CHAIN_ID] = new Web3(
      new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_POLYGON)
    );
    this.setState({
      web3Ethereum: new Web3(
        new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
      ),
      web3Binance: new Web3(
        new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
      ),
      web3Polygon: new Web3(
        new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_POLYGON)
      ),
      web3Provider
    });

    {
      //  this.openPopup('DepositToken');
      //  this.showWithId("DepositToken", "tab-A1");
    } // temporary popup on

    this.setState(
      {
        loading: true,
      },
      async () => {
        await this.initInstance();
      }
    );

    const href = window.location.href;
    const domaindata = href
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
      .split("/")[0];
    const domain = domaindata.split(".");

    console.log(domaindata);
    this.setState({
      subDomainName: domain[0],
    });

    const localhost = domaindata.indexOf("localhost");
    console.log(domain.length);
    if (domain.length === (localhost === -1 ? 3 : 2)) {
      this.setState({
        isSubdomain: true,
      });
      this.getData(domain);
    } else {
      this.setState({
        isSubdomain: false,
        isloading: false,
      });
      // setTimeout(() => {
      //   !this.state.cloneData.isPreview && this.openPopup("About");
      // }, 100);
    }

    // this.fetchTransactionStatus()
  };

  async updateTotalAmounts() {
    let ttAm = 0;
    await axios
      .get(`https://api.smartswap.exchange/summary`)
      .then((res) => {

        if (res.data.data.totalUsd) {

          ttAm = (Number(res.data.data.totalUsd) + 1170526).toFixed(0)

        }
      })
      .catch((err) => {
        console.log('error', err);
      });
    console.log(ttAm)
    setTimeout(() => {
      this.setState({
        amounts: {
          totalAmountSwapped: ttAm,
          feesGenerated: 0,
          smartBoughtBurned: 0,
          totalFeesReimbursed: 0,
          totalReimbursementStaking: 0
        }
      })
    }, 500)
  }

  getData = async (domain) => {
    this.setState({
      isloading: true,
    });
    try {
      const res = await axios.get(
        `https://wildcard.bswap.info:1830/api/v1/subdomain/getSubDomain/${domain[0]}`
      );
      console.log(res);
      if (res.data.response_code === 200) {
        if (domain[0].substring(0, 2) === "0x") {
          if (isValidAddress(domain[0])) {
            web3Config.setLicenseeData(res.data.result)
          }
        } else {
          const r = document.querySelector(":root");
          r.style.setProperty("--text-color", res.data.result.primaryColors);
          r.style.setProperty(
            "--button-bg-color",
            res.data.result.seconderyColor
          );
          r.style.setProperty(
            "--req-bg",
            `url(${res.data.result.backGroundImage})`
          );
          r.style.setProperty("--swap-btn-color", res.data.result.swapButton);
          var style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = `* { font-family: ${res.data.result.fontStyle} !important; }`;
          document.getElementsByTagName('head')[0].appendChild(style);
          // r.style.setProperty("font-family", res.data.result.fontStyle, "important");
          // window.document.body.setAttribute('style', 'font-family:Arial !important');
          this.setState({
            cloneData: {
              bgimage: res.data.result.backGroundImage,
              logoImage: res.data.result.logo,
              subDomain: res.data.result.subDomain,
              primaryColor: res.data.result.primaryColors,
              secondaryColor: res.data.result.seconderyColor,
              fontStyle: res.data.result.fontStyle,
              backgroundOverLay: res.data.result.backgroundOverLay,
              swapButtonColor: res.data.result.swapButton,
              logoUrl: res.data.result.logoUrl,
              sideBar: res.data.result.sideBar
            },
            licenseeAddress: {
              56: res.data.result.bscLicenseAddress,
              1: res.data.result.ethLicenseAddress,
              97: res.data.result.bscLicenseAddress,
              42: res.data.result.ethLicenseAddress
            }
          });
        }
      } else if (res.data.response_code === 404) {
        this.setState({
          noSubDomain: true,
        });
        setTimeout(() => {
          this.openPopup("NoDomain");
        }, 100);
      }
      this.setState({
        isloading: false,
      });
    } catch (error) {
      console.log(error)
      console.log(error.response);
      this.setState({
        isloading: false,
      });
    }
  };

  async initInstance() {
    let { web3Binance, web3Ethereum, web3Polygon } = this.state;
    let instanceSwapFactoryBinance = null;
    let instanceSwapFactoryEthereum = null;
    let instanceSwapFactoryPolygon = null;
    let instanceReimbursementBinance = null;
    let instanceReimbursementEthereum = null;
    instanceReimbursementBinance = new web3Binance.eth.Contract(
      reimbursementAbi,
      constantConfig[CONSTANT.NETWORK_ID.BINANCE].reimbursementContract
    );
    instanceReimbursementEthereum = new web3Ethereum.eth.Contract(
      reimbursementAbi,
      constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].reimbursementContract
    );
    instanceSwapFactoryBinance = new web3Binance.eth.Contract(
      swapFactoryAbi,
      constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract
    );
    instanceSwapFactoryEthereum = new web3Ethereum.eth.Contract(
      swapFactoryAbi,
      constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract
    );
    instanceSwapFactoryPolygon = new web3Polygon.eth.Contract(
      swapFactoryAbi,
      constantConfig[CONSTANT.NETWORK_ID.POLYGON].swapFactoryContract
    );

    let tokenInstance = {};
    tokenInstance["JNTR"] = new web3Binance.eth.Contract(
      tokenAbi,
      "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A"
    );
    tokenInstance["JNTR/b"] = new web3Binance.eth.Contract(
      tokenAbi,
      "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2"
    );
    tokenInstance["JNTR/e"] = new web3Ethereum.eth.Contract(
      tokenAbi,
      "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042"
    );
    this.setState(
      {
        instanceSwapFactoryBinance,
        instanceSwapFactoryEthereum,
        instanceSwapFactoryPolygon,
        instanceReimbursementBinance,
        instanceReimbursementEthereum,
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
      tokenBalances["JNTR"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR"].methods
          .balanceOf(web3Config.getAddress())
          .call(),
        "ether"
      );
      tokenBalances["JNTR/b"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR/b"].methods
          .balanceOf(web3Config.getAddress())
          .call(),
        "ether"
      );
      tokenBalances["JNTR/e"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR/e"].methods
          .balanceOf(web3Config.getAddress())
          .call(),
        "ether"
      );
      // Approve Balances
      tokenBalances["JNTR_APPROVED"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR"].methods
          .allowance(
            web3Config.getAddress(),
            "0x309208d15fba3207be6c760771ca3b4846e1be93"
          )
          .call(),
        "ether"
      );
      tokenBalances["JNTR/b_APPROVED"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR/b"].methods
          .allowance(
            web3Config.getAddress(),
            "0x309208d15fba3207be6c760771ca3b4846e1be93"
          )
          .call(),
        "ether"
      );
      tokenBalances["JNTR/e_APPROVED"] = web3Js.utils.fromWei(
        await tokenInstance["JNTR/e"].methods
          .allowance(
            web3Config.getAddress(),
            "0xeaf41806fcc2a3893a662dbba7a111630f9f6704"
          )
          .call(),
        "ether"
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
    let selectedCurId = constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId;
    if (!constantConfig.allowedNetwork.includes(networkId)) {
      notificationConfig.error("Please Select Ethereum or BSC or Polygon Main Network");
      this.setState({ btnClick: false });
      return;
    }
    if (selectedCurId !== networkId) {
      notificationConfig.warning("Change metamask network to " + CONSTANT.NETWORK_ID[selectedCurId] + "!");
      return;
    }
    // if (
    //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
    //   networkId &&
    //   (networkId === 97 || networkId === 56)
    // ) {
    //   notificationConfig.warning("Change metamask network to Ethereum!");
    //   return;
    // } else if (
    //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
    //   networkId &&
    //   (networkId === 42 || networkId === 1)
    // ) {
    //   notificationConfig.warning("Change metamask network to Binance!");
    //   return;
    // } else if (
    //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
    //   networkId &&
    //   (networkId === 80001 || networkId === 137)
    // ) {
    //   notificationConfig.warning("Change metamask network to Polygon!");
    //   return;
    // }
    this.setState(
      {
        web3: web3Config.getWeb3(),
        btnClick: false,
      },
      async () => {
        await this.fetchedUserTransaction(web3Config.getAddress());
        // await this.getData([web3Config.getAddress()])
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
    console.log(networkId)
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

    swapFactory.swap(
      CONSTANT.currencyAddresses[this.state.selectedSendCurrency],
      CONSTANT.currencyAddresses[this.state.selectedReceiveCurrency],
      value,
      swapAmount,
      allFees,
      this.state.licenseeAddress[networkId],
      (hash) => {
        this.setState({
          swapLoading: true,
          txIdSent: hash,
          txLinkSend: data[networkId].explorer + "/tx/" + hash,
        });
      },
      (receipt) => {
        // this.init()
        setTimeout(async () => {
          await this.fetchTransactionStatus(receipt.transactionHash);
        }, 120000);

        this.setState({
          swapLoading: false,
          showLedger: true,
          wrapBox: "success",
        });
        notificationConfig.success("Swap Success");
      }
    );
  }

  async fetchTransactionStatus(hash) {
    // let url = CONSTANT.API_URL + "/ledger/" + "0xcaba174a8ec3edd18e14d7dfc79e68fd0ae4193f";

    let url = process.env.REACT_APP_LEDGER_HOST + "ledger/tx/" + hash;

    console.log(url);

    var txCheckInterval = setInterval(async () => {
      console.log(" interval called ");
      await axios
        .get(url)
        .then((res) => {
          // console.log(res.data)
          let result = res.data;
          console.log(result);
          if (result.data.status === "FULFILLED" && result.data.relationship.claim.approveHash !== null) {
            console.log(result.data);
            // if (result.data.length > 0) {
            //     result.data.map((ele) => {
            //         console.log(ele.sentTx)

            //     })
            // }
            if (result.data.txHash === this.state.txIdSent) {
              console.log("in end");
              console.log("oracle tx start");
              console.log(result.data.relationship.claim.approveHash);
              if (result.data.relationship.claim.approveHash !== undefined || result.data.relationship.claim.approveHash !== null) {
                let txLinkReturn =
                  constantConfig[(result.data.chainId === 1 || result.data.chainId === 42) ? process.env.REACT_APP_BSC_CHAIN_ID : process.env.REACT_APP_ETH_CHAIN_ID].explorer +
                  "/tx/" +
                  result.data.relationship.claim.approveHash;

                result.data["recivedAmount"] = "0";
                result.data.counterParties.map(async (elementCounterParties, key) => {
                  let rcAmount = web3Js.utils.fromWei(elementCounterParties.crossAmountA) * (elementCounterParties.tokenAPrice / elementCounterParties.tokenBPrice)
                  result.data["recivedAmount"] = Number(result.data["recivedAmount"]) + Number(rcAmount);
                })

                this.updateLedgerAfterResponse(
                  result.data.relationship.claim.approveHash,
                  txLinkReturn,
                  result.data.recivedAmount
                );
                clearInterval(txCheckInterval);
              }

              console.log("oracle tx end");
            }
          }
        })
        .catch((err) => {
          console.log("error", err);
        });
    }, 60000);

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
        notificationConfig.success("Approve Success");
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
  async recivedToken(e) {
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

  async calculateSwapFees(actualSendFundAmount) {
    // console.log("----------------------------------------------amount-start----------------------------------")
    // console.log(actualSendFundAmount)
    // console.log("----------------------------------------------amount-end----------------------------------")
    let networkId = web3Config.getNetworkId();
    let { selectedOptionReceive } = this.state;
    console.log("------------------------matic-gas-price------------------------------")

    if (networkId === 56 || networkId === 97) {
      let prcsFees = 0;
      if (selectedOptionReceive.networkId === 42 || selectedOptionReceive.networkId === 1) {
        const response = await fetch(
          "https://ethgasstation.info/json/ethgasAPI.json"
        );
        const json = await response.json();
        let gasPrice = (json.fast / 10).toString();
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              web3Js.utils.toWei(gasPrice, "gwei") *
              (this.state.currencyPrices["ETH"] / this.state.currencyPrices["BNB"])).toFixed(0)).toString()
          )
        )
      } else if (selectedOptionReceive.networkId === 137 || selectedOptionReceive.networkId === 80001) {
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              (await this.state.web3Polygon.eth.getGasPrice()) *
              (this.state.currencyPrices["MATIC"] / this.state.currencyPrices["BNB"])).toFixed(0)).toString()
          )
        )
      }
      let companyFees = (
        (Number(actualSendFundAmount) * await this.getCompanyFees()) / 10000
      )
      let reimbursementFees = (
        (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.licenseeAddress[networkId])) / 10000
      )
      // console.log("----------------------------------Fee calculation Logs Start -----------------------------------------")
      // console.log("Company Fees : ", await this.getCompanyFees(this.state.instanceSwapFactoryBinance))
      // console.log("License Address : ", this.state.licenseeAddress[networkId])
      // console.log("Licensee Fees : ", await this.getReimbursementFees(this.state.instanceReimbursementBinance, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract))
      // console.log(Number(actualSendFundAmount))
      // console.log("Company Fees Calculated Amount * Company Fees / 10000: ", (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryBinance)) / 10000)
      // console.log("Licensee Fees Calculated Amount * Licensee Fees / 10000: ", (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.instanceReimbursementBinance, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract)) / 10000)
      // console.log("----------------------------------Fee calculation Logs End -----------------------------------------")
      console.log((
        (Number(actualSendFundAmount) * await this.getCompanyFees()) / 10000
      ))
      return {
        totalFees: (
          // web3Js.utils.toWei(
          ((prcsFees
            +
            companyFees
            +
            reimbursementFees
          ) * 10 ** 18).toFixed()
          // )
        ),
        processingFees: prcsFees,
        companyFees: companyFees,
        reimbursementFees: reimbursementFees
      }
    } else if (networkId === 1 || networkId === 42) {
      let prcsFees;
      if (selectedOptionReceive.networkId === 56 || selectedOptionReceive.networkId === 97) {
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              web3Js.utils.toWei("5", "gwei") *
              (this.state.currencyPrices["BNB"] / this.state.currencyPrices["ETH"])).toFixed(0)).toString()
          )
        )
      } else if (selectedOptionReceive.networkId === 137 || selectedOptionReceive.networkId === 80001) {
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              (await this.state.web3Polygon.eth.getGasPrice()) *
              (this.state.currencyPrices["MATIC"] / this.state.currencyPrices["ETH"])).toFixed(0)).toString()
          )
        )
      }
      let companyFees = (
        (Number(actualSendFundAmount) * await this.getCompanyFees()) / 10000
      )
      let reimbursementFees = (
        (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.licenseeAddress[networkId])) / 10000
      )
      // console.log("----------------------------------Fee calculation Logs Start -----------------------------------------")
      // console.log("Company Fees : ", await this.getCompanyFees(this.state.instanceSwapFactoryEthereum))
      // console.log("License Address : ", this.state.licenseeAddress[networkId])
      // console.log("Licensee Fees : ", await this.getReimbursementFees(this.state.instanceReimbursementEthereum, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract))
      // console.log(Number(actualSendFundAmount))
      // console.log("Company Fees Calculated Amount * Company Fees / 10000: ", (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryEthereum)) / 10000)
      // console.log("Licensee Fees Calculated Amount * Licensee Fees / 10000: ", (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.instanceReimbursementEthereum, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract)) / 10000)

      // console.log("----------------------------------Fee calculation Logs End -----------------------------------------")
      return {
        totalFees: (
          // web3Js.utils.toWei(
          ((prcsFees
            +
            companyFees
            +
            reimbursementFees
          ) * 10 ** 18).toFixed()
          // )
        ),
        processingFees: prcsFees,
        companyFees: companyFees,
        reimbursementFees: reimbursementFees
      }
    } else if (networkId === 137 || networkId === 80001) {
      let prcsFees;
      if (selectedOptionReceive.networkId === 42 || selectedOptionReceive.networkId === 1) {
        const response = await fetch(
          "https://ethgasstation.info/json/ethgasAPI.json"
        );
        const json = await response.json();
        let gasPrice = (json.fast / 10).toString();
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              web3Js.utils.toWei(gasPrice, "gwei") *
              (this.state.currencyPrices["ETH"] / this.state.currencyPrices["MATIC"])).toFixed(0)).toString()
          )
        )
      } else if (selectedOptionReceive.networkId === 56 || selectedOptionReceive.networkId === 97) {
        prcsFees = Number(
          web3Js.utils.fromWei(
            ((330000 *
              web3Js.utils.toWei("5", "gwei") *
              (this.state.currencyPrices["BNB"] / this.state.currencyPrices["MATIC"])).toFixed(0)).toString()
          )
        )
      }
      let companyFees = (
        (Number(actualSendFundAmount) * await this.getCompanyFees()) / 10000
      )
      let reimbursementFees = (
        (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.licenseeAddress[networkId])) / 10000
      )
      // console.log("----------------------------------Fee calculation Logs Start -----------------------------------------")
      // console.log("Company Fees : ", await this.getCompanyFees(this.state.instanceSwapFactoryEthereum))
      // console.log("License Address : ", this.state.licenseeAddress[networkId])
      // console.log("Licensee Fees : ", await this.getReimbursementFees(this.state.instanceReimbursementEthereum, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract))
      // console.log(Number(actualSendFundAmount))
      // console.log("Company Fees Calculated Amount * Company Fees / 10000: ", (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryEthereum)) / 10000)
      // console.log("Licensee Fees Calculated Amount * Licensee Fees / 10000: ", (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.instanceReimbursementEthereum, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract)) / 10000)

      // console.log("----------------------------------Fee calculation Logs End -----------------------------------------")
      return {
        totalFees: (
          // web3Js.utils.toWei(
          ((prcsFees
            +
            companyFees
            +
            reimbursementFees
          ) * 10 ** 18).toFixed()
          // )
        ),
        processingFees: prcsFees,
        companyFees: companyFees,
        reimbursementFees: reimbursementFees
      }
    }
  }

  async getCompanyFees() {
    let { web3Provider, selectedOptionSend, selectedPairAddress } = this.state;
    let instance = await new web3Provider[selectedOptionSend.networkId].eth.Contract(
      swapFactoryAbi,
      selectedPairAddress
    );
    let fees = await instance.methods.companyFee().call();
    console.log("company-fees:-----------------------", fees)
    return fees;
  }

  async getReimbursementFees(vaultAddress) {
    let { web3Provider, selectedOptionSend, selectedSendCurrency, selectedReceiveCurrency, selectedPairAddress } = this.state;

    let instance = await new web3Provider[selectedOptionSend.networkId].eth.Contract(
      reimbursementAbi,
      constantConfig.getReimbursementContractAddressByPairs(selectedSendCurrency, selectedReceiveCurrency)
    );
    let fees = await instance.methods.getLicenseeFee(vaultAddress, selectedPairAddress).call();
    console.log("reimbur-fees:-----------------------", fees)
    return fees;
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
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0xbb2b8038a1640196fbe3e38816f3e67cba72d940",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.BTC = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //USDT
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.USDT = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //BNB
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0x0a5cc39d43a12540ddbab43af588033a224fb764",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.BNB = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //ADA
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0xbe05aef285711e0ae4925d4fabd8485f054ec2e1",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.ADA = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //DOT
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0x5bcfa1765c790ff25170a0dc4b0f783b329a00fe",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.DOT = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //XRP : 0x4d931ed705622decbcb96d5e0736acabc65553e0
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0x4d931ed705622decbcb96d5e0736acabc65553e0",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.XRP = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    //UNI : 0xd3d2e2692501a5c9ca623199d38826e513033a17
    await axios
      .post(
        `https://node-blockchaindeveloper.mobiloitte.com/api/v1/user/afterSlippage`,
        {
          pairId: "0xd3d2e2692501a5c9ca623199d38826e513033a17",
          id: "1",
          price: value,
        }
      )
      .then((res) => {
        if (res.data.responseCode === 200) {
          Uniobj.UNI = res.data.afterSlippage;
        } else {
        }
      })
      .catch((err) => {
        console.log("error", err);
      });

    let pancakeswapValue = {};
    let obj = datTosort.map((data) => {
      if (data.shortName === "BNB") {
        pancakeswapValue = {
          usdValue: wbnbPrice,
          quote_volume: data.pancakeswapValue.quote_volume,
          base_volume: data.pancakeswapValue.base_volume,
        };
      } else if (data.shortName === "UNI") {
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

    console.log("obj", obj);

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

    await axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple%2Cmatic-network&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
      .then((res) => {
        tableDataLocalcoingecko = res.data;
      })
      .catch((err) => {
        console.log("error", err);
      });

    currencyPrices["ETH"] = tableDataLocalcoingecko["ethereum"]["usd"];

    currencyPrices["BNB"] = tableDataLocalcoingecko["binancecoin"]["usd"];

    currencyPrices["MATIC"] = tableDataLocalcoingecko["matic-network"]["usd"];

    currencyPrices["JNTR/e"] = 0.062166;
    currencyPrices["JNTR/b"] = 0.054237;
    currencyPrices["JNTR"] = 0.532;

    this.setState(
      {
        currencyPrices: currencyPrices,
      },
      () => {
        this.forceUpdate();
      }
    );
  }
  changeCurrency(check) {
    // if(check && this.state.web3 === null){
    let { selectedSendCurrency, selectedReceiveCurrency, selectedOptionSend, selectedOptionReceive } = this.state;

    this.setState(
      {
        selectedSendCurrency: selectedReceiveCurrency,
        selectedReceiveCurrency: selectedSendCurrency,
        selectedOptionSend: selectedOptionReceive,
        selectedOptionReceive: selectedOptionSend,
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedReceiveCurrency, selectedSendCurrency),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.label !== selectedOptionSend.label && selectedOptionReceive.label !== value.label;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.label !== selectedOptionReceive.label && selectedOptionSend.label !== value.label;
        }),
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

  handleChange = (name, selectedOption) => {
    const { selectedOptionSend, selectedOptionReceive } = this.state;
    if (name === "send") {
      this.setState({
        selectedSendCurrency: selectedOption.label,
        selectedOptionSend: selectedOption,
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOption.label, selectedOptionReceive.label),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.label !== selectedOption.label && selectedOptionSend.label !== value.label;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.label !== selectedOption.label && selectedOptionReceive.label !== value.label;
        }),
      })
    } else if (name === "receive") {
      this.setState({
        selectedReceiveCurrency: selectedOption.label,
        selectedOptionReceive: selectedOption,
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOptionSend.label, selectedOption.label,),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.label !== selectedOption.label && selectedOptionSend.label !== value.label;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return (value.label !== selectedOption.label && selectedOptionReceive.label !== value.label);
        }),
      })
    }
  };

  setSendCurrency(currency) {
    this.setState({ selectedSendCurrency: currency }, () => {
      this.closePopup("sendCurPop");
    });
  }
  setReceiveCurrency(currency) {
    this.setState({ selectedReceiveCurrency: currency }, () => {
      this.closePopup("receiveCurPop");
    });
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
      txLinkSend: "",
      txLinkReturn: "",
      receiveFundAmount: "",
      sendFundAmount: "",
      actualSendFundAmount: 0,
      approxReceiveFundAmount: 0,
      showLedger: false,
    });
  }
  async listenTransferEvent() {
    const { instanceSwapFactoryEthereum, instanceSwapFactoryBinance } =
      this.state;
    if (instanceSwapFactoryEthereum !== null) {
      instanceSwapFactoryEthereum.events
        .ClaimApprove(
          {
            fromBlock: "latest",
          },
          function (error, event) {
            console.log(event);
          }
        )
        .on("connected", function (subscriptionId) {
          console.log(subscriptionId);
        })
        .on(
          "data",
          function (event) {
            console.log(event); // same results as the optional callback above
            if (
              event.returnValues.user.toLocaleLowerCase() ===
              web3Config.getAddress().toLocaleLowerCase()
            ) {
              let txLinkReturn =
                constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].explorer +
                "/tx/" +
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
        .on("changed", function (event) {
          console.log(event);
          // remove event from local database
        })
        .on("error", function (error, receipt) {
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
          .getPastEvents("allEvents", {
            fromBlock: initialBlock,
            toBlock: currentBlock, // You can also specify 'latest'
          })
          .then(
            async function (result) {
              for (let i = 0; i < result.length; i++) {
                console.log(result[i].event);
                if (result[i].event === "ClaimApprove") {
                  console.log(result[i]);
                  if (
                    result[i].returnValues.user.toLocaleLowerCase() ===
                    web3Config.getAddress().toLocaleLowerCase()
                  ) {
                    let txLinkReturn =
                      constantConfig[CONSTANT.NETWORK_ID.BINANCE].explorer +
                      "/tx/" +
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
        txSentStatus: "Success",
        // txSentTime: new Date().toUTCString(),
        tokenReceive: "2",
        // txReceiveTime: new Date().toUTCString(),
        txIdReceive: hash,
        whichButton: "4",
        txLinkReturn: txLinkReturn,
        receiveFundAmount: returnAmount,
      },
      async () => {
        //   await this.enableInputs();
      }
    );
  }
  scrollToLedger() {
    $("html").animate({ scrollTop: 650 });
  }

  async fetchedUserTransaction(address) {
    // var userTxs = StableCoinStore.getFetchedUserTxs();
    this.setState({ loadingHistory: true })
    let url = process.env.REACT_APP_LEDGER_HOST + 'ledger/' + (address).toLocaleLowerCase();
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

        // sent transaction time calculation
        // if (element.sentChainId === 1) {
        //   sentTxTime = new Date(
        //     Number(
        //       (
        //         await this.state.web3Ethereum.eth.getBlock((await this.state.web3Ethereum.eth.getTransaction(element.sentTx)).blockNumber)
        //       ).timestamp.toString() + "000"
        //     )
        //   );
        // } else if (element.sentChainId === 56) {
        //   sentTxTime = new Date(
        //     Number(
        //       (
        //         await this.state.web3Binance.eth.getBlock((await this.state.web3Binance.eth.getTransaction(element.sentTx)).blockNumber)
        //       ).timestamp.toString() + "000"
        //     )
        //   );
        // }
        // // received transaction time calculation
        // if (element.oracleTx !== undefined && element.oracleTx !== null) {
        //   if (element.recivedChainId === 1) {
        //     recivedTxTime = new Date(
        //       Number(
        //         (
        //           await this.state.web3Ethereum.eth.getBlock((await this.state.web3Ethereum.eth.getTransaction(element.oracleTx)).blockNumber)
        //         ).timestamp.toString() + "000"
        //       )
        //     );
        //   } else if (element.recivedChainId === 56) {
        //     recivedTxTime = new Date(
        //       Number(
        //         (
        //           await this.state.web3Binance.eth.getBlock((await this.state.web3Binance.eth.getTransaction(element.oracleTx)).blockNumber)
        //         ).timestamp.toString() + "000"
        //       )
        //     );
        //   }
        // }
        element["sentCurrency"] =
          constantConfig.addressByToken[element.tokenA].symbol;
        element["recivedCurrency"] =
          constantConfig.addressByToken[element.tokenB].symbol;

        element["sentTxLink"] =
          constantConfig[(element.chainId === 56 || element.chainId === 97) ? process.env.REACT_APP_BSC_CHAIN_ID : process.env.REACT_APP_ETH_CHAIN_ID].explorer +
          "/tx/" +
          element.txHash;

        if (element.relationship.claim.approveHash !== undefined && element.relationship.claim.approveHash !== null) {
          element["recivedTxLink"] =
            constantConfig[(element.chainId === 1 || element.chainId === 42) ? process.env.REACT_APP_BSC_CHAIN_ID : process.env.REACT_APP_ETH_CHAIN_ID].explorer +
            "/tx/" +
            element.relationship.claim.approveHash;
          element["oracleTx"] = element.relationship.claim.approveHash;
        }



        element["recivedAmount"] = web3Js.utils.fromWei(element.estimatedForeignAmount);
        // element.counterParties.map(async (elementCounterParties, key) => {
        //   let rcAmount = web3Js.utils.fromWei(elementCounterParties.crossAmountA) * (elementCounterParties.tokenAPrice / elementCounterParties.tokenBPrice)
        //   element["recivedAmount"] = Number(element["recivedAmount"]) + Number(rcAmount);
        // })

        if (element.status === "FULFILLED" && element.relationship.claim.approveHash !== null) {
          userTxsUI.push(
            // <LedgerHistory />
            <LedgerHistory
              sentAmount={web3Js.utils.fromWei(element.processAmount)}
              sentCurrency={element.sentCurrency}
              sentAPrice={element.sentAPrice}
              sentTx={element.txHash}
              sentTxLink={element.sentTxLink}
              filledBprice={element.filledBprice}
              recivedAmount={element.recivedAmount}
              recivedCurrency={element.recivedCurrency}
              oracleTx={element.oracleTx}
              recivedTxLink={element.recivedTxLink}
              sentTxTime={sentTxTime.toString()}
              recivedTxTime={recivedTxTime.toString()}
              filledAprice={element.filledAprice}
              chainId={element.chainId}
              expedite={this.expedite}
            />
          );
        } else {
          userPendingTxsUI.push(
            // <LedgerHistory />
            <LedgerHistory
              sentAmount={web3Js.utils.fromWei(element.processAmount)}
              sentCurrency={element.sentCurrency}
              sentAPrice={element.sentAPrice}
              sentTx={element.txHash}
              sentTxLink={element.sentTxLink}
              filledBprice={element.filledBprice}
              recivedAmount={element.recivedAmount}
              recivedCurrency={element.recivedCurrency}
              oracleTx={element.oracleTx}
              recivedTxLink={element.recivedTxLink}
              sentTxTime={sentTxTime.toString()}
              recivedTxTime={recivedTxTime.toString()}
              filledAprice={element.filledAprice}
              chainId={element.chainId}
              expedite={this.expedite}
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

  async stopLoadingHist() {
    setTimeout(() => { this.setState({ loadingHistory: false }) }, 3000)
  }

  showHistory = (which, show) => {
    this.setState(
      {
        showTxHistory: show,
        showAllTx: which === "all" ? true : false,
      },
      () => {
        if (show) {
          $("html, body").animate({ scrollTop: 620 }, "slow");
        }
      }
    );
  };

  async expedite(txId, processAmount, sentChainId) {
    let web3 = web3Config.getWeb3();
    let networkId = web3Config.getNetworkId();
    console.log(networkId)
    let address = web3Config.getAddress();
    if (web3 === null) return 0;

    if (sentChainId !== networkId) {
      notificationConfig.warning("Change metamask network to " + CONSTANT.NETWORK_ID[sentChainId] + "!");
      return;
    }

    let swapFactory = new SwapFactoryContract(web3Config.getWeb3(), networkId);

    let allFees = await this.calculateSwapFees(processAmount);
    await swapFactory.expedite(txId, (((Number(allFees.processingFees) * 0.10 + Number(allFees.processingFees))) * 10 ** 18).toFixed(),
      (hash) => {
        this.setState({
          // swapLoading: true,
          // txIdSent: hash,
          // txLinkSend: data[networkId].explorer + "/tx/" + hash,
        });
      },
      (receipt) => {
        // this.init()
        // setTimeout(async () => {
        //   await this.fetchTransactionStatus(receipt.transactionHash);
        // }, 120000);

        // this.setState({
        //   swapLoading: false,
        //   showLedger: true,
        //   wrapBox: "success",
        // });
        notificationConfig.success("Expedite Success");
      }
    );
  }

  render() {
    return (
      <>
        {this.state.isloading ? (
          <p>Loading</p>
        ) : (
          <main id="main" className="smartSwap">
            <div className="fullscreen-bg">
              <div className="fsbg_sad01"></div>
              <div className="fsbg_container">
                <video loop autoPlay muted className="fullscreen-bg__video">
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.webm"} type="video/webm" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.mp4"} type="video/mp4" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.ogv"} type="video/ogg" />
                </video>
              </div>
            </div>
            <div className="main">
              {/* <!--======================= RIGHT SIDE MENU =====================--> */}
              <RightSideMenu
                web3={this.state.web3}
                openPopup={this.openPopup}
                web3Config={web3Config}
                cloneData={this.state.cloneData}
              ></RightSideMenu>
              {/* <!--======================= RIGHT SIDE MENU END  =====================-->
                    <!--======================= HEADER START =====================--> */}
              <Header
                web3={this.state.web3}
                web3Config={web3Config}
                cloneData={this.state.cloneData}
                isSubdomain={this.state.isSubdomain}
                clearPreview={this.clearPreview}
              ></Header>
              {/* <!--======================= HEADER END =====================--> */}
              <div className="backgroundBlock" onClick={this.handleClick} >
                <div
                  className={
                    this.state.cloneData.bgimage
                      ? "mainBlock required-bg"
                      : "mainBlock"
                  }
                  style={
                    this.state.cloneData.bgimage
                      ? this.state.cloneData.fontStyle &&
                        this.state.cloneData.fontStyle !== "Default"
                        ? {
                          fontFamily: this.state.cloneData.fontStyle,
                          backgroundColor: `rgba(0, 0, 0, 0.${this.state.cloneData.backgroundOverLay})`,
                        }
                        : {
                          backgroundColor: `rgba(0, 0, 0, 0.${this.state.cloneData.backgroundOverLay})`,
                        }
                      : null
                  }
                >
                  <div className="container-Grid">
                    <div className="boost-outer">
                      <div className="boost-left">
                        <h2>Boost your web3 dApp sales by giving your customers the best payment experience</h2>
                        <p>Super easy one-click multichain solution allowing customers to pay with any token or blockchain while you get the token on the blockchain you need.</p>
                        <p className="green">Instead of Deploying Your Project on Multiple Blockchains, Deploy One SmartBridge or Create a Quick Bridge Window to Welcome Them All</p>
                      </div>
                      <div className="boost-right">
                        <img src="images/mobile-frame.png" alt="" />
                      </div>
                    </div>
                    <div className="o-outer">
                      <div className="o-left">
                        <p className="option">OPTION 1</p>
                        <h3>ONE-CLICK SmartBridge</h3>
                        <p>This code will allow users to push by ONE click any token from any network, and receive the final assets that the project is offering.</p>
                        <p className="mb-135">The One-Click SmartBridge allows users one-click access from any token on any network to the final asset the project offers.</p>
                        <p className="need-text">You need to call this function in SmartBridge contract</p>
                        <div className="code-block">
                          <p><span>//user should approve tokens transfer before calling this function.</span></p>
                          <p><span>//if no licensee set it to address(0)</span></p>
                          <p>function swap(</p>
                             <p>address tokenA, <span>// token that user send to swap ( address(1) for BNB, address(2) for ETH)</span></p>
                             <p>address tokenB, <span>// token that user want to receive ( address(1) for BNB, address(2) for ETH)</span></p>
                             <p>address receiver, <span>// address that will receive tokens on other chain (user's wallet address)</span></p>
                             <p>uint256 amountA,  <span>// amount of tokens user sends to swap</span></p>
                             <p>address licensee,   <span>// for now, = address(0)</span></p>
                             <p>bool isInvestment,  <span>// for now, = false</span></p>
                             <p>uint128 minimumAmountToClaim,   <span>// do not claim on user behalf less of this amount. Only exception if order fulfilled. For now, = 0</span></p>
                             <p>uint128 limitPice   <span>// Do not match user if token A price less this limit. For now, = 0</span></p>
                             <p>)</p>
                             <p>external</p>
                             <p>payable</p>
                             <p><span>returns (bool)</span></p>
                        </div>
                        <div className="Box-bottom">
                          <Link to='#'>See example for live SmartBridge button for UniSwap V2 DEXs clone</Link>
                          <i className="fas fa-copy"></i>
                        </div>
                        <Link to='#' className="dc-file">Download ABI of smart contract file</Link>
                      </div>
                      <div className="o-left pl-15">
                        <p className="option">OPTION 2</p>
                        <h3>Quick Bridge Window</h3>
                        <p>This code will allow users to push any token from any network, and receive back to their wallet a stablecoin (like USDT) that belongs to the network that complies with the project, once receiving that stablecoin, users will not need to leave the project page and can interact with the project like a regular transaction.</p>
                        <p className="mb-45">The Quick Bridge Window allows users to push any token on any network to receive a stablecoin on the network that complies with your project. Once the project receives the stablecoin, users will not need to leave the project page, they can interact directly with the project.</p>
                        <div className="code-block">
                          <p><span>//user should approve tokens transfer before calling this function.</span></p>
                          <p><span>//if no licensee set it to address(0)</span></p>
                          <p>function swap(</p>
                             <p>address tokenA, <span>// token that user send to swap ( address(1) for BNB, address(2) for ETH)</span></p>
                             <p>address tokenB, <span>// token that user want to receive ( address(1) for BNB, address(2) for ETH)</span></p>
                             <p>address receiver, <span>// address that will receive tokens on other chain (user's wallet address)</span></p>
                             <p>uint256 amountA,  <span>// amount of tokens user sends to swap</span></p>
                             <p>address licensee,   <span>// for now, = address(0)</span></p>
                             <p>bool isInvestment,  <span>// for now, = false</span></p>
                             <p>uint128 minimumAmountToClaim,   <span>// do not claim on user behalf less of this amount. Only exception if order fulfilled. For now, = 0</span></p>
                             <p>uint128 limitPice   <span>// Do not match user if token A price less this limit. For now, = 0</span></p>
                             <p>)</p>
                             <p>external</p>
                             <p>payable</p>
                             <p><span>returns (bool)</span></p>
                        </div>
                        <div className="Box-bottom">
                          <Link to='#'>See example for live SmartBridge button for UniSwap V2 DEXs clone</Link>
                          <i className="fas fa-copy"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </>
    );
  }
}
