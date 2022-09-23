import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';
import bridgeContractAbi from "../abis/bridgeContract.json";
import web3Config from "../config/web3Config";


class BridgeContract extends EventEmitter {
    
    constructor(web3, contractAddress) {
        super();
        this.web3 = web3;
        this.contractAddress = contractAddress;

        this.contractInstance = new ethers.Contract(
            this.contractAddress,
            bridgeContractAbi,
            this.web3.getSigner(0)
        );
    }

    async sendTransaction(payload, value, to, txCb, receiptCb) {
        try {
            const gasPrice = await this.web3.getGasPrice();

            console.log(gasPrice);
            
            const gasLimit = await this.web3.estimateGas({
                // Wrapped ETH address
                to: to,              
                // `function deposit() payable`
                data: payload,
                value: web3Js.utils.toHex(value)
            });

            console.log(gasLimit);

            console.log({
                gasPrice: (gasPrice).toString(),
                gasLimit: (gasLimit).toString()
            });

            const tx = {
                to: to,
                data: payload,
                gasPrice: web3Js.utils.toHex(gasPrice),
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

        } catch(error){
            console.log(error);
            receiptCb(error);
        }
    }

    pad32Bytes(data) {
        var s = String(data);
        while (s.length < (64 || 2)) { s = "0" + s; }
        return s;
    }

    async isContractExist(){
        try {
            const response = await this.web3.getCode(this.contractAddress);
            if(response === '0x'){
                return false;
            } else {
                return true;
            }
        } catch(error){
            return false;
        }
    }

    async addTokenOnSourceChain(address, txCb, receiptCb){
        try {
            const isContractExist = await this.isContractExist(address);
            if(isContractExist){
                // address will be valid etherium bc address
                address = web3Js.utils.toHex(address);
                address = address.slice(2);
                var payload = `0xd48bfca7${this.pad32Bytes(address)}`;
                await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
            } else {
                receiptCb({
                    code: 'NOT_A_CONTRACT',
                });
            }
        } catch (error){
            receiptCb(error.message);
        }
    }

    handleActions(action) {
        switch (action.type) {}
    }

    async addWrappedTokenOnDestinationChain(tokenAddress, chainId, decimals, name, symbol, sig, txCb, receiptCb){
        try {

            console.log({
                tokenAddress: tokenAddress,
                chainId: chainId,
                decimals: decimals,
                name: name,
                symbol: symbol,
                sig: sig
            });

            // address will be valid etherium bc address
            tokenAddress = web3Js.utils.toHex(tokenAddress);
            tokenAddress = tokenAddress.slice(2);

            chainId = web3Js.utils.toHex(chainId);

            decimals = web3Js.utils.toHex(decimals);

            name = web3Js.utils.toHex(name);

            symbol = web3Js.utils.toHex(symbol);

            sig = sig.slice(2);
            sig = web3Js.utils.toHex([sig]);


            const payload = ethers.utils.defaultAbiCoder.encode([ 
                "address", 
                "uint256", 
                "uint256", 
                "string", 
                "string", 
                "bytes[]" 
            ], [ 
                tokenAddress,
                chainId,
                decimals,
                name,
                symbol,
                [sig]
            ]);

            await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
        } catch (error){
            console.log(error);
            return error;   
        }
    }
}


export default BridgeContract;