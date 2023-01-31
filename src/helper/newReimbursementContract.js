import { EventEmitter } from "events";
import { ethers } from "ethers";
import reimbursementAbi from "../abis/reimbursementAbi.json";

const pad32Bytes = (data) => {
    var s = String(data);
    while (s.length < (64 || 2)) {
        s = "0" + s;
    }
    return s;
}

class NewReimbursementContract extends EventEmitter {
    constructor(web3Provider, walletAddress, reimbursementContractAddress) {
        super();
        this.web3Provider = web3Provider;
        this.walletAddress = walletAddress;
        this.reimbursementContractAddress = reimbursementContractAddress;
        this.reimbursementContractInstance = new ethers.Contract(
            this.reimbursementContractAddress,
            reimbursementAbi,
            this.web3Provider.getSigner(0)
        );
    }

    isContractExist = async() => {
        try {
            const response = await this.web3Provider.getCode(this.reimbursementContractAddress);
            if(response === '0x'){
                return false;
            } else {
                return true;
            }
        } catch(error){
            return false;
        }
    }

    getLicenseeFee = async(vaultAddress, projectContractAddress) => {
        try {
            const isContractExist = await this.isContractExist();
            if(isContractExist){
                return await this.reimbursementContractInstance.getLicenseeFee(vaultAddress, projectContractAddress).then(res => {
                    return res.toString();
                });
            } else {
                console.error('getLicenseeFee', "NOT_A_CONTRACT");
            }
        } catch(error){
            console.error('getLicenseeFee', error.message)
        }
    }
}

export default NewReimbursementContract;
