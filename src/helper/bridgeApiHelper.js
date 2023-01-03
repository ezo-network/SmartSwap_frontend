import axiosRequest from './axiosRequest';
import CONSTANT from '../constants';

const BridgeApiHelper = {

    getValidatorFileInfo: async () => {
        let response, error, code;
        try {
            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getValidatorFileInfo
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    isProjectExist: async (chainId = null, sourceTokenAddress = null, cancelToken) => {
        let response, error, code;
        try {
            if (chainId === null || sourceTokenAddress === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.isProjectExist + `?chainId=${chainId}&sourceTokenAddress=${sourceTokenAddress}`,
                cancelToken: cancelToken
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getProject: async (chainId = null, sourceTokenAddress = null, cancelToken) => {
        let response, error, code;
        try {
            if (chainId === null || sourceTokenAddress === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.project + `?chainId=${chainId}&tokenAddress=${sourceTokenAddress}`,
                cancelToken: cancelToken
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getValidator: async (walletAddress = null) => {
        let response, error, code;
        try {
            if (walletAddress === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getValidator + `?walletAddress=${walletAddress}`,
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    addValidator: async (walletAddress = null, validatorAddress = null) => {
        let response, error, code;
        try {
            if (walletAddress === null || validatorAddress === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.addValidator,
                method: "POST",
                data: {
                    walletAddress: walletAddress,
                    validatorAddress: validatorAddress
                }
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getBridge: async (chainId = null, cancelToken) => {
        let response, error, code;
        try {
            if (chainId === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.bridge + `?chainId=${chainId}`,
                cancelToken: cancelToken
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getBridges: async () => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.bridges,
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    createNewProject: async (creatorAddress = null, sourceToken = null, sourceTokenAddress = null, sourceChain = null, sourceChainId = null, decimals = null, txHash = null) => {
        let response, error, code;
        try {
            if (
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
            ) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.createNewProject,
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

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getWrappedTokens: async (projectId = null, creatorAddress = null, all = false, cancelToken) => {
        let response, error, code;
        try {

            let params = {};

            if (projectId !== null) {
                params['projectId'] = projectId
            }

            if (creatorAddress !== null) {
                params['creatorAddress'] = creatorAddress
            }

            params = '?' + new URLSearchParams(params);


            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getWappedTokens + params,
                cancelToken: cancelToken
            });

            if (result !== undefined) {
                if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getProjects: async (args = {}, cancelToken) => {
        let response, error, code;
        try {

            let params = {};

            if (args?.projectId) {
                params['projectId'] = args.projectId
            }

            if (args?.creatorAddress) {
                params['creatorAddress'] = args?.creatorAddress
            }

            if (args?.chainId) {
                params['chainId'] = args?.chainId
            }

            if (args?.tokenAddress) {
                params['tokenAddress'] = args?.tokenAddress
            }

            params = '?' + new URLSearchParams(params);


            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.projects + params,
                cancelToken: cancelToken
            });

            if (result !== undefined) {
                if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getNetworkList: async (cancelToken) => {
        let response, error, code;
        try {
            
            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.networks,
                cancelToken: cancelToken
            });

            if (result !== undefined) {
                if (result.status === 200) {
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


        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getTokenList: async (cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.tokens,
                cancelToken: cancelToken
            });

            if (result !== undefined) {
                if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    activateToken: async (sourceTokenchainId, sourceTokenAddedTxHash) => {
        let response, error, code;
        try {
            if (sourceTokenchainId === null || sourceTokenAddedTxHash === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.activateToken + `?chainId=${sourceTokenchainId}&txHash=${sourceTokenAddedTxHash}`,
            });

            if (result.status === 200) {
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
        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    attachWrapTokenOnProject: async (toChainId = null, txHash = null, blockNumber = null) => {
        let response, error, code;

        if (
            toChainId == null
            ||
            txHash == null
            ||
            blockNumber == null
        ) {
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
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.attachWrappedToken,
                method: 'POST',
                data: {
                    toChainId: toChainId,
                    txHash: txHash,
                    blockNumber: blockNumber
                }
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getEmailStatus: async (walletAddress = null, emailAddress = null) => {
        let response, error, code;
        try {

            let queryString = `?walletAddress=${walletAddress}`;

            if (walletAddress === null) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            if (emailAddress !== null) {
                queryString = queryString + `&emailAddress=${emailAddress}`;
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getEmailStatus + queryString,
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    addEmailAddress: async (walletAddress = null, emailAddress = null) => {
        let response, error, code;
        try {

            if (
                walletAddress === null
                ||
                emailAddress === null
            ) {
                error = 'mandatory parameters are missing';
                code = 422;
                return {
                    response,
                    error,
                    code
                }
            }

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.addEmailAddress,
                method: 'POST',
                data: {
                    walletAddress: (walletAddress).toLowerCase(),
                    emailAddress: (emailAddress).toLowerCase()
                }
            });

            if (result.status === 201) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },


    makeTransferWrapTokenOwnershipRequest: async (tokenSymbol = null, chain = null, chainId = null, requesterAddress = null, hashMessage = null) => {
        let response, error, code;

        if (
            tokenSymbol == null
            ||
            chain == null
            ||
            chainId == null
            ||
            requesterAddress == null
            ||
            hashMessage == null
        ) {
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
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.makeTransferWrapTokenOwnershipRequest,
                method: 'POST',
                data: {
                    token: tokenSymbol,
                    chain: chain,
                    chainId: chainId,
                    requesterAddress: requesterAddress,
                    hashMessage: hashMessage
                }
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    getOwnershipRequests: async (requesterAddress = null, status = null, token = null, chainId = null) => {
        let response, error, code;
        try {

            let params = {};

            if (requesterAddress !== null) {
                params['requesterAddress'] = requesterAddress
            }

            if (status !== null) {
                params['status'] = status
            }

            if (token !== null) {
                params['token'] = token
            }

            if (chainId !== null) {
                params['chainId'] = chainId
            }

            params = '?' + new URLSearchParams(params);

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getOwnershipRequests + params,
            });

            if (result.status === 200) {
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

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    addErc20Token: async (chainId = null, tokenAddress = null) => {
        let response, error, code;

        if (
            chainId == null
            ||
            tokenAddress == null
        ) {
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
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.addErc20Token,
                method: 'POST',
                data: {
                    chainId: chainId,
                    address: tokenAddress
                }
            });

            if (result.status === 201) {
                return {
                    response: result.data.data,
                    code: result.status,
                    error: undefined
                }
            } else {
                return {
                    response: undefined,
                    code: result.status,
                    error: result.data.error
                }
            }

        } catch (err) {
            error = err;
            code = 500;
        }

        return {
            response,
            error,
            code
        }
    },

    /** ledger */
    getDepositTokensHistoryByWalletAddress: async (walletAddress, fromChainId, isWrapTokenDeposit) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                hostType: CONSTANT.HOST_TYPES.SMARTEXCHANGE_DATABASE_INSTANCE,
                path: CONSTANT.API_ENDPOINTS.SMARTEXCHANGE_DATABASE_INSTANCE.BRIDGE_TOKENS.getDepositTokensHistoryByWalletAddress(walletAddress, fromChainId, isWrapTokenDeposit),
            });

            // console.log({
            //     result: result
            // });

            if (result.status === 200) {
                return {
                    response: result.data.data,
                    code: result.data.code,
                    error: ""
                }
            } else {
                return {
                    response: [],
                    code: result.data.code,
                    error: result.data.error
                }
            }

        } catch (err) {
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