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

    isContractExist = async() => {
        try {
            const response = await this.web3Provider.getCode(this.smartSwapContractAddress);
            if(response === '0x'){
                return false;
            } else {
                return true;
            }
        } catch(error){
            return false;
        }
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
                gasPrice: web3.utils.toHex(gasPrice.toString()),
                gasLimit: web3.utils.toHex(gasLimit.toString()),
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

            const isContractExist = await this.isContractExist();

            if(isContractExist){
                console.log([
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
            } else {
                receiptCb({
                    code: 'NOT_A_CONTRACT',
                });
            }
        } catch(error){
            console.error("swap", error.message)
            receiptCb(error)
        }
    }

    getCompanyFeeRatio = async() => {
        try {
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                console.log('getCompanyFeeRatio', this.smartSwapContractInstance);
                return await this.smartSwapContractInstance.companyFee().then(res => {
                    return res.toString();
                });
            } else {
                console.error('getCompanyFeeRatio', "NOT_A_CONTRACT");
                notificationConfig.error(`${this.smartSwapContractAddress} is not a smartswap contract.`)
                return undefined;                
            }
        } catch(error){
            console.error('getCompanyFeeRatio', error.message)
        }
    }
}

export default SmartSwapContract;