import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import Loader from "react-loader-spinner";
import web3Js from "web3";
import Web3 from "web3";
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig, { getNetworkList, getTokenByName, getTokenByNetwork, getTokenList, tokenDetails } from "../config/constantConfig";
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
import AnimatedNumbers from "react-animated-number";

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
import Collapse from "@kunukn/react-collapse";
import Dropdown from "../components/DropDown";
import Counter from "../components/Counter";

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
      userBalance: 0,
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
      selectedOptionSend: getTokenByName("BNB"),
      selectedOptionReceive: getTokenByName("ETH"),
      selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs("BNB", "ETH"),
      sendCurrencyList: getTokenList().filter(function (value, index, arr) {
        return value.label !== "ETH" && value.label !== "BNB";
      }),
      selectedNetworkOptionSend: getTokenByNetwork("BSC"),
      selectedNetworkOptionReceive: getTokenByNetwork("ETHEREUM"),
      sendNetworkList: getNetworkList().filter(function (value, index, arr) {
        return value.label !== "ETHEREUM" && value.label !== "BSC";
      }),
      recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
        return value.label !== "BSC" && value.label !== "ETHEREUM";
      }),
      recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
        return value.label !== "BNB" && value.label !== "ETH";
      }),
      web3Provider: {
        [process.env.REACT_APP_ETH_CHAIN_ID]: null,
        [process.env.REACT_APP_BSC_CHAIN_ID]: null,
        [process.env.REACT_APP_POLYGON_CHAIN_ID]: null,
      },
      allowCurrentTxExpedite: 0,
      currentTxExpediteData: {},
      checked1: false
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
    setInterval(async () => {
      await this.fetchPrice();
    }, 60000)

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
    // await this.fetchTransactionStatus("0xb41a1f771244992427ff250d2981381305c5d0bf81e5107a3b5e442b903fd339");
  };

  async updateTotalAmounts() {
    let ttAm = 0;
    await axios
      .get(`https://api.smartswap.exchange/summaries`)
      .then((res) => {
        console.log(res.data.data)
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

  updateUserBalance = async () => {
    if (this.state.web3 !== null) {
      let web3 = web3Config.getWeb3();
      // Balances
      // console.log((await web3.getBalance(web3Config.getAddress()))._hex)
      // console.log(web3Js.utils.fromWei(web3Js.utils.hexToNumberString((await web3.getBalance(web3Config.getAddress()))._hex)))      
      this.setState({
        userBalance: web3Js.utils.fromWei(web3Js.utils.hexToNumberString((await web3.getBalance(web3Config.getAddress()))._hex))
      });
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
        setInterval(async () => {
          await this.fetchedUserTransaction(web3Config.getAddress());
        }, 60000);
        // await this.getData([web3Config.getAddress()])
        // this.changeCurrency(false)
        this.updateUserBalance();
        setInterval(() => {
          this.updateUserBalance();
        }, 10000);
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
        }, 5000);

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
    // let url = CONSTANT.API_URL + "/ledgers/" + "0xcaba174a8ec3edd18e14d7dfc79e68fd0ae4193f";

    let url = process.env.REACT_APP_LEDGER_HOST + "ledgers/tx/" + hash;

    // let url = "http://18.224.106.204:8080/ledger/tx/0xb41a1f771244992427ff250d2981381305c5d0bf81e5107a3b5e442b903fd339"

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

            if (result.data.txHash === this.state.txIdSent) {
              console.log("in end");
              console.log("oracle tx start");
              console.log(result.data.relationship.claim.approveHash);
              if (result.data.relationship.claim.approveHash !== undefined || result.data.relationship.claim.approveHash !== null) {
                let txLinkReturn =
                  constantConfig[Number(result.data.crossChainId)].explorer +
                  "/tx/" +
                  result.data.relationship.claim.approveHash;


                result.data["recivedAmount"] = web3Js.utils.fromWei(result.data.estimatedForeignAmount);
                // result.data.counterParties.map(async (elementCounterParties, key) => {
                //   let rcAmount = web3Js.utils.fromWei(elementCounterParties.crossAmountA) * (elementCounterParties.tokenAPrice / elementCounterParties.tokenBPrice)
                //   result.data["recivedAmount"] = Number(result.data["recivedAmount"]) + Number(rcAmount);
                // })

                this.updateLedgerAfterResponse(
                  result.data.relationship.claim.approveHash,
                  txLinkReturn,
                  result.data.recivedAmount
                );
                clearInterval(txCheckInterval);
              }

              console.log("oracle tx end");
            }
          } else {
            if (result.data.canExpedite) {
              let curTxExData = {};
              let { allowCurrentTxExpedite } = this.state;
              curTxExData["txHash"] = result.data.txHash;
              curTxExData["processAmount"] = result.data.processAmount;
              curTxExData["chainId"] = result.data.chainId;
              curTxExData["crossChainId"] = result.data.crossChainId;
              this.setState({
                allowCurrentTxExpedite: (allowCurrentTxExpedite === 0) ? 1 : allowCurrentTxExpedite,
                currentTxExpediteData: curTxExData,
              })
            }
          }
        })
        .catch((err) => {
          console.log("error", err);
        });
    }, 5000);

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
      async () => {
        this.forceUpdate();
        if (this.state.sendFundAmount > 0)
          await this.setAmount(this.state.sendFundAmount)
      }
    );
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
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOptionSend.value && selectedOptionReceive.value !== value.value;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOptionReceive.value && selectedOptionSend.value !== value.value;
        }),
        sendNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOptionSend.value && selectedOptionReceive.value !== value.value;
        }),
        recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOptionReceive.value && selectedOptionSend.value !== value.value;
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
    const { selectedOptionSend, selectedOptionReceive, selectedNetworkOptionSend, selectedNetworkOptionReceive } = this.state;
    if (name === "send") {
      this.setState({
        selectedSendCurrency: selectedOption.value,
        selectedOptionSend: selectedOption,
        selectedNetworkOptionSend: getTokenByNetwork(selectedOption.networkName),
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOption.value, selectedOptionReceive.value),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        sendNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
      })
    } else if (name === "receive") {
      this.setState({
        selectedReceiveCurrency: selectedOption.value,
        selectedOptionReceive: selectedOption,
        selectedNetworkOptionReceive: getTokenByNetwork(selectedOption.networkName),
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOptionSend.value, selectedOption.value),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionSend.value !== value.value;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return (value.value !== selectedOption.value && selectedOptionSend.value !== value.value);
        }),
        sendNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionSend.value !== value.value;
        }),
        recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
          return (value.value !== selectedOption.value && selectedOptionSend.value !== value.value);
        }),
      })
    } else if (name === "sendNetwork") {
      this.setState({
        selectedNetworkOptionSend: selectedOption,
        selectedSendCurrency: getTokenByName(selectedOption.value).value,
        selectedOptionSend: getTokenByName(selectedOption.value),
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOption.value, selectedOptionReceive.value),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        sendNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
        recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionReceive.value !== value.value;
        }),
      })
    } else if (name === "receiveNetwork") {
      this.setState({
        selectedNetworkOptionReceive: selectedOption,
        selectedReceiveCurrency: getTokenByName(selectedOption.value).value,
        selectedOptionReceive: getTokenByName(selectedOption.value),
        selectedPairAddress: constantConfig.getSmartswapContractAddressByPairs(selectedOptionSend.value, selectedOption.value),
        sendCurrencyList: getTokenList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionSend.value !== value.value;
        }),
        recieveCurrencyList: getTokenList().filter(function (value, index, arr) {
          return (value.value !== selectedOption.value && selectedOptionSend.value !== value.value);
        }),
        sendNetworkList: getNetworkList().filter(function (value, index, arr) {
          return value.value !== selectedOption.value && selectedOptionSend.value !== value.value;
        }),
        recieveNetworkList: getNetworkList().filter(function (value, index, arr) {
          return (value.value !== selectedOption.value && selectedOptionSend.value !== value.value);
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
      allowCurrentTxExpedite: 0
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
    const options = [
      { label: 'Ethereum', value: 'Ethereum' },
      { label: 'BSC', value: 'BSC' },
      { label: 'Polygon', value: 'Polygon' },
    ];

    const optionsToken = [
      { label: 'ETH', value: 'ETH' },
      { label: 'BNB', value: 'BNB' },
      { label: 'MATIC', value: 'MATIC' },
    ];

    let counter = 0;

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
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.webm?v=1.18"} type="video/webm" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.mp4?v=1.18"} type="video/mp4" />
                  <source src={CONSTANT.PrePath + "/video/14559736-hd.ogv?v=1.18"} type="video/ogg" />
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
                        className="smeTitle01 wow fadeInUp" data-wow-delay="0.1s"
                      // onClick={() => {
                      //     this.openPopup('About');
                      // }}
                      >
                        <span>One click</span> DECENTRALIZED MULTICHAIN SMART SWAP
                      </div>
                      <div className="smvTitle02 wow fadeInUp" data-wow-delay="0.2s">
                        {/* Unlimited Liquidity CeFi to Defi Decentralized Bridge <span style={{ color: '#525252' }}>|</span> AMM Alternative */}
                        {/* Best multichain rates available with slippage free transactions or with a DeFi aggregator */}
                        Best multichain rates available from slippage or slippage free transactions with P2P and CeDeFi
                      </div>
                      {this.state.wrapBox === "swap" ? (
                        <>
                          <div className="tab-container">
                            <div className="tab-main-wrapper">
                              <ul className="tabs-n">
                                <li className="tab-link current-n" data-tab="tab-1">
                                  <div>
                                    CRYPTO
                                    <span className="text-sm-n">LIVE BETA</span>
                                  </div>
                                </li>
                                <li className="tab-link" data-tab="tab-2" style={{ pointerEvents: 'none' }}>
                                  <div>
                                    W3B
                                    <span className="text-sm-n">COMING SOON</span>
                                  </div>
                                </li>
                                <li className="tab-link" data-tab="tab-3" style={{ pointerEvents: 'none' }}>
                                  <div>
                                    FOREX
                                    <span className="text-sm-n">COMING SOON</span>
                                  </div>
                                </li>
                                <li className="tab-link" data-tab="tab-4" style={{ pointerEvents: 'none' }}>
                                  <div>
                                    STOCKS
                                    <span className="text-sm-n">COMING SOON</span>
                                  </div>
                                </li>
                              </ul>

                              {/* swap completed successfully box */}
                              {/* <div className="cs-box">
                                <div>
                                  <img src="images/big-check.png" alt="" />
                                  <p className="b-text">100% OF THE SWAP COMPLETED SUCCESSFULLY</p>
                                  <a href="#">Check the ledger below</a>
                                </div>
                              </div> */}

                              {/* max priority fee box design */}

                              {/* <div className="mx-box">
                                <div className="mx-close">
                                  <img src="images/grey-close.png" alt="" />
                                </div>
                                <div className="label-line">
                                  <p>
                                    <b>MAX PRIORITY FEE <i className="help-circle">
                                    <i
                                      className="fas fa-question-circle protip"
                                      data-pt-position="top"
                                      data-pt-title="Help Text"
                                      aria-hidden="true"
                                    ></i>
                                    </i>
                                    </b>
                                  </p>
                                  <p> Estimated high: 5 Gwei </p>
                                </div>
                                <div className="input-outer">
                                  <input type="text" placeholder="5.00" />
                                  <button>Gwei</button>
                                </div>
                                <div className="label-line">
                                  <p>
                                    <b>MAX FEE <i className="help-circle">
                                    <i
                                      className="fas fa-question-circle protip"
                                      data-pt-position="top"
                                      data-pt-title="Help Text"
                                      aria-hidden="true"
                                    ></i>
                                    </i>
                                    </b>
                                  </p>
                                  <p> Estimated high: 42 Gwei </p>
                                </div>
                                <div className="input-outer">
                                  <input type="text" placeholder="5.00" />
                                  <button>Gwei</button>
                                </div>
                                <div className="label-line">
                                  <p><b>Wait time</b></p>
                                  <p>~12 sec</p>
                                </div>
                                <div className="label-line">
                                  <p><b>Fee range</b></p>
                                  <p>41.12–74.07 Gwei</p>
                                </div>
                              </div> */}
                              <div className="tab-content-n-main">
                                <div id="tab-1" className="tab-content-n current-n">
                                  <div className="">
                                    <div className="form-group-n  items-center-n">
                                      <div className="d-flex balance-row">
                                        <div className="b-text">
                                          Balance: {Number(this.state.userBalance).toFixed(4)} &nbsp;<span>MAX</span>
                                        </div>
                                        {/* <img src="images/slider-icon.png" alt="" /> */}
                                      </div>
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
                                                  onChange={this.recivedToken.bind(this)}
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
                                              <Select
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
                                              />
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

                                              <Select
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
                                              />
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
                                        </div>
                                      </div>
                                      <div className="form-ic">
                                        <a className="grey-arrow"
                                          href="javascript:void(0);"
                                          onClick={() => {
                                            this.changeCurrency(true);
                                          }}
                                        >
                                          <img src="images/green-arrow.png" alt="" />
                                        </a>
                                        <a className="green-arrow"
                                          href="javascript:void(0);"
                                          onClick={() => {
                                            this.changeCurrency(true);
                                          }}
                                        >
                                          <img src="images/green-arrow.png" alt="" />
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
                                              <Select
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
                                              />

                                            </div>
                                            <div className="input-box2 ver2">
                                              <label htmlFor="" className="form-label">TOKEN</label>
                                              {/* <button className="border-left-0 ani-1"><img src="images/eth-icon.png" alt="" /> ETH</button> */}
                                              <Select
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
                                              />
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
                                    <div className="text-center">
                                      {this.state.web3 === null ||
                                        constantConfig.tokenDetails[
                                          this.state.selectedSendCurrency
                                        ].networkId !== web3Config.getNetworkId() ? (
                                        <button className="btn-primary-n ani-1 connect" style={{ background: "#0d0e13" }} onClick={this.connectWallet.bind(this)}><span>
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
                                          <img src={"images/receiveCurrencies/" + this.state.selectedSendCurrency + ".png"} alt="" /> CONNECT YOUR WALLET</button>

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
                                  </div>
                                </div>
                                <div id="tab-2" className="tab-content-n">
                                  <div className="">
                                    <div className="form-group-n d-flex items-center-n">
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">from</label>
                                        <div className="inputs-wrap light-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item" id="bnb2" name="currency">
                                                <option value="btc" data-icon="images/bnb.png"> BNB</option>
                                                <option value="eth" data-icon="images/eth.png"> ETH</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">≈ 0.0123 | 1 BNB : $257.63</p>
                                      </div>
                                      <div className="form-ic">
                                        <a href=""><img src="images/form-middle-ic.png" alt="" /></a>
                                      </div>
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">to</label>
                                        <div className="inputs-wrap dark-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item" id="eth2" name="demo">
                                                <option value="btc" data-icon="images/bnb.png"> BNB</option>
                                                <option value="eth" data-icon="images/eth.png"> ETH</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">≈ 3.2025 | 1 ETH : $2,070.12</p>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <button className="btn-primary-n">SWAP</button>
                                      <p className="font-11 color-light-n mb-0-n">You are swapping $100 of BNB to $100 of ETH</p>
                                    </div>
                                  </div>
                                </div>
                                <div id="tab-3" className="tab-content-n">
                                  <div className="">
                                    <div className="form-group-n d-flex items-center-n">
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">from</label>
                                        <div className="inputs-wrap light-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item" id="usd" name="currency">
                                                <option value="USD" data-icon="images/usd.png" > USD</option>
                                                <option value="EUR" data-icon="images/eur.png"> EUR</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">1 EUR = 1.1414 USD</p>
                                      </div>
                                      <div className="form-ic">
                                        <a href=""><img src="images/form-middle-ic.png" alt="" /></a>
                                      </div>
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">to</label>
                                        <div className="inputs-wrap dark-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item" id="eur" name="demo">
                                                <option value="EUR" data-icon="images/eur.png"> EUR</option>
                                                <option value="USD" data-icon="images/usd.png"> USD</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">1 EUR = 1.1414 USD</p>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <button className="btn-primary-n">SWAP</button>
                                    </div>
                                    <p className="font-11 color-light-n mb-0-n text-with-svg-sm">
                                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cog" className="svg-inline--fa fa-cog fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path></svg>
                                      <span className="text-between-ic"> Estimated gas and fees: 0.0015 USD</span>
                                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="question-circle" className="svg-inline--fa fa-question-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"></path></svg>
                                    </p>
                                  </div>
                                </div>
                                <div id="tab-4" className="tab-content-n">
                                  <div className="">
                                    <div className="form-group-n d-flex items-center-n">
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">from</label>
                                        <div className="inputs-wrap light-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item no-img" id="jd1" name="currency">
                                                <option value="JD.com" > JD.com</option>
                                                <option value="Yandex" > Yandex</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">1 JD.COM = 0.8759 YANDEX
                                        </p>
                                      </div>
                                      <div className="form-ic">
                                        <a href=""><img src="images/form-middle-ic.png" alt="" /></a>
                                      </div>
                                      <div className="flex-1 w-100-sm flex-auto-sm">
                                        <label htmlFor="" className="form-label">to</label>
                                        <div className="inputs-wrap dark-controls-n">
                                          <span className="currency-ic-n">
                                            $
                                          </span>
                                          <div className="inputs-wrap-control">
                                            <input type="text" className="form-control-n" placeholder="Enter amount" />
                                            <div className="relative select-item-wrap">
                                              <select className="select-item no-img" id="jd2" name="demo">
                                                <option value="Yandex" > Yandex</option>
                                                <option value="JD.com" > JD.com</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="form-label font-normal pl-50">1 YANDEX = 1.1414 JD.COM
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <button className="btn-primary-n">SWAP</button>
                                    </div>
                                    <p className="font-11 color-light-n mb-0-n text-with-svg-sm">
                                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cog" className="svg-inline--fa fa-cog fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path></svg>
                                      <span className="text-between-ic"> Estimated gas and fees: 0.0015 USD</span>
                                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="question-circle" className="svg-inline--fa fa-question-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"></path></svg>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                          <div className="swap-Textlink">
                            {this.state.web3 !== null ? (
                              <div className="swap-Link01">
                                <a
                                  className="icon-Box Setting"
                                  // onClick={() => { this.setState({ sideBar: !this.state.sideBar }) }}
                                  href="javascript:void(0);"
                                >
                                  <i className="fas fa-cog"></i>
                                </a>
                                Estimated gas and fees:
                                {Number(this.state.estimatedGasFee).toFixed(
                                  5
                                )}{" "}
                                {this.state.selectedSendCurrency}{" "}
                                <a
                                  href="javascript:void(0);"
                                  className="gas-Est"
                                >
                                  <i
                                    className="fas fa-question-circle"
                                    aria-hidden="true"
                                  ></i>
                                </a>
                              </div>
                            ) : (
                              <div className="powertextBX">
                                <div className="d-flex">
                                  <p>
                                    Powered by
                                    <img src="images/smLOGO.png" />
                                    {/* <a href="#">Start new swap</a> */}
                                  </p>
                                  {/* <p className="ml-198">Estimated gas and fees: <span>0.09806</span> BNB</p> */}
                                </div>
                              </div>
                            )}
                            <label className="slippage-outer">
                              <p className="active" style={{ paddingRight: "10px" }}>Slippage free </p>
                              <Switch
                                checked={this.state.checked1}
                                onChange={this.handleChange1}
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
                              <p style={{ paddingLeft: "10px" }}>Slippage</p>
                            </label>
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
                        </>
                      ) : this.state.wrapBox === "success" ? (
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
                                          "images/receiveCurrencies/" +
                                          this.state.selectedSendCurrency +
                                          ".png"
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
                                          "images/receiveCurrencies/" +
                                          this.state.selectedReceiveCurrency +
                                          ".png"
                                        }
                                      />
                                    </i>
                                  </div>
                                </div>
                              </div>
                              {/* <div className="swap-Icon">
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
                              </div> */}
                              <div className="successMesg01">
                                <div className="icon-Box">
                                  <i className="fas fa-check"></i>
                                </div>
                                Swap sent successfully
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
                                  onClick={() => this.changeWrapBox("swap")}
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
                                  <div className="Title02 orange-Color">
                                    Send
                                  </div>
                                  <div className="trasaction-Amt">
                                    {this.state.actualSendFundAmount}{" "}
                                    {this.state.selectedSendCurrency}
                                    {/* <span>({this.state.sendFundAmount})</span> */}
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
                                  {this.state.txSentStatus === "Success" ? (
                                    <div>
                                      <div className="Title02 green-Color">
                                        Received <span></span>
                                      </div>
                                      <div className="trasaction-Amt">
                                        {this.state.receiveFundAmount}{" "}
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
                                          Funds wired to your wallet{" "}
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
                                        ... {this.state.selectedReceiveCurrency}{" "}
                                      </div>
                                      <div className="trasaction-Box pendingColor">
                                        <div className="trasaction-Status pending-Text">
                                          Pending{" "}
                                          <span className="pending-loader">
                                            <img src="images/loader2.gif" />
                                          </span>
                                        </div>
                                      </div>
                                      <p>
                                        {this.state.allowCurrentTxExpedite === 1 ? (
                                          <>
                                            <a
                                              href="javascript:void(0);"
                                              className="ani-1 green"
                                            >
                                              Waiting to be match with counter-party...
                                            </a>
                                            <a
                                              href="javascript:void(0);"
                                              className="ani-1"
                                              style={{ color: "white" }}
                                              onClick={() => this.expedite(this.state.currentTxExpediteData)}
                                            >
                                              Expedite
                                            </a>
                                          </>) : this.state.allowCurrentTxExpedite === 2 ? (
                                            "Expediting...."
                                          ) : this.state.allowCurrentTxExpedite === 3 ? (
                                            <a style={{ color: "#91dc27" }}>Expedited <i class="far fa-check-circle"></i></a>
                                          ) :
                                          <>
                                            <a
                                              href="javascript:void(0);"
                                              className="ani-1 green"
                                            >
                                              Waiting to be match with counter-party...
                                            </a>
                                            <Counter />
                                          </>
                                        }
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
                        {/* <div className="bb-traHistoryBTNbar ">
                                        <a href="javascript:void(0);" className="">All</a>
                                        <a href="javascript:void(0);" className="">Completed</a>
                                        <a href="javascript:void(0);" className="active">Pending</a>
                                    </div> */}
                        {web3Config.getAddress() !== null ? (
                          !this.state.showTxHistory ? (
                            <div className="bb-traHistoryBTNbar">
                              <a
                                href="javascript:void(0)"
                                className="ssbtn05"
                                onClick={() => this.showHistory("all", true)}
                              >
                                <h4 className="orange-Color">History</h4>
                              </a>
                            </div>
                          ) : (
                            <div className="bb-traHistoryBTNbar">
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.showHistory("all", false)}
                              >
                                <h4 className="orange-Color">Hide</h4>
                              </a>
                              &nbsp;
                              <a
                                href="javascript:void(0)"
                                onClick={() => this.showHistory("all", true)}
                              >
                                <h4 className="orange-Color">All</h4>
                              </a>
                              &nbsp;
                              <a
                                href="javascript:void(0)"
                                onClick={() =>
                                  this.showHistory("pending", true)
                                }
                              >
                                <h4 className="orange-Color">Pending</h4>
                              </a>
                              &nbsp;
                            </div>
                          )
                        ) : null}

                        {this.state.showTxHistory
                          ? this.state.loadingHistory ?
                            <div style={{ textAlign: "center" }}>
                              <Loader
                                type="Grid"
                                color="#00BFFF"
                                height={70}
                                width={70}
                              />
                            </div>
                            :
                            this.state.showAllTx
                              ? this.state.allTxHistoryUI
                              : this.state.allPendingTxHistoryUI
                          : null}

                        {/* {this.state.allTxHistoryUI !== null ? this.state.allTxHistoryUI : null} */}
                      </div>
                    </div>

                    {/* <div className="bb-traHSection">
                                <div className="container-Grid">
                                <div className="bb-traHistoryBTNbar ">
                                    <a href="javascript:void(0);" className="">All</a> 
                                    <a href="javascript:void(0);" className="">Completed</a>
                                    <a href="javascript:void(0);" className="active">Pending</a>
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
                            <div className="icon-Box icon04">
                              <svg>
                                <g>
                                  <path className="cst0" d="M31.7,19.4l-1-1c-1.3-1.3-3-2.3-4.7-2.8L22.5,19c2-0.1,3.9,0.6,5.4,2.1l1,1c2.8,2.8,2.8,7.3,0,10.1L17,44.1
                                    c-2.8,2.8-7.3,2.8-10.1,0l-1-1c-2.8-2.8-2.8-7.3,0-10.1l7.5-7.5c-0.3-1.4-0.5-3.3-0.1-5.3L3.2,30.2c-4.3,4.3-4.3,11.3,0,15.6l1,1
                                    c4.3,4.3,11.3,4.3,15.6,0L31.7,35C36,30.7,36,23.7,31.7,19.4"/>
                                  <path className="cst1" d="M27.3,31.1c-1.9,0-3.8-0.7-5.2-2.1l-1-1c-2.8-2.8-2.8-7.3,0-10.1L32.9,5.9c2.8-2.8,7.3-2.8,10.1,0l1,1
                                    c2.8,2.8,2.8,7.3,0,10.1l-7,7c0.3,1.4,0.4,3.3-0.1,5.5l9.8-9.8c4.3-4.3,4.3-11.3,0-15.6l-1-1c-4.3-4.3-11.3-4.3-15.6,0L18.3,15.1
                                    c-4.3,4.3-4.3,11.3,0,15.6l1,1c1.3,1.3,2.9,2.2,4.6,2.7L27.3,31.1z"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> multichain
                              </div>
                              <p> No wraps, no side-chain, no light chain, 100% true one-click swap between all blockchains</p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon01">
                              <svg>
                                <g>
                                  <path className="cst0" d="M26.6,48.5c-0.8,0-1.5-0.6-1.5-1.5V1.5c0-0.8,0.6-1.5,1.5-1.5c0.8,0,1.5,0.6,1.5,1.5V47
                                    C28.1,47.8,27.4,48.5,26.6,48.5"/>
                                  <path className="cst1" d="M45.7,48.5H7.5c-0.8,0-1.5-0.6-1.5-1.5c0-0.8,0.6-1.5,1.5-1.5h38.2c0.8,0,1.5,0.6,1.5,1.5
                                    C47.2,47.8,46.5,48.5,45.7,48.5"/>
                                  <path className="cst1" d="M46.2,12.4H7.1c-0.8,0-1.5-0.6-1.5-1.5c0-0.8,0.6-1.5,1.5-1.5h39.2c0.8,0,1.5,0.6,1.5,1.5
                                    C47.7,11.8,47,12.4,46.2,12.4"/>
                                  <path className="cst1" d="M19.9,25.3L19.9,25.3c0-0.3-0.1-0.4-0.2-0.6l-8.5-14.5C11,9.8,10.5,9.5,10,9.5c-0.5,0-1,0.3-1.3,0.7L0.2,24.7
                                    C0.1,24.9,0.1,25,0,25.2v0.1c0,0.1,0,0.1,0,0.2v0c0,3.8,4.4,6.8,10,6.8s10-3,10-6.8v0C19.9,25.4,19.9,25.4,19.9,25.3 M10,13.9
                                    l6,10.2H4L10,13.9z M10,29.4c-3.1,0-5.4-1.1-6.5-2.5h13C15.4,28.3,13,29.4,10,29.4"/>
                                  <path className="cst0" d="M52.9,25.3L52.9,25.3c0-0.3-0.1-0.4-0.2-0.6l-8.5-14.5c-0.3-0.5-0.7-0.7-1.3-0.7c-0.5,0-1,0.3-1.3,0.7
                                    l-8.5,14.5c-0.1,0.2-0.1,0.3-0.2,0.5v0.1c0,0.1,0,0.1,0,0.2v0c0,3.8,4.4,6.8,10,6.8s10-3,10-6.8v0C52.9,25.4,52.9,25.4,52.9,25.3
                                    M42.9,13.9l6,10.2H37L42.9,13.9z M42.9,29.4c-3.1,0-5.4-1.1-6.5-2.5h13C48.4,28.3,46,29.4,42.9,29.4"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br />
                                value match
                              </div>
                              <p>Select the slippage free option to receive new crypto equal to the exact value you sent
                                <i className="help-circle">
                                  <i
                                    className="fas fa-question-circle protip"
                                    data-pt-position="top"
                                    data-pt-title="The slippage option finds the best price in the market with a slippage limit option under your trade options"
                                    aria-hidden="true"
                                  ></i>
                                </i>
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon02">
                              <svg>
                                <g>
                                  <path className="cst1" d="M36.3,16.3h-3.6v-3.9C32.7,5.6,27.1,0,20.3,0S7.9,5.6,7.9,12.4v3.9H5.6c-3.1,0-5.6,2.5-5.6,5.6v20.8
                                    c0,3.1,2.5,5.6,5.6,5.6h30.6c3.1,0,5.6-2.5,5.6-5.6V21.9C41.9,18.8,39.3,16.3,36.3,16.3 M10.8,12.4c0-5.2,4.2-9.5,9.5-9.5
                                    c5.2,0,9.5,4.2,9.5,9.5v3.9H10.8V12.4z M38.8,42.7c0,1.4-1.1,2.6-2.6,2.6H5.6c-1.4,0-2.6-1.1-2.6-2.6V21.9c0-1.4,1.1-2.6,2.6-2.6
                                    h30.6c1.4,0,2.6,1.1,2.6,2.6V42.7z"/>
                                  <path className="cst0" d="M25.9,30c0-2.8-2.3-5-5-5c-2.7,0-5,2.3-5,5c0,2.2,1.5,4.1,3.5,4.7v3.2c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5
                                    v-3.2C24.4,34.1,25.9,32.2,25.9,30 M20.9,31.9c-1,0-1.9-0.9-1.9-1.9c0-1,0.9-1.9,1.9-1.9c1,0,1.9,0.9,1.9,1.9
                                    C22.8,31.1,21.9,31.9,20.9,31.9"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100%
                                <br />
                                safe
                              </div>
                              <p>
                                No hot wallet, no deposits, no accounts, no custodial wallets
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
                            <div className="icon-Box icon03">
                              <svg>
                                <g>
                                  <path className="cst0" d="M26.5,38.9V42h-2.7v-3c-2.7-0.2-5.4-1-6.9-2.2l1.5-3.4c1.4,1,3.4,1.8,5.4,2v-4.6c-3.1-0.8-6.5-1.8-6.5-5.7
                                  c0-2.9,2.1-5.5,6.5-5.9v-3.1h2.7v3c2.1,0.2,4.1,0.7,5.6,1.7L30.8,24c-1.4-0.8-2.9-1.3-4.2-1.4v4.7C29.6,28,33,29,33,32.9
                                  C33,35.8,30.9,38.3,26.5,38.9 M23.8,26.6v-4c-1.5,0.3-2,1.1-2,2C21.7,25.7,22.5,26.2,23.8,26.6 M28.5,33.3c0-1-0.8-1.5-2-1.9v3.8
                                  C27.9,34.9,28.5,34.2,28.5,33.3"/>
                                  <path className="cst1" d="M26.4,4.1V0.7c0-0.3-0.2-0.6-0.6-0.7c-0.4-0.1-0.8-0.1-1.1,0.1l-6.3,4.9c-0.2,0.2-0.3,0.3-0.3,0.5
                                  c0,0.2,0.1,0.4,0.3,0.5l6.3,4.9c0.3,0.2,0.6,0.3,1.1,0.2s0.6-0.3,0.6-0.7V7.2c10.9,1,19.5,10.1,19.5,21.3
                                  c0,11.8-9.6,21.4-21.4,21.4c-11.8,0-21.4-9.6-21.4-21.4c0-6.3,2.7-11.9,7-15.8L8.7,9.9C3.4,14.4,0,21.1,0,28.5C0,42,11,53,24.5,53
                                  S49,42,49,28.5C49,15.6,39.1,5.1,26.4,4.1"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100%
                                <br />
                                reimbursement
                              </div>
                              <p>
                                Fees and gas reimbursed fully with SMART
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
                            <div id="reimburTip" style={{ display: "none" }}>
                              <p style={{ marginTop: '0px' }}>SmartSwap users have the option to receive 100% reimbursement for their gas and swap fees. Users are able to claim reimbursements via the reimbursement staking contract. To release reimbursements users must stake the 1:1 equal amount of SMART for one year, but will be able to release partial amounts of the reimbursement if withdrawn at any time before the 1 year period . The pending balance accumulates and the user is able to claim the rest.</p>
                              <p style={{ marginBottom: '0px' }}>Example </p>
                              <p style={{ marginTop: '0px', marginBottom: '0px' }}>If over the year a user spent over $1000 or more on gas, at any time he can be reimbursed for such cost even if the SMART token value is higher due to appreciation. </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon05">
                              <svg>
                                <g>
                                  <path className="cst0" d="M26,35.8v3h-2.7v-3c-2.7-0.2-5.3-1-6.7-2.2l1.5-3.3c1.3,1,3.3,1.7,5.3,1.9v-4.5c-3-0.7-6.4-1.7-6.4-5.6
                                    c0-2.9,2.1-5.3,6.4-5.8v-3H26v2.9c2,0.2,4,0.7,5.5,1.7l-1.3,3.3c-1.4-0.8-2.8-1.2-4.1-1.4v4.6c3,0.7,6.3,1.7,6.3,5.5
                                    C32.3,32.9,30.2,35.3,26,35.8 M23.3,23.8V20c-1.5,0.3-2,1.1-2,2C21.3,23,22.1,23.5,23.3,23.8 M27.9,30.4c0-0.9-0.8-1.5-1.9-1.9v3.7
                                    C27.4,31.9,27.9,31.2,27.9,30.4"/>
                                  <path className="cst1" d="M50.2,0.4c-0.6-0.6-1.6-0.6-2.1,0l-7.7,7.7c-4.3-4-10-6.4-16.3-6.4c-13.2,0-24,10.8-24,24
                                    C0,32,2.5,37.7,6.4,42l-5,5c-0.6,0.6-0.6,1.6,0,2.1c0.3,0.3,0.7,0.4,1.1,0.4c0.4,0,0.8-0.1,1.1-0.4l5.1-5.1
                                    c4.1,3.5,9.5,5.6,15.4,5.6c13.2,0,24-10.8,24-24c0-5.8-2.1-11.2-5.6-15.4l7.7-7.7C50.8,2,50.8,1,50.2,0.4 M3,25.7
                                    C3,14.1,12.4,4.8,24,4.8c5.5,0,10.4,2.1,14.1,5.5L8.6,39.9C5.2,36.1,3,31.1,3,25.7 M45,25.7c0,11.5-9.4,21-21,21
                                    c-5,0-9.6-1.8-13.2-4.7l29.4-29.4C43.2,16.1,45,20.7,45,25.7"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> free license
                              </div>
                              <p>Build your own SmartSwap at no cost or become an affiliate </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon06">
                              <svg>
                                <g>
                                  <path className="cst0" d="M5.8,13.6c0,0,6-3.9,10.1,3.1c0,0,3.3,1.2,2.2-1.8S10.7,9,5.8,13.6" />
                                  <path className="cst0" d="M6.6,19.2c0,0,3.7-3.3,7.5,0C14.1,19.2,10.7,22.1,6.6,19.2" />
                                  <path className="cst0" d="M36,13.6c0,0-6-3.9-10.1,3.1c0,0-3.3,1.2-2.2-1.8C24.9,12,31.1,9,36,13.6" />
                                  <path className="cst0" d="M35.2,19.2c0,0-3.7-3.3-7.5,0C27.6,19.2,31,22.1,35.2,19.2" />
                                  <path className="cst0" d="M27.6,35c-3.8,0-5.5-4-5.5-4H21h-1.1c0,0-1.7,4-5.5,4s-7.2-4.6-7.2-4.6s2.6,6.8,6.9,6.8s6.9-2.4,6.9-2.4
                                    s2.5,2.4,6.9,2.4s6.9-6.8,6.9-6.8S31.4,35,27.6,35"/>
                                  <path className="cst1" d="M41.5,4.8C41.2,4.5,33.8,0,21,0S0.8,4.6,0.5,4.8L0,5.1v25.6l0,0.2c2.6,12.2,19.7,22,20.4,22.4l0.5,0.3l0.5-0.3
                                    c0.7-0.4,17.8-10.2,20.4-22.4L42,5L41.5,4.8z M39.9,30.6C38,39,28.1,46.6,23.2,49.8V42h-4.4v7.9C13.9,46.6,3.9,39.1,2,30.6V6.2
                                    C3.8,5.2,10.5,2,20.9,2c10.5,0,17.1,3.2,18.9,4.2L39.9,30.6L39.9,30.6z"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> anonymous
                              </div>
                              <p>Complete privacy guard with no KYC / AML needed</p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon07">
                              <svg>
                                <g>
                                  <path className="cst0" d="M42.2,37.6H16c-3.1,0-5.7-2.5-5.7-5.7V5.7C10.3,2.5,12.8,0,16,0h26.3c3.1,0,5.7,2.5,5.7,5.7v26.3
                                    C47.9,35.1,45.4,37.6,42.2,37.6 M16,3.1c-1.4,0-2.6,1.1-2.6,2.6v26.3c0,1.4,1.1,2.6,2.6,2.6h26.3c1.4,0,2.6-1.1,2.6-2.6V5.7
                                    c0-1.4-1.1-2.6-2.6-2.6H16z"/>
                                  <path className="cst1" d="M17.7,39.8v3.5c0,1.4-1.1,2.6-2.6,2.6H5.7c-1.4,0-2.6-1.1-2.6-2.6v-9.4c0-1.4,1.1-2.6,2.6-2.6H8v-3.1H5.7
                                    c-3.1,0-5.7,2.5-5.7,5.7v9.4c0,3.1,2.5,5.7,5.7,5.7h9.4c3.1,0,5.7-2.5,5.7-5.7v-3.5H17.7z"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> scalable
                              </div>
                              <p>No LP, no pools, true decentralized CEX and OTC liquidity bridge</p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon09">
                              <svg>
                                <rect x="15.9" y="14.3" transform="matrix(-0.7819 0.6234 -0.6234 -0.7819 43.8185 24.7639)" className="cst0" width="3.4" height="11.6" />
                                <rect x="29.8" y="28" className="cst0" width="8.9" height="3.4" />
                                <rect x="12.5" y="38.4" transform="matrix(-0.4212 0.9069 -0.9069 -0.4212 63.2795 39.8947)" className="cst0" width="12.8" height="3.4" />
                                <g>
                                  <path className="cst1" d="M24.5,36.1c-3.9,0-7.2-3.2-7.2-7.2s3.2-7.2,7.2-7.2s7.2,3.2,7.2,7.2S28.4,36.1,24.5,36.1 M24.5,25.2
                                    c-2.1,0-3.7,1.7-3.7,3.7c0,2.1,1.7,3.7,3.7,3.7s3.7-1.7,3.7-3.7C28.2,26.9,26.5,25.2,24.5,25.2"/>
                                  <path className="cst1" d="M9.4,18.8C4.2,18.8,0,14.6,0,9.4S4.2,0,9.4,0c5.2,0,9.4,4.2,9.4,9.4S14.5,18.8,9.4,18.8 M9.4,3.4
                                    c-3.3,0-6,2.7-6,6s2.7,6,6,6s6-2.7,6-6S12.7,3.4,9.4,3.4"/>
                                  <path className="cst1" d="M15.1,55.1c-3,0-5.4-2.4-5.4-5.4c0-3,2.4-5.4,5.4-5.4s5.4,2.4,5.4,5.4C20.5,52.7,18.1,55.1,15.1,55.1
                                    M15.1,47.7c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2C17.1,48.5,16.2,47.7,15.1,47.7"/>
                                  <path className="cst1" d="M47.9,40.7c-6,0-10.9-4.9-10.9-10.9s4.9-10.9,10.9-10.9c6,0,10.9,4.9,10.9,10.9S54,40.7,47.9,40.7 M47.9,22.2
                                    c-4.2,0-7.5,3.4-7.5,7.5s3.4,7.5,7.5,7.5s7.5-3.4,7.5-7.5S52.1,22.2,47.9,22.2"/>
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> decentralized
                              </div>
                              <p>DAO approach with a closed system lacking any single point of failure privilege</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <!--======================= SWAP BLOCK END =====================--> */}
                </div>

                <div
                  className="mainBlock"
                  style={
                    this.state.cloneData.bgimage
                      ? { paddingTop: 0, display: "none" }
                      : { paddingTop: 0 }
                  }
                >
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
                    <div className="swap-textBox" style={{ paddingTop: 0 }}>
                      <div className="container-Grid" onPointerEnter={() => { this.updateTotalAmounts() }}>
                        <div
                          className="ssBTNbar01 wow fadeInUp" data-wow-delay="0.2s"
                          style={{ justifyContent: "center" }}
                        >
                          <Link to="/ownLicence" className="ssBtn01 ani-1">
                            FREE SMARTSWAP LICENSE
                          </Link>
                          <Link
                            to="/"
                            className="ssBtn02 ani-1"
                            onClick={() => {
                              this.openPopup("LiquidityProvider");
                            }}

                          >
                            <span>BECOME A SWAP PROVIDER</span>{" "}
                          </Link>
                        </div>
                        {/* <div className="ssTitle01 wow fadeInUp" data-wow-delay="0.2s">
                          Alternative to AMMs with zero pools or LPs needed
                        </div> */}
                        {/* <div className="ssText01 wow fadeInUp" data-wow-delay="0.4s" style={{ marginTop: "10px" }}>
                          SmartSwap is the world's first smart decentralized
                          exchange (SDEX) providing a one-click slippage-free
                          cross-chain swap in a simple layer that decentralizes
                          the access to all CEX (Centralize exchanges) and OTC
                          (Over-the-counter) industry. The best way to think of
                          SDEX is like PayPal creating a simple one-click layer
                          on top of banks to send and receive funds.
                        </div> */}
                        <div className="ssTitle01 wow fadeInRight" data-wow-delay="0.2s">Supporting blockchains</div>
                        <Carousel className="wow fadeInRight caro-1" data-wow-delay="0.3s"
                          swipeable={false}
                          draggable={false}
                          showDots={false}
                          responsive={responsive}
                          ssr={true} // means to render carousel on server-side.
                          infinite={true}
                          autoPlay={false}
                          autoPlaySpeed={5000}
                          keyBoardControl={true}
                          customTransition="all 1sec"
                          transitionDuration={900}
                          containerclassName="carousel-container ani-1"
                          // removeArrowOnDeviceType={["tablet", "mobile"]}
                          deviceType={this.props.deviceType}
                          dotListclassName="custom-dot-list-style"
                          itemclassName="carousel-item-padding-40-px"
                        >
                          <div className="sbSlide">
                            {" "}
                            <img src={SBLogo01} alt="" />{" "}
                          </div>
                          <div className="sbSlide">
                            {" "}
                            <img src={SBLogo02} alt="" />{" "}
                          </div>
                          <div className="sbSlide">
                            {" "}
                            <img src={SBLogo03} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo04} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo05} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo06} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo07} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo08} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo09} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo010} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo011} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo03} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo04} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo05} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo06} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo07} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo08} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo09} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo010} alt="" />{" "}
                          </div>
                          <div className="sbSlide disable">
                            {" "}
                            <img src={SBLogo011} alt="" />{" "}
                          </div>
                        </Carousel>

                        <div className="ssTitle01 wow fadeInLeft mb-25" data-wow-delay="0.2s">
                          SMART Tokenomics in Action
                        </div>
                        <div className="ssText01 wow fadeInLeft" data-wow-delay="0.4s" style={{ marginTop: "0px" }}>
                          SmartSwap does not utilize LPs or pools therefore fees
                          are used to support SMART through automatic buybacks.{" "}
                        </div>

                        <div className="stActMBX">
                          <div className="stActSbx01 wow zoomIn" data-wow-delay="0.1s">
                            {" "}
                            <span>
                              Total Amount Swapped
                            </span>
                            <div className="container">
                              $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalAmountSwapped}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                              ></AnimatedNumber>
                            </div>{" "}
                          </div>
                          <div className="stActSbx01 wow zoomIn" data-wow-delay="0.2s">
                            {" "}
                            <span>Fees Generated</span>
                            <div className="container">
                              $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.feesGenerated}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                              ></AnimatedNumber>
                            </div>{" "}
                          </div>
                          <div className="stActSbx01 wow zoomIn" data-wow-delay="0.3s">
                            {" "}
                            <span>
                              Smart Bought and Burned
                            </span>
                            <div className="container">
                              <AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.smartBoughtBurned}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                              ></AnimatedNumber>
                            </div>{" "}
                          </div>
                          <div className="stActSbx01 wow zoomIn" data-wow-delay="0.4s">
                            {" "}
                            <span>Total Fees Reimbursed</span>
                            <div className="container">
                              $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalFeesReimbursed}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                              ></AnimatedNumber> </div>{" "}
                          </div>
                          <div className="stActSbx01 wow zoomIn" data-wow-delay="0.5s">
                            {" "}
                            <span>
                              Total reimbursement staking
                            </span>
                            <div className="container">
                              <AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalReimbursementStaking}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                              ></AnimatedNumber>
                            </div>{" "}
                          </div>
                        </div>

                        <div className="ssTitle01 wow fadeInLeft" data-wow-delay="0.2s">
                          SmartSwap AMA Series:
                          <span>
                            Alon Goren (Draper-Goren-Holm) and Yoda (Jude) Regev
                          </span>
                        </div>
                        <div className="videoMcontent wow fadeInLeft" data-wow-delay="0.4s">
                          <div className="video-responsive">
                            <iframe
                              width="560"
                              height="315"
                              src="https://www.youtube.com/embed/LKtJ6oaFak0"
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                        <div
                          className="ssBTNbar01 wow fadeInUp mt-145 mb-135" data-wow-delay="0.2s"
                          style={{ justifyContent: "center" }}
                        >
                          <Link to="/ownLicence" className="ssBtn01">
                            FREE SMARTSWAP LICENSE
                          </Link>
                          <Link
                            to="/"
                            className="ssBtn02"
                            onClick={() => {
                              this.openPopup("LiquidityProvider");
                            }}
                          >
                            <span>BECOME A SWAP PROVIDER</span>{" "}
                          </Link>
                        </div>
                        {/* <div className="ssTitle01">Market Prices </div>
                                    <div className="ssSearchBox">
                                        <div className="ssSearchMBox01">
                                            <i className="fas fa-search"></i>
                                            <input
                                                type="text"
                                                placeholder="Search coin name or token name"
                                                onChange={(e) => this.tableSearchHandler(e)}
                                            />
                                        </div>
                                        <div className="ssSearchMBox02">
                                            Choose amount of token to compare prices
                      <div className="sswapSelectbx">
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
                                            <i className="fas fa-angle-left"></i>
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
                                            <i className="fas fa-angle-right"></i>
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

                        <div className="ssTitle01 wow fadeInUp mb-10" data-wow-delay="0.2s">License Partners</div>
                        <div
                          className="VPMainBX wow fadeInUp" data-wow-delay="0.4s"
                          style={{
                            justifyContent: "center",
                            marginBottom: "80px",
                          }}
                        >
                          <div className="VPSubBX01">
                            {" "}
                            <img src="images/lp-logo01.png" alt="" />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img src="images/lp-logo02.png" alt="" />{" "}
                          </div>
                        </div>

                        <div className="ssTitle01 wow fadeInUp mb-10" data-wow-delay="0.2s">Venture Partners</div>

                        <div className="VPMainBX wow fadeInUp" data-wow-delay="0.4s">
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-01.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-02.png?v1"
                              alt=""
                            />
                            Hassan (Hatu) Sheikh
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-03.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/bitangels.png"
                              alt=""
                            />
                            Michael Terpin
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-04.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-05.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/silent.png"
                              alt=""
                            />
                            Andrea Castiglione
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-07.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-08.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-09.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-010.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/mexc.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-012.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-013.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/fairum.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-014.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-015.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-016.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-017.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-018.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-019.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-020.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-021.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-022.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-023.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-024.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-025.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-026.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-027.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-029.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-030.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-031V2.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-032.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-033.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-034.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-035.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-036.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-037.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-038.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-039.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/vpICON-040.png"
                              alt=""
                            />
                          </div>
                          <div className="VPSubBX01">
                            <img
                              src="images/venture-partners/legion.png"
                              alt=""
                            />
                          </div>
                        </div>
                        {/* <div className="smrtSwapNewsletterBX wow fadeInUp" data-wow-delay="0.2s">
                          <button className='smrtNLBTN01'>Connect Your Wallet To Become An Affiliate</button>

                          <div className="smrtSwapNewslSBX">
                            <input
                              type="text"
                              value="smartswap.exchange/ref/917Ak92j06noRka"
                            />
                            <button className="submitBTN ani-1">COPY LINK</button>
                          </div>
                          <div className="smrtSwapInfoSBX">
                          Share your link and receive 0.1% in SMART tokens for each swap you refer
                            <i className="help-circle">
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>
                            </i>
                            | Total commission: <span>4526.32</span> SMART
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  {/* <!--======================= SWAP BLOCK END =====================--> */}
                </div>
              </div>
              {/* <!--======================= SELECT POPUP START =====================--> */}
              {/* <SelectToken/> */}
              {/* <!--======================= SELECT POPUP END =====================--> */}
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
                popId={"sendCurPop"}
                opositeSelectedCurrrency={this.state.selectedReceiveCurrency}
                selectedCurrrency={this.state.selectedSendCurrency}
              ></CoinPopup>
              <CoinPopup
                web3={this.state.web3}
                web3Config={web3Config}
                setCurrency={this.setReceiveCurrency}
                popId={"receiveCurPop"}
                opositeSelectedCurrrency={this.state.selectedSendCurrency}
                selectedCurrrency={this.state.selectedReceiveCurrency}
              ></CoinPopup>

              <LiquidityProvider
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></LiquidityProvider>

              <LiquidityFountainSP
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              />
              <About
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></About>
              <PeerPopup
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></PeerPopup>
              <HowItWorks
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></HowItWorks>
              {/* <DepositToken
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></DepositToken> */}
              <CefiToDefi
                closePopup={this.closePopup}
                openPopup={this.openPopup}
              ></CefiToDefi>
              <NoDomain
                closePopup={this.closePopup}
                openPopup={this.openPopup}
                subDomainName={this.state.subDomainName}
              ></NoDomain>
              {/* <!--======================= COIN POPUP END =====================-->
                    <!--======================= SIDE POPUP START =====================--> */}
              <SidePopup
                web3={this.state.web3}
                web3Config={web3Config}
                closePopup={() => { this.setState({ sideBar: false }) }}
                openPopup={this.openPopup}
                sideBar={this.state.sideBar}
              ></SidePopup>
              {/* <!--======================= SIDE POPUP END =====================--> */}
              {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/gnaJlUA20lk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> */}
            </div>
          </main>
        )}
      </>
    );
  }
}
