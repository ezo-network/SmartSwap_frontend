import React, {Component} from "react";

export default class SpIntroduction extends Component {
    render() {
        return (
            <>
            <div className="LiProTitle01 ">Become a Swap Provider</div>
            <div className="details-para-n">
                <p>Swap Provider (SP) act as a default counterparty when swaps are pending due to lack of liquidity. SP use an API to automatically buying in real time tokens from centralized exchange (CEX) and sell them as a counterparty on the Smartswap based on average market price. The spread between the market to average market is the SP's profit. SP can control the outcome of the swap including the profits by setting terms for the API, such as the maximum funds to use, the minimum spread to gain from and other terms.</p>
                <p>The SP process works like a fountain, first users place orders on the Smartswap, and if there is no counterparty, the SP's CEX account will be trigger by an API to use stablecoin to buy in real time the tokens those users looking for. Then those token will be send by the CEX account to the smartswap and at the same time the Smartswap will send the counter party tokens to the SP's CEX account, at that point the API will sell those receiving tokens back to stablecoins and wait for the next trigger to repeat the process again. Since the receiving tokens from the counterparty can take few long minutes until it's received in the SP's CEX account and sold back to stablecoins, the API will protect the SP's profits by placing automatically short order to guaranty that the face value of the receiving tokens will not be change during that time. </p>
                <p>As SP you do not need to do anything active, everything will work for you, so everything your account sending funds out to the smartswap it will gain that fund back plus a spread as a profit.</p>
                <ul className="count-content-wrap-n">
                    <li>
                        <div className="count-content-n">
                            <span className="count-n">
                                1
                            </span>
                            <p>Set terms for the API and deploy you smart contract.</p>
                        </div>
                    </li>
                    <li>
                        <div className="count-content-n">
                            <span className="count-n">
                                2
                            </span>
                            <p>Go to your CEX and open an API and whitelist the smart contract and IP address for withdrawal.</p>
                        </div>
                    </li>
                    <li>
                        <div className="count-content-n">
                            <span className="count-n">
                                3
                            </span>
                            <p>Update the smart contract with the new API and Secret Key you received from your CEX.</p>
                        </div>
                    </li>
                </ul>
            </div>
            </>
        )
    }
};