import React, { PureComponent } from "react";
import BridgeSwap from "./bridge-tokens/BridgeSwap";
import NativeSwap from "./native-tokens/NativeSwap";
import {LedgerHistory as NativeTokenLedgerHistory} from "../tabs/LedgerHistory/native-tokens/LedgerHistory";
import {LedgerHistory as BridgeTokenLedgerHistory} from "../tabs/LedgerHistory/bridge-tokens/LedgerHistory";


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
            tokens: []
        }

        this.changeTab = this.changeTab.bind(this);
        this.closeSideBar = this.closeSideBar.bind(this);
        this.setNetworkList = this.setNetworkList.bind(this);
        this.setTokenList = this.setTokenList.bind(this);
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
                    showSidebar={this.state.showSidebar}
                    closeSideBar={() => this.closeSideBar()}
                    openLedger={() => this.openLedger()}
                    setNetworkList={this.setNetworkList}
                ></NativeSwap>,
            'bridge-tokens': 
                <BridgeSwap 
                    setNetworkList={this.setNetworkList} 
                    onTokenListFetched={this.setTokenList}
                    openLedger={() => this.openLedger()}
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

    setNetworkList(networkList, type){
        if(this._componentMounted){ 
            if(type === 'native-tokens'){
                this.setState({
                    nativeTokenSupportedNetworks: networkList
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
                            <div id={`${this.state.activeTabLink}`}>
                                {this.activeComponent(this.state.activeTabLink)}
                            </div>
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
                        isLedgerOpen={this.state.openLedger} 
                        toggleLedger={() => this.toggleLedger()
                    }></BridgeTokenLedgerHistory>
                }

            </>
        )
    }
}