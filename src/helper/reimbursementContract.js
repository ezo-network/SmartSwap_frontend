import { EventEmitter } from "events";
import web3Js from "web3";
import { ethers } from "ethers";

import reimbursementAbi from "../abis/reimbursementAbi.json";
import tokenAbi from "../abis/tokenAbi.json";
import tokenVaultAbi from "../abis/tokenVaultAbi.json";
import constantConfig from "../config/constantConfig";
import web3Config from "../config/web3Config";
var BigNumber = require("big-number");

// const ADRESS_ONE = "0x0000000000000000000000000000000000000001";
// const ADRESS_TWO = "0x0000000000000000000000000000000000000002";

class ReimbursementContract extends EventEmitter {
    constructor(web3, networkId) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        // this.reimbursementAddress = constantConfig[networkId].reimbursementContract;

        // this.reimbursementInstance = new ethers.Contract(
        //     this.reimbursementAddress,
        //     reimbursementAbi,
        //     web3.getSigner(0)
        // );

    }

    async sendTransaction(payload, value, gasLimit, to, txCb, receiptCb, errorCb) {
        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97) gasPrice = "20";
        else if (this.networkId === 42) gasPrice = "30";
        else {
            const response = await fetch(
                "https://ethgasstation.info/json/ethgasAPI.json"
            );
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }

        const tx = {
            to: to,
            data: payload,
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice, "gwei")),
            gasLimit: web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(value),
        };

        this.web3
            .getSigner(0)
            .sendTransaction(tx)
            .then((result) => {
                txCb(result.hash);
                result.wait().then(async (receipt) => {
                    receiptCb(receipt);
                });
            })
            .catch((error) => {
                console.log(error);
                errorCb(error);
            });
    }

    pad32Bytes(data) {
        var s = String(data);
        while (s.length < (64 || 2)) {
            s = "0" + s;
        }
        return s;
    }

    async getVaultAddress(receipt) {
        const iface = new ethers.utils.Interface(reimbursementAbi)

        if (receipt.status === 1) {
            for (var i = 0; i < receipt.logs.length; i++) {
                if (receipt.logs[i].topics[0] === "0x897c133dfbfe1f6239e98b4ffd7e4f6c86a62350a131a7a37790419f58af02f9") {
                    return iface.decodeEventLog("VaultCreated", receipt.logs[i].data, receipt.logs[i].topics).vault;
                }
            }
        }
    }

    async newVault(newVaultData, txCb, receiptCb, errorCb) {
        let token = newVaultData.token;                         // reimbursement token
        let isMintable = newVaultData.isMintable;               // token can be minted by this contract (`false` for Licensee)
        let period = newVaultData.period;                       // staking period in seconds (365 days)
        let reimbursementRatio = newVaultData.reimbursementRatio;   // the ratio of deposited amount to reimbursement amount (with 2 decimals). 
        let swapPair = newVaultData.swapPair;                    // uniswap compatible pair for token and native coin (ETH, BNB)
        let licenseeFee = newVaultData.licenseeFee;             // percentage of Licensee fee (with 2 decimals). I.e. 30 means 0.3%
        let projectContract = newVaultData.projectContract;

        let reimbursementInstance = await new ethers.Contract(
            newVaultData.reimbursementAddress,
            reimbursementAbi,
            this.web3.getSigner(0)
        );

        let payload = (await reimbursementInstance.populateTransaction.newVault(
            token,
            isMintable,
            period,
            reimbursementRatio,
            swapPair,
            licenseeFee,
            projectContract
        )).data;

        console.log(payload);

        this.sendTransaction(
            payload,
            0,
            "900000",
            newVaultData.reimbursementAddress,
            txCb,
            receiptCb,
            errorCb
        );

    }

    async depositTokens(transferTokenData, txCb, receiptCb, errorCb) {
        console.log(transferTokenData)
        let to = transferTokenData.to;                         // reimbursement token
        let amount = web3Js.utils.toWei(transferTokenData.amount);

        let tokenInstance = await new ethers.Contract(
            transferTokenData.tokenAddress,
            tokenAbi,
            this.web3.getSigner(0)
        );

        let payload = (await tokenInstance.populateTransaction.transfer(
            to,
            amount
        )).data;

        console.log(payload);

        this.sendTransaction(
            payload,
            0,
            "900000",
            transferTokenData.tokenAddress,
            txCb,
            receiptCb,
            errorCb
        );

    }

    async withdrawTokens(withdrawTokensData, txCb, receiptCb, errorCb) {
        let vault = withdrawTokensData.vault;                         // reimbursement token
        let amount = web3Js.utils.toWei(withdrawTokensData.amount);

        console.log(withdrawTokensData)

        let reimbursementInstance = await new ethers.Contract(
            withdrawTokensData.reimbursementAddress,
            reimbursementAbi,
            this.web3.getSigner(0)
        );

        let payload = (await reimbursementInstance.populateTransaction.withdrawTokens(
            vault,
            amount
        )).data;

        console.log(payload);

        this.sendTransaction(
            payload,
            0,
            "900000",
            withdrawTokensData.reimbursementAddress,
            txCb,
            receiptCb,
            errorCb
        );

    }

    async setLicenseeFee(setLicenseeFeeData, txCb, receiptCb, errorCb) {
        let vault = setLicenseeFeeData.vault;
        let projectContract = setLicenseeFeeData.projectContract;
        let fee = setLicenseeFeeData.fee;             // percentage of Licensee fee (with 2 decimals). I.e. 30 means 0.3%

        console.log(vault, projectContract, fee)

        let reimbursementInstance = await new ethers.Contract(
            setLicenseeFeeData.reimbursementAddress,
            reimbursementAbi,
            this.web3.getSigner(0)
        );

        let payload = (await reimbursementInstance.populateTransaction.setLicenseeFee(
            vault,
            projectContract,
            fee
        )).data;

        console.log(payload);

        this.sendTransaction(
            payload,
            0,
            "900000",
            setLicenseeFeeData.reimbursementAddress,
            txCb,
            receiptCb,
            errorCb
        );
    }

    async estimateSwapGasFee(
        tokenA,
        tokenB,
        amount,
        swapAmount,
        fee,
        gasLimit,
        estGasCb
    ) {
        // let fee = await this.reimbursementInstance.processingFee();
        // fee = web3Js.utils.hexToNumberString(fee._hex);
        // amount = BigNumber(amount).add(fee);
        // amount = amount.toString();

        let amountNew = (Number(amount) + Number(fee)).toString();

        let receiver = web3Config.getAddress();
        let licensee = "0x0000000000000000000000000000000000000000";

        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97) gasPrice = "20";
        else if (this.networkId === 42) gasPrice = "30";
        else {
            const response = await fetch(
                "https://ethgasstation.info/json/ethgasAPI.json"
            );
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }
        console.log(swapAmount);
        let newamount = web3Js.utils.toHex(swapAmount).replace("0x", "");
        tokenA = tokenA.replace("0x", "");
        tokenB = tokenB.replace("0x", "");
        receiver = receiver.replace("0x", "");
        licensee = licensee.replace("0x", "");
        // var encodeABI = `${pad32Bytes(requestId)}${pad32Bytes(price)}`;

        var payload = `0x653c3c8f${this.pad32Bytes(tokenA)}${this.pad32Bytes(
            tokenB
        )}${this.pad32Bytes(receiver)}${this.pad32Bytes(
            newamount
        )}${this.pad32Bytes(licensee)}${this.pad32Bytes(0)}${this.pad32Bytes(
            0
        )}${this.pad32Bytes(0)}`;

        const tx = {
            to: this.reimbursementAddress,
            data: payload,
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice, "gwei")),
            gasLimit: web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(amountNew),
        };

        this.web3
            .getSigner(0)
            .estimateGas(tx)
            .then((result) => {
                let estGasEth = web3Js.utils.fromWei(
                    (
                        web3Js.utils.toDecimal(result) *
                        web3Js.utils.toWei(gasPrice, "gwei")
                    ).toString()
                );
                estGasCb(estGasEth);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    async approveJNTRTokenForSwapFactory(
        tokenAddress,
        reimbursementAddress,
        txCb,
        receiptCb
    ) {
        let web3 = this.web3;

        this.tokenInstance = new ethers.Contract(
            tokenAddress,
            tokenAbi,
            web3.getSigner(0)
        );

        let highApproval = web3Js.utils.toWei("10000000000000");
        let payload = await this.tokenInstance.populateTransaction.approve(
            reimbursementAddress,
            highApproval
        );
        this.sendTransaction(
            payload.data,
            0,
            "250000",
            tokenAddress,
            txCb,
            receiptCb
        );
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
        switch (action.type) {
        }
    }
}

export default ReimbursementContract;
