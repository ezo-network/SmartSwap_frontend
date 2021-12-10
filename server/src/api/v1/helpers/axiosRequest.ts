import axios from 'axios';
import { response } from 'express';
import { log, constants } from "../../../config";

const Config = {
    baseUrl: `http://${constants.SERVER_HOST}:${constants.SERVER_PORT}`,
};

export default class axiosRequest {

    static async request(args) {

        try {

            let path = `/${args.path}`;
            const url = `${Config.baseUrl}${path}`;
            let options = {
                method: args.method || 'GET',
                url,
                headers: {
                    'Accept': 'application/json'
                },
                data: null
            };
            for (let k in args.headers) {
                options.headers[k] = args.headers[k];
            }
            if (args.data) {
                options.data = args.data;
            }
            console.log(options);

            return await axios.request(options).then(response => {
                return response;
            }).catch(ex => {
                return ex.response;
            });

        } catch (error) {
            error['errorOrigin'] = args.hasOwnProperty('errorOrigin') ? args['errorOrigin'] : 'axiosRequest';
            return error;
        }
    }

}