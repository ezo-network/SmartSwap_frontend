import React, { PureComponent, lazy, Suspense } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Web3 from "web3";
import _ from "lodash";
import { LoopCircleLoading } from "react-loadingg";
import SSIco from "../../../../../src/assets/images/ss.png";
import SmartSwapApiHelper from "../../../../helper/smartswapApiHelper";

export default class Sidebar extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            crossChainQuoteResult: {},
            wait: false,
            superBonus: 0
        }
    }

    componentDidMount = async() =>  {
        this._componentMounted = true;
    }

    componentDidUpdate = async(prevProps, prevState, snapshot) => {
        if(
            (this.props.amountToSwap !== prevProps.amountToSwap) 
            || 
            (prevProps.fromChainId !== this.props.fromChainId)
            ||
            (prevProps.toChainId !== this.props.toChainId)
        ){
            if(this.props.amountToSwap > 0 && isNaN(this.props.fromChainId) === false && isNaN(this.props.toChainId) === false){
                this.setState({
                    crossChainQuoteResult: {},
                    wait: true
                }, async() => {
                    
                    const {response, error, code} = await SmartSwapApiHelper.chainHopPriceQuoteApi(
                        this.props.fromChainId, 
                        this.props.toChainId, 
                        this.props.amountToSwap
                    );

                    if(code === 200){
                        if(this._componentMounted){
                            this.setState({
                                crossChainQuoteResult: response.data,
                                wait: false
                            });
                        }
                    } else {
                        console.error("chainHopPriceQuoteApi", {
                            error: error,
                            code: code
                        });

                        if(this._componentMounted){
                            this.setState({
                                wait: false
                            });
                        }
                    }
                })
            }
        }
    }

    componentWillUnmount() {
        this._componentMounted = false;
        console.log("Sidebar Component unmounted");
    }

    render() {
        return (<>
            <div className={`side-pannel ${this.props.showSidebar ? '' : 'hidden'}`}>
                <h4>Best cross chain prices</h4>
                <div className="cross-chain-price-quote-results">
                    <h5 key="smartswap"><span>1. <LazyLoadImage alt="SmartSwap" src={SSIco} /></span>SmartSwap
                        <b><strong>{this.props.smartSwapQuoteData.quotePrice}</strong> [${this.props.smartSwapQuoteData.quotePriceInUsd}]</b>
                        <p>Estimated fees: ${this.props.smartSwapQuoteData.quoteEstimatedFee} <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="All gas used during the transaction is expected to be fully refunded by a reimbursement staking contract." aria-hidden="true"></i></i></p>
                        <p className="color-green mt-1">Super bonus {this.state.superBonus}% <i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Every swap is eligible for a super bonus reward in the form of a dVoucher" aria-hidden="true"></i></i></p>
                    </h5>
                    

                    {this.state.crossChainQuoteResult?.paths?.slice(0, 2).map((path, index) => {
                        const bridge = _.find(path.steps, {
                            type: "STEP_BRIDGE"
                        });

                        if(bridge !== undefined){
                            const quote = path;
                            const fromTokenUsdValue = this.state.crossChainQuoteResult.src_token_usd_price;
                            const toTokenIdUsdValue = this.state.crossChainQuoteResult.dst_token_usd_price;

                            let quoteAmount = 0;
                            if(this.props.amountToSwap < 15){
                                const quoteAmountPerToken = Number(Web3.utils.fromWei(quote.amount_out_min)) / 15;
                                quoteAmount = quoteAmountPerToken * this.props.amountToSwap;
                            } else {
                                quoteAmount = Number(Web3.utils.fromWei(quote.amount_out_min));
                            }

                            return (
                                <h5 key={index+1}>
                                    <span>{index+2}.</span>
                                    <span className="provider-image">
                                        <LazyLoadImage alt={bridge.provider_name} src={bridge.provider_icon_url} />
                                    </span>
                                    <span className="provider-name">
                                        {bridge.provider_name === 'anyswap' ? 'Multichain' : bridge.provider_name}   
                                    </span>
                                    <b>
                                        <span className="provider-quote-qty">
                                            <strong>{Number(quoteAmount).toFixed(5)} {this.props.toChainNativeTokenSymbol}</strong> 
                                        </span>
                                        &nbsp;
                                        <span className="provider-quote-usd">
                                            [${Number(quoteAmount * toTokenIdUsdValue).toFixed(2)}]
                                        </span>
                                    </b>
                                    <p className="provider-fee">Estimated fees: <span className="color-red">-${quote.src_gas_fee_usd}</span></p>
                                </h5>
                            )
                        }
                    })}

                    {this.state.wait && 
                        <LoopCircleLoading color="#91dc27"></LoopCircleLoading>
                    }

                </div>
            </div>            
        </>)                  
    }
}