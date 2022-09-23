import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';
import ERC20TokenContractAbi from "../abis/erc20TokenAbi.json";
import web3Config from "../config/web3Config";


class ERC20TokenContract extends EventEmitter {
    
    constructor(web3, contractAddress) {
        super();
        this.web3 = web3;
        this.contractAddress = contractAddress;

        this.contractInstance = new ethers.Contract(
            this.contractAddress,
            ERC20TokenContractAbi,
            this.web3.getSigner(0)
        );
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

    async getTokenInfo(successCb, errorCb) {
        try {
            
            const isContractExist = await this.isContractExist();

            if(isContractExist){
                const name = await this.contractInstance.name();
                const symbol = await this.contractInstance.symbol();
                const decimals = await this.contractInstance.decimals();
                const totalSupply = await this.contractInstance.totalSupply();
                successCb({name: name, symbol: symbol, decimals: decimals, totalSupply: ethers.utils.formatUnits(totalSupply, decimals)});
            } else {
                errorCb({
                    error: 'Contract does not exist.'
                });
            }
        } catch(error){
            errorCb({
                error: error.message
            });
        }
    }

    handleActions(action) {
        switch (action.type) {}
    }
}


export default ERC20TokenContract;