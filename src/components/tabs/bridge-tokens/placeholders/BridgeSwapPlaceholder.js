import { PureComponent } from "react";

export default class BridgeSwapPlaceholder extends PureComponent {
    render() {
        return (
            <>
                <div className="tabRow">
                    <div className="tabCol">
                        <div className="d-flex balance-row">
                            <div className="b-text">
                                Balance: 0 MAX
                            </div>
                        </div>
                    </div>
                    <div className="tabCol">
                        {/* <button onClick={(e) => this.toggleCheckAuthenticityPopup()} className="color-green button-link">Check authenticity</button> */}
                    </div>
                </div>
                <div className="tabRow">
                    <div className="tabCol">
                        <label>DEPOSIT</label>
                        <div className="from-token inputIcon white">
                            <i style={{ height: '48px' }}>
                                <PlaceholderLoading shape="circle" width={20} height={20} colorEnd="#91dc27" />
                            </i>
                            <PlaceholderLoading shape="rect" width={280} height={50} />
                        </div>
                        <figure className="from-token-selector">
                            <div className="figIcon">
                                <PlaceholderLoading shape="circle" width={65} height={65} />
                            </div>
                            <figcaption>
                                <span><PlaceholderLoading shape="rect" width={100} height={10} /></span>
                                <span><PlaceholderLoading shape="rect" width={100} height={10} /></span>
                            </figcaption>
                        </figure>
                    </div>
                    <div className="tabDivider">
                        <button
                            className="swap"
                        //onClick={() => this.swapDirections()}
                        >
                            <img src={swapImg} alt="swap-directions-button"></img>
                        </button>
                    </div>
                    <div className="tabCol">
                        <label>RECEIVE</label>
                        <div className="to-token inputIcon black">
                            <i style={{ height: '48px', background: '#ededed' }}>
                                <PlaceholderLoading shape="circle" width={20} height={20} colorEnd="#91dc27" />
                            </i>
                            <PlaceholderLoading shape="rect" width={280} height={50} />
                        </div>
                        <figure className="to-token-selector">
                            <div className="figIcon">
                                <PlaceholderLoading shape="circle" width={65} height={65} />
                            </div>
                            <figcaption>
                                <span><PlaceholderLoading shape="rect" width={100} height={10} /></span>
                                <span><PlaceholderLoading shape="rect" width={100} height={10} /></span>
                            </figcaption>
                        </figure>
                    </div>
                </div>
                <div className="tabRow hasBtn action-btn">
                    <PlaceholderLoading shape="rect" width={616} height={84} />
                    <PlaceholderLoading shape="rect" width={616} height={10} />
                </div>
            </>
        )
    }
}