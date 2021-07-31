import React, { PureComponent } from "react";
import web3Config from "../config/web3Config";

export default class Header extends PureComponent {
    constructor(props){
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config
        }
    }

    componentWillReceiveProps(newProps){
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config
        })
    }

    render() {

        return (
            <header className="header wow fadeInDown">
                <div className="logo"><a href="https://smartswap.exchange/" target="_blank"><img src="images/logo.png"
                            alt=""/></a></div>
                <div className="rightMenu">
                    {/* <a style={{color:"orange",marginRight:"20px"}} target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSf9vPdd87ai-O_ZMIY5Wr88DF6KTLMheTL1nzvm9fXEgJTXJg/viewform">Smartswap PreSale </a> */}
                    <div className="rmUserWallet">{this.state.web3 !== null ? this.state.web3Config.getAddress().slice(0,6)+"..."+this.state.web3Config.getAddress().slice(38,42) : null}</div>
                    <a href="javascript:void(0);" className="rmDotLink  " id="DotMenu" style={{color: this.state.web3 !== null ? "#91dc27" : "white"}}>
                        {/* <i className="fas fa-ellipsis-h"></i> */}
                        <i className="fas fa-circle"></i>
                    </a>
                </div>
                <div id="langBox" className="autoClose n-collapse">
                    <div className="langBoxContainer clearfix">
                        <div className="lanbox01"> <a href="javascript:void(0)" className="active">
                                <div className="lanIconbox"><i className="lanicon01"></i></div>
                                English
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon02"></i></div>
                                中文繁體
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon03"></i></div>
                                Tiếng Việt
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon04"></i></div>
                                العربية
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon05"></i></div>
                                Deutsch
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon06"></i></div>
                                Pусский
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon07"></i></div>
                                Español
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon08"></i></div>
                                <span style={{unicodeBidi: "bidi-override"}}>תירבע</span>
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon09"></i></div>
                                BAHASA INDONESIA
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon010"></i></div>
                                Türkçe
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon011"></i></div>
                                Português
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon012"></i></div>
                                हिन्दी
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon013"></i></div>
                                Français
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon014"></i></div>
                                한국어
                            </a> </div>
                        <div className="lanbox01 disableBTN"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon015"></i></div>
                                日本語
                            </a> </div>
                        <div className="lanbox01 ani-1"> <a href="javascript:void(0)">
                                <div className="lanIconbox"><i className="lanicon015 translateLanguage"></i></div>
                                <div id="google_translate_element"></div>
                            </a> </div>
                    </div>
                </div>
            </header>
        )

    }

}