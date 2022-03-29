import React, { PureComponent } from "react";
import SpIntroduction from "./SpIntroduction";
import SpContractDeployForm from "./SpContractDeployForm";
import { tokenDetails } from "../../config/constantConfig";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import ccxt from "ccxt";

const MIN_AMOUNT_A = 500;
const MIN_SPREAD_RANGE=0;
const MAX_SPREAD_RANGE=1;
const MAX_WITHDRAW_PERCENT=45;
const SANDBOX_MODE=false;
const PRICE_SOURCE="binance"; // coingecko OR binance

export default class LiquidityProvider extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            web3: null,
            web3Config: null,
            coinList: tokenDetails
        }
    }

    componentWillReceiveProps(newProps) {
        if (typeof window.ethereum !== 'undefined') {            
            // detect Network account change
            window.ethereum.on('chainChanged', networkId => {
                console.log('chainChanged', networkId);
                this.setState({
                    web3: null
                });
            });
    
            window.ethereum.on('accountsChanged', accounts => {
                console.log('account Changed');
                this.setState({
                    web3: null
                });
            });
        }
    }

    componentDidMount() {
        this.getTokenUsdValuesFromCoingecko();
    }

    getTokenUsdValuesFromCoingecko = async () => {
        if(PRICE_SOURCE === "coingecko"){
            let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,cardano,polkadot,uniswap,ripple,matic-network&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
            
            let response = await axios.get(url).then((res) => {
                return res.data;
            }).catch((err) => {
                console.log("errorOrigin: getTokenUsdValuesFromCoingecko", err);
            });
      
            this.setState({
                tokenPrices: {
                    'ETH': response["ethereum"]["usd"],
                    'BNB': response["binancecoin"]["usd"]
                }
            });
        } 

        if(PRICE_SOURCE === "binance"){
            const exchange = new ccxt.binance();
            exchange.set_sandbox_mode(SANDBOX_MODE);
            
            let ticker = await exchange.fetchTicker('BNBUSDT');
            let bnbPrice = ticker.last;            

            ticker = await exchange.fetchTicker('ETHUSDT');
            let ethPrice = ticker.last;
            if(SANDBOX_MODE === false){
                ticker = await exchange.fetchTicker('MATICUSDT');
            } else {
                ticker = {
                    last: 1.80
                }
                console.log("MATIC price is static in sanbox mode. Price 1 matic = $1.80");
            }
            let maticPrice = ticker.last;

            this.setState({ 
                tokenPrices: {
                    'ETH': ethPrice,
                    'BNB': bnbPrice,
                    'MATIC': maticPrice
                }
            });
        }
    }

    render() {
        return (
            <div className="main-Popup wallet-Popup" id="LiquidityProvider">
                <div className="container-Grid details-n">
                    <SpIntroduction />
                    <SpContractDeployForm 
                        minAmountA={MIN_AMOUNT_A} 
                        minSpreadRange={MIN_SPREAD_RANGE} 
                        maxSpreadRange={MAX_SPREAD_RANGE}
                        maxWithdrawPercent={MAX_WITHDRAW_PERCENT}
                        tokenPrices={this.state.tokenPrices}
                        sandboxMode={SANDBOX_MODE}
                    />
                </div>
                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("LiquidityProvider") }} className="close-Icon"></a>
            </div>
        )
    }

}