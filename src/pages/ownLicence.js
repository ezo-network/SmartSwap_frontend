import React, { PureComponent, lazy, Suspense } from "react";
import InputRange from "react-input-range";

import { Redirect } from "react-router-dom";
import { Link, NavLink } from 'react-router-dom'
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
import WithDrawToken from "../components/withdraw_token";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import WalletPopup from "../components/WalletPopup";
import CoinPopup from "../components/CoinPopup";
import SidePopup from "../components/SidePopup";
import Collapse from "@kunukn/react-collapse";
import CreateLicence from "../components/CreateLicense";
import axios from "axios";
import Highlight from "react-highlight";
import { ChromePicker } from "react-color";
import ReimbursementContract from "../helper/reimbursementContract";
import { isValidAddress } from "ethereumjs-util";
import reimbursementAbi from "../abis/reimbursementAbi.json";
import tokenVaultAbi from "../abis/tokenVaultAbi.json";
import DepositToken from "../components/Deposit-withdraw";

const $ = window.$;

const validatesubDomain = (value) => {
  const reg = /^[a-zA-Z0-9&_-]+$/;
  const isvalid = reg.test(value);
  return isvalid;
};
const isValidURL = (string) => {
  // var res = string.match(
  //   /((http|https):\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  // );
  var res = string.match(
    /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm
  );
  return res !== null;
};
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const copyAffiliateLink = (e, id) => {
  e.preventDefault();
  var copyText = document.getElementById(id);
  copyText.select();
  document.execCommand("copy");
  notificationConfig.success("Copied Successfully!")
};

export default class ownLicence extends PureComponent {
  constructor(props) {
    super();
    this.setSendCurrency = this.setSendCurrency.bind(this);
    this.setReceiveCurrency = this.setReceiveCurrency.bind(this);
    this.changeTypeofLicense = this.changeTypeofLicense.bind(this);
    this._onChangeRadio = this._onChangeRadio.bind(this);
    this.getFees = this.getFees.bind(this);
    // this.updateLicenseAddress = this.updateLicenseAddress.bind(this)
    const { location } = props;
    this.state = {
      value: 0,
      isOpen1: false,
      web3: null,
      web3Check: false,
      btnClick: false,
      swapFactory: null,
      swapLoading: false,
      selectedSendCurrency: "BNB",
      selectedReceiveCurrency: "ETH",
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
      showLedger: false,
      currencyPrices: {},
      estimatedGasFee: "0",
      tokenBalances: {
        JNTR: 0,
        "JNTR/b": 0,
        "JNTR/e": 0,
        JNTR_APPROVED: 0,
        "JNTR/b_APPROVED": 0,
        "JNTR/e_APPROVED": 0,
      },
      showFeeInpt: true,
      zeroIntegrationShow: true,
      "bsc": false,
      "ethereum": false,
      "polygon": false,
      bgimage:
        typeof location.state === "undefined"
          ? ""
          : location.state.cloneData
            ? location.state.cloneData.bgimage
            : "",
      logoImage:
        typeof location.state === "undefined"
          ? ""
          : location.state.cloneData
            ? location.state.cloneData.logoImage
            : "",
      error: "",
      isloading: false,
      subDomain:
        typeof location.state === "undefined"
          ? ""
          : location.state.cloneData
            ? location.state.cloneData.subDomain
            : "",
      logoUrl:
        typeof location.state === "undefined"
          ? ""
          : location.state.cloneData
            ? location.state.cloneData.logoUrl
            : "",
      primaryColor:
        typeof location.state === "undefined"
          ? "#fff"
          : location.state.cloneData
            ? location.state.cloneData.primaryColor
            : "#fff",
      showPrimaryColor: false,
      showSwapButtonColor: false,
      secondaryColor:
        typeof location.state === "undefined"
          ? "#5c6bc0"
          : location.state.cloneData
            ? location.state.cloneData.secondaryColor
            : "#5c6bc0",
      swapButtonColor:
        typeof location.state === "undefined"
          ? "#91dc27"
          : location.state.cloneData
            ? location.state.cloneData.swapButtonColor
            : "#91dc27",
      showSecondaryColor: false,
      formData: {
        primaryColor: { value: "", error: "", errormsg: "" },
        secondaryColor: { value: "", error: "", errormsg: "" },
        subDomain: { value: "", error: "", errormsg: "" },
      },
      visitDomain: "",
      fontStyle:
        typeof location.state === "undefined"
          ? "Default"
          : location.state.cloneData
            ? location.state.cloneData.fontStyle
            : "Default",
      backgroundOverLay:
        typeof location.state === "undefined"
          ? "60"
          : location.state.cloneData
            ? location.state.cloneData.backgroundOverLay
            : "60",
      cloneData:
        typeof location.state === "undefined"
          ? {}
          : location.state.cloneData
            ? location.state.cloneData
            : {},
      typeofLicense: "Zero integration",
      newColor: false,
      changeFee: "Yes",
      changeText:
        typeof location.state === "undefined"
          ? "Yes"
          : location.state.cloneData
            ? location.state.cloneData.changeText
            : "Yes",
      sideBar:
        typeof location.state === "undefined"
          ? "true"
          : location.state.cloneData
            ? location.state.cloneData.sideBar
            : "true",
      displayToken: "Display token lists",
      bscLicenseAddress: CONSTANT.ZERO_ADDRESS,
      ethLicenseAddress: CONSTANT.ZERO_ADDRESS,
      bscLicenseFees: 0,
      ethLicenseFees: 0,
      bscLicenseFeesCurrent: 0,
      ethLicenseFeesCurrent: 0,
      bscLicenseTokenBalance: 0,
      ethLicenseTokenBalance: 0,
      allowClone: false,
      licenseeData: null,
      depositWithdrawNetwork: null,
      depositWithdrawVaultAddress: null,
      depositTokenAddress: CONSTANT.ZERO_ADDRESS
    };
  }
  componentWillMount = async () => {
    await this.fetchPrice();
  };
  componentDidMount = async () => {
    window.scrollTo(0, 0);
    this.setState({
      web3Ethereum: new Web3(
        new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
      ),
      web3Binance: new Web3(
        new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
      ),
    });
    this.setState(
      {
        loading: true,
        licenseeData: web3Config.getLicenseeData()
      },
      async () => {
        await this.initInstance();
      }
    );
    console.log("-------------license-data-------------------------------------", web3Config.getLicenseeData())
  };
  async initInstance() {
    let { web3Binance, web3Ethereum } = this.state;
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

    this.setState(
      {
        instanceReimbursementBinance,
        instanceReimbursementEthereum,
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
      notificationConfig.error("Please Select Kovan or BSC Test Network");
      this.setState({ btnClick: false });
      return;
    }
    // if (
    //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
    //   networkId &&
    //   networkId === 97
    // ) {
    //   notificationConfig.warning("Change metamask network to Ethereum!");
    //   return;
    // } else if (
    //   constantConfig.tokenDetails[this.state.selectedSendCurrency].networkId !==
    //   networkId &&
    //   networkId === 42
    // ) {
    //   notificationConfig.warning("Change metamask network to Binance!");
    //   return;
    // }
    this.setState(
      {
        web3: web3Config.getWeb3(),
        btnClick: false,
      },
      async () => {
        await this.getData([web3Config.getAddress()])
        let licenseeData = await web3Config.getLicenseeData()
        if (licenseeData !== null) {
          const href = window.location.href;
          const domaindata = href
            .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
            .split("/")[0];
          this.clearPreview();
          this.setState({
            licenseeData: licenseeData,
            bscLicenseAddress: licenseeData.bscLicenseAddress,
            ethLicenseAddress: licenseeData.ethLicenseAddress,
            bscLicenseFees: licenseeData.bscLicenseAddress !== CONSTANT.ZERO_ADDRESS ? (await this.getFees("BSC", licenseeData.bscLicenseAddress, constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract)).fees : 0,
            ethLicenseFees: licenseeData.ethLicenseAddress !== CONSTANT.ZERO_ADDRESS ? (await this.getFees("Ethereum", licenseeData.ethLicenseAddress, constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract)).fees : 0,
            bscLicenseTokenBalance: licenseeData.bscLicenseAddress !== CONSTANT.ZERO_ADDRESS ? (await this.getFees("BSC", licenseeData.bscLicenseAddress, constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract)).tokenBalance : 0,
            ethLicenseTokenBalance: licenseeData.ethLicenseAddress !== CONSTANT.ZERO_ADDRESS ? (await this.getFees("Ethereum", licenseeData.ethLicenseAddress, constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract)).tokenBalance : 0,
            visitDomain: `http://${licenseeData.subDomain}.${domaindata}`,
          }, () => {
            this.setIsValidLicenseAddress()
          });
        }
      }

    );
  }

  async getFees(network, vaultAddress, projectContractAddress) {
    let currInstance = null;
    if (network === "BSC") {
      currInstance = this.state.instanceReimbursementBinance;
      let fees = Number(await currInstance.methods.getLicenseeFee(vaultAddress, projectContractAddress).call());
      let tokenBalance = await currInstance.methods.getAvailableTokens(vaultAddress).call();
      return { fees: fees, tokenBalance: web3Js.utils.fromWei(tokenBalance) };
    } else if (network === "Ethereum") {
      currInstance = this.state.instanceReimbursementEthereum;
      let fees = Number(await currInstance.methods.getLicenseeFee(vaultAddress, projectContractAddress).call());
      let tokenBalance = await currInstance.methods.getAvailableTokens(vaultAddress).call();
      return { fees: fees, tokenBalance: web3Js.utils.fromWei(tokenBalance) };
    }
  }

  getData = async (domain) => {
    // this.setState({
    //   isloading: true,
    // });
    try {
      const res = await axios.get(
        `https://wildcard.bswap.info:1830/api/v1/subdomain/getSubDomain/${domain[0]}`
      );
      console.log(res);
      if (res.data.response_code === 200) {
        if (isValidAddress(domain[0])) {
          await web3Config.setLicenseeData(res.data.result)
        } else {
          // const r = document.querySelector(":root");
          // r.style.setProperty("--text-color", res.data.result.primaryColors);
          // r.style.setProperty(
          //   "--button-bg-color",
          //   res.data.result.seconderyColor
          // );
          // r.style.setProperty(
          //   "--req-bg",
          //   `url(${res.data.result.backGroundImage})`
          // );
          // r.style.setProperty("--swap-btn-color", res.data.result.swapButton);
          // this.setState({
          //   cloneData: {
          //     bgimage: res.data.result.backGroundImage,
          //     logoImage: res.data.result.logo,
          //     subDomain: res.data.result.subDomain,
          //     primaryColor: res.data.result.primaryColors,
          //     secondaryColor: res.data.result.seconderyColor,
          //     fontStyle: res.data.result.fontStyle,
          //     backgroundOverLay: res.data.result.backgroundOverLay,
          //     swapButtonColor: res.data.result.swapButton,
          //     logoUrl: res.data.result.logoUrl,
          //     sideBar: res.data.result.sideBar
          //   },
          //   licenseeAddress: {
          //     56: res.data.result.bscLicenseAddress,
          //     1: res.data.result.ethLicenseAddress,
          //     97: res.data.result.bscLicenseAddress,
          //     42: res.data.result.ethLicenseAddress
          //   }
          // });
        }
      } else if (res.data.response_code === 404) {
        // this.setState({
        //   noSubDomain: true,
        // });
        // setTimeout(() => {
        //   this.openPopup("NoDomain");
        // }, 100);
      }
      // this.setState({
      //   isloading: false,
      // });
    } catch (error) {
      console.log(error.response);
      // this.setState({
      //   isloading: false,
      // });
    }
  };

  async swap() {
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
      swapAmount = 0;
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
      (hash) => {
        this.setState({
          swapLoading: true,
          txIdSent: hash,
          txLinkSend: data[networkId].explorer + "/tx/" + hash,
        });
      },
      () => {
        // this.init()
        this.setState({
          swapLoading: false,
          showLedger: true,
          wrapBox: "success",
        });
        notificationConfig.success("Swap Success");
      }
    );
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
      swapAmount = 0;
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
      "350000",
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
  async fetchPrice() {
    var { currencyPrices } = this.state;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin&vs_currencies=usd`
    );
    const json = await response.json();
    currencyPrices["ETH"] = json["ethereum"]["usd"];
    currencyPrices["BNB"] = json["binancecoin"]["usd"];
    currencyPrices["JNTR/e"] = 0.062166;
    currencyPrices["JNTR/b"] = 0.054237;
    currencyPrices["JNTR"] = 0.532;
    this.setState({
      currencyPrices,
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
        if (this.state.sendFundAmount !== "")
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

  async showDepWdrwPopup(network, vaultAddress, popup, id) {
    let { web3Binance, web3Ethereum } = this.state;
    let instanceVault = null;
    if (network === "BSC") {
      instanceVault = new web3Binance.eth.Contract(
        tokenVaultAbi,
        vaultAddress
      );
    } else if (network === "Ethereum") {
      instanceVault = new web3Ethereum.eth.Contract(
        tokenVaultAbi,
        vaultAddress
      );
    }
    let tokenAddress = "";
    if (instanceVault._address !== CONSTANT.ZERO_ADDRESS) {
      tokenAddress = await instanceVault.methods.reimbursementToken().call();
    }
    this.setState({
      depositTokenAddress: tokenAddress,
      depositWithdrawNetwork: network,
      depositWithdrawVaultAddress: vaultAddress
    }, () => {
      this.showWithId(popup, id)
    })
  }

  showWithId(popup, id) {
    this.openPopup(popup);
    $("[data-id=" + this.state.currentTab + "]").removeClass("active");
    $(".tab-Link").removeClass("active");
    $("[data-id=" + id + "]").addClass("active");
    $(".tab-Content").hide();
    $("#" + id).fadeIn("slow");
    this.setState({
      currentTab: id,
    });
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

  updateLicenseAddress(network, address, fees) {
    // console.log(network, address)
    // console.log(network === "BSC")
    let netlicAdd = (network === "BSC" ? "bscLicenseAddress" : "ethLicenseAddress")
    let netlicFees = (network === "BSC" ? "bscLicenseFees" : "ethLicenseFees")
    let netlicFeesCurrent = (network === "BSC" ? "bscLicenseFeesCurrent" : "ethLicenseFeesCurrent")
    this.setState({
      [netlicAdd]: address,
      [netlicFees]: fees,
      [netlicFeesCurrent]: fees
    }, () => {
      this.setIsValidLicenseAddress();
    })
  }

  toggle = (index) => {
    let collapse = "isOpen" + index;
    this.setState((prevState) => ({ [collapse]: !prevState[collapse] }));
  };

  async onNetworkChange(event) {
    console.log(event.target.checked)
    console.log(event.target.name)
    this.setState({
      [event.target.name]: event.target.checked
    }, () => {
      this.setIsValidLicenseAddress();
    })
  }

  async floatOnly(event) {
    if (event.shiftKey === true) event.preventDefault();

    var code = event.keyCode;

    if (
      (code >= 48 && code <= 57) ||
      (code >= 96 && code <= 105) ||
      code === 8 ||
      code === 9 ||
      code === 37 ||
      code === 39 ||
      code === 46 ||
      code === 190 ||
      code === 110
    ) {
      // allowed characters
    } else event.preventDefault();

    if (
      event.target.value.indexOf(".") !== -1 &&
      (code === 190 || code === 110)
    )
      event.preventDefault();
  }

  async handleChange(event) {
    const { value } = event.target;
    this.setState({
      showFeeInpt: value === "option146" ? true : false,
      zeroIntegrationShow: value === "" ? true : false
    }, () => {
      this.setIsValidLicenseAddress()
    })
  };

  handalFormChange = (e) => {
    this.setState({
      subDomain: e.target.value,
    });
    const isvalid = validatesubDomain(e.target.value);
    if (!isvalid) {
      this.setState({
        errormsg: "Please enter valid subdomain",
      });
    } else {
      this.setState({
        errormsg: "",
      });
    }
  };

  changeFontStyle = (e) => {
    this.setState({
      fontStyle: e.target.value,
    });
  };

  toggalColor = (e, colorType, id) => {
    e.stopPropagation();
    document.getElementById(id).checked = true;
    this.setState({
      [colorType]: true,
    });
  };

  handleChangeComplete = (color, node) => {
    this.setState({ [node]: color.hex });
  };

  updateCloneData = (data) => {
    this.setState({
      cloneData: data,
    });
  };

  closeChromePickerPopUp = (e) => {
    e.stopPropagation();
    this.setState({
      showSecondaryColor: false,
      showPrimaryColor: false,
      showSwapButtonColor: false,
    });
  };

  preview = () => {
    const {
      bgimage,
      logoImage,
      logoUrl,
      subDomain,
      primaryColor,
      secondaryColor,
      fontStyle,
      backgroundOverLay,
      swapButtonColor,
      changeText,
      sideBar,
    } = this.state;
    console.log("siedBar", sideBar);
    const isvalid = validatesubDomain(subDomain);
    const isValidLogoUrl = isValidURL(logoUrl);
    if (
      logoImage !== "" &&
      subDomain !== "" &&
      isvalid &&
      isValidLogoUrl
    ) {
      this.setState({
        errormsg: "",
        successmsg: "",
      });
      const r = document.querySelector(":root");
      console.log("document");
      r.style.setProperty("--text-color", primaryColor);
      r.style.setProperty("--button-bg-color", secondaryColor);
      r.style.setProperty("--req-bg", `url(${bgimage})`);
      r.style.setProperty("--swap-btn-color", swapButtonColor);
      console.log("CloneForm");
      this.props.history.push({
        pathname: "/",
        state: {
          cloneData: {
            bgimage,
            logoImage,
            logoUrl,
            subDomain,
            primaryColor,
            secondaryColor,
            fontStyle,
            backgroundOverLay,
            isPreview: true,
            swapButtonColor,
            changeText,
            sideBar,
          },
        },
      });
      this.updateCloneData({
        bgimage,
        logoImage,
        subDomain,
        logoUrl,
        primaryColor,
        secondaryColor,
        fontStyle,
        backgroundOverLay,
        changeText,
        swapButtonColor,
        sideBar,
      });
    } else if (!isvalid) {
      this.setState({
        errormsg: "Please enter valid subdomain",
      });
    } else if (!isValidLogoUrl) {
      this.setState({
        errormsg: "Please enter valid Url for behind your logo",
      });
    } else if (logoImage === "") {
      this.setState({
        errormsg: "Please add logo",
      });
    } else {
      this.setState({
        errormsg: "All fields are mandatory",
      });
    }
  };

  Main = async () => {
    const file = document.querySelector("#contained-button-file").files[0];
    const image = await toBase64(file);
    this.setState({
      bgimage: image,
    });
  };

  changeLogo = async () => {
    const file = document.querySelector("#contained-button-file-logo").files[0];
    const image = await toBase64(file);
    this.setState({
      logoImage: image,
    });
  };
  changeurl = (e) => {
    const link = e.target.value;
    this.setState({
      logoUrl: link,
    });
  };

  changeOverlay = (e) => {
    this.setState({
      backgroundOverLay: e.target.value,
    });
  };

  async setIsValidLicenseAddress() {
    let { showFeeInpt, bsc, ethereum, bscLicenseAddress, ethLicenseAddress } = this.state;
    let isValidLicenseAddress = false;
    if (showFeeInpt) {
      if (bsc || ethereum) {
        if (bsc && bscLicenseAddress !== CONSTANT.ZERO_ADDRESS) {
          isValidLicenseAddress = true;
        } else {
          isValidLicenseAddress = false;
        }
        if (ethereum && ethLicenseAddress !== CONSTANT.ZERO_ADDRESS) {
          if (bsc && bscLicenseAddress !== CONSTANT.ZERO_ADDRESS) {
            isValidLicenseAddress = true;
          } else {
            if (ethereum && ethLicenseAddress !== CONSTANT.ZERO_ADDRESS && !bsc)
              isValidLicenseAddress = true;
            else
              isValidLicenseAddress = false;
          }
        } else {
          if (bsc && bscLicenseAddress !== CONSTANT.ZERO_ADDRESS && !ethereum) {
            isValidLicenseAddress = true;
          } else {
            isValidLicenseAddress = false;
          }
        }
      } else {
        if (!bsc && !ethereum)
          isValidLicenseAddress = false;
        else
          isValidLicenseAddress = true;
      }
      // isValidLicenseAddress = ((bscLicenseAddress !== CONSTANT.ZERO_ADDRESS) || (ethLicenseAddress !== CONSTANT.ZERO_ADDRESS));
    } else {
      isValidLicenseAddress = true;
    }
    this.setState({
      allowClone: isValidLicenseAddress
    }, () => {
      this.forceUpdate()
    })
  }

  uploadData = async () => {
    const {
      bgimage,
      logoImage,
      logoUrl,
      subDomain,
      primaryColor,
      secondaryColor,
      fontStyle,
      backgroundOverLay,
      swapButtonColor,
      sideBar,
      bscLicenseAddress,
      ethLicenseAddress,
      allowClone
    } = this.state;
    const isvalid = validatesubDomain(subDomain);
    const isValidLogoUrl = logoUrl !== undefined ? isValidURL(logoUrl) : false;
    if (
      logoImage !== "" &&
      subDomain !== "" &&
      isvalid &&
      isValidLogoUrl &&
      allowClone
    ) {
      this.setState({
        errormsg: "",
        successmsg: "",
        isloading: true,
      });
      try {
        const res = await axios.post(
          "https://wildcard.bswap.info:1830/api/v1/subdomain/addSubDomain",
          {
            licenseeAddress: web3Config.getAddress(),
            bscLicenseAddress: bscLicenseAddress,
            ethLicenseAddress: ethLicenseAddress,
            backGroundImage: bgimage,
            primaryColors: primaryColor,
            seconderyColor: secondaryColor,
            subDomain: subDomain,
            logo: logoImage,
            logoUrl: logoUrl,
            fontStyle,
            backgroundOverLay,
            swapButton: swapButtonColor,
            sideBar,
          }
        );
        console.log(res);

        if (res.data.response_code === 200) {
          this.setState({
            successmsg: res.data.response_message,
          });
          const href = window.location.href;
          const domaindata = href
            .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
            .split("/")[0];
          this.clearPreview();
          this.setState({
            isloading: false,
            visitDomain: `http://${subDomain}.${domaindata}`,
          });
        } else if (res.data.response_code === 409) {
          this.setState({
            errormsg: res.data.response_message,
            isloading: false,
          });
        } else {
          notificationConfig.error("")
          this.setState({
            errormsg: "Something went wrong please try again later",
            isloading: false,
          });
        }
      } catch (error) {
        console.log(error);
        this.setState({
          isloading: false,
        });
      }
    } else if (!isvalid) {
      this.setState({
        errormsg: "Please enter valid subdomain",
      });
      notificationConfig.error("Please enter valid subdomain")
    } else if (!isValidLogoUrl) {
      this.setState({
        errormsg: "Please enter valid Url for behind your logo",
      });
      notificationConfig.error("Please enter valid Url for behind your logo")
    } else if (logoImage === "") {
      this.setState({
        errormsg: "Please add logo",
      });
      notificationConfig.error("Please add logo")
    } else if (!allowClone) {
      this.setState({
        errormsg: "Please create license contract",
      });
      notificationConfig.error("Please create license contract")
    } else {
      this.setState({
        errormsg: "All fields are mandatory",
      });
      notificationConfig.error("All fields are mandatory")
    }
  };

  clearPreview = () => {
    const r = document.querySelector(":root");
    r.style.removeProperty("--text-color");
    r.style.removeProperty("--button-bg-color");
    r.style.removeProperty("--req-bg");
    this.updateCloneData({
      cloneData: {},
    });
    this.props.history.push({
      pathname: "",
      state: {
        cloneData: {},
      },
    });
  };
  changeTypeofLicense = (e) => {
    this.setState({
      typeofLicense: e.target.value,
    });
  };
  _onChangeRadio(e) {
    const name = e.target.name;
    this.setState({
      [name]: e.target.value,
    });
    if (name === "changeText" && e.target.value === "No") {
      this.setState({
        primaryColor: "#ffffff",
        secondaryColor: "#5c6bc0",
        swapButtonColor: "#91dc27",
      });
    }
  }

  async setLicenseeFee(network, reimbursementAddress, vaultAddress, newFees) {

    await web3Config.connectWallet(0);
    let newNetworkId = web3Config.getNetworkId()

    if (!constantConfig.allowedNetwork.includes(newNetworkId)) {
      notificationConfig.error("Please Select Ethereum or BSC Main Network");
      return;
    }
    if (
      network === "Ethereum" &&
      (newNetworkId === 97 || newNetworkId === 56)
    ) {
      notificationConfig.warning("Change metamask network to Ethereum!");
      return;
    } else if (
      network === "BSC" &&
      (newNetworkId === 42 || newNetworkId === 1)
    ) {
      notificationConfig.warning("Change metamask network to Binance!");
      return;
    }

    // this.setState({ creatingLicense: true })
    console.log(reimbursementAddress, vaultAddress, newFees)

    let web3 = web3Config.getWeb3();
    let networkId = web3Config.getNetworkId();
    let address = web3Config.getAddress();

    let reimbursementContract = new ReimbursementContract(web3, networkId);

    let setLicenseeFeeData = {};

    setLicenseeFeeData["reimbursementAddress"] = reimbursementAddress;
    setLicenseeFeeData["vault"] = vaultAddress;
    setLicenseeFeeData["projectContract"] = constantConfig[networkId].swapFactoryContract;
    setLicenseeFeeData["fee"] = Number(newFees);

    reimbursementContract.setLicenseeFee(
      setLicenseeFeeData,
      (hash) => {
        this.setState({
          // swapLoading: true,
          // txIdSent: hash,
          // txLinkSend: data[networkId].explorer + '/tx/' + hash,
        });
      },
      async (receipt) => {
        // this.setState({ crtLicSuccess: true, creatingLicense: false })
        // this.props.updateLicenseAddress(this.props.network, await reimbursementContract.getVaultAddress(receipt), licenseeFees)
        notificationConfig.success('Fees Updated Successfully!');
      },
      async (error) => {
        // this.setState({ creatingLicense: false })
        if (error.code === 4001) {
          notificationConfig.error("Transaction rejected!")
        }
      }
    );

  }

  render() {
    const {
      bgimage,
      logoImage,
      logoUrl,
      subDomain,
      primaryColor,
      showPrimaryColor,
      showSecondaryColor,
      secondaryColor,
      errormsg,
      successmsg,
      fontStyle,
      isloading,
      visitDomain,
      typeofLicense,
      changeFee,
      displayToken,
      changeText,
      swapButtonColor,
      showSwapButtonColor,
      sideBar,
      bsc,
      ethereum,
      bscLicenseAddress,
      ethLicenseAddress,
      bscLicenseTokenBalance,
      ethLicenseTokenBalance,
      allowClone
    } = this.state;
    return (
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
            web3Config={web3Config}
            cloneData={this.state.cloneData}
          ></RightSideMenu>
          {/* <!--======================= RIGHT SIDE MENU END  =====================-->
                    <!--======================= HEADER START =====================--> */}
          <Header
            web3={this.state.web3}
            web3Config={web3Config}
            cloneData={this.state.cloneData}
          ></Header>
          {/* <!--======================= HEADER END =====================--> */}
          <div className="mainBlock">
            {/* <!--======================= SWAP BLOCK START =====================--> */}

            <Link to="/" class="close-Icon" style={{ zIndex: '1000', top: '70px', right: '35px' }}></Link>
            <div className="swap-Block">
              <div className="container-Grid">
                <div className="smeTitle01-v2"> {/*   onClick={() => { this.openPopup("WithdrawToken"); }} */}
                  Get Your Own License For FREE
                </div>
              </div>
              <div className="swap-textBox">
                <div className="container-Grid">
                  <div className="gwFormMbox">
                    <div className="gwFormLMbox">
                      <div className="gwFormSTitle01">
                        <span>1</span> Set up your fees and reimbursement
                      </div>

                      <div className="gwFormSbox01">
                        <div className="gwFormTitle01" >Do you want to charge your users a fee above our fee?</div>
                        <div className="gwFormSFormbox02">
                          <div className="md-radio md-radio-inline gwFroWidthFix01">
                            <input type="radio" id="rr01" checked={this.state.showFeeInpt ? true : false} name="stepin46" value="option146" onChange={this.handleChange.bind(this)} />
                            <label htmlFor="rr01">Yes </label>
                          </div>
                          <div className="md-radio md-radio-inline gwFroWidthFix01">
                            <input type="radio" id="rr02" checked={this.state.showFeeInpt ? false : true} name="stepin46" value="option145" onChange={this.handleChange.bind(this)} />
                            <label htmlFor="rr02">No</label>
                          </div>
                        </div>
                      </div>

                      {this.state.showFeeInpt ?
                        <div>
                          <div className="gwFormSbox01">
                            <div className="gwFormTitle01" >Choose blockchain  <i className="help-circle"> <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="You can only charge fees and reimbursement users with your tokens on blockchains that your token is deploy on. If your token is for example on one chain like Ethereum users from other chains like BSC can use your license but they will not be charged with fees or reimbursement for it" aria-hidden="true"></i> </i>
                            </div>
                            <div className="gwFormSCheckbx01">
                              <div className="md-checkbox">
                                <input type="checkbox" id="rr04" name="bsc" onChange={(e) => this.onNetworkChange(e)} />
                                <label htmlFor="rr04">BSC </label>
                              </div>
                              <div className="md-checkbox">
                                <input type="checkbox" id="rr03" name="ethereum" onChange={(e) => this.onNetworkChange(e)} />
                                <label htmlFor="rr03">Ethereum </label>
                              </div>
                              <div className="md-checkbox">
                                <input type="checkbox" id="rr05" name="polygon" onChange={(e) => this.onNetworkChange(e)} disabled />
                                <label htmlFor="rr05">Polygon </label>
                              </div>
                            </div>
                          </div>

                          {this.state.bsc ?
                            <CreateLicence reimbursementAddress={constantConfig[CONSTANT.NETWORK_ID.BINANCE].reimbursementContract} network="BSC" currency="BNB" connectWallet={() => { this.connectWallet() }} web3={this.state.web3} updateLicenseAddress={this.updateLicenseAddress.bind(this)} web3Binance={this.state.web3Binance}></CreateLicence>
                            : null}
                          {this.state.ethereum ?
                            <CreateLicence reimbursementAddress={constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].reimbursementContract} network="Ethereum" currency="ETH" connectWallet={() => { this.connectWallet() }} web3={this.state.web3} updateLicenseAddress={this.updateLicenseAddress.bind(this)} web3Ethereum={this.state.web3Ethereum}></CreateLicence>
                            : null}
                          {this.state.polygon ?
                            <CreateLicence network="Polygon" currency="MATIC"></CreateLicence>
                            : null}

                        </div>
                        : null}

                      {/* <div className="gwFormBRBox01">
                        <div className="gwFormBRTitle01">
                          <span>Ethereum</span>
                        </div>
                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Add your native token smart contract on Ethereum
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>TOKEN</span>
                          </div>
                        </div>
                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Add a pool contract between your TOKEN to ETH
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>TOKEN</span>
                          </div>
                        </div>

                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            How many days users need to stake to get 100%
                            reimbursement?
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>DAYS</span>
                          </div>
                        </div>

                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Choose the token ratio users will need to stake
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>: 1</span>
                          </div>
                        </div>

                        <button className="gwFormBTN02">
                          Connect your Ethereum wallet to create a license on
                          Ethereum{" "}
                        </button>
                      </div>

                      <div className="gwFormBRBox01">
                        <div className="gwFormBRTitle01">
                          <span>BSC</span>
                        </div>
                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Add your native token smart contract on BSC
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>TOKEN</span>
                          </div>
                        </div>
                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Add a pool contract between your TOKEN to BNB
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>TOKEN</span>
                          </div>
                        </div>

                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            How many days users need to stake to get 100%
                            reimbursement?
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>DAYS</span>
                          </div>
                        </div>

                        <div className="gwFormSbox01">
                          <div className="gwFormTitle01">
                            Choose the token ratio users will need to stake
                            <i className="help-circle">
                              {" "}
                              <i
                                className="fas fa-question-circle protip"
                                data-pt-position="top"
                                data-pt-title="Help Text"
                                aria-hidden="true"
                              ></i>{" "}
                            </i>
                          </div>
                          <div className="gwFormSFormbox01">
                            <input type="text" /> <span>: 1</span>
                          </div>
                        </div>

                        <button className="gwFormBTN02 greenC">
                          <i className="fas fa-check"></i> BSC license been
                          created successfully
                        </button>
                      </div> */}

                    </div>


                    <div className="gwFormRMbox">
                      <div className="gwFormSTitle01">
                        <span>2</span>Set up your design{" "}
                      </div>
                      <div className="gwFormSbox01">
                        <div className="gwFormTitle01">
                          Choose the type of integration{" "}
                        </div>
                        <div className="gwFormSFormbox02">
                          <div className="md-radio md-radio-inline gwFroWidthFix01">
                            <input
                              type="radio"
                              id="radio145"
                              name="typeofLicense"
                              checked={this.state.typeofLicense === "Zero integration" ? true : false}
                              value="Zero integration"
                              defaultChecked
                              onChange={this._onChangeRadio}
                            />
                            <label htmlFor="radio145">
                              Zero integration
                              <i className="help-circle">
                                <i
                                  className="fas fa-question-circle protip"
                                  data-pt-position="top"
                                  data-pt-title="This option allow licensees to create an instant license under one minute, with no coding knowledge needed or any server costs."
                                  aria-hidden="true"
                                ></i>
                              </i>
                            </label>
                          </div>
                          <div className="md-radio md-radio-inline gwFroWidthFix01">
                            <input
                              type="radio"
                              id="radio146"
                              name="typeofLicense"
                              checked={this.state.typeofLicense === "Smart contract integration" ? true : false}
                              value="Smart contract integration"
                              onChange={this._onChangeRadio}
                            // onClick={() => { notificationConfig.info("Coming Soon!") }}
                            // disabled
                            />
                            <label htmlFor="radio146">
                              Smart contract integration
                              <i className="help-circle">
                                <i
                                  className="fas fa-question-circle protip"
                                  data-pt-position="top"
                                  data-pt-title="This option allow licensees to designed their own UI and do direct integration with the smart contract code. "
                                  aria-hidden="true"
                                ></i>
                              </i>
                            </label>
                          </div>
                        </div>
                      </div>
                      {typeofLicense === "Zero integration" && (
                        <>

                          <div className="gwFormSbox01">
                            {/* <div className="gwFormTitle01">
                              Do you want to display your native token first during
                              the lauding?
                              <i className="help-circle">
                                <i
                                  className="fas fa-question-circle protip"
                                  data-pt-position="top"
                                  data-pt-title="Help Text"
                                  aria-hidden="true"
                                ></i>
                              </i>
                            </div>
                            <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline gwFroWidthFix01">
                                <input
                                  type="radio"
                                  id="rr200"
                                  defaultChecked
                                  name="stepin101"
                                  value="1"
                                />
                                <label htmlFor="rr200">Yes</label>
                              </div>
                              <div className="md-radio md-radio-inline gwFroWidthFix01">
                                <input
                                  type="radio"
                                  id="rr201"
                                  name="stepin101"
                                  value="option145"
                                />
                                <label htmlFor="rr201">No</label>
                              </div>
                            </div> */}
                            {/* <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline gwFroWidthFix01">
                                <input
                                  type="radio"
                                  id="rr202"
                                  name="displayToken"
                                  value="Display all tokens"
                                  onChange={this._onChangeRadio}
                                />
                                <label htmlFor="rr202">
                                  Display all tokens
                                  <i className="help-circle">
                                    <i
                                      className="fas fa-question-circle protip"
                                      data-pt-position="top"
                                      data-pt-title="Help Text"
                                      aria-hidden="true"
                                    ></i>
                                  </i>
                                </label>
                              </div>
                              <div className="md-radio md-radio-inline gwFroWidthFix01">
                                <input
                                  type="radio"
                                  id="rr203"
                                  name="displayToken"
                                  value="Display token lists"
                                  onChange={this._onChangeRadio}
                                  defaultChecked
                                />
                                <label htmlFor="rr203">
                                  Display token lists
                                  <i className="help-circle">
                                    <i
                                      className="fas fa-question-circle protip"
                                      data-pt-position="top"
                                      data-pt-title="Help Text"
                                      aria-hidden="true"
                                    ></i>
                                  </i>
                                </label>
                              </div>
                            </div> */}
                          </div>
                          {/* {displayToken === "Display token lists" && (
                            <div className="gwFormSbox01">
                              <div class="gwFormSFormbox01">
                                <input
                                  type="text"
                                  style={{ width: "100%" }}
                                  placeholder="https:// or ipfs:// or ENS name"
                                  defaultValue=""
                                />
                              </div>
                            </div>
                          )} */}

                          <div className="gwFormSbox01 ">
                            <div className="gwFormTitle01">
                              Choose your subdomain name
                              <i className="help-circle">
                                <i
                                  className="fas fa-question-circle protip"
                                  data-pt-position="top"
                                  data-pt-title="After you choose your subdomain, you can create a redirect with a mask to it, from your own main domain. so your users will not even know about that subdomain and it will look and fell like it yours"
                                  aria-hidden="true"
                                ></i>
                              </i>{" "}
                            </div>
                            <div className="gwFormSFormbox01 v2 smFixer03">
                              <input
                                type="text"
                                value={subDomain}
                                onChange={this.handalFormChange}
                              />{" "}
                              <span>.smartswap.exchange </span>
                            </div>
                          </div>


                          <div className="gwFormSbox01 NpDisplyFix01 ">
                            <div className="gwFormSubBox01 smFixer04">
                              Add logo
                              <div className="SSMainInputBX ">
                                <input
                                  placeholder="Choose file"
                                  disabled="disabled"
                                  className="ssInputtype01"
                                />
                                <label className="custom-file-input">
                                  <input
                                    type="file"
                                    id="contained-button-file-logo"
                                    onChange={this.changeLogo.bind(this)}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="gwFormSubBox01 smFixer04">
                              Add a URL link behind your logo
                              <div className="SSMainInputBX">
                                <input
                                  id="urlLink"
                                  placeholder="http:///www.yourwebsite.com"
                                  style={{ width: "100%", color: "white" }}
                                  className="ssInputtype01"
                                  value={logoUrl}
                                  onChange={this.changeurl}
                                />
                              </div>
                            </div>
                          </div>
                          {logoImage !== "" && (
                            <div className="gwFormSbox01 NpDisplyFix01 ">
                              <img src={logoImage} alt="" width="200" />
                            </div>
                          )}

                          <div className="gwFormSbox01 NpDisplyFix01 smFixer04">
                            <div className="gwFormSubBox01">
                              Add new background
                              <div className="SSMainInputBX">
                                <input
                                  placeholder="Choose file"
                                  disabled="disabled"
                                  className="ssInputtype01"
                                />
                                <label className="custom-file-input">
                                  <input
                                    type="file"
                                    onChange={this.Main.bind(this)}
                                    id="contained-button-file"
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="gwFormSubBox01">
                              Background dark layer
                              <div className="dragorInput">
                                <div className="bg-slider">
                                  <input
                                    type="range"
                                    min="1"
                                    max="99"
                                    value={this.state.backgroundOverLay}
                                    class="overlay-slider"
                                    id="myRange"
                                    onChange={this.changeOverlay}
                                    title="title"
                                  />

                                  <span className="bar"></span>

                                  <span
                                    className="progress"
                                    style={{
                                      width: `calc(${this.state.backgroundOverLay}% )`,
                                    }}
                                  ></span>
                                  <span className="text">0%</span>
                                  <span className="text right">100%</span>
                                  <span
                                    className="percent"
                                    style={{
                                      left: `calc(${this.state.backgroundOverLay
                                        }% - ${this.state.backgroundOverLay / 3 - 23
                                        }px)`,
                                      borderRadius: "0",
                                      border: "0",
                                      boxShadow: "none",
                                    }}
                                  >
                                    {this.state.backgroundOverLay}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {bgimage !== "" && (
                            <div className="gwFormSbox01 NpDisplyFix01 ">
                              <img src={bgimage} alt="" width="200" />
                            </div>
                          )}

                          <div className="gwFormSbox01 smFixer04">
                            <div className="gwFormTitle01" style={{ margin: '20px 0 0 0' }}>
                              Keep SmartSwap side bar
                            </div>
                            <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio21"
                                  name="sideBar"
                                  value="true"
                                  defaultChecked
                                  onClick={this._onChangeRadio}
                                />
                                <label htmlFor="radio21">Yes</label>
                              </div>
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio22"
                                  name="sideBar"
                                  value="false"
                                  defaultChecked={
                                    this.state.sideBar === "false"
                                  }
                                  onClick={this._onChangeRadio}
                                />
                                <label htmlFor="radio22">No </label>
                              </div>
                            </div>
                            <div className="gwFormTitle01" style={{ margin: '20px 0 0 0' }}>
                              Change button and text
                            </div>
                            <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio11"
                                  name="changeText"
                                  value="Yes"
                                  defaultChecked
                                  onClick={this._onChangeRadio}
                                />
                                <label htmlFor="radio11">Yes</label>
                              </div>
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio12"
                                  name="changeText"
                                  value="No"
                                  defaultChecked={
                                    this.state.changeText === "No"
                                  }
                                  onClick={this._onChangeRadio}
                                />
                                <label htmlFor="radio12">No </label>
                              </div>
                            </div>

                            {/* <div className="gwFormTitle01" style={{ margin: '20px 0 0 0' }}>
                              Keep button "BECOME A SWAP PROVIDER"
                            </div>

                            <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio13"
                                  name="aaaa"
                                  value="Yes"
                                  defaultChecked
                                />
                                <label htmlFor="radio13">Yes</label>
                              </div>
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio14"
                                  name="aaaa"
                                  value="No"
                                />
                                <label htmlFor="radio14">No </label>
                              </div>
                            </div>

                            <div className="gwFormTitle01" style={{ margin: '20px 0 0 0' }}>
                              Keep button "GET YOUR OWN FREE LICENSE"
                            </div>

                            <div className="gwFormSFormbox02">
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio15"
                                  name="bbb"
                                  value="Yes"
                                  defaultChecked
                                />
                                <label htmlFor="radio15">Yes</label>
                              </div>
                              <div className="md-radio md-radio-inline ">
                                <input
                                  type="radio"
                                  id="radio16"
                                  name="bbb"
                                  value="No"
                                />
                                <label htmlFor="radio16">No </label>
                              </div>
                            </div> */}
                          </div>
                          {changeText === "Yes" && (
                            <>
                              <div className="gwFormSbox01">
                                <div className="gwFormTitle01">
                                  Select font style
                                </div>
                                <select
                                  name="fontStyle"
                                  id="fontStyle"
                                  className="subdomain"
                                  value={fontStyle}
                                  onChange={this.changeFontStyle}
                                  style={{
                                    padding: "20px 15px",
                                    width: "100%",
                                    backgroundColor: "#271e3a",
                                    color: "#fff",
                                    border: 0,
                                  }}
                                >
                                  <option value="Default">Default</option>
                                  <option value="Montserrat">Montserrat</option>
                                  <option value="Nunito">Nunito</option>
                                  <option value="Poppins">Poppins</option>
                                  <option value="Roboto">Roboto</option>
                                </select>
                                {/* <div className="LiproDropdown">
                                  <button
                                    className="LiproDDbtn01"
                                    onClick={() => this.toggle(1)}
                                  >
                                    <div className="ddIconBX">Default</div>
                                    <i className="fas fa-caret-down"></i>
                                  </button>
                                  <div className="ddContainer">
                                    <Collapse
                                      isOpen={this.state.isOpen1}
                                      className={"collapse-css-transition"}
                                    >
                                      <button className="LiproDDbtn01">
                                        <div className="ddIconBX">Font 01</div>
                                      </button>
                                      <button className="LiproDDbtn01">
                                        <div className="ddIconBX">Font 02</div>
                                      </button>
                                    </Collapse>
                                    
                                  </div>
                                </div> */}
                              </div>

                              <div className="colorPlateMBox npFixer05">
                                <div className="colorPlateTitle01">
                                  Text color
                                </div>
                                <div className="colorPlateSBox01">
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="s01"
                                      name="s11"
                                      value="s10"
                                      defaultChecked
                                      onClick={() =>
                                        this.setState({ primaryColor: "#fff" })
                                      }
                                    />
                                    <label htmlFor="s01"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={() => {
                                      document.getElementById(
                                        "s01"
                                      ).checked = true;
                                      this.setState({ primaryColor: "#fff" });
                                    }}
                                  >
                                    Current color{" "}
                                    <div
                                      className="ColorBX"
                                      style={{ backgroundColor: "#fff" }}
                                    ></div>
                                  </div>
                                  <div className="chevrBox">
                                    <i className="fas fa-chevron-right"></i>
                                  </div>
                                </div>
                                <div
                                  className="colorPlateSBox02"
                                  style={{ position: "relative" }}
                                >
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="s02"
                                      name="s11"
                                      value="s11"
                                      defaultChecked={primaryColor !== "#fff"}
                                    />
                                    <label htmlFor="s02"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={(e) => {
                                      this.toggalColor(
                                        e,
                                        "showPrimaryColor",
                                        "s02"
                                      );
                                    }}
                                  >
                                    New color
                                    <span className="colorPlaterSbx">
                                      <div
                                        className="ColorBX"
                                        style={{ background: primaryColor }}
                                      ></div>
                                      <button>
                                        {" "}
                                        <i class="fas fa-sort-down"></i>{" "}
                                      </button>
                                    </span>
                                  </div>
                                  {showPrimaryColor && (
                                    <>
                                      <div
                                        className="overPicker"
                                        onClick={this.closeChromePickerPopUp.bind(
                                          this
                                        )}
                                      ></div>
                                      <div className="color-picker">
                                        <ChromePicker
                                          color={primaryColor}
                                          onChangeComplete={(color) => {
                                            this.handleChangeComplete(
                                              color,
                                              "primaryColor"
                                            );
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="colorPlateMBox npFixer05">
                                <div className="colorPlateTitle01">
                                  Connect your wallet button
                                </div>
                                <div className="colorPlateSBox01">
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="s03"
                                      name="s12"
                                      value="s12"
                                      defaultChecked
                                      onClick={() =>
                                        this.setState({
                                          secondaryColor: "#5c6bc0",
                                        })
                                      }
                                    />
                                    <label htmlFor="s03"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={() => {
                                      document.getElementById(
                                        "s03"
                                      ).checked = true;
                                      this.setState({
                                        secondaryColor: "#5c6bc0",
                                      });
                                    }}
                                  >
                                    Current color{" "}
                                    <div
                                      className="ColorBX"
                                      style={{ backgroundColor: "#5c6bc0" }}
                                    ></div>
                                  </div>
                                  <div className="chevrBox">
                                    <i className="fas fa-chevron-right"></i>
                                  </div>
                                </div>
                                <div
                                  className="colorPlateSBox02"
                                  style={{ position: "relative" }}
                                >
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="s04"
                                      name="s12"
                                      value="s12"
                                      defaultChecked={
                                        secondaryColor !== "#5c6bc0"
                                      }
                                    />
                                    <label htmlFor="s04"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={(e) => {
                                      this.toggalColor(
                                        e,
                                        "showSecondaryColor",
                                        "s04"
                                      );
                                    }}
                                  >
                                    New color
                                    <span className="colorPlaterSbx">
                                      <div
                                        className="ColorBX"
                                        style={{ background: secondaryColor }}
                                      ></div>
                                      <button>
                                        {" "}
                                        <i class="fas fa-sort-down"></i>{" "}
                                      </button>
                                    </span>
                                  </div>
                                  {showSecondaryColor && (
                                    <>
                                      <div
                                        className="overPicker"
                                        onClick={this.closeChromePickerPopUp.bind(
                                          this
                                        )}
                                      ></div>
                                      <div className="color-picker">
                                        <ChromePicker
                                          color={secondaryColor}
                                          onChangeComplete={(color) => {
                                            this.handleChangeComplete(
                                              color,
                                              "secondaryColor"
                                            );
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="colorPlateMBox npFixer05">
                                <div className="colorPlateTitle01">
                                  Swap button
                                </div>
                                <div className="colorPlateSBox01">
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="swap"
                                      name="swapButtonColor"
                                      value="s12"
                                      defaultChecked
                                      onClick={() =>
                                        this.setState({
                                          swapButtonColor: "#91dc27",
                                        })
                                      }
                                    />
                                    <label htmlFor="swap"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={() => {
                                      document.getElementById(
                                        "swap"
                                      ).checked = true;
                                      this.setState({
                                        swapButtonColor: "#91dc27",
                                      });
                                    }}
                                  >
                                    Current color{" "}
                                    <div
                                      className="ColorBX"
                                      style={{ backgroundColor: "#91dc27" }}
                                    ></div>
                                  </div>
                                  <div className="chevrBox">
                                    <i className="fas fa-chevron-right"></i>
                                  </div>
                                </div>
                                <div
                                  className="colorPlateSBox02"
                                  style={{ position: "relative" }}
                                >
                                  <div className="md-radio md-radio-inline ">
                                    <input
                                      type="radio"
                                      id="swap1"
                                      name="swapButtonColor"
                                      value="s12"
                                      defaultChecked={
                                        swapButtonColor !== "#91dc27"
                                      }
                                    />
                                    <label htmlFor="swap1"></label>
                                  </div>
                                  <div
                                    className="colorPlater"
                                    onClick={(e) => {
                                      this.toggalColor(
                                        e,
                                        "showSwapButtonColor",
                                        "swap1"
                                      );
                                    }}
                                  >
                                    New color
                                    <span className="colorPlaterSbx">
                                      <div
                                        className="ColorBX"
                                        style={{ background: swapButtonColor }}
                                      ></div>
                                      <button>
                                        {" "}
                                        <i class="fas fa-sort-down"></i>{" "}
                                      </button>
                                    </span>
                                  </div>
                                  {showSwapButtonColor && (
                                    <>
                                      <div
                                        className="overPicker"
                                        onClick={this.closeChromePickerPopUp.bind(
                                          this
                                        )}
                                      ></div>
                                      <div className="color-picker">
                                        <ChromePicker
                                          color={swapButtonColor}
                                          onChangeComplete={(color) => {
                                            this.handleChangeComplete(
                                              color,
                                              "swapButtonColor"
                                            );
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                          {errormsg !== "" && (
                            <p style={{ color: "red" }}>{errormsg}</p>
                          )}
                          {successmsg !== "" && (
                            <p style={{ color: "#92db28" }}>{successmsg}</p>
                          )}

                          <div className="colorPlateMBox">
                            <div className="colorPlateTitle01">
                              <button
                                disabled={isloading}
                                onClick={this.preview}
                              >
                                Preview
                              </button>
                              {visitDomain !== "" && (
                                <button
                                  className=""
                                  style={{ marginLeft: 25 }}
                                  onClick={() => {
                                    window.open(visitDomain, "_blank");
                                  }}
                                >
                                  Go to Page
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {typeofLicense === "Smart contract integration" && (
                        <div id="contract-integration">
                          {/* <div className="gwFormTitle01">swapMulti </div>
                          <div className="swapMulti">
                            <Highlight language="javascript">
                              {` function swapMulti (                          
 IERC20[] memory tokens,
 uint256 amounts,
 uint256 minReturn,
 uint256[] memory distribution,
 uint256[] memory flags,
 ) public payable returns (uint256)`}
                            </Highlight>
                          </div>

                          <p className="swapMultiP">
                            Swap <span style={{ color: "white" }}>amount</span>{" "}
                            first element of{" "}
                            <span style={{ color: "white" }}>tokens</span> of
                            the latest element.<br></br>
                            The length of{" "}
                            <span style={{ color: "white" }}>flags</span> array
                            should be 1 element less than tokens array length.
                            Each element from{" "}
                            <span style={{ color: "white" }}>flags</span> array
                            corresponds to 2 neighboring elements from{" "}
                            <span style={{ color: "white" }}>tokens</span>{" "}
                            array.
                          </p>
                          <table className="swapMultiTable">
                            <tr style={{ color: "white" }}>
                              <td className="lefttd">Params</td>
                              <td>Type</td>
                              <td>Description </td>
                            </tr>
                            <tr>
                              <td className="lefttd">token</td>
                              <td>IERC20[]</td>
                              <td>
                                Addresses of tokens or{" "}
                                <span style={{ color: "white" }}>
                                  address(0)
                                </span>{" "}
                                for Ether
                              </td>
                            </tr>
                            <tr>
                              <td className="lefttd">amount</td>
                              <td>uint256</td>
                              <td>Amount of tokens</td>
                            </tr>
                            <tr>
                              <td className="lefttd">minReturn</td>
                              <td>uint256</td>
                              <td>
                                Minimum expected return,else revert transaction
                              </td>
                            </tr>
                            <tr>
                              <td className="lefttd">distribution</td>
                              <td>uint256[]</td>
                              <td style={{ lineHeight: "1.8" }}>
                                Array of weights for volume distribution
                                (returned by{" "}
                                <span style={{ color: "white" }}>
                                  getRespectReturn)
                                </span>
                              </td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #271e3a" }}>
                              <td className="lefttd">flags</td>
                              <td>uint256[]</td>
                              <td style={{ lineHeight: "1.8" }}>
                                The sequence of flags for enabling and disabling
                                some features (default:{" "}
                                <span style={{ color: "white" }}>0</span>), see
                                flags Description
                              </td>
                            </tr>
                          </table> */}
                        </div>
                      )}
                    </div>
                  </div>



                  <div className="gwFormSFormbox03">
                    {/* <button
                      className="gwFormBTN01 greenBack"
                      disabled={
                        isloading || typeofLicense !== "Zero integration"
                      }
                      onClick={this.uploadData}
                    >
                      {isloading
                        ? "Cloning.."
                        : "GET YOUR OWN LICENSE FOR FREE"}
                    </button> */}

                    {this.state.web3 !== null ?
                      <button
                        className={allowClone ? "gwFormBTN01 greenBack" : "gwFormBTN01 greenBack disable-btn"}
                        disabled={
                          isloading || typeofLicense !== "Zero integration" || !allowClone
                        }
                        onClick={this.uploadData}
                      >
                        {isloading
                          ? "Cloning.."
                          : "GET YOUR OWN LICENSE FOR FREE"}
                      </button>
                      :
                      <button
                        className="gwFormBTN01"
                        disabled={
                          isloading
                        }
                        onClick={() => { this.connectWallet() }}
                      >
                        Connect your wallet
                      </button>
                    }
                  </div>

                  {/*     First Popup Part */}
                  {(visitDomain && typeofLicense === "Zero integration") ? (
                    <>
                      <div className="spacerLine02"></div>
                      <div className="smeTitle01-v3">
                        Below is Your License URL and Smart Contract
                      </div>

                      <div className="LicMbx">
                        Your licensee sub domain
                        <div className="LicInputBX01">
                          <input type="text" value={visitDomain} id="license" />
                          <a
                            href="#"
                            className="LicCopyBTN"
                            onClick={(a) => copyAffiliateLink(a, "license")}
                          >
                            <i class="fas fa-copy"></i>
                          </a>
                        </div>
                      </div>
                      <div className="gwFormBRBox01">
                        {ethLicenseAddress !== "0x0000000000000000000000000000000000000000" ?
                          <div className="LicMbx">
                            Your licensee smart contract for Ethereum
                            <div className="LicInputBX01">
                              <input
                                type="text"
                                value={ethLicenseAddress}
                                id="Ethereum"
                              />
                              <a
                                href="#"
                                className="LicCopyBTN"
                                onClick={(a) => copyAffiliateLink(a, "Ethereum")}
                              >
                                <i class="fas fa-copy"></i>
                              </a>
                            </div>
                            <div className="LicInfoBX">
                              {" "}
                              Created: July 21, 2021 11:23:01 am UTC |
                              <a href="#" onClick={() => { this.showDepWdrwPopup("Ethereum", ethLicenseAddress, 'DepositToken', "tab-A1") }}>
                                <span className="greenC">
                                  Deposit your reimbursement TOKEN to this smart
                                  contract
                                </span>{" "}
                              </a>
                              {/* | Balance: 8569.563 [TOKEN] |{" "} */}
                              | Balance: {ethLicenseTokenBalance} |{" "}
                              <a href="#" onClick={() => { this.showDepWdrwPopup("Ethereum", ethLicenseAddress, 'DepositToken', "tab-A2") }}>
                                <span className="redC">
                                  Withdraw your reimbursement tokens
                                </span>
                              </a>
                            </div>
                            <div style={{ marginTop: "15px" }}>
                              Change the fees that you want to charge your users <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                            </div>

                            <div className='DragrMBX'>
                              <div className='DragrSBX'>

                                <div className="dragorInput">
                                  <InputRange
                                    maxValue={300}
                                    minValue={0}
                                    value={this.state.ethLicenseFees}
                                    formatLabel={value => `${value / 100}%`}
                                    onChange={value => this.setState({ ethLicenseFees: value })} />
                                </div>
                              </div>
                              <button className="DragrSBTN" onClick={() => { this.setLicenseeFee("Ethereum", constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].reimbursementContract, ethLicenseAddress, this.state.ethLicenseFees) }}>Save</button>

                            </div>
                          </div> : null
                        }

                        {bscLicenseAddress !== "0x0000000000000000000000000000000000000000" ?
                          <div className="LicMbx">
                            Your licensee smart contract for BSC
                            <div className="LicInputBX01">
                              <input
                                type="text"
                                value={bscLicenseAddress}
                                id="BSC"
                              />
                              <a
                                href="#"
                                className="LicCopyBTN"
                                onClick={(a) => copyAffiliateLink(a, "BSC")}
                              >
                                <i class="fas fa-copy"></i>
                              </a>
                            </div>
                            <div className="LicInfoBX">
                              {" "}
                              Created: July 21, 2021 11:23:01 am UTC |

                              <a href="#" onClick={() => { this.showDepWdrwPopup("BSC", bscLicenseAddress, 'DepositToken', "tab-A1") }}>
                                <span className="greenC">
                                  Deposit your reimbursement TOKEN to this smart
                                  contract
                                </span>{" "}
                              </a>

                              {/* | Balance: 8569.563 [TOKEN] |{" "} */}
                              | Balance: {bscLicenseTokenBalance} |{" "}
                              <a href="#" onClick={() => { this.showDepWdrwPopup("BSC", bscLicenseAddress, 'DepositToken', "tab-A2") }}>
                                <span className="redC">
                                  Withdraw your reimbursement tokens
                                </span>
                              </a>
                            </div>
                            <div style={{ marginTop: "15px" }}>
                              Change the fees that you want to charge your users <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                            </div>
                            <div className='DragrMBX'>
                              <div className='DragrSBX'>
                                <div className="dragorInput">
                                  <InputRange
                                    maxValue={300}
                                    minValue={0}
                                    value={this.state.bscLicenseFees}
                                    formatLabel={value => `${value / 100}%`}
                                    onChange={value => this.setState({ bscLicenseFees: value })} />

                                </div>
                              </div>
                              <button className="DragrSBTN" onClick={() => { this.setLicenseeFee("BSC", constantConfig[CONSTANT.NETWORK_ID.BINANCE].reimbursementContract, bscLicenseAddress, this.state.bscLicenseFees) }}>Save</button>
                            </div>
                          </div>
                          : null}
                        {/* <div className="LicMbx">
                          Your licensee smart contract for Polygon
                          <div className="LicInputBX01">
                            <input
                              type="text"
                              value="0x0000000000000000000000000000000000000000"
                              id="Polygon"
                            />
                            <a
                              href="#"
                              className="LicCopyBTN"
                              onClick={(a) => copyAffiliateLink(a, "Polygon")}
                            >
                              <i class="fas fa-copy"></i>
                            </a>
                          </div>
                          <div className="LicInfoBX">
                            {" "}
                            Created: July 21, 2021 11:23:01 am UTC |
                            <span className="greenC">
                              Deposit your reimbursement TOKEN to this smart
                              contract
                            </span>{" "}
                            | Balance: 8569.563 [TOKEN] |{" "}
                            <span className="redC">
                              Withdraw your reimbursement tokens
                            </span>
                          </div>
                          <div style={{ marginTop: "15px" }}>
                            Change the fees that you want to charge your users <i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text" aria-hidden="true"></i>
                          </div>
                          <div className="dragorInput">
                            <InputRange
                              maxValue={100}
                              minValue={0}
                              value={this.state.value}
                              formatLabel={value => `${value}%`}
                              onChange={value => this.setState({ value })} />
                          </div>
                        </div> */}
                      </div>
                    </>
                  ) : (this.state.web3 !== null && typeofLicense === "Smart contract integration") && (
                    <>
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
                          <input type="text" value={constantConfig[CONSTANT.NETWORK_ID.BINANCE].swapFactoryContract} />
                          <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                        </div>
                      </div>

                      <div className='LicMbx'>
                        Smart contract address Ethereum
                        <div className='LicInputBX01'>
                          <input type="text" value={constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].swapFactoryContract} />
                          <a href='#' className='LicCopyBTN'><i class="fas fa-copy"></i></a>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Second Popup Part 

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
                               
       */}
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


          <WithDrawToken closePopup={this.closePopup} openPopup={this.openPopup} />


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
          {/* <!--======================= COIN POPUP END =====================-->
                    <!--======================= SIDE POPUP START =====================--> */}
          <SidePopup web3={this.state.web3} web3Config={web3Config}></SidePopup>
          {/* <!--======================= SIDE POPUP END =====================--> */}
          {/* =========================== DEPOSIT TOKENS POPUP START ================================= */}
          <DepositToken
            tokenAddress={this.state.depositTokenAddress}
            network={this.state.depositWithdrawNetwork}
            vaultAddress={this.state.depositWithdrawVaultAddress}
            closePopup={this.closePopup}
            openPopup={this.openPopup}
          ></DepositToken>
          {/* =========================== DEPOSIT TOKENS POPUP END ================================= */}
          {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/gnaJlUA20lk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> */}
        </div>
      </main>
    );
  }
}
