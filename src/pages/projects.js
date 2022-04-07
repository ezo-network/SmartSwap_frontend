import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import web3Config from "../config/web3Config";
import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig, { getTokenList, tokenDetails } from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import SwapFactoryContract from "../helper/swapFactoryContract";
import CONSTANT from "../constants";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import axios from "axios";
import "react-multi-carousel/lib/styles.css";
import { isValidAddress } from 'ethereumjs-util';
import reimbursementAbi from "../abis/reimbursementAbi.json";


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

        });
      },
      (receipt) => {

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
