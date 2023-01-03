import axiosRequest from './axiosRequest';
import CONSTANT from "../constants";

const SmartSwapApiHelper = {

    getNetworkList: async(cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.NATIVE_TOKENS.networks,
                cancelToken: cancelToken
            });

            if(result !== undefined){
                if(result.status === 200){
                    return {
                        response: result.data.data,
                        code: result.data.code,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: result.data.code,
                        error: result.data.error
                    }
                }
            }


        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }
    },

    getEstimateGasAndFees: async(fromChainId, toChainId, cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTSWAP_API_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTSWAP_API_INSTANCE('estimateGasAndFees', {
                    fromChainId: fromChainId,
                    toChainId: toChainId
                }),
                cancelToken: cancelToken
            });

            if(result !== undefined){
                if(result?.status === 200 && result?.data?.result){
                    return {
                        response: result?.data,
                        code: result.status,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: 422,
                        error: result?.data?.message
                    }
                }
            }


        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }
    },

    getEstimateProcessingFees: async(fromChainId, toChainId, cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTSWAP_API_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTSWAP_API_INSTANCE('estimatedProcessingFees', {
                    fromChainId: fromChainId,
                    toChainId: toChainId
                }),
                cancelToken: cancelToken
            });

            if(result !== undefined){
                if(result?.status === 200 && result?.data?.result){
                    return {
                        response: result?.data,
                        code: result.status,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: 422,
                        error: result?.data?.message
                    }
                }
            }


        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }
    },    

    getLedgerByAccountAddress: async(accountAddress, cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTSWAP_API_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTSWAP_API_INSTANCE('ledgerHistoryByAddress', {
                    accountAddress: accountAddress
                }),
                cancelToken: cancelToken
            });

            if(result !== undefined){
                if(result?.status === 200 && result?.data){
                    return {
                        response: result?.data,
                        code: result.status,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: 422,
                        error: result?.data?.message
                    }
                }
            }


        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }
    },  
    
    chainHopPriceQuoteApi: async(fromChainId, toChainId, amountToSwap, cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.NATIVE_TOKENS.chainHopPriceQuoteApi(fromChainId, toChainId, amountToSwap),
                cancelToken: cancelToken
            });

            if(result !== undefined){
                if(result?.status === 200 && result?.data){
                    return {
                        response: result?.data,
                        code: result.status,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: 422,
                        error: result?.data?.message
                    }
                }
            }


        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }
    },  

}


export default SmartSwapApiHelper;