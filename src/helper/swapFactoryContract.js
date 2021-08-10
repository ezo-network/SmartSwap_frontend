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

    constructor(web3, networkId) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        this.swapFactoryAddress = constantConfig[networkId].swapFactoryContract;

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
            gasLimit: web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(value)
        };

        this.web3.getSigner(0).sendTransaction(tx).then(result => {
            txCb(result.hash)
            result.wait().then(async(receipt) => {
                receiptCb(receipt);
            })
        }).catch(error => {
            console.log(error);
        });
    }

    pad32Bytes(data) {
        var s = String(data);
        while (s.length < (64 || 2)) { s = "0" + s; }
        return s;
    }

    async swap(tokenA, tokenB, amount, swapAmount, fee, txCb, receiptCb) {
        // let fee = await this.swapFactoryInstance.processingFee();
        // let fee = web3Js.utils.toWei(0.1);
        // fee = web3Js.utils.hexToNumberString(fee._hex);
        // amount = BigNumber(amount).add(fee);
        // amount = amount.toString();

        console.log(amount)
        console.log(swapAmount)
        console.log(fee)

        console.log((Number(amount) + Number(fee)).toString())
        let amountNew = (Number(amount) + Number(fee)).toString();

        let receiver = web3Config.getAddress();
        let licensee = "0x0000000000000000000000000000000000000000";
        let isInvestment = false;
        let minimumAmountToClaim = 0;
        let limitPice = 0;

        let newamount = web3Js.utils.toHex(swapAmount).replace("0x", "");
        tokenA = tokenA.replace("0x", "");
        tokenB = tokenB.replace("0x", "");
        receiver = receiver.replace("0x", "");
        licensee = licensee.replace("0x", "");
        // var encodeABI = `${pad32Bytes(requestId)}${pad32Bytes(price)}`;

        var payload = `0x653c3c8f${this.pad32Bytes(tokenA)}${this.pad32Bytes(tokenB)}${this.pad32Bytes(receiver)}${this.pad32Bytes(newamount)}${this.pad32Bytes(licensee)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}`

        // let payload = `0xdf791e50${this.pad32Bytes(tokenA)}${this.pad32Bytes(tokenB)}${this.pad32Bytes(newamount)}`;

        // let payload = await this.swapFactoryInstance.populateTransaction.swap(tokenA, tokenB, receiver, swapAmount, licensee, isInvestment, minimumAmountToClaim, limitPice);
        console.log(payload)
        this.sendTransaction(payload, amountNew, "120000", this.swapFactoryAddress, txCb, receiptCb)
    }

    async addSwapProvider(nativeToken, foreignToken, nativeTokenReceiver, foreignTokenReceiver, feeAmountLimit, txCb, receiptCb) {
        let _nativeToken = nativeToken.replace("0x", "");
        let _foreignToken = foreignToken.replace("0x", "");
        let _nativeTokenReceiver = nativeTokenReceiver.replace("0x", "");
        let _foreignTokenReceiver = foreignTokenReceiver.replace("0x", "");
        let _feeAmountLimit = web3Js.utils.toBN(web3Js.utils.toWei((feeAmountLimit).toString()));

        var payload = `0xd104451a${this.pad32Bytes(_nativeToken)}${this.pad32Bytes(_foreignToken)}${this.pad32Bytes(_nativeTokenReceiver)}${this.pad32Bytes(_foreignTokenReceiver)}${this.pad32Bytes(_feeAmountLimit)}`
        console.log(payload);
        console.log(this.swapFactoryAddress);

        this.sendTransaction(payload, 0, "400680", this.swapFactoryAddress, txCb, receiptCb)
    }

    async estimateSwapGasFee(tokenA, tokenB, amount, swapAmount, fee, gasLimit, estGasCb) {
        // let fee = await this.swapFactoryInstance.processingFee();
        // fee = web3Js.utils.hexToNumberString(fee._hex);
        // amount = BigNumber(amount).add(fee);
        // amount = amount.toString();

        let amountNew = (Number(amount) + Number(fee)).toString();

        let receiver = web3Config.getAddress();
        let licensee = "0x0000000000000000000000000000000000000000";

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
        // var encodeABI = `${pad32Bytes(requestId)}${pad32Bytes(price)}`;

        var payload = `0x653c3c8f${this.pad32Bytes(tokenA)}${this.pad32Bytes(tokenB)}${this.pad32Bytes(receiver)}${this.pad32Bytes(newamount)}${this.pad32Bytes(licensee)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}${this.pad32Bytes(0)}`

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

    // async approveJNTRTokenForSwapFactory(txCb,receiptCb){
    //     let highApproval = web3Js.utils.toWei("10000000000000");
    //     let payload = await this.JNTRTokenInstance.populateTransaction.approve("0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",highApproval);
    //     this.sendTransaction(payload.data,0,"150000",txCb,receiptCb);
    // }

    // async approveJNTRETokenForSwapFactory(txCb,receiptCb){
    //     let highApproval = web3Js.utils.toWei("10000000000000");
    //     let payload = await this.JNTRETokenInstance.populateTransaction.approve("0xeaf41806fcc2a3893a662dbba7a111630f9f6704",highApproval);
    //     this.sendTransaction(payload.data,0,"150000",txCb,receiptCb);
    // }

    // async approveJNTRBTokenForSwapFactory(txCb,receiptCb){
    //     let highApproval = web3Js.utils.toWei("10000000000000");
    //     let payload = await this.JNTRBTokenInstance.populateTransaction.approve("0x001667842cc59cadb0a335bf7c7f77b3c75f41c2",highApproval);
    //     this.sendTransaction(payload.data,0,"150000",txCb,receiptCb);
    // }


    handleActions(action) {
        switch (action.type) {}
    }

}





export default SwapFactoryContract;