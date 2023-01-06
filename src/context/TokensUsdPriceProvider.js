import React from 'react';
import CONSTANT from "../constants";
import axios from 'axios';

const refreshRate = 1; // in minutes
export const TokensUsdPriceContext = React.createContext(null);
export const useTokensUsdPrice = () => React.useContext(TokensUsdPriceContext);

export function withTokensUsdPrice(Component) {
    const TokensUsdPriceComponent = (props) => (
        <TokensUsdPriceContext.Consumer>
            {(contexts) => <Component {...props} {...contexts} />}
        </TokensUsdPriceContext.Consumer>
    );
    return TokensUsdPriceComponent;
}

const TokensUsdPriceProvider = React.memo((args) => {
    const [tokensUsdPrice, setTokensUsdPrice] = React.useState([]);
    React.useEffect(async() => {
        await reFetch();

        return () => {
            // clean up function
        }
    }, []);

    const fetchCoingeckoMarketPrice = async () => {
        try {
            await axios.get(CONSTANT.API_ENDPOINTS['3RD_PARTY_APPS'].COIN_GECKO_API.tokensUsdPrice).then(async(res) => {
                const response = res.data;
    
                let tokens = [];
                tokens.push({
                    chain: 'ETH',
                    value: response["ethereum"]["usd"]
                }, {
                    chain: 'BSC',
                    value: response["binancecoin"]["usd"]
                }, {
                    chain: 'POLYGON',
                    value: response["matic-network"]["usd"]
                });
    
                setTokensUsdPrice(tokens);
    
            }).catch((err) => {
                console.error("fetchCoingeckoMarketPrice api error", err);
            });
        } catch(err){
            console.error("fetchCoingeckoMarketPrice catch", err.message);
        }
    }

    const reFetch = async() => {
		try {
            const fetchCoingeckoMarketPriceApi = fetchCoingeckoMarketPrice();
            const timeOutPromise = new Promise(function (resolve, reject) {
                setTimeout(resolve, 60000 * refreshRate);
            });
            
            Promise.all([fetchCoingeckoMarketPriceApi, timeOutPromise]).then(async (responses) => {
                console.log('Refetching token prices from token price provider');
                await reFetch();
            });
		} catch (err){
			console.error("reFetch", err.message);
		}
    }

    return (
        <TokensUsdPriceContext.Provider
            value={{
                tokensUsdPrice: tokensUsdPrice
            }}
        >
            {args.children}
        </TokensUsdPriceContext.Provider>
    )
});

export default TokensUsdPriceProvider;