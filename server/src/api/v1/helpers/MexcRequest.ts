// dependencies
import axios, { AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import { filter } from 'lodash';
const qs = require('qs');
let crypto = require('crypto');

import {log} from "../../../config";
let print = log.createLogger('Logs', 'trace');

const exchangesConfiguration = {
    'mexc' : {
        sandboxMode: false,
        api: {
            spot: {
                endpoint: 'https://www.mexc.com/open/api/v2',
            },
            contract: {
                endpoint: 'https://contract.mexc.com/api/v1'
            }
        }
    }
}

interface IauthParams {
    key: string, 
    secret: string
}

interface IfilterDepositsRecords {
    currency?: string, 
    state?: string, 
    start_time?: string, 
    end_time?: string, 
    page_num?: string, 
    page_size?: string
}

interface IplaceOrderOptions {
    symbol: string, 
    price: string, 
    quantity: string, 
    trade_type: string, 
    order_type: string, 
    client_order_id?: string    
}

interface IqueryOrderOptions {
    order_ids?: string    
}

interface IqueryOpenOrdersOptions {
    symbol: string,
    start_time?: string,
    limit?: string,
    trade_type?: string,
}

interface IcancelOrderOptions {
    order_ids?: string, 
    client_order_ids?: string    
}

interface IwithdrawOrderOptions {
    currency: string, 
    chain?: string, 
    amount: number, 
    address: string, 
    remark?: string
}

interface IqueryWithdrawOrderOptions {
    currency?: string, 
    withdraw_id?: string, 
    state?: string, 
    start_time?: string, 
    end_time?: string, 
    page_num?: string, 
    page_size?: string
}

interface IqueryTransferOrderOptions {
    transact_id: string    
}

interface IqueryTransferOrdersOptions {
    currency?: string,
    from?: string,
    to?: string,
    start_time?: string,
    end_time?: string,
    page_num?: string,
    page_size?: string
}

interface IassetTransferOptions {
    currency: string,
    amount: string,
    from: string,
    to: string
}

// contract
interface IqueryContractHistoricalOrdersOptions {
    page_num: number,
    page_size: number
}

interface IqueryContractAssetTransferRecordsOptions {
    page_num: number,
    page_size: number    
}

interface IplaceContractOrderOptions {
    symbol: string,
    price: number,
    vol: number,
    leverage?: number
    side: number
    type: number,
    openType: number, 
    positionId?: number,
    externalOid?: string,
    stopLossPrice?: number,
    takeProfitPrice?: number,
}

const signRequest = (host, path, method = 'GET', data = {},  params = {}, headers = undefined, body = undefined) => {
    let auth = '', url = '';

    url = host + '/' + path;

    if (!params.hasOwnProperty('auth')) {
        if(Object.keys(data).length !== 0) {
            url += '?' + qs.stringify(data);
        }
    } else {
        const timestamp = new Date().getTime();
        headers = {
            'ApiKey': params['cexData']['key'],
            'Request-Time': timestamp,
            'Content-Type': 'application/json',
        };
                
        if (method === 'POST') {
            if(Object.keys(data).length !== 0) {
                auth = JSON.stringify(data);
            }

            body = auth;

        } else {
            if (Object.keys(data).length) {
                auth += qs.stringify(data);
                url += '?' + auth;
            }
        }

        auth = params['cexData']['key'] + timestamp + auth;

        const signature = crypto.createHmac('sha256', params['cexData']['secret']).update(auth).digest('hex');
        headers['Signature'] = signature;
    }
    const config: AxiosRequestConfig = { url: url, method: method as Method, data: body, headers: headers };
    return config;
}

class MexcRequest {

    // to connect to binance api
    request = async(data, params = {}) => {
        //API mode
        const exchangeId = 'mexc';
        const validMarketTypes = ['spot', 'contract'];
        const validMethods = ['GET', 'POST', 'DELETE'];

        const marketType = params['marketType'] !== null ? (params['marketType']).toLowerCase() : undefined;
        const method = params['method'] !== null ? (params['method']).toUpperCase() : undefined;
        const endPoint = ((params['endPoint'] !== null) || (params['endPoint'] !== '')) ? params['endPoint'] : undefined;

        if(params.hasOwnProperty('marketType')){
            if(!validMarketTypes.includes(marketType)){
                throw "Invalid market type";
            }
        } else {
            throw "param market type required.";
        }

        if(params.hasOwnProperty('method')){
            if(!validMethods.includes(method)){
                throw "Invalid request method passed";
            }
        } else {
            throw "request method is required.";
        }

        if(endPoint === undefined){
            throw "param endPoint is required.";
        }

        if(method === 'POST' || (params.hasOwnProperty('auth') && params['auth'] === true)){
            if(!(params.hasOwnProperty('cexData') && params['cexData'].hasOwnProperty('key'))){
                throw "post request must call by swap provider cex key.";
            }
            if(!(params.hasOwnProperty('cexData') && params['cexData'].hasOwnProperty('secret'))){
                throw "post request must call by swap provider cex secret key.";
            }
        }


        const exchangeConfig = exchangesConfiguration[exchangeId].api[marketType];
        const host = exchangeConfig.endpoint;

        try {
            const requestParams = signRequest(host, endPoint, method, data, params);
            //print.info(requestParams);
            const response: AxiosResponse = await axios(requestParams);

            if(response.status == 200){
                return response.data;
            } else {
                print.info({
                    status: response.status
                });
                return undefined;
            }
        } catch (err) {
            let error; 
            if(err.hasOwnProperty('response')){
                error = {
                    status: err.response.status,
                    code: err.response.data.code,
                    message: err.response.data.msg
                };
                print.info(error);
            } else {
                error = err
                print.info(err);                
            }
            return error;
        }
    }

    fetchTicker = async(symbol) => {
        symbol = symbol.replace('/', '_');
        const response = await this.request({
            'symbol': symbol
        }, {
            'method': 'GET',
            'endPoint': 'market/ticker',
            'marketType': 'SPOT'
        });

        if(response){
            return response.data;
        } else {
            return undefined;
        }
    }

    currencyInfo = async(currency) => {
        const response = await this.request({
            currency: currency
        }, {
            'method': 'GET',
            'endPoint': 'market/coin/list',
            'marketType': 'SPOT'
        });

        return response;        
    }

    accInfo = async(authParams : IauthParams) => {
        const response = await this.request({}, {
            'method': 'GET',
            'endPoint': 'account/info',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }
        });
        return response;
    }

    getTradingPairs = async(query = {}, authParams : IauthParams) => {
        const response = await this.request({}, {
            'method': 'POST',
            'endPoint': 'market/api_symbols',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        if(response){
            return response.data;
        } else {
            return undefined;
        }           
    }

    placeOrder = async(options: IplaceOrderOptions, authParams : IauthParams) => {
        const symbol = options.symbol.replace('/', '_');
        const price = options.price;
        const quantity = options.quantity;        
        let trade_type = options.trade_type.toUpperCase().trim();
        const order_type = options.order_type.toUpperCase().trim();
        let client_order_id = options.client_order_id;
        const validTradeTypes = ['BID', 'ASK', 'BUY', 'SELL'];
        const tradeTypeAlias = ['BUY', 'SELL'];
        const tradeTypeAliasMap = {
            'BUY': 'BID',
            'SELL': 'ASK'
        };
        
        const validOrderTypes = ["LIMIT_ORDER", "POST_ONLY", "IMMEDIATE_OR_CANCEL"];
            
        if(symbol === null || symbol === '' || symbol === undefined){
            throw 'parameter symbol is required.';            
        }
        
        if(price === null || price === '' || price === undefined){
            throw 'parameter price is required.';            
        }
        
        if(quantity === null || quantity === '' || quantity === undefined){
            throw 'parameter quantity is required.';            
        }

        if(trade_type === null || trade_type === '' || trade_type === undefined){
            throw 'parameter trade_type is required.';            
        }        
        
        if(order_type === null || order_type === '' || order_type === undefined){
            throw 'parameter order_type is required.';            
        }
        
        
        if(!validTradeTypes.includes(trade_type)){
            throw 'Invalid trade type passed.';
        }
        
        if(tradeTypeAlias.includes(trade_type)){
            trade_type = tradeTypeAliasMap[trade_type];
        }
        
        if(!validOrderTypes.includes(order_type)){
            throw 'Invalid order type passed.';
        }
        
        let args = {
            symbol: symbol,
            price: price,
            quantity: quantity,
            trade_type: trade_type,
            order_type: order_type
        };
        
        if(client_order_id !== undefined && client_order_id.length > 0){
            client_order_id = client_order_id.length > 32 ? client_order_id.substring(0, 32) : client_order_id;
            args['client_order_id'] = client_order_id;
        }

        const response = await this.request(args, {
            'method': 'POST',
            'endPoint': 'order/place',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }
        });

        return response;
    }

    queryOrder = async(filter: IqueryOrderOptions, authParams : IauthParams) => {
        const response = await this.request({
            order_ids: filter.order_ids
        }, {
            'method': 'GET',
            'endPoint': 'order/query',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        return response;
    }

    queryOpenOrders = async(filter: IqueryOpenOrdersOptions, authParams : IauthParams) => {
        const response = await this.request({
            symbol: filter.symbol,
            start_time: filter.start_time,
            limit: filter.limit,
            trade_type: filter.trade_type
        }, {
            'method': 'GET',
            'endPoint': 'order/open_orders',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        return response;
    }


    cancelOrder = async(filter: IcancelOrderOptions, authParams : IauthParams) => {

        if(filter.hasOwnProperty('order_ids') && filter.order_ids.length > 0){
            delete filter['client_order_ids'];
        }

        const response = await this.request({
            order_ids: filter.order_ids,
            client_order_ids: filter.client_order_ids
        }, {
            'method': 'DELETE',
            'endPoint': 'order/cancel',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        if(response){
            return response.data;
        } else {
            return undefined;
        }
    }

    queryDepositsRecords = async(filter: IfilterDepositsRecords, authParams : IauthParams) => {
        const response = await this.request({
            currency: filter.currency,
            state: filter.state,
            start_time: filter.start_time,
            end_time: filter.end_time,
            page_num: filter.page_num,
            page_size: filter.page_size
        }, {
            'method': 'GET',
            'endPoint': 'asset/deposit/list',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        if(response){
            return response;
        } else {
            return undefined;
        }
    }
    
    placeWithdrawOrder = async(options: IwithdrawOrderOptions, authParams : IauthParams) => {
        // get currency info to obtain valid chains 
        let validChainsForCurrency = [];
        const curInfo = await this.currencyInfo((options.currency).toUpperCase());
        if(curInfo.code == 200) {
            curInfo.data[0].coins.forEach((coins) => {
                validChainsForCurrency.push(coins.chain);
            });
        }
        if(validChainsForCurrency.includes((options.chain).toUpperCase())){
            
            let args = {
                currency: (options.currency).toUpperCase(),
                chain: options.chain,
                amount: options.amount,
                address: options.address,
            }

            if(options.remark !== undefined && options.remark.length > 0){
                args['remark'] = options.remark
            }
            
            if(exchangesConfiguration.mexc.sandboxMode){
                return { code: 200, data: { withdrawId: 'withdrawid_' + (new Date().getTime()).toString() } }
            }

            const response = await this.request(args, {
                'method': 'POST',
                'endPoint': 'asset/withdraw',
                'marketType': 'SPOT',
                'auth': true,
                'cexData': {
                    key: authParams.key,
                    secret: authParams.secret
                }           
            });
            
            return response;
        } else {
            print.info('placeWithdrawOrder Error: Invalid chain provided.');
            return undefined;
        }
    }

    queryWithdrawRecords = async(filter: IqueryWithdrawOrderOptions, authParams : IauthParams) => {
        const response = await this.request({
            currency: filter.currency,
            withdraw_id: filter.withdraw_id,
            state: filter.state,
            start_time: filter.start_time,
            end_time: filter.end_time,
            page_num: filter.page_num,
            page_size: filter.page_size
        }, {
            'method': 'GET',
            'endPoint': 'asset/withdraw/list',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        return response;
    }

    queryTransferRecord = async(filter: IqueryTransferOrderOptions, authParams : IauthParams) => {
        const response = await this.request({
            transact_id: filter.transact_id
        }, {
            'method': 'GET',
            'endPoint': 'asset/internal/transfer/info',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        return response;        
    }

    queryTransferRecords = async(filter: IqueryTransferOrdersOptions, authParams : IauthParams) => {
        const response = await this.request({
            currency: filter.currency,
            from: filter.from,
            to: filter.to,
            start_time: filter.start_time,
            end_time: filter.end_time,
            page_num: filter.page_num,
            page_size: filter.page_size
        }, {
            'method': 'GET',
            'endPoint': 'asset/internal/transfer/record',
            'marketType': 'SPOT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }           
        });

        return response;        
    }
    
    // (future / contract) account function
    queryContractHistoricalOrders = async(filter: IqueryContractHistoricalOrdersOptions, authParams : IauthParams) => {
        const response = await this.request({
            page_num: filter.page_num,
            page_size: filter.page_size
        }, {
            'method': 'GET',
            'endPoint': 'private/order/list/history_orders',
            'marketType': 'CONTRACT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }
        });

        return response;      
    }

    getContractTransferRecords = async(filter: IqueryContractAssetTransferRecordsOptions, authParams : IauthParams) => {
        const response = await this.request({
            page_num: filter.page_num,
            page_size: filter.page_size
        }, {
            'method': 'GET',
            'endPoint': 'private/account/transfer_record',
            'marketType': 'CONTRACT',
            'auth': true,
            'cexData': {
                key: authParams.key,
                secret: authParams.secret
            }
        });

        return response;      
    }

    placeContractOrder = async(options: IplaceContractOrderOptions, authParams : IauthParams) => {
        try {
            const symbol = options.symbol.replace('/', '_');
            const side = options.side;
            const type = options.type;
            const openType = options.openType;
            /**
             * 
             * validSides
             * 1: open long
             * 2: close short
             * 3: open short
             * 4:  close
             * 
             * */
            const validSides = [1, 2, 3, 4];
            /**
             * 
             * validTypes
             * 1: Price limited order
             * 2: Post Only Maker
             * 3: Transact or cancel instantly 
             * 4: Transact completely or cancel completely
             * 5: Market orders
             * 6: Convert market price to current price
             * 
             * */
            const validTypes = [1, 2, 3, 4, 5, 6]; 
    
            /**
             * 
             * validOpenTypes
             * 1: isolated
             * 2: cross
             * 
             * */ 
            const validOpenTypes = [1, 2];
            
    
            if(!validSides.includes(side)){
                throw 'Invalid side parameter value.';
            }
    
            if(!validTypes.includes(type)){
                throw 'Invalid type parameter value.';
            }
    
            if(!validOpenTypes.includes(openType)){
                throw 'Invalid openType parameter value.';
            }
            
            let args = {
                symbol: symbol,
                price: options.price,
                vol: options.vol,
                leverage: options.leverage,
                side: side,
                type: type, 
                openType: openType,
                positionId: options.positionId,
                externalOid: options.externalOid,
                stopLossPrice: options.stopLossPrice,
                takeProfitPrice: options.takeProfitPrice
            };
    
            const response = await this.request(args, {
                'method': 'POST',
                'endPoint': 'private/order/submit',
                'marketType': 'CONTRACT',
                'auth': true,
                'cexData': {
                    key: authParams.key,
                    secret: authParams.secret
                }
            });
    
            return response;
        } catch(err){
            return err;
        }
    }

    assetsTransfer = async(filter: IassetTransferOptions, authParams : IauthParams) => {
        try {
            const validAccountTypes = ["MAIN", "CONTRACT"];
            
            if(!validAccountTypes.includes(filter.from)){
                throw 'Invalid from parameter value.';
            }
    
            if(!validAccountTypes.includes(filter.to)){
                throw 'Invalid to parameter value.';
            }
    
            const response = await this.request({
                currency: filter.currency,
                amount: filter.amount,
                from: filter.from,
                to: filter.to
            }, {
                'method': 'POST',
                'endPoint': 'asset/internal/transfer',
                'marketType': 'SPOT',
                'auth': true,
                'cexData': {
                    key: authParams.key,
                    secret: authParams.secret
                }
            });
    
            return response;         
        } catch(err){
            return err;
        }
    }


}


export {MexcRequest};