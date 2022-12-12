import axios from 'axios';
import CONSTANT from "../constants";

export default class axiosRequest {

    static async request(args) {

        try {
            const path = `/${args.path}`;
            const url = `${args.hostType}${path}`;
            let options = {
                method: args.method || 'GET',
                url,
                headers: {
                    'Accept': 'application/json'
                },
                data: null,
                cancelToken: args.cancelToken
            };
            for (let k in args.headers) {
                options.headers[k] = args.headers[k];
            }
            if (args.data) {
                options.data = args.data;
            }

            return await axios.request(options).then(response => {
                return response;
            }).catch(ex => {
                if (axios.isCancel(ex)) {
                    console.log('Request canceled', ex.message, url);
                } else {
                    // handle error
                    return ex.response;
                }
            });

        } catch (error) {
            error['errorOrigin'] = args.hasOwnProperty('errorOrigin') ? args['errorOrigin'] : 'axiosRequest';
            return error;
        }
    }

}