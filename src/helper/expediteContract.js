import { EventEmitter } from "events";
import web3 from 'web3';
import { ethers } from 'ethers';
import swapFactoryAbi from "../abis/swapFactory.json";
import notificationConfig from "../config/notificationConfig";

const pad32Bytes = (data) => {
    var s = String(data);
    while (s.length < (64 || 2)) {
        s = "0" + s;
    }
    return s;
}   

class ExpediteContract extends EventEmitter {

    constructor(web3Provider, walletAddress, expediteContractAddress) {
        super();
        this.web3Provider = web3Provider;
        this.walletAddress = walletAddress;
        this.expediteContractAddress = expediteContractAddress;
        this.expediteContractInstance = new ethers.Contract(
            this.expediteContractAddress,
            swapFactoryAbi,
            this.web3Provider.getSigner(0)
        );

        console.log('expediteContract', this.expediteContractInstance);

    }

    sendTransaction = async(payload, value, to, txCb, receiptCb) => {
        try {
            const gasPrice = await this.web3Provider.getGasPrice();

            console.log((gasPrice).toString());
            
            const gasLimit = await this.web3Provider.getSigner(0).estimateGas({
                // Wrapped ETH address
                to: to,
                data: payload,
                value: web3.utils.toHex(value)
            });

            console.log({
                gasPrice: (gasPrice).toString(),
                gasLimit: (gasLimit).toString()
            });

            const tx = {
                to: to,
                data: payload,
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(gasLimit),
                value: web3.utils.toHex(value)
            };

            this.web3Provider.getSigner(0).sendTransaction(tx).then(result => {
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

        } catch(error){
            console.error(error);
            receiptCb(error);
        }
    }

    isContractExist = async() => {
        try {
            const response = await this.web3Provider.getCode(this.expediteContractAddress);
            if(response === '0x'){
                return false;
            } else {
                return true;
            }
        } catch(error){
            return false;
        }
    }

    expedite = async(txID, value, txCb, receiptCb) => {
        try {
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                console.log('Inside expedite func');
                let payload = ethers.utils.defaultAbiCoder.encode([
                    "bytes32" // txID
                ], [
                    txID
                ]);
    
                payload = payload.slice(2);
                payload = `0xabc810a4${pad32Bytes(payload)}`;
                                
                this.sendTransaction(payload, value.toString(), this.expediteContractAddress, txCb, receiptCb)
            } else {
                receiptCb({
                    code: 'NOT_A_EXPEDITE_CONTRACT',
                });
            }
        } catch(error){
            console.error("expedite", error.message)
            receiptCb(error)
        }
    }

}

export default ExpediteContract;