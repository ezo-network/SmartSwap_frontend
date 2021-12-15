import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import Loader from "react-loader-spinner";
import web3Js from "web3";
import Web3 from "web3";
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig from "../config/constantConfig";
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
import LiquidityProvider from "../components/LiquidityProvider";
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
    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
    this.setSendCurrency = this.setSendCurrency.bind(this);
    this.setReceiveCurrency = this.setReceiveCurrency.bind(this);
    this.updateCloneData = this.updateCloneData.bind(this);
    this.clearPreview = this.clearPreview.bind(this);
    this.getData = this.getData.bind(this);
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
        42: "0x0000000000000000000000000000000000000000"
      },
      loadingHistory: false
    };
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
    this.setState({
      web3Ethereum: new Web3(
        new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
      ),
      web3Binance: new Web3(
        new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
      ),
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
      .get(`https://api.smartswap.exchange/info`)
      .then((res) => {
        if (res.data.totalUsd) {

          ttAm = (res.data.totalUsd).toFixed(0)

        }
      })
      .catch((err) => {
        console.log('error', err);
      });
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
    let { web3Binance, web3Ethereum } = this.state;
    let instanceSwapFactoryBinance = null;
    let instanceSwapFactoryEthereum = null;
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
    if (!constantConfig.allowedNetwork.includes(networkId)) {
      notificationConfig.error("Please Select Ethereum or BSC Main Network");
      this.setState({ btnClick: false });
      return;
    }
    if (
      constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
      networkId &&
      (networkId === 97 || networkId === 56)
    ) {
      notificationConfig.warning("Change metamask network to Ethereum!");
      return;
    } else if (
      constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
      networkId &&
      (networkId === 42 || networkId === 1)
    ) {
      notificationConfig.warning("Change metamask network to Binance!");
      return;
    }
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

    let url = CONSTANT.API_URL + "/ledger/tx/" + hash;

    console.log(url);

    var txCheckInterval = setInterval(async () => {
      console.log(" interval called ");
      await axios
        .get(url)
        .then((res) => {
          // console.log(res.data)
          let result = res.data;
          console.log(result);
          if (result.resp_code === 1) {
            console.log(result.data);
            // if (result.data.length > 0) {
            //     result.data.map((ele) => {
            //         console.log(ele.sentTx)

            //     })
            // }
            if (result.data.sentTx === this.state.txIdSent) {
              console.log("in end");
              console.log("oracle tx start");
              console.log(result.data.oracleTx);
              if (result.data.oracleTx !== undefined) {
                let txLinkReturn =
                  constantConfig[result.data.recivedChainId].explorer +
                  "/tx/" +
                  result.data.oracleTx;

                this.updateLedgerAfterResponse(
                  result.data.oracleTx,
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
    if (networkId === 56 || networkId === 97) {
      const response = await fetch(
        "https://ethgasstation.info/json/ethgasAPI.json"
      );
      const json = await response.json();
      let gasPrice = (json.fast / 10).toString();
      let prcsFees = Number(
        web3Js.utils.fromWei(
          ((330000 *
            web3Js.utils.toWei(gasPrice, "gwei") *
            (this.state.currencyPrices["ETH"] / this.state.currencyPrices["BNB"])).toFixed(0)).toString()
        )
      )
      let companyFees = (
        (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryBinance)) / 10000
      )
      let reimbursementFees = (
        (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.instanceReimbursementBinance, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract)) / 10000
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
        (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryBinance)) / 10000
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
      let prcsFees = Number(
        web3Js.utils.fromWei(
          ((330000 *
            web3Js.utils.toWei("5", "gwei") *
            (this.state.currencyPrices["BNB"] / this.state.currencyPrices["ETH"])).toFixed(0)).toString()
        )
      )
      let companyFees = (
        (Number(actualSendFundAmount) * await this.getCompanyFees(this.state.instanceSwapFactoryEthereum)) / 10000
      )
      let reimbursementFees = (
        (Number(actualSendFundAmount) * await this.getReimbursementFees(this.state.instanceReimbursementEthereum, this.state.licenseeAddress[networkId], constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract)) / 10000
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

  async getCompanyFees(instance) {
    let fees = await instance.methods.companyFee().call();
    return fees;
  }

  async getReimbursementFees(instance, vaultAddress, projectContractAddress) {
    let fees = await instance.methods.getLicenseeFee(vaultAddress, projectContractAddress).call();
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
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Ccardano%2Cpolkadot%2Cuniswap%2Cripple&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
      .then((res) => {
        tableDataLocalcoingecko = res.data;
      })
      .catch((err) => {
        console.log("error", err);
      });

    currencyPrices["ETH"] = tableDataLocalcoingecko["ethereum"]["usd"];

    currencyPrices["BNB"] = tableDataLocalcoingecko["binancecoin"]["usd"];

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
    let selectedSendCurrency = this.state.selectedSendCurrency;
    let selectedReceiveCurrency = this.state.selectedReceiveCurrency;
    this.setState(
      {
        selectedSendCurrency: selectedReceiveCurrency,
        selectedReceiveCurrency: selectedSendCurrency,
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
        txSentTime: new Date().toUTCString(),
        tokenReceive: "2",
        txReceiveTime: new Date().toUTCString(),
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
    let url = `https://api.smartswap.exchange/ledger/` + address;

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
          constantConfig[element.sentChainId].explorer +
          "/tx/" +
          element.sentTx;

        if (element.oracleTx !== undefined && element.oracleTx !== null) {
          element["recivedTxLink"] =
            constantConfig[element.recivedChainId].explorer +
            "/tx/" +
            element.oracleTx;
        }

        userTxsUI.push(
          // <LedgerHistory />
          <LedgerHistory
            sentAmount={element.sentAmount}
            sentCurrency={element.sentCurrency}
            sentAPrice={element.sentAPrice}
            sentTx={element.sentTx}
            sentTxLink={element.sentTxLink}
            filledBprice={element.filledBprice}
            recivedAmount={element.recivedAmount}
            recivedCurrency={element.recivedCurrency}
            oracleTx={element.oracleTx}
            recivedTxLink={element.recivedTxLink}
            sentTxTime={sentTxTime.toString()}
            recivedTxTime={recivedTxTime.toString()}
            filledAprice={element.filledAprice}
          />
        );
        if (element.oracleTx === undefined || element.oracleTx === null) {
          userPendingTxsUI.push(
            // <LedgerHistory />
            <LedgerHistory
              sentAmount={element.sentAmount}
              sentCurrency={element.sentCurrency}
              sentAPrice={element.sentAPrice}
              sentTx={element.sentTx}
              sentTxLink={element.sentTxLink}
              filledBprice={element.filledBprice}
              recivedAmount={element.recivedAmount}
              recivedCurrency={element.recivedCurrency}
              oracleTx={element.oracleTx}
              recivedTxLink={element.recivedTxLink}
              sentTxTime={sentTxTime.toString()}
              recivedTxTime={recivedTxTime.toString()}
              filledAprice={element.filledAprice}
            />
          );
        }
      });
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
                        <span>One click</span> slippage-free cross-chain swap
                      </div>
                      <div className="smvTitle02 wow fadeInUp" data-wow-delay="0.2s">
                        Unlimited Liquidity CeFi to Defi Decentralized Bridge
                      </div>
                      {this.state.wrapBox === "swap" ? (
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
                                      style={{ background: "#3d3d3d" }}
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
                                        "images/currencies/" +
                                        data.tokenDetails[
                                          this.state.selectedSendCurrency
                                        ].iconName +
                                        ".png"
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
                                      ≈
                                      {this.state.actualSendFundAmount.toFixed(
                                        5
                                      )}
                                    </p>
                                  ) : null}
                                  <div
                                    className="total-Amt"
                                    style={{ paddingTop: 0 }}
                                  >
                                    <p>
                                      [1 {this.state.selectedSendCurrency} : ${" "}
                                      {parseFloat(
                                        this.state.currencyPrices[
                                        this.state.selectedSendCurrency
                                        ]
                                      ).toFixed(2)}
                                      ]
                                    </p>
                                  </div>
                                  <a
                                    href="javascript:void(0);"
                                    className="faux-Link"
                                    id="change-Market"
                                    onClick={() => {
                                      // this.openPopup("sendCurPop");
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
                                    style={{ paddingTop: 137 }}
                                  >
                                    <svg
                                      viewBox="0 0 200 200"
                                      style={{ transform: "scale(1.5)" }}
                                    >
                                      <polygon
                                        fill="var(--button-bg-color)"
                                        points="152.9,58.3 152.9,45.1 139.7,45.1 139.7,58.3 60.6,58.3 60.6,71.5 60.6,84.7 139.7,84.7 139.7,97.9 
	152.9,97.9 152.9,84.7 152.9,84.7 166.1,84.7 166.1,71.5 166.1,58.3 "
                                      />
                                      <polygon
                                        fill="var(--button-bg-color)"
                                        points="48.4,141 48.4,154.2 61.6,154.2 61.6,141 140.8,141 140.8,127.8 140.8,114.6 61.6,114.6 61.6,101.4 
	48.4,101.4 48.4,114.6 48.4,114.6 35.2,114.6 35.2,127.8 35.2,141 "
                                      />
                                    </svg>
                                  </a>
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
                                        "images/currencies/" +
                                        data.tokenDetails[
                                          this.state.selectedReceiveCurrency
                                        ].iconName +
                                        ".png"
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
                                      ≈
                                      {this.state.approxReceiveFundAmount.toFixed(
                                        5
                                      )}
                                    </p>
                                  ) : null}
                                  <div
                                    className="total-Amt"
                                    style={{ paddingTop: 0 }}
                                  >
                                    <p>
                                      [1 {this.state.selectedReceiveCurrency} :
                                      ${" "}
                                      {parseFloat(
                                        this.state.currencyPrices[
                                        this.state.selectedReceiveCurrency
                                        ]
                                      ).toFixed(2)}
                                      ]
                                    </p>
                                  </div>
                                  {/* <!-- <div className="total-Amt"> <span className="slippageText">~ ~</span> 3.202 EZO </div> --> */}
                                  <a
                                    href="javascript:void(0);"
                                    className="faux-Link"
                                    onClick={() => {
                                      // this.openPopup("receiveCurPop");
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
                                    className="btn btn-large greyScale ani-1 connect"
                                    onClick={this.connectWallet.bind(this)}
                                  >
                                    <span>
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
                                    CONNECT YOUR WALLET
                                  </a>
                                </div>
                              ) : constantConfig.tokenDetails[
                                this.state.selectedSendCurrency
                              ].approveRequire &&
                                this.state.tokenBalances[
                                this.state.selectedSendCurrency + "_APPROVED"
                                ] <= this.state.actualSendFundAmount ? (
                                this.state.approveLoading ? (
                                  <div className="swap-Btn">
                                    <a
                                      href="javascript:void(0);"
                                      id="lrlock-btn"
                                      className="btn btn-large ani-1 connect swap"
                                    >
                                      <LoopCircleLoading
                                        height={"20px"}
                                        width={"20px"}
                                        color={"#ffffff"}
                                      />
                                    </a>
                                  </div>
                                ) : (
                                  <div className="swap-Btn">
                                    <a
                                      href="javascript:void(0);"
                                      id="lrlock-btn"
                                      className="btn btn-large ani-1 connect swap"
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
                                    className="btn btn-large ani-1 connect swap"
                                  >
                                    <LoopCircleLoading
                                      height={"20px"}
                                      width={"20px"}
                                      color={"#ffffff"}
                                    />
                                  </a>
                                </div>
                              ) : (
                                <div className="swap-Btn">
                                  <a
                                    href="javascript:void(0);"
                                    id="lrlock-btn"
                                    className="btn btn-large ani-1 connect swap swapBtn"
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
                                    <div className="text-Title">
                                      Ethereum gas :
                                    </div>
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
                                  <a
                                    href="javascript:void"
                                    className="close-Icon"
                                  >
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
                                  Powered by <img src="images/smLOGO.png" />{" "}
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
                        {web3Config.getAddress() !== null ? (
                          !this.state.showTxHistory ? (
                            <div class="bb-traHistoryBTNbar">
                              <a
                                href="javascript:void(0)"
                                className="ssbtn05"
                                onClick={() => this.showHistory("all", true)}
                              >
                                <h4 className="orange-Color">History</h4>
                              </a>
                            </div>
                          ) : (
                            <div class="bb-traHistoryBTNbar">
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
                            <div className="icon-Box icon04">
                              <svg viewBox="0 0 200 200">
                                <polygon
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  points="170.6,45.7 170.6,42.8 167.5,42.8 167.5,39.8 167.5,39.7 167.5,36.6 161.8,36.6 161.8,33.8 158.5,33.8 
	158.5,31.2 158.5,30.9 158.5,28 125.5,28 125.5,30.9 122.8,30.9 122.8,33.8 119.8,33.8 119.8,36.6 113.9,36.6 113.9,39.8 
	113.9,39.8 113.9,42.8 110.9,42.8 110.9,45.8 104.8,45.8 104.8,48.9 104.8,49 104.8,52 101.8,52 101.8,54.7 98.8,54.7 98.8,57.7 
	95.9,57.7 95.9,60.7 86.7,60.7 86.7,63.7 86.7,63.9 86.7,66.8 86.7,66.9 86.7,69.9 86.7,70 86.7,72.9 77.9,72.9 77.9,76 77.9,76.1 
	77.9,78.9 77.9,79.2 77.9,82.1 77.9,82.1 77.9,85 77.9,85.3 77.9,88.1 77.9,88.2 77.9,91 77.9,91.3 77.9,93.9 77.9,94.2 77.9,96.7 
	77.9,97.1 77.9,99.6 77.9,99.9 77.9,102.7 77.9,102.8 77.9,105.6 77.9,105.9 77.9,108.8 81,108.8 81,111.8 83.8,111.8 83.8,114.8 
	87.1,114.8 87.1,117.6 87.1,117.9 87.1,120.5 87.1,120.8 87.1,123.7 96,123.7 96,126.8 104.6,126.8 104.6,123.7 104.9,123.7 
	104.9,120.8 107.8,120.8 107.8,117.6 104.6,117.6 104.6,114.7 98.8,114.7 98.8,111.6 95.8,111.6 95.8,108.6 92.7,108.6 92.7,105.6 
	89.8,105.6 89.8,102.8 89.8,102.7 89.8,99.6 86.7,99.6 86.7,97.1 86.7,96.7 86.7,94.2 86.7,93.9 86.7,91.3 86.8,91.3 86.8,88.2 
	86.8,88.1 86.8,85.3 89.4,85.3 89.4,82.1 92.7,82.1 92.7,79.2 95.8,79.2 95.8,76.1 95.8,76 95.8,73.1 101.8,73.1 101.8,70 104.8,70 
	104.8,66.9 104.8,66.8 104.8,63.9 107.7,63.9 107.7,60.9 113.8,60.9 113.8,57.9 113.8,57.7 113.8,55.2 122.7,55.2 122.7,52.1 
	122.7,52 122.7,49 122.8,49 122.8,46 134.6,46 134.6,43 134.6,42.8 134.6,39.8 137.8,39.8 137.8,37 149.8,37 149.8,39.7 149.8,39.8 
	149.8,42.8 149.8,42.9 149.8,46 158.6,46 158.6,48.9 158.6,48.9 158.6,52 158.6,52.1 158.6,55.2 164.6,55.2 164.6,58 167.6,58 
	167.6,61 167.8,61 167.8,63.8 167.5,63.8 167.5,67 167.6,67 167.6,69.9 164.6,69.9 164.6,73 158.6,73 158.6,75.8 158.6,76.2 
	158.6,78.8 158.6,79 158.6,81.7 149.7,81.7 149.7,84.7 149.7,84.9 149.7,87.6 149.7,87.9 149.7,90.6 146.6,90.6 146.6,93.6 
	143.5,93.6 143.5,96.6 143.5,96.8 143.5,99.5 140.8,99.5 140.8,102.5 140.8,102.7 140.8,105.4 140.8,105.7 140.8,108.5 140.8,108.6 
	140.8,111.7 143.5,111.7 143.5,108.6 146.6,108.6 146.6,105.7 149.7,105.7 149.7,102.7 152.6,102.7 152.6,99.8 158.6,99.8 
	158.6,96.8 158.6,96.8 158.6,93.8 158.6,93.6 158.6,90.8 167.6,90.8 167.6,87.9 167.6,87.6 167.6,84.9 170.6,84.9 170.6,82 
	176.5,82 176.5,79 176.5,78.8 176.5,76.2 176.5,75.8 176.5,73.1 176.5,73 176.5,70 176.5,69.9 176.5,67 176.5,66.8 176.5,64 
	176.5,63.8 176.5,61 176.5,60.8 176.5,58 176.5,57.8 176.5,55.2 176.5,54.8 176.5,52.1 176.5,52 176.5,48.9 176.5,48.9 176.5,45.7 
	"
                                />
                                <polygon
                                  class="st1"
                                  fill="var(--button-bg-color)"
                                  points="129.7,91.2 129.7,88.2 127,88.2 127,85.2 123.7,85.2 123.7,82.4 123.7,82.1 123.7,79.5 123.7,79.2 
	123.7,76.3 114.8,76.3 114.8,73.2 106.1,73.2 106.1,76.3 105.9,76.3 105.9,79.2 103,79.2 103,82.4 106.1,82.4 106.1,85.3 
	111.9,85.3 111.9,88.4 115,88.4 115,91.4 118.1,91.4 118.1,94.4 121,94.4 121,97.2 121,97.3 121,100.4 124,100.4 124,102.9 
	124,103.3 124,105.8 124,106.1 124,108.7 124,108.7 124,111.8 124,111.9 124,114.7 121.4,114.7 121.4,117.9 118.1,117.9 
	118.1,120.8 115,120.8 115,123.9 115,124 115,126.9 108.9,126.9 108.9,130 105.9,130 105.9,133.1 105.9,133.2 105.9,136.1 
	103.1,136.1 103.1,139.1 97,139.1 97,142.1 97,142.3 97,144.8 88,144.8 88,147.9 88,148 88,151 88,151 88,154 76.2,154 76.2,157 
	76.2,157.2 76.2,160.2 73,160.2 73,163 61,163 61,160.3 61,160.2 61,157.2 61,157.1 61,154 52.1,154 52.1,151.1 52.1,151.1 
	52.1,148 52.1,147.9 52.1,144.8 46.1,144.8 46.1,142 43.2,142 43.2,139 43,139 43,136.2 43.3,136.2 43.3,133 43.2,133 43.2,130.1 
	46.1,130.1 46.1,127 52.1,127 52.1,124.2 52.1,123.8 52.1,121.2 52.1,121 52.1,118.3 61.1,118.3 61.1,115.3 61.1,115.1 61.1,112.4 
	61.1,112.1 61.1,109.4 64.1,109.4 64.1,106.4 67.2,106.4 67.2,103.4 67.2,103.2 67.2,100.5 69.9,100.5 69.9,97.5 69.9,97.3 
	69.9,94.6 69.9,94.3 69.9,91.5 69.9,91.4 69.9,88.3 67.2,88.3 67.2,91.4 64.1,91.4 64.1,94.3 61.1,94.3 61.1,97.3 58.1,97.3 
	58.1,100.2 52.2,100.2 52.2,103.2 52.1,103.2 52.1,106.2 52.1,106.4 52.1,109.2 43.2,109.2 43.2,112.1 43.2,112.4 43.2,115.1 
	40.2,115.1 40.2,118 34.3,118 34.3,121 34.3,121.2 34.3,123.8 34.3,124.2 34.3,126.9 34.3,127 34.3,130 34.3,130.1 34.3,133 
	34.3,133.2 34.3,136 34.3,136.2 34.3,139 34.3,139.2 34.3,142 34.3,142.2 34.3,144.8 34.3,145.2 34.3,147.9 34.3,148 34.3,151.1 
	34.3,151.1 34.3,154.3 40.1,154.3 40.1,157.2 43.3,157.2 43.3,160.2 43.3,160.3 43.3,163.4 49,163.4 49,166.2 52.2,166.2 
	52.2,168.8 52.2,169.1 52.2,172 85.2,172 85.2,169.1 88,169.1 88,166.2 90.9,166.2 90.9,163.4 96.8,163.4 96.8,160.2 96.8,160.2 
	96.8,157.2 99.9,157.2 99.9,154.2 105.9,154.2 105.9,151.1 105.9,151 105.9,148 108.9,148 108.9,145.3 112,145.3 112,142.3 
	114.8,142.3 114.8,139.3 124,139.3 124,136.3 124,136.1 124,133.2 124,133.1 124,130.1 124,130 124,127.1 132.9,127.1 132.9,124 
	132.9,123.9 132.9,121.1 132.9,120.8 132.9,117.9 132.9,117.9 132.9,115 132.9,114.7 132.9,111.9 132.9,111.8 132.9,109 
	132.9,108.7 132.9,106.1 132.9,105.8 132.9,103.3 132.9,102.9 132.9,100.4 132.9,100.1 132.9,97.3 132.9,97.2 132.9,94.4 
	132.9,94.1 132.9,91.2 "
                                />
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> cross-chain
                              </div>
                              <p>
                                No wraps, no side-chain, no light chain, 100%
                                true one-click swap between all blockchains{" "}
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon01">
                              <svg viewBox="0 0 200 200">
                                <g>
                                  <rect
                                    x="35.2"
                                    y="160.4"
                                    class="st0"
                                    fill="var(--button-bg-color)"
                                    width="128.3"
                                    height="8.5"
                                  />
                                  <path
                                    class="st0"
                                    fill="var(--button-bg-color)"
                                    d="M38.9,115.5v2.9h6.4v3.1h2.9h0.1h2.9v-3.1h6.4v-2.9h9.7v-3.1h3.3v-2.9h3.2v-3.1h3.1v-2.9H79v-3.2h-0.1v-3.2
		h-2.8v-2.6v-0.1v-3.1h-3v-2.7v-0.2v-3.1h-3v-3h-3v-2.7v-0.3v-2.7v-0.2v-3h-3.2v-2.9h-2.8v-3.2h-3v-3.1h-6v-2.7v-0.2v-2.6h3.2h108.1
		v-3.1v-0.1v-2.9v-0.2v-2.8v-0.2v-3H35.4v3v0.2v2.8v0.2v2.9v0.1v3.1h4.9h3v2.6v0.2v2.7h-5.9v3.1h-3v3.2h-2.8v2.9h-3.1v3v0.2v2.7v0.3
		v2.7h-3.1v3h-3v3.1v0.2v2.7h-2.9v3.1v0.1v2.6h-3.1v3.2v3.2h3.1v2.9h3.1v3.1h3.2v2.9h3.3v3.1H38.9z M37.2,88.7v-0.2v-2.9v-0.2v-2.8
		v-0.2v-2.7v-0.3v-2.7h3.1v-2.9h3v-3.2v-3h2.8v-3h3.3v3h2.8v3v3.2h3v2.9h3.1v2.7v0.3v2.7v0.2v2.8v0.2v2.9v0.2v2.7H37.2V88.7z"
                                  />
                                </g>
                                <g>
                                  <rect
                                    x="94.8"
                                    y="19.7"
                                    class="st1"
                                    width="9.2"
                                    height="26.8"
                                    fill="var(--button-bg-color)"
                                  />
                                  <rect
                                    x="94.8"
                                    y="58.8"
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    width="9.2"
                                    height="101.6"
                                  />
                                  <path
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    d="M183.5,100.3v-3.2h-2.8v-2.6v-0.1v-3.1h-3v-2.7v-0.2v-3.1h-3v-3h-3.1v-2.7v-0.3v-2.7v-0.2v-3h-3.1v-2.9h-2.8
		v-3.2h-3v-3.1h-6.1v-2.7v-0.2v-2.6h3.2v-3.2h-3.2v-2.9v-0.2v-2.8v-0.2v-3h-8.7v3v0.2v2.8v0.2v2.9h-3.1v3.2h3.1v2.6v0.2v2.7H142v3.1
		h-3v3.2h-2.8v2.9h-3.1v3v0.2v2.7v0.3v2.7H130v3h-3v3.1v0.2v2.7h-2.9v3.1v0.1v2.6H121v3.2v3.2h3.1v2.9h3.1v3.1h3.2v2.9h3.3v3.1h9.7
		v2.9h6.4v3.1h2.9h0.1h2.9v-3.1h6.4v-2.9h9.7v-3.1h3.3v-2.9h3.2v-3.1h3.1v-2.9h2.1L183.5,100.3L183.5,100.3z M162.9,79.4v0.3v2.7
		v0.2v2.8v0.2v2.9v0.2v2.7h-21.2v-2.7v-0.2v-2.9v-0.2v-2.8v-0.2v-2.7v-0.3v-2.7h3.1v-2.9h3.1v-3.2v-3h2.8v-3h3.3v3h2.8v3v3.2h3.1
		v2.9h3.1V79.4z"
                                  />
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br />
                                value match
                              </div>
                              <p>
                                Receive new crypto equal to the exact value you
                                sent with zero slippage
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon02">
                              <svg viewBox="0 0 200 200">
                                <path
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  d="M152.4,81.9v-2.7h-2.9V76h-6.4v-2.8h-6.4V64h-3V46.4l-3.2,0v-3.2h-3.1v-3h-3.1v-3.1h-3.1v-3h-3.1v-3h-3.4v-3
	h-12.7h-4.1H85.3v3h-3.4v3h-3.1v3h-3.1v3.1h-3.1v3h-3.1v3.2l-3.2,0V64h-3v9.2h-6.4V76h-6.4v3.2h-2.9v2.7h-9v2.8v0.5v2.3v0.6v74.5
	h2.7v3.5h3.1v2.7h3.1v2.9h49.2h6.4h49.2v-2.9h3.1v-2.7h3.1v-3.5h2.7V88.2v-0.6v-2.3v-0.5v-2.8H152.4z M72.4,64h3.3V46.4H85v-3v-0.2
	v-2.9h3.4v-3h9.5h4.1h9.5v3h3.4v2.9v0.2v3h9.3V64h3.3v9.2h-26.8h-1.5H72.4V64z M152.7,162.7h-49.5h-6.4H47.3V88.2h6.2v-2.9h3.4h2.5
	h39.9h1.5h39.9h2.5h3.4v2.9h6.2V162.7z"
                                />
                                <path
                                  class="st1"
                                  fill="var(--button-bg-color)"
                                  d="M113.1,114.7v-2.9v-3.2h-2.9v-2.8H107v-2.7v-0.3v-2.9h-7.4h-7.4v2.9v0.3v2.7h-3.3v2.8H86v3.2v2.9H86v3.2H86v3
	v0.2v3H89v2.9h5.9v17.9h4.7h0h4.7v-17.9h5.9v-2.9h2.9v-3v-0.2v-3h0.1L113.1,114.7L113.1,114.7z M107.2,117.9h-2.9v3v0.2v2.7h-4.7
	h-4.7v-2.7v-0.2v-3H92v-2.9h2.9v-3.2h4.7h4.7v3.2h2.9V117.9z"
                                />
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100%
                                <br />
                                safe
                              </div>
                              <p>
                                No hot wallet, no deposits, no accounts, no
                                custodial wallets
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
                              <svg viewBox="0 0 200 200">
                                <polygon
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  points="168.8,93.6 168.8,91.3 171.8,91.3 171.8,88.1 165.9,88.1 165.9,85.7 166.3,85.7 166.3,82.5 165.9,82.5 
	165.9,79.8 162.9,79.8 162.9,77.1 162.9,76.9 162.9,74.4 162.9,73.9 162.9,71.7 163.4,71.7 163.4,68.5 160.6,68.5 160.6,65.9 
	163.4,65.9 163.4,62.7 154.8,62.7 154.8,60.3 154.8,59.8 154.8,57.1 149.1,57.1 149.1,54.4 146.3,54.4 146.3,51.9 146.3,51.3 
	146.3,48.7 140.8,48.7 140.8,45.8 137.8,45.8 137.8,43.5 137.8,43 137.8,40.3 123.6,40.3 123.6,37.3 113.3,37.3 113.3,34.7 
	110.2,34.7 110.2,31.9 104.5,31.9 104.5,28.9 104,28.9 104,26.5 104.5,26.5 104.5,23.3 96.4,23.3 96.4,26.3 96.4,26.5 96.4,28.9 
	90.5,28.9 90.5,31.9 84.9,31.9 84.9,34.7 81.9,34.7 81.9,37.3 79.4,37.3 79.4,40.3 79.4,40.5 79.4,43 79.4,43.5 79.4,45.8 
	79.4,46.2 79.4,49 88.1,49 88.1,51.6 88.1,51.9 88.1,54.8 96.4,54.8 96.4,57.6 104,57.6 104,54.8 107.1,54.8 107.1,51.9 107.1,51.6 
	107.1,49 107.1,48.7 107.1,46.2 121.3,46.2 121.3,49 129.7,49 129.7,51.9 135.3,51.9 135.3,54.5 138.3,54.5 138.3,57.6 140.8,57.6 
	140.8,60.3 146.3,60.3 146.3,62.7 146.3,63 146.3,65.9 149.5,65.9 149.5,68.6 152.1,68.6 152.1,71.7 155.1,71.7 155.1,73.9 
	155.1,74.4 155.1,76.9 155.1,77.1 155.1,79.8 155.1,80.1 155.1,82.5 155.1,83 155.1,85.7 157.8,85.7 157.8,88.6 160.6,88.6 
	160.6,91.3 160.7,91.3 160.7,93.6 160.7,94 160.7,96.3 160.7,96.8 160.7,99.1 160.7,99.5 160.7,101.9 160.7,102.3 160.7,104.5 
	160.6,104.5 160.6,107.7 160.7,107.7 160.7,110.4 160.7,110.9 160.7,113.3 157.7,113.3 157.7,116.2 157.7,116.6 157.7,118.8 
	157.7,119.3 157.7,121.7 155,121.7 155,124.3 155,124.9 155,127.2 155,127.6 155,130 152.1,130 152.1,132.7 149.4,132.7 
	149.4,135.5 146.5,135.5 146.5,138.2 146.5,138.7 146.5,141 143.7,141 143.7,143.9 138.2,143.9 138.2,146.8 136.3,146.8 
	136.3,149.4 132.5,149.4 132.5,152.3 118.6,152.3 118.6,155.1 115.9,155.1 115.9,157.8 108.7,157.8 107.5,157.8 87.6,157.8 
	87.6,155.1 87.3,155.1 87.3,152.3 73.5,152.3 73.5,149.4 70.7,149.4 70.7,147.1 70.7,146.5 70.7,143.9 62.3,143.9 62.3,141.4 
	62.5,141.4 62.5,138.2 62.3,138.2 62.3,135.4 56.7,135.4 56.7,132.6 53.9,132.6 53.9,130.1 53.9,129.9 53.9,127.3 53.9,126.8 
	53.9,124.8 53.9,124.1 53.9,121.6 48.5,121.6 48.5,118.5 45.5,118.5 45.5,117 45.5,115.9 45.5,82.8 48.3,82.8 48.3,80.1 54.1,80.1 
	54.1,77 54.1,76.9 54.1,73.8 53.9,73.8 53.9,71.4 53.9,70.9 53.9,68.6 56.7,68.6 56.7,65.8 56.7,65.4 56.7,62.8 62.4,62.8 
	62.4,60.1 62.4,59.6 62.4,57.4 65.2,57.4 65.2,54.2 62.4,54.2 62.4,51.4 57.1,51.4 57.1,54.2 54.4,54.2 54.4,56.9 54.4,57.4 
	54.4,59.6 51.3,59.6 51.3,62.6 45.8,62.6 45.8,65.4 45.7,65.4 45.7,68.2 45.3,68.2 45.3,70.9 43,70.9 43,73.8 42.8,73.8 42.8,76.9 
	40.1,76.9 40.1,80 40,80 37.3,80 37.3,116 37.4,116 37.4,118.5 37.4,119.2 37.4,121.7 43,121.7 43,124.1 43,124.8 43,126.8 
	43,127.3 43,130.1 46.6,130.1 46.6,132.6 46.6,133.1 46.6,135.9 51.1,135.9 51.1,138.6 51.5,138.6 51.5,141.4 54.4,141.4 
	54.4,143.9 54.4,144.1 54.4,147.1 59.9,147.1 59.9,149.4 59.9,149.7 59.9,152.6 65.3,152.6 65.3,155.4 71.1,155.4 71.1,158.3 
	71.4,158.3 71.4,161 82.1,161 82.1,164.1 90.7,164.1 90.7,166.8 96.1,166.8 96.1,169.8 112.7,169.8 112.7,166.8 112.7,166.6 
	112.7,164.1 124,164.1 124,161 138,161 138,158.3 138,157.8 138,155.4 140.6,155.4 140.6,152.6 146.2,152.6 146.2,149.9 
	146.5,149.9 146.5,147.1 152.1,147.1 152.1,144.2 154.7,144.2 154.7,141.4 155,141.4 155,138.7 157.6,138.7 157.6,135.9 
	163.1,135.9 163.1,133.2 163.1,132.7 163.1,130.4 163.1,130 163.1,127.6 163.4,127.6 163.4,124.9 163.4,124.3 163.4,122.1 
	163.4,121.7 163.4,119.3 165.8,119.3 165.8,116.6 166.1,116.6 166.1,113.6 166.1,113.3 166.1,110.9 168.8,110.9 168.8,107.7 
	168.8,107.7 168.8,105.1 168.8,104.5 168.8,102.3 171.5,102.3 171.5,99.5 171.8,99.5 171.8,96.3 168.8,96.3 168.8,94 "
                                />
                                <path
                                  class="st1"
                                  fill="var(--button-bg-color)"
                                  d="M118.2,108.9v-1.1h0v-2.8v-0.5v-2.2v-0.6v-2.7h-11.1v-2.4v-0.6V94v-0.4v-2.4v-0.4v-2.4V88v-2.4h5.8v2.7h2.2v2.7
	h3v-2.7v-0.6v-2.1h3v-2.8v-0.3v-2.8h-3v-2.8h-11.1v-2.4v-0.5v-2.3v-0.4v-2.8H96.4v2.8v0.4v2.3v0.5v2.4H91v2.8h-0.3v2.8h-3v2.8h-5.4
	V88v0.4v2.4v0.4v2.4V94v2.2v0.6v2.6h5.4v1.1h0v2.8v0.5v2.2v0.6v2.7h11.1v2.4v0.6v2.2v0.4v2.4v0.4v2.4v0.4v2.4h-5.8V120h-2.2v-2.7h-3
	v2.7v0.6v2.1h-3v2.8v0.3v2.8h3v2.8h11.1v2.4v0.5v2.3v0.4v2.8h10.7V137v-0.4v-2.3v-0.5v-2.4h5.5v-2.8h0.3v-2.8h3v-2.8h5.4v-2.8v-0.4
	v-2.4v-0.4v-2.4v-0.4v-2.2v-0.6v-2.6H118.2z M95.7,94v-0.4v-2.4v-0.4v-2.4h3.2v2.4v0.4v2.4V94v2.2h-3.2V94z M110.2,114.3v0.4v2.4
	v0.4v2.4H107v-2.4v-0.4v-2.4v-0.4v-2.2h3.2V114.3z"
                                />
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100%
                                <br />
                                reimbursement
                              </div>
                              <p>
                                Fees and gas reimbursed fully with SMART{" "}
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
                              <p>
                                At the end of the swap, once the final cost for each user (sender / receiver) is known, the SmartSwap will send both users SMART at the same face value to rebate user’s fees and gas 100% paid throughout the swap. Users must join the bus to receive the reimbursement.
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon05">
                              <svg viewBox="0 0 200 200">
                                <path
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  d="M169.2,96.7v-2.3h-2.7v-0.3v-1.9v-0.5v-0.3V89v-0.1v-3.1h-2.7v-2.5v-0.3v-2.9h-0.3v-2.8h-2.5V75v-0.3v-2.3v-0.5
	v-2.7h-0.3v-2.5v-0.3V64v-0.5v-2.7h-5.5V58h-2.6v-2.7h-0.3v-2.8h-2.6v-2.9h-5.5v-2.9H144v-2.6h-5.6v-2.9h-2.6v-2.4v-0.4v-2.8h-14
	v-3.1h-11.3v-2.5v-0.2v-3H93.9v3h-5.4v2.6h-8.7v3.1H69.2v2.8h-0.4v2.8h-5.7v2.8h-5.4V47v0.3v2.3h-5.5v3v0.2v2.5h-2.9V58h-0.3v2.8
	h-4.5v2.8V64v2.6h-3.6v2.8v0.4v2.1v0.7V75h-5.5v2.6v0.6v2.3h-0.1v0.2v35.8v0.2h0.1v2.3v0.7v2.5h5.5v2.4v0.7v2.1v0.4v2.8h3.6v2.6v0.4
	v2.8h4.5v2.8h0.3v2.8h2.9v2.5v0.2v3h5.5v2.3v0.3v2.9h5.4v2.9h5.7v2.8h0.4v2.8h10.6v3.1h8.7v2.6h5.4v3.1h16.6v-3.1v-0.1v-2.5h11.3
	v-3.1h14v-2.8v-0.4v-2.3h2.6V153h5.6v-2.6h0.3v-2.9h5.5v-2.8h2.6v-2.8h0.3v-2.7h2.6v-2.8h5.5v-2.7v-0.5v-2.4v-0.4V128h0.3v-2.6v-0.6
	v-2.3v-0.4v-2.3h2.5V117h0.3v-3v-0.3v-2.5h2.7v-3.1v-0.1v-2.3v-0.3V105v-1.9v-0.3h2.7v-2.3h0.3v-0.5v-2.7v-0.5H169.2z M158.4,103.1
	v1.9h-0.1v3.2h0.1v2.7v0.5v2.5h-2.9v2.8v0.4v2.3v0.5v2.3h-2.8v2.7v0.6v2.3v0.4v2.4h-2.9v2.7h-2.6v2.8h-2.9v2.7v0.5v2.3h-2.8v2.9H136
	v2.9h-2v2.6h-3.8v2.9h-13.9v2.8h-2.7v2.8h-7.2h-1.2H85.4v-2.8h-0.3v-2.8H71.3v-2.8h-2.8v-2.3V147v-2.6H60v-2.5h0.3v-3.2H60v-2.8
	h-5.6v-2.8h-2.8v-2.6v-0.2v-2.6v-0.4v-2.1v-0.7V122h-5.5V119h-2.9v-1.5V117H46v-3.2h-2.7V83.3H46v-3.2h-2.7v-0.4v-1.5h2.9v-3h5.5
	v-2.5v-0.7v-2.1v-0.4v-2.6v-0.2V64h2.8v-2.8H60v-2.8h0.3v-3.2H60v-2.5h8.4v-2.6v-0.6v-2.3h2.8v-2.8h13.8v-2.8h0.3v-2.8h19.8h1.2h7.2
	v2.8h2.7v2.8h13.9v2.9h3.8v2.6h2v2.9h5.5v2.9h2.8V58v0.5v2.7h2.9V64h2.6v2.7h2.9v2.5v0.4v2.3v0.5V75h2.8v2.3v0.5v2.3v0.4v2.8h2.9
	v2.5v0.5v2.7h-0.1v3.2h0.1v1.9v0.3v0.1v0.3v1.9v0.5v0.1v0.3v1.9v0.3v0.1v0.5v1.9v0.3v0.1V103.1z"
                                />
                                <path
                                  class="st1"
                                  fill="var(--button-bg-color)"
                                  d="M115.9,106.2v-1.1h0v-2.8v-0.4v-2.2v-0.5v-2.7h-11.1V94v-0.6v-2.1v-0.5v-2.3v-0.4v-2.4v-0.4v-2.4h5.8v2.7h2.2
	v2.6h3v-2.6V85v-2.1h3V80v-0.4v-2.8h-3v-2.8h-11.1v-2.3v-0.5v-2.3v-0.4v-2.8H94.2v2.8v0.4v2.3v0.5v2.3h-5.5v2.8h-0.3v2.8h-3v2.8H80
	v2.8v0.4v2.4v0.4v2.3v0.5v2.1V94v2.6h5.4v1.1h0v2.8v0.4v2.2v0.5v2.7h11.1v2.5v0.6v2.2v0.4v2.3v0.4v2.4v0.4v2.4h-5.8v-2.6h-2.2v-2.7
	h-3v2.7v0.5v2.1h-3v2.9v0.3v2.8h3v2.7h11.1v2.4v0.5v2.3v0.4v2.8h10.7v-2.8v-0.4v-2.3v-0.5v-2.4h5.5V126h0.3v-2.8h3v-2.8h5.4v-2.8
	v-0.4v-2.4v-0.4V112v-0.4v-2.2v-0.6v-2.6H115.9z M93.5,91.3v-0.5v-2.3v-0.4v-2.4h3.2v2.4v0.4v2.3v0.5v2.1h-3.2V91.3z M107.9,111.5
	v0.4v2.3v0.4v2.4h-3.2v-2.4v-0.4V112v-0.4v-2.2h3.2V111.5z"
                                />
                                <polygon
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  points="169.9,33.4 166.7,33.4 166.7,30.4 163.6,30.4 163.6,33.4 157.3,33.4 157.3,36.5 153.9,36.5 153.9,39.7 
	150.8,39.7 150.8,42.8 147.6,42.8 147.6,45.8 144.5,45.8 144.5,49 141.3,49 141.3,52.1 138.3,52.1 138.3,55.1 135.1,55.1 
	135.1,58.2 131.9,58.2 131.9,61.2 128.9,61.2 128.9,64.4 125.7,64.4 125.7,67.5 122.7,67.5 122.7,70.5 119.6,70.5 119.6,73.6 
	116.3,73.6 116.3,76.6 113.3,76.6 113.3,79.8 110.1,79.8 110.1,82.9 107.1,82.9 107.1,86.1 103.6,86.1 103.6,89.2 100.3,89.2 
	100.3,92.2 97.3,92.2 97.3,95.4 94.1,95.4 94.1,98.5 91.1,98.5 91.1,101.5 87.8,101.5 87.8,104.6 84.6,104.6 84.6,107.6 81.5,107.6 
	81.5,110.8 78.3,110.8 78.3,113.9 75.3,113.9 75.3,116.9 72.2,116.9 72.2,120 68.9,120 68.9,123 65.9,123 65.9,126.2 62.7,126.2 
	62.7,129.3 59.7,129.3 59.7,132.3 56.5,132.3 56.5,135.4 53.3,135.4 53.3,138.4 50.3,138.4 50.3,141.6 47,141.6 47,144.7 44,144.7 
	44,147.9 40.5,147.9 40.5,151 37.3,151 37.3,154 34.3,154 34.3,157.2 31,157.2 31,160.3 28,160.3 28,163.5 31,163.5 31,166.4 
	34.1,166.4 34.1,163.5 40.2,163.5 40.2,160.4 43.6,160.4 43.6,157.2 46.8,157.2 46.8,154.2 49.8,154.2 49.8,151.1 53,151.1 
	53,147.9 56.2,147.9 56.2,144.8 59.6,144.8 59.6,141.6 62.8,141.6 62.8,138.6 65.8,138.6 65.8,135.5 69.1,135.5 69.1,132.5 
	71.8,132.5 71.8,129.4 75.2,129.4 75.2,126.2 78.4,126.2 78.4,123.2 81.4,123.2 81.4,120.1 84.7,120.1 84.7,117.1 87.3,117.1 
	87.3,114 90.8,114 90.8,110.8 94,110.8 94,107.8 97,107.8 97,104.7 100.3,104.7 100.3,101.7 103.2,101.7 103.2,98.6 106.6,98.6 
	106.6,95.4 109.8,95.4 109.8,92.4 112.8,92.4 112.8,89.3 116.1,89.3 116.1,86.1 119.2,86.1 119.2,83 122.6,83 122.6,79.8 
	125.8,79.8 125.8,76.8 128.8,76.8 128.8,73.7 132.1,73.7 132.1,70.7 134.8,70.7 134.8,67.6 138.2,67.6 138.2,64.4 141.4,64.4 
	141.4,61.4 144.4,61.4 144.4,58.3 147.6,58.3 147.6,55.3 150.4,55.3 150.4,52.2 153.8,52.2 153.8,49 157,49 157,46 160,46 160,42.9 
	163.3,42.9 163.3,39.7 166.7,39.7 166.7,36.6 169.9,36.6 "
                                />
                              </svg>
                            </div>
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
                            <div className="icon-Box icon06">
                              <svg viewBox="0 0 200 200">
                                <path
                                  class="st0"
                                  fill="var(--button-bg-color)"
                                  d="M150.2,56.9v-3.6h-2.7v-2.7v-0.3v-2.9h-2.7v-3.1h-7.7v-2.5h-7.4v-1.9v-0.6v-2.6h-29.6H100H70.2v2.6v0.6v1.9
	h-7.4v2.5h-7.7v3.1h-2.7v2.9v0.3v2.7h-2.7v3.6h-2.7v50.9h2.7v2.8h2.7v8.3h0.6v2.7h2.1v2.2v0.5v2.7h2v2.4v0.7v2.3v0.2v3H63v2.7v0.3
	v2.9h2.3v2.5h4.9v2.6v3.2h5.7v2.8H79v3.1h3.2v3h2.3v2.7h3.1v2.7H100h0.1h12.3v-2.7h3.1v-2.7h2.3v-3h3.2v-3.1h3.1v-2.8h5.7v-3.2v-2.6
	h4.9v-2.5h2.3v-2.9v-0.3v-2.7h5.8v-3v-0.2v-2.3v-0.7v-2.4h2v-2.7v-0.5v-2.2h2.1V119h0.6v-8.3h2.7v-2.8h2.7V56.9H150.2z M144.3,118.5
	H137v2.7v0.5v2.2v0.5v2.6v0.1v2.4h-1.9v3h-5.3v3.1v0.1v2.7v0.3v2.2h-7.4v2.6v0.6v2.6h-3.3v2.8h-3.6v3.1v0.1v2.9h-8l0-14.6h-2.3V139
	H100H100h-5.2v2.1h-2.3l0,14.6h-8v-2.9v-0.1v-3.1h-3.6v-2.8h-3.3v-2.6v-0.6v-2.6h-7.4v-2.2v-0.3v-2.7v-0.1v-3.1h-5.3v-3H63v-2.4V127
	v-2.6v-0.5v-2.2v-0.5v-2.7h-7.3V50.6h7.1v-3.1h4.7V45H100h0.5h32v2.5h4.7v3.1h7.1V118.5z"
                                />
                                <g>
                                  <polygon
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    points="65.3,69.7 69.8,69.7 69.8,67 77.6,67 77.6,69.7 80.4,69.7 80.4,72.4 82.7,72.4 82.7,75.3 85.1,75.3 
		85.1,78.2 85.2,78.2 85.2,81.2 77.6,81.2 77.6,78.3 70.2,78.3 70.2,81.2 65.3,81.2 65.3,83.7 65.3,84.4 65.3,86.9 70.2,86.9 
		70.2,89.6 77.6,89.6 77.6,86.9 85.1,86.9 85.1,84.4 85.2,84.4 85.2,81.3 92.8,81.3 92.8,78.2 92.8,78.1 92.8,75.3 92.8,75 
		92.8,72.4 92.8,72.1 92.8,69.7 92.8,69.2 92.8,66.5 85.1,66.5 85.1,63.8 82.7,63.8 82.7,61.5 79.7,61.5 79.7,58.9 72.9,58.9 
		72.9,61.5 70.2,61.5 70.2,63.8 67.7,63.8 67.7,66.5 65.3,66.5 65.3,68.8 62.8,68.8 62.8,72 65.3,72 	"
                                  />
                                  <polygon
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    points="134.7,68.8 134.7,66.5 132.3,66.5 132.3,63.8 129.8,63.8 129.8,61.5 127.1,61.5 127.1,58.9 
		120.3,58.9 120.3,61.5 117.3,61.5 117.3,63.8 114.9,63.8 114.9,66.5 107.2,66.5 107.2,69.2 107.2,69.7 107.2,72.1 107.2,72.4 
		107.2,75 107.2,75.3 107.2,78.1 107.2,78.2 107.2,81.3 114.8,81.3 114.8,84.4 114.9,84.4 114.9,86.9 122.4,86.9 122.4,89.6 
		129.8,89.6 129.8,86.9 134.7,86.9 134.7,84.4 134.7,83.7 134.7,81.2 129.8,81.2 129.8,78.3 122.4,78.3 122.4,81.2 114.8,81.2 
		114.8,78.2 114.9,78.2 114.9,75.3 117.3,75.3 117.3,72.4 119.6,72.4 119.6,69.7 122.4,69.7 122.4,67 130.2,67 130.2,69.7 
		134.7,69.7 134.7,72 137.2,72 137.2,68.8 	"
                                  />
                                  <polygon
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    points="132.2,111.1 129.8,111.1 129.8,113.7 127.4,113.7 127.4,116.4 124.9,116.4 124.9,119.5 107.2,119.5 
		107.2,116.9 107.2,116.4 107.2,114.3 107.2,113.7 107.2,111.1 100,111.1 100,111.1 92.8,111.1 92.8,113.7 92.8,114.3 92.8,116.4 
		92.8,116.9 92.8,119.5 75.1,119.5 75.1,116.4 72.6,116.4 72.6,113.7 70.2,113.7 70.2,111.1 67.8,111.1 67.8,108.3 63,108.3 
		63,111.5 65.6,111.5 65.6,114.3 67.8,114.3 67.8,116.9 70.2,116.9 70.2,119.5 70.2,119.6 70.2,122.5 70.2,122.7 70.2,125.7 
		73.9,125.7 73.9,128.9 93.7,128.9 93.7,125.7 100,125.7 100,125.7 106.3,125.7 106.3,128.9 126.1,128.9 126.1,125.7 129.8,125.7 
		129.8,122.7 129.8,122.5 129.8,119.6 129.8,119.5 129.8,116.9 132.2,116.9 132.2,114.3 134.4,114.3 134.4,111.5 137,111.5 
		137,108.3 132.2,108.3 	"
                                  />
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> anonymous
                              </div>
                              <p>
                                Complete privacy guard with no KYC / AML needed{" "}
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon07">
                              <svg viewBox="0 0 200 200">
                                <g>
                                  <path
                                    class="st0"
                                    fill="var(--button-bg-color)"
                                    d="M155.9,51.4v-2.7h-2.7v-2.7h-2.2v-2.3H71.2v5h-2.2v5h-2.4v72h2.2v4.9h2.5v2.4h6.8v2.4h70.2V133h10v-2.4v-0.5
		v-1.5v-2.9V51.4H155.9z M73.9,125.7V55.8v-2.1v-2.3h75.8h1.2v74.3H73.9z"
                                  />
                                  <polygon
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    points="93.8,140.1 83.7,140.1 83.7,155.3 49,155.3 49,119.8 49,118.4 63.8,118.4 63.8,111 49,111 49,115.6 
		44.3,115.6 44.3,118.4 41.8,118.4 41.8,155.3 44.3,155.3 44.3,158.2 49,158.2 49,162.8 86.2,162.8 86.2,158.2 91.2,158.2 
		91.2,155.3 93.8,155.3 	"
                                  />
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> scalable
                              </div>
                              <p>
                                No LP, no pools, true decentralized CEX and OTC
                                liquidity bridge{" "}
                              </p>
                            </div>
                          </div>
                          <div className="swap-Box01">
                            <div className="icon-Box icon09">
                              <svg viewBox="0 0 200 200">
                                <g>
                                  <g>
                                    <polygon
                                      class="st0"
                                      fill="var(--button-bg-color)"
                                      points="70.1,81.8 70.1,84.9 70.1,88.1 72.7,88.1 72.7,91.2 75.2,91.2 75.2,94 75.2,94.1 75.2,96.9 
			82.9,96.9 82.9,94.1 82.9,94 82.9,90.9 82.4,90.9 82.4,88 79.7,88 79.7,84.9 79.7,81.7 77.9,81.7 77.9,78.6 75.2,78.6 75.2,76.1 
			64.9,76.1 64.9,79.3 68.2,79.3 68.2,81.8 		"
                                    />
                                    <rect
                                      x="109.4"
                                      y="103.7"
                                      class="st0"
                                      fill="var(--button-bg-color)"
                                      width="14.6"
                                      height="8.8"
                                    />
                                    <polygon
                                      class="st0"
                                      fill="var(--button-bg-color)"
                                      points="77.3,123.4 75.2,123.4 75.2,126.1 75.2,130.9 70.3,130.9 70.3,138 70.3,143.3 68.2,143.3 68.2,145.5 
			77.3,145.5 77.3,143.3 77.3,138 80.2,138 80.2,130.9 85.2,130.9 85.2,126.1 85.2,123.4 87.6,123.4 87.6,120.4 77.3,120.4 		"
                                    />
                                  </g>
                                  <path
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    d="M77.8,53.7v-3.1h-5v-3.1v-3.2h-4.9v-2.8h-3v-2.1v-0.8v-2.4H40.5v2.4v0.8v2.1H38v2.8h-7.4v2.6v0.6V50v0.1v3v0.1
		v2.9v0.2v12.8h4.9V74h5v2.7h7.2v4.2h17.2v-4.2h5.3v-3.1h2.6v-4.3h2.7v-3h2.4v-3v-0.2v-3v-3.2L77.8,53.7L77.8,53.7z M68.3,60.1v3
		v0.2v2.8h-2.5v3h-0.9v2.3h-4.5V74H48.3h-0.5v-4.9h-7.2V56.3v-0.2v-2.9H43v-3.1h4.7v-2.6v-0.6v-2.2h14.9v2.8v3.1v0.1v3.1h5.7v3.1
		V60.1z"
                                  />
                                  <path
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    d="M109.4,103.7v-2.2h-3.6v-2.2v-2.3h-3.6v-2H100v-1.5v-0.6V91H82.3v1.7v0.6v1.5h-1.8v2h-5.4v1.9v0.4v1.8v0.1v2.2
		v0.1v2.1v0.1v9.3h3.6v3.6h3.6v2h5.2v3H100v-3h3.8v-2.2h1.9V115h2v-2.2h1.7v-2.2v-0.1v-2.2V106L109.4,103.7L109.4,103.7z
		 M102.5,108.3v2.2v0.1v2h-1.8v2.2H100v1.6h-3.3v1.9h-8.8h-0.4v-3.6h-5.2v-9.3v-0.1v-2.1h1.8v-2.2h3.4v-1.9v-0.4v-1.6h10.8v2v2.2
		v0.1v2.2h4.1v2.2V108.3z"
                                  />
                                  <path
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    d="M176.4,101.7V98h-5.6v-3.7v-3.8h-5.4v-3.3h-3.3v-2.5v-1v-2.9H135v2.9v1v2.5h-2.8v3.3H124v3.1v0.7v3v0.1v3.6
		v0.1v3.4v0.2V120h5.5v5.8h5.5v3.2h8v5h19.1v-5h5.9v-3.7h2.9v-5.1h3v-3.6h2.7v-3.6v-0.2v-3.6v-3.8v-3.8H176.4z M165.9,109.3v3.6v0.2
		v3.3h-2.8v3.6h-1v2.7h-5v3.1h-13.6H143V120h-8v-15.2v-0.2v-3.4h2.8v-3.7h5.2v-3.1v-0.7V91h16.6v3.3V98v0.1v3.7h6.3v3.7V109.3z"
                                  />
                                  <path
                                    class="st1"
                                    fill="var(--button-bg-color)"
                                    d="M79.2,154.2v-1.5h-2.3v-1.5v-1.6h-2.3v-1.4h-1.4v-1v-0.4v-1.2H61.8v1.2v0.4v1h-1.2v1.4h-3.5v1.3v0.3v1.2v0v1.5
		v0v1.4v0.1v6.4h2.3v2.4h2.3v1.3h3.4v2.1h8v-2.1h2.5v-1.5h1.2V162h1.3v-1.5h1.1V159v-0.1v-1.5v-1.6L79.2,154.2L79.2,154.2z
		 M74.8,157.4v1.5v0.1v1.4h-1.2v1.5h-0.4v1.1h-2.1v1.3h-5.7h-0.2v-2.4h-3.4v-6.4v-0.1V154h1.2v-1.5h2.2v-1.3v-0.3v-1.1h7v1.4v1.5v0
		v1.5h2.7v1.5V157.4z"
                                  />
                                </g>
                              </svg>
                            </div>
                            <div className="text-Content">
                              <div className="text-Title">
                                100% <br /> decentralized
                              </div>
                              <p>
                                DAO approach with a closed system lacking any
                                single point of failure privilege{" "}
                              </p>
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
                          <Link to="/ownLicence" className="ssBtn01">
                            GET YOUR OWN LICENSE FOR FREE{" "}
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
                        <div className="ssTitle01 wow fadeInUp" data-wow-delay="0.2s">
                          Alternative to AMMs with zero pools or LPs needed
                        </div>
                        <div className="ssText01 wow fadeInUp" data-wow-delay="0.4s" style={{ marginTop: "10px" }}>
                          SmartSwap is the world's first smart decentralized
                          exchange (SDEX) providing a one-click slippage-free
                          cross-chain swap in a simple layer that decentralizes
                          the access to all CEX (Centralize exchanges) and OTC
                          (Over-the-counter) industry. The best way to think of
                          SDEX is like PayPal creating a simple one-click layer
                          on top of banks to send and receive funds.
                        </div>
                        <div className="ssTitle01 wow fadeInRight" data-wow-delay="0.2s">Supporting blockchains</div>
                        <Carousel className="wow fadeInRight" data-wow-delay="0.3s"
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
                          containerClass="carousel-container ani-1"
                          // removeArrowOnDeviceType={["tablet", "mobile"]}
                          deviceType={this.props.deviceType}
                          dotListClass="custom-dot-list-style"
                          itemClass="carousel-item-padding-40-px"
                        >
                          <div className="sbSlide">
                            {" "}
                            <img src={SBLogo01} alt="" />{" "}
                          </div>
                          <div className="sbSlide">
                            {" "}
                            <img src={SBLogo02} alt="" />{" "}
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

                        <div className="ssTitle01 wow fadeInLeft" data-wow-delay="0.2s">
                          SMART Tokenomics in Action
                        </div>
                        <div className="ssText01 wow fadeInLeft" data-wow-delay="0.4s" style={{ marginTop: "10px" }}>
                          SmartSwap does not utilize LPs or pools therefore fees
                          are used to support SMART through automatic buybacks.{" "}
                        </div>

                        <div class="stActMBX">
                          <div class="stActSbx01 wow zoomIn" data-wow-delay="0.1s">
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
                          <div class="stActSbx01 wow zoomIn" data-wow-delay="0.2s">
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
                          <div class="stActSbx01 wow zoomIn" data-wow-delay="0.3s">
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
                          <div class="stActSbx01 wow zoomIn" data-wow-delay="0.4s">
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
                          <div class="stActSbx01 wow zoomIn" data-wow-delay="0.5s">
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
                              frameborder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowfullscreen
                            ></iframe>
                          </div>
                        </div>
                        <div
                          className="ssBTNbar01 wow fadeInUp" data-wow-delay="0.2s"
                          style={{ justifyContent: "center" }}
                        >
                          <Link to="/ownLicence" className="ssBtn01">
                            GET YOUR OWN LICENSE FOR FREE{" "}
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

                        <div className="ssTitle01 wow fadeInUp" data-wow-delay="0.2s">License Partners</div>
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

                        <div className="ssTitle01 wow fadeInUp" data-wow-delay="0.2s">Venture Partners</div>

                        <div className="VPMainBX wow fadeInUp" data-wow-delay="0.4s">
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-01.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-02.png?v1"
                              alt=""
                            />
                            Hassan (Hatu) Sheikh{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-03.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-04.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-05.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-06.png"
                              alt=""
                            />{" "}
                            Andrea Castiglione
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-07.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-08.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-09.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-010.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-011.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-012.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-013.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-014.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-015.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-016.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-017.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-018.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-019.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-020.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-021.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-022.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-023.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-024.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-025.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-026.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-027.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-028.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-029.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-030.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-031V2.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-032.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-033.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-034.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-035.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-036.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-037.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-038.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-039.png"
                              alt=""
                            />{" "}
                          </div>
                          <div className="VPSubBX01">
                            {" "}
                            <img
                              src="images/venture-partners/vpICON-040.png"
                              alt=""
                            />{" "}
                          </div>
                        </div>
                        <div className="smrtSwapNewsletterBX wow fadeInUp" data-wow-delay="0.2s">
                          {/* <button className='smrtNLBTN01'>Connect Your Wallet To Become An Affiliate</button> */}

                          {/* <div className="smrtSwapNewslSBX">
                            <input
                              type="text"
                              value="smartswap.exchange/ref/917Ak92j06noRka"
                            />
                            <button className="submitBTN">COPY LINK</button>
                          </div> */}
                          {/* <div className="smrtSwapInfoSBX">
                            Share your link and receive 0.1% with SAMRT tokens
                            for each swap you refer{" "}
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>{" "}
                            | Total commission: <span>4526.32</span> SMART
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <!--======================= SWAP BLOCK END =====================--> */}
                </div>
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
