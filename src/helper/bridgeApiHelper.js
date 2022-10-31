import axiosRequest from './axiosRequest';
const apiEndpoints = {
    'isProjectExist': 'customer/project-exist',
    'createNewProject': 'customer/create-project',
    'project': 'customer/project',
    'projects': 'customer/projects',
    'bridge': 'public/bridge',
    'bridges': 'public/bridges',
    'getWappedTokens': 'customer/wrapped-tokens',
    'networks': 'public/networks',
    'tokens': 'public/tokens',
    'activateToken': 'customer/activate-token',
    'attachWrappedToken': 'customer/attach-wrap-token',
    'getEmailStatus': 'customer/get-email-status',
    'addEmailAddress': 'customer/add-email-address',
    'getValidatorFileInfo': 'public/validator-file-info',
    'makeTransferWrapTokenOwnershipRequest': 'customer/transfer-wrap-token-ownership-request',
    'addValidator': 'customer/add-validator',
    'getValidator': 'customer/get-validator',
    'getOwnershipRequests': 'public/ownership-requests'
}

const BridgeApiHelper = {
    
    getValidatorFileInfo: async() => {
        let response, error, code;
        try {
            const result = await axiosRequest.request({
                path: apiEndpoints.getValidatorFileInfo
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

    getValidator: async(walletAddress = null) => {
        let response, error, code;
        try {
            if(walletAddress === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.getValidator + `?walletAddress=${walletAddress}`,
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

        }  catch(err){
            error = err;
            code = 500;
        }

        return {
            response, 
            error,
            code
        }      
    },

    addValidator: async(walletAddress = null, validatorAddress = null) => {
        let response, error, code;
        try {
            if(walletAddress === null || validatorAddress === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.addValidator,
                method: "POST",
                data: {
                    walletAddress: walletAddress,
                    validatorAddress: validatorAddress
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

        }  catch(err){
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

    getBridges: async() => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                path: apiEndpoints.bridges,
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

    createNewProject: async(creatorAddress = null, sourceToken = null, sourceTokenAddress = null, sourceChain = null, sourceChainId = null, decimals = null, txHash = null) => {
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
                decimals === null
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
                    decimals: decimals,
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

    getWrappedTokens: async(projectId = null, creatorAddress = null, all = false) => {
        let response, error, code;
        try {

            let params = {};

            if(projectId !== null){
                params['projectId'] = projectId
            }

            if(creatorAddress !== null){
                params['creatorAddress'] = creatorAddress
            }

            params =  '?' + new URLSearchParams(params);
            

            const result = await axiosRequest.request({
                path: apiEndpoints.getWappedTokens + params,
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

    attachWrapTokenOnProject: async(toChainId = null, txHash = null, blockNumber = null) => {
        let response, error, code;

        if(
            toChainId == null
            ||
            txHash == null
            ||
            blockNumber == null
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
            const result = await axiosRequest.request({
                path: apiEndpoints.attachWrappedToken,
                method: 'POST',
                data: {
                    toChainId: toChainId,
                    txHash: txHash,
                    blockNumber: blockNumber
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

    getEmailStatus: async(walletAddress = null, emailAddress = null) => {
        let response, error, code;
        try {

            let queryString = `?walletAddress=${walletAddress}`;

            if(walletAddress === null){
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response, 
                    error,
                    code
                }
            }

            if(emailAddress !== null){
                queryString = queryString + `&emailAddress=${emailAddress}`;
            }

            const result = await axiosRequest.request({
                path: apiEndpoints.getEmailStatus + queryString,
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

    addEmailAddress: async(walletAddress = null, emailAddress = null) => {
        let response, error, code;
        try {

            if(
                walletAddress === null
                || 
                emailAddress === null
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
                path: apiEndpoints.addEmailAddress,
                method: 'POST',
                data: {
                    walletAddress: (walletAddress).toLowerCase(),
                    emailAddress: (emailAddress).toLowerCase()
                }
            });

            if(result.status === 201){
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


    makeTransferWrapTokenOwnershipRequest: async(tokenSymbol = null, chain = null, chainId = null, requesterAddress = null, hashMessage = null) => {
        let response, error, code;

        if(
            tokenSymbol == null
            ||
            chain == null
            ||
            chainId == null
            ||
            requesterAddress == null
            ||
            hashMessage == null
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
            const result = await axiosRequest.request({
                path: apiEndpoints.makeTransferWrapTokenOwnershipRequest,
                method: 'POST',
                data: {
                    token: tokenSymbol,
                    chain: chain,
                    chainId: chainId,
                    requesterAddress: requesterAddress,
                    hashMessage: hashMessage
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

    getOwnershipRequests: async(requesterAddress = null, status = null, token = null, chainId = null) => {
        let response, error, code;
        try {

            let params = {};

            if(requesterAddress !== null){
                params['requesterAddress'] = requesterAddress
            }

            if(status !== null){
                params['status'] = status
            }

            if(token !== null){
                params['token'] = token
            }

            if(chainId !== null){
                params['chainId'] = chainId
            }

            params =  '?' + new URLSearchParams(params);
            
            const result = await axiosRequest.request({
                path: apiEndpoints.getOwnershipRequests + params,
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

}


export default BridgeApiHelper;