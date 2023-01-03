import React, { PureComponent } from "react";
import BridgeSwap from "./bridge-tokens/BridgeSwap";
import NativeSwap from "./native-tokens/NativeSwap";
import {LedgerHistory as NativeTokenLedgerHistory} from "../tabs/LedgerHistory/native-tokens/LedgerHistory";
import {LedgerHistory as BridgeTokenLedgerHistory} from "../tabs/LedgerHistory/bridge-tokens/LedgerHistory";
import {TokensUsdPriceContext} from "../../context/TokensUsdPriceProvider";


export default class SmartEcoSystemTabs extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            activeTabLink: 'native-tokens',
            showSidebar: true,
            tabs: [
                {
                    title: 'Native Tokens',
                    link: 'native-tokens',
                    inBeta: true,
                    disabled: false
                },
                {
                    title: 'Bridge Tokens',
                    link: 'bridge-tokens',
                    inBeta: true,
                    disabled: false
                },
                {
                    title: 'SoulBounds',
                    link: 'soul-bounds',
                    inBeta: true,
                    disabled: true
                },
                {
                    title: 'W3B',
                    link: 'w3b',
                    inBeta: true,
                    disabled: true
                },
                {
                    title: 'CBDC',
                    link: 'cbdc',
                    inBeta: true,
                    disabled: true
                },
                {
                    title: 'dSTOCKS',
                    link: 'dstocks',
                    inBeta: true,
                    disabled: true
                }
            ],
            openLedger: false,
            smartswapSupportedNetworks: [],
            bridgeSupportedNetworks: [],
            tokens: [],
            wrappedTokens: [],
            isWrapTokenDeposit: false
        }

        this.changeTab = this.changeTab.bind(this);
        this.closeSideBar = this.closeSideBar.bind(this);
        this.setNetworkList = this.setNetworkList.bind(this);
        this.setTokenList = this.setTokenList.bind(this);
        this.setWrappedTokenList = this.setWrappedTokenList.bind(this);
        this.toggleIsWrapTokenDeposit = this.toggleIsWrapTokenDeposit.bind(this);
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        console.log("SmartEcoSystemTabs Component mounted");
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("SmartEcoSystemTabs Component unmounted");
    }

    activeComponent = (tabLink) => {
        const tabComponentsMap = {
            'native-tokens': 
                <NativeSwap 
                    tokensUsdPrice={this.context.tokensUsdPrice}
                    showSidebar={this.state.showSidebar}
                    closeSideBar={() => this.closeSideBar()}
                    openLedger={() => this.openLedger()}
                    setNetworkList={this.setNetworkList}
                ></NativeSwap>,
            'bridge-tokens': 
                <BridgeSwap 
                    setNetworkList={this.setNetworkList} 
                    onTokenListFetched={this.setTokenList}
                    onWrapTokenListFetched={this.setWrappedTokenList}
                    openLedger={() => this.openLedger()}
                    toggleIsWrapTokenDeposit={this.toggleIsWrapTokenDeposit}
                ></BridgeSwap>
        }
        return tabComponentsMap[tabLink];
    }

    changeTab = (tab) => {
        if(this._componentMounted){
            if (!tab.disabled && this.state.activeTabLink !== tab.link) {
                this.setState({
                    activeTabLink: tab.link
                });
            }
        }
    }

    closeSideBar = () => {
        if(this._componentMounted){
            let currentStatus = !this.state.showSidebar;
            this.setState({ showSidebar: currentStatus });
        }
    }
    
    openLedger(){
        if(this._componentMounted){
            this.setState({
                openLedger: true
            });
            this.scroll();
        }
    }

    toggleLedger(){
        if(this._componentMounted){            
            this.setState({
                openLedger: !this.state.openLedger
            });
        }
    }

    toggleIsWrapTokenDeposit(isWrapTokenDeposit){
        if(this._componentMounted){            
            this.setState({
                isWrapTokenDeposit: isWrapTokenDeposit
            });
        }        
    }

    setNetworkList(networkList, type){
        if(this._componentMounted){ 
            if(type === 'native-tokens'){
                this.setState({
                    smartswapSupportedNetworks: networkList
                });
            }
            if(type === 'bridge-tokens'){
                this.setState({
                    bridgeSupportedNetworks: networkList
                });
            }            
        }
    }

    setTokenList(tokenList){
        if(this._componentMounted){            
            this.setState({
                tokens: tokenList
            });
        }
    }

    setWrappedTokenList(wrappedTokensList){
        if(this._componentMounted){            
            this.setState({
                wrappedTokens: wrappedTokensList
            });
        }        
    }

    scroll = () => {
        const section = document.querySelector( '#ledger-history' );
        section.scrollIntoView( { behavior: 'smooth', block: 'start' } );
    };

    render() {
        return (
            <>
                <div className={(this.state.showSidebar && this.state.activeTabLink === "native-tokens") ? "tab-container hasSidebar" : "tab-container"}>
                    <div className="tab-main-wrapper">
                        <ul className="tabs-n">
                            {this.state.tabs.map((tab) => {
                                return <li key={tab.link} onClick={(e) => this.changeTab(tab)} className={`tab-link ${this.state.activeTabLink === tab.link ? 'current-n' : ''} ${tab.disabled ? 'disable' : ''}`} data-tab={tab.link}>
                                    <div>
                                        {tab.title}
                                        {tab.inBeta && !tab.disabled &&
                                            <span className="text-sm-n color-green">BETA</span>
                                        }
                                    </div>
                                </li>
                            })}
                        </ul>

                        <div className="tab-content-n-main">
                            <button key={this.state.tabs[0].link} onClick={(e) => this.changeTab(this.state.tabs[0])} className={`tab-link ${this.state.activeTabLink === this.state.tabs[0].link ? 'current-n' : ''} ${this.state.tabs[0].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[0].link}>
                                <div>
                                    {this.state.tabs[0].title}
                                    {this.state.tabs[0].inBeta && !this.state.tabs[0].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            {this.state.activeTabLink === this.state.tabs[0].link && (
                            <div id={`${this.state.activeTabLink}`} className="tabMain">
                                <NativeSwap 
                                    tokensUsdPrice={this.context.tokensUsdPrice}
                                    showSidebar={this.state.showSidebar}
                                    closeSideBar={() => this.closeSideBar()}
                                    openLedger={() => this.openLedger()}
                                    setNetworkList={this.setNetworkList}
                                ></NativeSwap>
                            </div>
                            )}


                            <button key={this.state.tabs[1].link} onClick={(e) => this.changeTab(this.state.tabs[1])} className={`tab-link ${this.state.activeTabLink === this.state.tabs[1].link ? 'current-n' : ''} ${this.state.tabs[1].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[1].link}>
                                <div>
                                    {this.state.tabs[1].title}
                                    {this.state.tabs[1].inBeta && !this.state.tabs[1].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            {this.state.activeTabLink === this.state.tabs[1].link && (
                                <div id={`${this.state.activeTabLink}`} className="tabMain">
                                    <BridgeSwap 
                                        setNetworkList={this.setNetworkList} 
                                        onTokenListFetched={this.setTokenList}
                                        onWrapTokenListFetched={this.setWrappedTokenList}
                                        openLedger={() => this.openLedger()}
                                        toggleIsWrapTokenDeposit={this.toggleIsWrapTokenDeposit}
                                    ></BridgeSwap>
                                </div>
                            )}

                            <button className={`tab-link ${this.state.activeTabLink === this.state.tabs[2].link ? 'current-n' : ''} ${this.state.tabs[2].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[2].link}>
                                <div>
                                    {this.state.tabs[2].title}
                                    {this.state.tabs[2].inBeta && !this.state.tabs[2].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            <button className={`tab-link ${this.state.activeTabLink === this.state.tabs[3].link ? 'current-n' : ''} ${this.state.tabs[3].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[3].link}>
                                <div>
                                    {this.state.tabs[3].title}
                                    {this.state.tabs[3].inBeta && !this.state.tabs[3].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            <button className={`tab-link ${this.state.activeTabLink === this.state.tabs[4].link ? 'current-n' : ''} ${this.state.tabs[4].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[4].link}>
                                <div>
                                    {this.state.tabs[4].title}
                                    {this.state.tabs[4].inBeta && !this.state.tabs[4].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            <button className={`tab-link ${this.state.activeTabLink === this.state.tabs[5].link ? 'current-n' : ''} ${this.state.tabs[5].disabled ? 'disable' : ''}`} data-tab={this.state.tabs[5].link}>
                                <div>
                                    {this.state.tabs[5].title}
                                    {this.state.tabs[5].inBeta && !this.state.tabs[5].disabled &&
                                        <span className="text-sm-n color-green">BETA</span>
                                    }
                                </div>
                            </button>
                            {/* <div id={`${this.state.activeTabLink}`}>
                                {this.activeComponent(this.state.activeTabLink)}
                            </div> */}
                        </div>
                    </div>
                </div>

                {this.state.activeTabLink === "native-tokens" &&
                    <NativeTokenLedgerHistory 
                        networks={this.state.smartswapSupportedNetworks}
                        isLedgerOpen={this.state.openLedger} 
                        toggleLedger={() => this.toggleLedger()
                    }></NativeTokenLedgerHistory>
                }

                {this.state.activeTabLink === "bridge-tokens" &&
                    <BridgeTokenLedgerHistory 
                        networks={this.state.bridgeSupportedNetworks}
                        tokens={this.state.tokens}
                        wrappedTokens={this.state.wrappedTokens}
                        isLedgerOpen={this.state.openLedger}
                        isWrapTokenDeposit={this.state.isWrapTokenDeposit}
                        toggleLedger={() => this.toggleLedger()
                    }></BridgeTokenLedgerHistory>
                }

            </>
        )
    }
}

SmartEcoSystemTabs.contextType = TokensUsdPriceContext;