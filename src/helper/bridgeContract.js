import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';
import bridgeContractAbi from "../abis/bridgeContract.json";

const Logger = new ethers.utils.Logger(ethers.version);

class BridgeContract extends EventEmitter {
    
    constructor(web3, ownerAddress, contractAddress) {
        super();
        this.web3 = web3;
        this.ownerAddress = ownerAddress;
        this.contractAddress = contractAddress;
        
        try {
            this.contractInstance = new ethers.Contract(
                this.contractAddress,
                bridgeContractAbi,
                this.web3.getSigner(0)
            );
        } catch(error){
            console.error({
                BridgeContractError: error 
            });
        }
    }

    async sendTransaction(payload, value, to, txCb, receiptCb) {
        try {
            const gasPrice = await this.web3.getGasPrice();

            console.log((gasPrice).toString());
            
            const gasLimit = await this.web3.getSigner(0).estimateGas({
                // Wrapped ETH address
                to: to,              
                data: payload,
                value: web3Js.utils.toHex(value)
            });

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
                }).catch(error => {
                    console.error(error);
                    receiptCb(error);
                });
            }).catch(error => {
                console.error(error);
                receiptCb(error);
            });

            // try {
            //     // Wait for the transaction to be mined
            //     const receipt = await txResponse.wait();
            //     // The transactions was mined without issue
            //     //myProcessMinedTransaction(tx, receipt);
            //     receiptCb({tx, receipt});
            //   } catch (error) {
            //     if (error.code === Logger.errors.TRANSACTION_REPLACED) {
            //       if (error.cancelled) {
            //         // The transaction was replaced  :'(
            //         //myProcessCancelledTransaction(tx, error.replacement);
            //         receiptCb({tx, error: error.replacement});
            //     } else {
            //         // The user used "speed up" or something similar
            //         // in their client, but we now have the updated info
            //         //myProcessMinedTransaction(error.replacement, error.receipt);
            //         receiptCb({tx, error: error.receipt});
            //       }
            //     }
            // }

        } catch(error){
            console.error(error);
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
            const isContractExist = await this.isContractExist();
            // address will be valid etherium bridge address
            if(isContractExist){
                const response = await this.web3.getCode(address);
                if(response === '0x'){
                    receiptCb({
                        code: 'INVALID_TOKEN_ADDRESS',
                    });
                } else {
                    address = web3Js.utils.toHex(address);
                    address = address.slice(2);
                    var payload = `0xd48bfca7${this.pad32Bytes(address)}`;
                    await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
                }
            } else {
                receiptCb({
                    code: 'NOT_A_BRIDGE_CONTRACT',
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
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                console.log({
                    tokenAddress: tokenAddress,
                    chainId: chainId,
                    decimals: decimals,
                    name: name,
                    symbol: symbol,
                    sig: sig
                });
    
                let payload = ethers.utils.defaultAbiCoder.encode([ 
                    "address", 
                    "uint256", 
                    "uint256", 
                    "string", 
                    "string", 
                    "bytes[]" 
                ], [ 
                    tokenAddress,
                    Number(chainId),
                    Number(decimals),
                    name,
                    symbol,
                    [sig]
                ]);
    
                payload = payload.slice(2);
                payload = `0xa85c33cd${this.pad32Bytes(payload)}`;
    
                await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
            } else {
                receiptCb({
                    code: 'NOT_A_BRIDGE_CONTRACT',
                });
            }
        } catch (err){
            console.error({
                addWrappedTokenOnDestinationChain: err.message
            });
            return err;   
        }
    }

    async depositTokens(originalTokenAddress, amountToDepositInWei, toChainId, txCb, receiptCb){
        try {
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                const args = {
                    receiver: this.ownerAddress,
                    token: originalTokenAddress,
                    value: (amountToDepositInWei).toString(),
                    toChainId: Number(toChainId)
                };
    
                console.log(args);
    
                let payload = ethers.utils.defaultAbiCoder.encode([
                    "address",
                    "address",
                    "uint256",
                    "uint256"
                ], [
                    this.ownerAddress,
                    originalTokenAddress,
                    (amountToDepositInWei).toString(),
                    Number(toChainId)
                ]);
    
                payload = payload.slice(2);
                payload = `0x487cda0d${this.pad32Bytes(payload)}`;
    
                await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
            } else {
                receiptCb({
                    code: 'NOT_A_BRIDGE_CONTRACT',
                });
            }

        } catch (err){
            console.error({
               depositTokens: err.message
            });
            return err;   
        }
    }

    async claimToken(orignalToken, orignalChainId, txId, to, value, fromChainId, sig, txCb, receiptCb){
        try {
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                const args = {
                    orignalToken: orignalToken,
                    orignalChainId: orignalChainId,
                    txId: txId,
                    to: to,
                    value: value,
                    fromChainId: fromChainId,
                    sig: sig
                };
    
                console.log("claimToken args:", args);
    
                let payload = ethers.utils.defaultAbiCoder.encode([
                    "address", // orignalToken
                    "uint256", // orignalChainId
                    "bytes32", // txId
                    "address", // to
                    "uint256", // value
                    "uint256", // fromChainId
                    "bytes[]" // sig
                ], [
                    orignalToken,
                    orignalChainId,
                    txId,
                    to,
                    value,
                    fromChainId,
                    [sig]
                ]);
    
                payload = payload.slice(2);
                payload = `0x1c9499e8${this.pad32Bytes(payload)}`;
    
                await this.sendTransaction(payload, 0, this.contractAddress, txCb, receiptCb);
            } else {
                receiptCb({
                    code: 'NOT_A_BRIDGE_CONTRACT',
                });
            }
        } catch (err){
            console.error({
               claimToken: err.message
            });
            return err;   
        }        
    }
}


export default BridgeContract;