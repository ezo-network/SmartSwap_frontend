import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const $ = window.$;
export default class Projects extends PureComponent {
  constructor(props) {
    super();
    this.state = {}
  }

  render() {
    return (
      <>
        <div className="main">
          <div className="container-Grid">
            <div className="boost-outer">
              <div className="boost-left">
                <h2>Boost your web3 dApp sales by giving your customers the best payment experience</h2>
                <p>Super easy one-click cross-chain solution allowing customers to pay with any token or blockchain while you get the token on the blockchain you need.</p>
                <p className="green">Instead of Deploying Your Project on Multiple Blockchains, integrate one smartpayment to Welcome All Type of Users</p>
                
              </div>
              <div className="boost-right">
                <img src="images/mobile-frame.png" alt="" />
              </div>
            </div>
            <div className="o-outer">
              <div className="o-left">
                <div className="down-block">
                  <img src="images/down-arrow.png" alt="" />
                </div>
                {/* <p className="option">OPTION 1</p> */}
                <h3>ONE-CLICK SMARTPAYMENT</h3>
                <p>This code will allow users to push by ONE click any token from any network, and receive the final assets that the project is offering. The One-Click SmartPayment allows users one-click access from any token on any network to the final asset the project offers.</p>

                <div className="Box-bottom">
                  <p className="need-text">You need to call this function in SmartBridge contract</p>
                  <i className="fas fa-copy"></i>
                </div>
                <div className="code-block">
                  {/* <p><span>//user should approve tokens transfer before calling this function.</span></p>
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
                             <p><span>returns (bool)</span></p> */}
                  <p className="cs">COMING SOON</p>
                </div>
                <div className="Box-bottom ver2">
                  <Link to='#' className="dc-file">Download ABI of smart contract file</Link>
                  <Link to='#'>See example for live SmartPayment button for UniSwap V2 DEXs clone</Link>
                </div>

              </div>
              {/* <div className="o-left pl-15">
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
                      </div> */}
            </div>
          </div>
        </div>
      </>
    );
  }
}
