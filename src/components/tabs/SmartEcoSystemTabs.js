import React, { PureComponent } from "react";
import BridgeSwap from "./bridge-tokens/BridgeSwap";
import NativeSwap from "./native-tokens/NativeSwap";
import LedgerHistory from "../LedgerHistory/LedgerHistory";

const activeComponent = (tabLink, callback, props) => {
    const tabComponentsMap = {
        'native-tokens': <NativeSwap showSidebar={props.showSidebar} closeSideBar={()=> callback()}></NativeSwap>,
        'bridge-tokens': <BridgeSwap></BridgeSwap>
    }
    return tabComponentsMap[tabLink];
}


export default class SmartEcoSystemTabs extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            activeTabLink: 'native-tokens',
            showSidebar: false,
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
        }

        this.changeTab = this.changeTab.bind(this);
        this.closeSideBar = this.closeSideBar.bind(this);
    }

    changeTab = (tab) => {
        if(!tab.disabled && this.state.activeTabLink !== tab.link){
            this.setState({
                activeTabLink: tab.link
            });
        }
    }

    closeSideBar = () => {
        let currentStatus = !this.state.showSidebar;
        this.setState({showSidebar: currentStatus});
    }

    render() {
        return (
            <>
                <div className={(this.state.showSidebar && this.state.activeTabLink === "native-tokens") ? "tab-container hasSidebar" : "tab-container" }>
                    <div className="tab-main-wrapper">
                        <ul className="tabs-n">
                            {this.state.tabs.map((tab) => {
                                return <li key={tab.link} onClick={(e) => this.changeTab(tab)} className={`tab-link ${this.state.activeTabLink === tab.link ? 'current-n' : '', tab.disabled ? 'disable' : ''}`} data-tab={tab.link}>
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
                                {activeComponent(this.state.activeTabLink, this.closeSideBar, {showSidebar: this.state.showSidebar})}
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.activeTabLink === "native-tokens" &&
                <LedgerHistory></LedgerHistory>
                }
            </>
        )
    }
}