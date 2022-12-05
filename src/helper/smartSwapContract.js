import { EventEmitter } from "events";
import web3 from 'web3';
import { ethers } from 'ethers';
import swapFactoryAbi from "../abis/swapFactory.json";
import notificationConfig from "../config/notificationConfig";
var BigNumber = require('big-number');

const pad32Bytes = (data) => {
    var s = String(data);
    while (s.length < (64 || 2)) {
        s = "0" + s;
    }
    return s;
}   

class SmartSwapContract extends EventEmitter {

    constructor(web3Provider, walletAddress, smartSwapContractAddress) {
        super();
        this.web3Provider = web3Provider;
        this.walletAddress = walletAddress;
        this.smartSwapContractAddress = smartSwapContractAddress;
        this.smartSwapContractInstance = new ethers.Contract(
            this.smartSwapContractAddress,
            swapFactoryAbi,
            this.web3Provider.getSigner(0)
        );

        console.log('SmartSwapContract', this.smartSwapContractInstance);

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

    swap = async(tokenA, tokenB, amountA, value, fee, licenseeAddress, txCb, receiptCb) => {
        try {
            console.log('Inside swap func');
            // amountA = amountToSwap
            // value = amountToSwap + totalFee (processingFee + companyFees + reimbursementFees)
            // fees = companyFees + reimbursementFees 

            // const swap = web3.utils.toHex(value).replace("0x", "");

            // tokenA = tokenA.replace("0x", "");
            // console.log('tokenA', tokenA);
    
            // tokenB = tokenB.replace("0x", "");
            // console.log('tokenB', tokenB);
            
            // amountA = web3.utils.toHex(amountA).replace("0x", "");
            // console.log('amountA', amountA);
    
            // fee = web3.utils.toHex(fee).replace("0x", "");
            // console.log('fee', fee);
    
            // const receiver = this.walletAddress.replace("0x", "");
            // console.log('receiver', receiver);
    
            // licenseeAddress = licenseeAddress.replace("0x", "");
            // console.log('licenseeAddress', licenseeAddress);
    
            // var payload = `0xe0e45f0e${pad32Bytes(swap)}${pad32Bytes(tokenA)}${pad32Bytes(tokenB)}${pad32Bytes(receiver)}${pad32Bytes(amountA)}${pad32Bytes(licenseeAddress)}${pad32Bytes(0)}${pad32Bytes(0)}${pad32Bytes(0)}${pad32Bytes(fee)}`
            // console.log('payload', payload);


            let payload = ethers.utils.defaultAbiCoder.encode([
                "address", // tokenA
                "address", // tokenB
                "address", // receiver
                "uint256", // amountA
                "address", // licensee
                "bool", // isInvestment
                "uint256", // minimumAmountToClaim
                "uint256", // limitPice
                "uint256" // fee
            ], [
                tokenA,
                tokenB,
                this.walletAddress,
                amountA.toString(),
                licenseeAddress,
                false,
                0,
                0,
                fee.toString()
            ]);

            payload = payload.slice(2);
            payload = `0xe0e45f0e${pad32Bytes(payload)}`;
                            
            this.sendTransaction(payload, value.toString(), this.smartSwapContractAddress, txCb, receiptCb)
        } catch(error){
            console.error("swap", error.message)
            receiptCb(error)
        }
    }

    getCompanyFeeRatio = async() => {
        try {
            console.log('getCompanyFeeRatio', this.smartSwapContractInstance);
            return await this.smartSwapContractInstance.companyFee().then(res => {
                return res.toString();
            });
        } catch(error){
            console.error('getCompanyFeeRatio', error.message)
        }
    }

}

export default SmartSwapContract;