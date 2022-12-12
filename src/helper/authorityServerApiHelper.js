import axiosRequest from './axiosRequest';
import CONSTANT from "../constants";

const AuthorityServerApiHelper = {
    getAuthoritySignature: async(depositTxHash, chainId) => {
        try {
            const result = await axiosRequest.request({
                hostType: CONSTANT.DEFAULT_AUTHORITY_SERVER,
                path: `auth?tx=${depositTxHash}&chain=${chainId}`,
                method: 'get'
            });

            console.table({
                hostType: CONSTANT.DEFAULT_AUTHORITY_SERVER,
                path: `auth?tx=${depositTxHash}&chain=${chainId}`,
                method: 'get'
            });


            // {
            //     "originalChainID": "5",
            //     "signature": "0x01366a5b3a912f1990d178d842f2b7ccaff8d4d5d66a242c621b5b0ec00c270043cfc6560fdedd0f51ece374c8731216dc7fcdb57f6c63a4132aac7c0a4bf5461c",
            //     "chainId": "80001",
            //     "originalToken": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            //     "to": "0x22a6a4Dd1eB834f62c43F8A4f58B7F6c1ED5A2F8",
            //     "bridge": "0xB0983e9B637836BAB164BAfE06Db19dfcFd5acde",
            //     "value": "5000000000000",
            //     "isSuccess": true
            // }

            if(result.status === 200){
                if(result.data.hasOwnProperty('isSuccess') === true && result.data.isSuccess === true){
                    return {
                        response: result.data,
                        code: result.status,
                        error: undefined
                    }
                } else {
                    return {
                        response: undefined,
                        code: 400,
                        error: result.data.message
                    }
                }
            } else {
                return {
                    response: undefined,
                    code: 400,
                    error: 'BAD REQUEST'
                }                
            } 
        } catch(error){
            // logMe('ERROR', {
            //     errorOrigin: 'getAuthoritySignature',
            //     error: error.message
            // });
        }
    },
}

export default AuthorityServerApiHelper;