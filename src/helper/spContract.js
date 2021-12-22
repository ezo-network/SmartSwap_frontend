import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';
import spContractAbi from "../abis/spContract.json";


class SPContract extends EventEmitter {

    constructor(web3, networkId, contractAddress) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        this.contractAddress = contractAddress;

        this.spContractInstance = new ethers.Contract(
            this.contractAddress,
            spContractAbi,
            web3.getSigner(0)
        );

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
            receiptCb(error);
        });
    }

    pad32Bytes(data) {
        var s = String(data);
        while (s.length < (64 || 2)) { s = "0" + s; }
        return s;
    }

    async setFeeAmountLimit(amount, txCb, receiptCb) {
        amount = web3Js.utils.toWei((amount).toString());
        amount = web3Js.utils.toHex(amount);
        amount = amount.slice(2);
        var payload = `0x8c90c121${this.pad32Bytes(amount)}`
        console.log(payload);
        console.log(this.contractAddress);
        this.sendTransaction(payload, 0, "120000", this.contractAddress, txCb, receiptCb)
    }

    async withdraw(address, amount, txCb, receiptCb){

        // amount in wei, address will be valid etherium bc address

        address = web3Js.utils.toHex(address);
        address = address.slice(2);

        amount = web3Js.utils.toHex(amount);
        amount = amount.slice(2);

        var payload = `0xf3fef3a3${this.pad32Bytes(address)}${this.pad32Bytes(amount)}`
        console.log(payload);
        console.log(this.contractAddress);
        this.sendTransaction(payload, 0, "120000", this.contractAddress, txCb, receiptCb)        
    }

    async getFeeAmountLimit(txCb, receiptCb) {
        //this.sendTransaction(payload, 0, "120000", this.contractAddress, txCb, receiptCb)
    }

    handleActions(action) {
        switch (action.type) {}
    }

}


export default SPContract;