import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';

import swapFactoryAbi from "../abis/swapFactory.json";
import tokenAbi from "../abis/tokenAbi.json";
import constantConfig from "../config/constantConfig";
import web3Config from "../config/web3Config";
var BigNumber = require('big-number');

// const ADRESS_ONE = "0x0000000000000000000000000000000000000001";
// const ADRESS_TWO = "0x0000000000000000000000000000000000000002";

class SwapFactoryContract extends EventEmitter {

    constructor(web3, networkId, component="") {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        this.swapFactoryAddress = constantConfig[networkId].swapFactoryContract;
        this.component = component;

        this.swapFactoryInstance = new ethers.Contract(
            this.swapFactoryAddress,
            swapFactoryAbi,
            web3.getSigner(0)
        );

        // this.JNTRTokenInstance = new ethers.Contract(
        //     "0x1350044d6a653E87Ed3384DC1D2f6b1A7F138e0A",
        //     tokenAbi,
        //     web3.getSigner(0)
        // );

        // this.JNTRETokenInstance = new ethers.Contract(
        //     "0x40a99d086d517f06f9d1ed564f51ef75b8f7f042",
        //     tokenAbi,
        //     web3.getSigner(0)
        // );

        // this.JNTRBTokenInstance = new ethers.Contract(
        //     "0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",
        //     tokenAbi,
        //     web3.getSigner(0)
        // );
    }

    async sendTransaction(payload, value, gasLimit, to, txCb, receiptCb) {
        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97)
            gasPrice = "20";
        else if (this.networkId === 42)
            gasPrice = "30";
        else {
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }

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

            if(this.component == "LiquidityProvider"){
                if (error.code === 4001){
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

    async swap(tokenA, tokenB, amount, swapAmount, fee, licenseeAddress, txCb, receiptCb) {
        let amountNew = (Number(amount) + Number(fee.totalFees)).toString();

        let receiver = web3Config.getAddress();
        let licensee = licenseeAddress;
        let fees = web3Js.utils.toHex(((Number(fee.companyFees) + Number(fee.reimbursementFees)) * 10 ** 18).toFixed()).replace("0x", "");

        let newamount = web3Js.utils.toHex(swapAmount).replace("0x", "");
        tokenA = tokenA.replace("0x", "");
        tokenB = tokenB.replace("0x", "");
        receiver = receiver.replace("0x", "");
        licensee = licensee.replace("0x", "");

        var payload = `0xe0e45f0e${this.pad32Bytes(tokenA)}${this.pad32Bytes(tokenB)}${this.pad32Bytes(receiver)}${this.pad32Bytes(newamount)}${this.pad32Bytes(licensee)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(fees)}`
        this.sendTransaction(payload, amountNew, "270000", this.swapFactoryAddress, txCb, receiptCb)
    }

    async addSwapProvider(nativeToken, foreignToken, nativeTokenReceiver, foreignTokenReceiver, feeAmountLimit, txCb, receiptCb) {
        let _nativeToken = nativeToken.replace("0x", "");
        let _foreignToken = foreignToken.replace("0x", "");
        let _nativeTokenReceiver = nativeTokenReceiver.replace("0x", "");
        let _foreignTokenReceiver = foreignTokenReceiver.replace("0x", "");
        let _feeAmountLimit = web3Js.utils.toHex(web3Js.utils.toWei((feeAmountLimit).toString()));
        _feeAmountLimit = _feeAmountLimit.replace("0x", "");

        var payload = `0xd104451a${this.pad32Bytes(_nativeToken)}${this.pad32Bytes(_foreignToken)}${this.pad32Bytes(_nativeTokenReceiver)}${this.pad32Bytes(_foreignTokenReceiver)}${this.pad32Bytes(_feeAmountLimit)}`
        console.log(payload);
        console.log(this.swapFactoryAddress);

        return await this.sendTransaction(payload, 0, "400680", this.swapFactoryAddress, txCb, receiptCb)
        // .then(tx => {
        //     //do whatever you want with tx
        //     console.log({
        //         addSwapProviderTx: tx
        //     });
        // }).catch(e => {
        //      if (e.code === 4001){
        //          //user rejected the transaction
        //          console.log('user rejected the transaction')
        //      } 
        // });
    }

    async estimateSwapGasFee(tokenA, tokenB, amount, swapAmount, fee, licenseeAddress, gasLimit, estGasCb) {
        let amountNew = (Number(amount) + Number(fee.totalFees)).toString();

        let receiver = web3Config.getAddress();
        let licensee = licenseeAddress;

        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97)
            gasPrice = "20";
        else if (this.networkId === 42)
            gasPrice = "30";
        else {
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }
        console.log(swapAmount)
        let newamount = web3Js.utils.toHex(swapAmount).replace("0x", "");
        tokenA = tokenA.replace("0x", "");
        tokenB = tokenB.replace("0x", "");
        receiver = receiver.replace("0x", "");
        licensee = licensee.replace("0x", "");

        let fees = web3Js.utils.toHex(((Number(fee.companyFees) + Number(fee.reimbursementFees)) * 10 ** 18).toFixed()).replace("0x", "");
        var payload = `0xe0e45f0e${this.pad32Bytes(tokenA)}${this.pad32Bytes(tokenB)}${this.pad32Bytes(receiver)}${this.pad32Bytes(newamount)}${this.pad32Bytes(licensee)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(fees)}`

        const tx = {
            to: this.swapFactoryAddress,
            data: payload,
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice, "gwei")),
            gasLimit: web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(amountNew)
        };

        this.web3.getSigner(0).estimateGas(tx).then(result => {
            let estGasEth = web3Js.utils.fromWei((web3Js.utils.toDecimal(result) * web3Js.utils.toWei(gasPrice, "gwei")).toString());
            estGasCb(estGasEth);
        }).catch(error => {
            console.log(error);
        });
    }

    async approveJNTRTokenForSwapFactory(tokenAddress, swapFactoryAddress, txCb, receiptCb) {

        let web3 = this.web3;

        this.tokenInstance = new ethers.Contract(
            tokenAddress,
            tokenAbi,
            web3.getSigner(0)
        );

        let highApproval = web3Js.utils.toWei("10000000000000");
        let payload = await this.tokenInstance.populateTransaction.approve(swapFactoryAddress, highApproval);
        this.sendTransaction(payload.data, 0, "150000", tokenAddress, txCb, receiptCb);

    }

    handleActions(action) {
        switch (action.type) { }
    }

}





export default SwapFactoryContract;