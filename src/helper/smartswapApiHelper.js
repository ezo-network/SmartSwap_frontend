import axiosRequest from './axiosRequest';
const apiEndpoints = {
    'networks': 'public/active-smartswap-networks'
}

const SmartswapApiHelper = {

    getNetworkList: async(cancelToken) => {
        let response, error, code;
        try {

            const result = await axiosRequest.request({
                path: apiEndpoints.networks,
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
    }

}


export default SmartswapApiHelper;