import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';
// import fetch from 'node-fetch';
import swapFactoryAbi from "../abis/swapFactory.json";
import constantConfig from "../config/constantConfig";
import web3Config from "../config/web3Config";

class SwapFactoryContractPairWise extends EventEmitter {

    constructor(web3, tokenASymbol, tokenBSymbol, component = "") {
        super();
        this.web3 = web3;
        this.swapFactoryAddress = constantConfig.getSmartswapContractAddressByPairs(tokenASymbol, tokenBSymbol);
        this.component = component;
        this.swapFactoryInstance = new ethers.Contract(
            this.swapFactoryAddress,
            swapFactoryAbi,
            this.web3.getSigner(0)
        );

        console.log({
            swapFactoryAddress : this.swapFactoryAddress,
            tokenASymbol: tokenASymbol,
            tokenBSymbol: tokenBSymbol
        });
    }

    async sendTransaction(payload, value, gasLimit, to, txCb, receiptCb) {
        let gasPrice = "0";
        if (web3Config.getNetworkId() === process.env.REACT_APP_BSC_CHAIN_ID)
            gasPrice = "20";
        else if (web3Config.getNetworkId() === process.env.REACT_APP_ETH_CHAIN_ID)
            gasPrice = "30";
        else {
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }
        console.log(value)
        const tx = {
            to: to,
            data: payload,
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice, "gwei")),

            value: web3Js.utils.toHex(value)
        };

        // gasLimit: web3Js.utils.toHex(gasLimit),

        console.log("EstimateGas : ")
        try {
            console.log((await this.web3.getSigner(0).estimateGas(tx))._hex)
            tx['gasLimit'] = (await this.web3.getSigner(0).estimateGas(tx))._hex
        } catch (e) {
            tx['gasLimit'] = '0x186A0'
        }

        this.web3.getSigner(0).sendTransaction(tx).then(result => {
            txCb(result.hash)
            result.wait().then(async (receipt) => {
                receiptCb(receipt);
            })
        }).catch(error => {
            console.log(error);

            if (this.component === "LiquidityProvider") {
                if (error.code === 4001) {
                    //user rejected the transaction
                    console.log('user rejected the transaction to become swap provider')
                    receiptCb(error);
                }
            }
        });
    }

    pad32Bytes(data) {
        var s = String(data);
        while (s.length < (64 || 2)) { s = "0" + s; }
        return s;
    }

    async addSwapProvider(nativeToken, foreignToken, nativeTokenReceiver, foreignTokenReceiver, feeAmountLimit, txCb, receiptCb) {
        let _nativeToken = nativeToken.replace("0x", "");
        let _foreignToken = foreignToken.replace("0x", "");
        let _nativeTokenReceiver = nativeTokenReceiver.replace("0x", "");
        let _foreignTokenReceiver = foreignTokenReceiver.replace("0x", "");
        let _feeAmountLimit = web3Js.utils.toHex(web3Js.utils.toWei((feeAmountLimit).toString()));
        _feeAmountLimit = _feeAmountLimit.replace("0x", "");

        var payload = `0xd104451a${this.pad32Bytes(_nativeToken)}${this.pad32Bytes(_foreignToken)}${this.pad32Bytes(_nativeTokenReceiver)}${this.pad32Bytes(_foreignTokenReceiver)}${this.pad32Bytes(_feeAmountLimit)}`;
        console.log(payload);
        console.log(this.swapFactoryAddress);

        return await this.sendTransaction(payload, 0, "400680", this.swapFactoryAddress, txCb, receiptCb);
    }

    handleActions(action) {
        switch (action.type) { }
    }

}





export default SwapFactoryContractPairWise;