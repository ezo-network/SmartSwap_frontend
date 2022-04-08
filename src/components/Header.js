import React, { PureComponent } from "react";
import web3Config from "../config/web3Config";
import { Link } from "react-router-dom";
export default class Header extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      web3: props.web3,
      web3Config: props.web3Config,
      address: null
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      web3: newProps.web3,
      web3Config: newProps.web3Config,
      address: newProps.web3Config.getAddress()
    }, () => {
      if (newProps.web3Config.getAddress() !== null) {
        this.updateAcc()
      }
    });
  }
  componentDidMount() {
    const { isSubdomain, cloneData } = this.props;

    if ((cloneData && cloneData.isPreview) || isSubdomain) {
      setTimeout(() => {
        window
          .$(window)
          .resize(function () {
            if (window.$(this).width() > 768) {
              window
                .$(
                  ".wallet-Popup, .side-Popup, #security-DigitalPopup, .menuSideBarContainer"
                )
                .mCustomScrollbar(); //apply scrollbar with your options
            } else {
              window
                .$(
                  ".wallet-Popup, .side-Popup, #security-DigitalPopup, .menuSideBarContainer"
                )
                .mCustomScrollbar("destroy"); //destroy scrollbar
            }
          })
          .trigger("resize");

        // var menuOpen = false;
        // window.$("#DotMenu").click(function (event) {  
        //   window.$(".menuSideBar").animate({ right: "0", opacity: "1" }, 500); 
        //   menuOpen = true;
        //   event.stopPropagation();
        // });


        // window.$(".main, .MenuClose").click(function (e) {
        //   if (menuOpen) {
        //     if (!window.$(e.target).is(".menuSideBar *, .menuSideBar")) {
        //       window
        //         .$(".menuSideBar")
        //         .animate({ right: "-100%", opacity: "0" }, 500);
        //     }
        //   }
        // });
        // window.$(".MenuClose, .footerV2-LanBoxLink").click(function (e) {
        //   if (menuOpen) {
        //     window
        //       .$(".menuSideBar")
        //       .animate({ right: "-100%", opacity: "0" }, 500);
        //   }
        // });
      }, 100);
    }
  }

  async updateAcc() {
    setInterval(async () => {
      await web3Config.checkAccount()
      this.setState({
        address: web3Config.getAddress()
      })
    }, 10000)
  }

  render() {
    const { cloneData, clearPreview } = this.props;
    // console.log({ cloneData, clearPreview });
    const urlData = cloneData.logoUrl;
    const logoPath = cloneData.logoImage
      ? cloneData.logoImage
      : "images/logo.png";
    return (
      <header className="header wow fadeInDown">
        <div className="logo">
          <a className="urlData" href={urlData ? urlData : "/"} target="_blank">
            <img className="logoimage" src={logoPath} alt="" />
          </a>
        </div>
        <div className="leftMenu">
          <Link to='/' className="active">SMARTSWAP</Link>
          <Link to='/extension'>SMARTBRIDGE EXTENSION</Link>
          <Link to='/projects'>SMARTBRIDGE FOR PROJECTS</Link>
        </div>
        <div className="rightMenu">
          {cloneData && cloneData.isPreview && (
            <>
              <Link
                className="ssBtn03 clone-button"
                to={{
                  pathname: "/ownLicence",
                  state: {
                    cloneData: cloneData,
                  },
                }}
              >
                Continue
              </Link>
              <button className="ssBtn03 clone-button" onClick={clearPreview}>
                Cancel Preview
              </button>
            </>
          )}
          {/* <a style={{color:"orange",marginRight:"20px"}} target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSf9vPdd87ai-O_ZMIY5Wr88DF6KTLMheTL1nzvm9fXEgJTXJg/viewform">Smartswap PreSale </a> */}
          <div className="rmUserWallet">
            {this.state.web3 !== null
              ? this.state.address.slice(0, 6) +
              "..." +
              this.state.address.slice(38, 42)
              : null}
          </div>
          <a
            href="javascript:void(0);"
            className="rmDotLink  "
            id="DotMenu"
            style={{ color: this.state.web3 !== null ? "#91dc27" : "white" }}
          >
            {/* <i className="fas fa-ellipsis-h"></i> */}
            {/* <i className="fas fa-circle"></i> */}
          </a>
        </div>
        <div id="langBox" className="autoClose n-collapse">
          <div
            className={
              cloneData.logoImage
                ? "langBoxContainer subdomain clearfix"
                : "langBoxContainer clearfix"
            }
          >
            <div className="lanbox01">
              {" "}
              <a href="javascript:void(0)" className="active">
                <div className="lanIconbox">
                  <i className="lanicon01"></i>
                </div>
                English
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon02"></i>
                </div>
                中文繁體
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon03"></i>
                </div>
                Tiếng Việt
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon04"></i>
                </div>
                العربية
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon05"></i>
                </div>
                Deutsch
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon06"></i>
                </div>
                Pусский
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon07"></i>
                </div>
                Español
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon08"></i>
                </div>
                <span style={{ unicodeBidi: "bidi-override" }}>תירבע</span>
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon09"></i>
                </div>
                BAHASA INDONESIA
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon010"></i>
                </div>
                Türkçe
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon011"></i>
                </div>
                Português
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon012"></i>
                </div>
                हिन्दी
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon013"></i>
                </div>
                Français
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon014"></i>
                </div>
                한국어
              </a>{" "}
            </div>
            <div className="lanbox01 disableBTN">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon015"></i>
                </div>
                日本語
              </a>{" "}
            </div>
            <div className="lanbox01 ani-1">
              {" "}
              <a href="javascript:void(0)">
                <div className="lanIconbox">
                  <i className="lanicon015 translateLanguage"></i>
                </div>
                <div id="google_translate_element"></div>
              </a>{" "}
            </div>
          </div>
        </div>
      </header>
    );
  }
}
