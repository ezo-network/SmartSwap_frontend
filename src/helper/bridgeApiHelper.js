import axiosRequest from './axiosRequest';
const apiEndpoints = {
    'isProjectExist': 'customer/project-exist',
    'createNewProject': 'customer/create-project',
    'project': 'customer/project',
    'projects': 'customer/projects',
    'bridge': 'public/bridge',
    'getWappedTokens': 'customer/wrapped-tokens',
    'networks': 'public/networks',
    'tokens': 'public/tokens',
    'activateToken': 'customer/activate-token'
}

const BridgeApiHelper = {
    isProjectExist: async(chainId = null, sourceTokenAddress = null) => {
        let response, error, code;
        try {
            if(chainId === null || sourceTokenAddress === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.isProjectExist + `?chainId=${chainId}&sourceTokenAddress=${sourceTokenAddress}`,
            });

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
                    error: undefined
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

    getProject: async(chainId = null, sourceTokenAddress = null) => {
        let response, error, code;
        try {
            if(chainId === null || sourceTokenAddress === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.project + `?chainId=${chainId}&tokenAddress=${sourceTokenAddress}`,
            });

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

    getBridge: async(chainId = null) => {
        let response, error, code;
        try {
            if(chainId === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.bridge + `?chainId=${chainId}`,
            });

            if(result.status === 200){
                return {
                    response: result.data.data,
                    code: result.data.code,
                    error: undefined
                }
            } else {
                return {
                    response: undefined,
                    code: result.data,
                    error: undefined
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

    createNewProject: async(creatorAddress = null, sourceToken = null, sourceTokenAddress = null, sourceChain = null, sourceChainId = null, txHash = null) => {
        let response, error, code;
        try {
            if(
                creatorAddress === null 
                || 
                sourceToken === null
                || 
                sourceTokenAddress === null
                || 
                sourceChain === null
                || 
                sourceChainId === null
                ||
                txHash === null
            ){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.createNewProject,
                method: "POST",
                data: {
                    creatorAddress: creatorAddress,
                    sourceToken: sourceToken,
                    sourceTokenAddress: sourceTokenAddress,
                    sourceChain: sourceChain,
                    sourceChainId: sourceChainId,
                    txHash: txHash
                }
            });

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

    getWrappedTokens: async(projectId = null) => {
        let response, error, code;
        try {

            if(projectId === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.getWappedTokens + `?projectId=${projectId}`,
            });

            if(result.status === 200){
                return {
                    response: result.data.data,
                    code: result.data.code,
                    error: undefined
                }
            } else {
                return {
                    response: undefined,
                    code: result.data,
                    error: undefined
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

    getNetworkList: async() => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                path: apiEndpoints.networks,
            });

            if(result.status === 200){
                return {
                    response: result.data.data,
                    code: result.data.code,
                    error: undefined
                }
            } else {
                return {
                    response: undefined,
                    code: result.data,
                    error: undefined
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

    getTokenList: async() => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                path: apiEndpoints.tokens,
            });
            
            if(result.status === 200){
                return {
                    response: result.data.data,
                    code: result.data.code,
                    error: undefined
                }
            } else {
                return {
                    response: undefined,
                    code: result.data,
                    error: undefined
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

    activateToken: async(sourceTokenchainId, sourceTokenAddedTxHash) => {
        let response, error, code;
        try { 
            if(sourceTokenchainId === null || sourceTokenAddedTxHash === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.activateToken + `?chainId=${sourceTokenchainId}&txHash=${sourceTokenAddedTxHash}`,
            });

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

    attachWrapTokenOnProject: async(projectId, tokenName, chain, chainId) => {
        let response, error, code;

        if(
            projectId == null
            ||
            tokenName == null
            ||
            chain == null
            ||
            chainId == null
        ){
            error = 'mandatory parameters are missing';
            code = 422;
            return {
                response, 
                error,
                code
            }
        }

        try { 

        } catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }    
    }
}


export default BridgeApiHelper;