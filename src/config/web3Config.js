import { utils } from 'web3';
import {
    EventEmitter
} from "events";
import dispatcher from "../dispatcher";
import { providers } from "ethers";


// const web3Provider = new WalletConnectProvider({
//     infuraId: "81e7625588484d45a3a3be76abbb2030", // Required
// });

class Web3Config extends EventEmitter {


    constructor() {
        super();
        this.web3 = null;
        this.netWorkId = 0;
        this.address = null;
    }

    //0 = metamask
    //1 = walletConnect 
    async connectWallet(type) {
        let web3;
        if (type === 0) {
            web3 = new providers.Web3Provider(window.ethereum);
            if (window.ethereum) {
                try {
                    await window.ethereum.enable();
                    this.web3 = web3;
                    await this.checkAccount();
                    return true;
                } catch (error) {

                }
            } else if (window.web3) {
                web3 = new providers.Web3Provider(window.currentProvider);
                this.web3 = web3;
                await this.checkAccount();
                return true;
            }

        }
        // else if(type === 1){
        //     await web3Provider.enable();
        //     const web3 = new providers.Web3Provider(web3Provider);
        //     this.web3 = web3;
        //     this.checkAccount();
        // }        
    }

    async checkAccount() {
        let web3 = this.web3;
        let address = await web3.listAccounts();
        let netWorkId = await web3.getNetwork();
        this.netWorkId = netWorkId.chainId;
        this.address = address[0];
        return address;
    }



    async enableWalletConnect() {

    }

    getAddress() {
        return this.address;
    }


    getNetworkId() {
        return this.netWorkId;
    }

    getWeb3() {
        return this.web3;
    }


    sendTransction(to, data, gasPrice, gasLimit, value, callback) {
        const tx = {
            to: to, // Required (for non contract deployments)
            data: data, // Required
            gasPrice: utils.toHex(gasPrice), // Optional
            gasLimit: utils.toHex(gasLimit), // Optional
            value: utils.toHex(value), // Optional
        };


        this.web3.getSigner(0).sendTransaction(tx).then(result => {
            callback(result, null);
        }).catch(error => {
            // Error returned when rejected
            console.error(error);
        });
    }


    handleActions(action) {
        switch (action.type) {}
    }

}


const web3Config = new Web3Config();
dispatcher.register(web3Config.handleActions.bind(web3Config));
export default web3Config;