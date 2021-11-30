import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';

import frozenTokenAbi from "../abis/frozenTokenAbi.json";
import gateWayAbi from "../abis/gateWayAbi.json";
import constantConfig from "../config/constantConfig";
var BigNumber = require('big-number');

// const ADRESS_ONE = "0x0000000000000000000000000000000000000001";
// const ADRESS_TWO = "0x0000000000000000000000000000000000000002";

class FrozenContract extends EventEmitter {

    constructor(web3,networkId) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        this.frozenAddress = constantConfig[networkId].frozenTokenContract;
        this.gateWayAddress = constantConfig[networkId].tokenGateWay; 
        this.frozenInstance = new ethers.Contract(
            this.frozenAddress,
            frozenTokenAbi,
            web3.getSigner(0)
        );
        this.gateWayInstance = new ethers.Contract(
            this.gateWayAddress,
            gateWayAbi,
            web3.getSigner(0)
        );
    }

    async makeTxUrl(){
        
    }

    async getPrice(){
        let price = await this.frozenInstance.getNativePrice();
        return web3Js.utils.fromWei(price._hex,"gwei");
    }

    async getBalance(userAddress){
        let balance = await this.frozenInstance.balanceOf(userAddress);
        return web3Js.utils.fromWei(balance._hex);
    }

    async getApprovedTokenForGateWay(userAddress){
        let balance = await this.frozenInstance.allowance(userAddress,this.gateWayAddress);
        return web3Js.utils.fromWei(balance._hex);
    }
    
    async approveTokenForGateWay(txCb,receiptCb){
        let highApproval = web3Js.utils.toWei("10000000000000");
        let payload = await this.frozenInstance.populateTransaction.approve(this.gateWayAddress,highApproval);
        this.sendTransaction(payload.data,0,"150000",txCb,receiptCb);
    }

    async sendTransaction(payload,value,gasLimit,txCb,receiptCb,to=this.frozenAddress){
        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97)
            gasPrice = "20";
        else{
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            gasPrice = (json.fast/10).toString();
        }

        const tx = {
            to: to, 
            data: payload, 
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice,"gwei")), 
            gasLimit:web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(value)
        };

        this.web3.getSigner(0).sendTransaction(tx).then(result => {
            txCb(result.hash)
            result.wait().then(async (receipt)=>{
                receiptCb(receipt);
            })
        }).catch(error => {
            console.log(error);
        });
    }

    async unFreezeToken(tokenAmount,txCb,receiptCb){
        let payload = await this.frozenInstance.populateTransaction.withdraw(tokenAmount);
        let fee = await this.frozenInstance.getWithdrawFee(tokenAmount);
        fee = web3Js.utils.hexToNumberString(fee._hex);
        this.sendTransaction(payload.data,fee,"350000",txCb,receiptCb)
    }

    async ConvertToken(tokenB,networkId,tokenAmount,txCb,receiptCb){
        let withDrawfee = await this.frozenInstance.getWithdrawFee(tokenAmount);
        withDrawfee = web3Js.utils.hexToNumber(withDrawfee._hex);
        let crosschainfee = await this.gateWayInstance.crosschainfee();
        crosschainfee = web3Js.utils.hexToNumber(crosschainfee._hex);
        console.log(crosschainfee)
        let totalFee = BigNumber(withDrawfee).plus(crosschainfee);
        totalFee = totalFee.toString();
        console.log(totalFee)
        let payload = await this.gateWayInstance.populateTransaction.convert(this.frozenAddress,tokenB,networkId,tokenAmount,true);
        this.sendTransaction(payload.data,totalFee,"800000",txCb,receiptCb,this.gateWayAddress);
    }

    async getFrozenToken(value,txCb,receiptCb){
        this.sendTransaction('0x',value,"250000",txCb,receiptCb)
    }


    handleActions(action) { 
        switch (action.type) { }
    }

}





export default FrozenContract;