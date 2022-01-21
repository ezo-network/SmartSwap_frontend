import uniqueValidator from 'mongoose-unique-validator';
import mongoose, { Schema, Document } from 'mongoose';
import { number } from 'yup/lib/locale';

export interface WalletAddresses extends Document {
    toSend: string
    toReceive: string,
    spAccount: string
}

export interface TokenA extends Document {
    address: string,
    recievedAmount: Schema.Types.Decimal128,
    consumedAmount: Schema.Types.Decimal128
}

export interface TokenB extends Document {
    address: string,
    recievedAmount: Schema.Types.Decimal128
}

export interface StopRepeats extends Document {
    mode: {
        type: Number,
        enum : [1,2,3]
    };
    onDate: Date;
    afterCalls: number;
}

export interface Withdraw extends Document {
    mode: {
        type: Number,
        enum : [1,2,3]
    };
    onDate: Date;
    afterCalls: number;
}

export interface CexData extends Document {
    key: string,
    secret: string,
}

export interface ISwapProvider extends Document {
    tokenA: TokenA, // address of token A (sender)
    tokenB: TokenB, // address of token B (reciever)
    walletAddresses: WalletAddresses,
    networkId: number, // active network id
    gasAndFeeAmount: Schema.Types.Decimal128 // gas And Fee
    spProfitPercent: number, // Choose the minimum that you want to gain on each repeat 
    accumulateFundsLimit: number, // Choose the minimum funds to accumulate before calming it back to your CEX account
    stopRepeats: StopRepeats,
    withdraw: Withdraw,
    cexData: CexData,
    smartContractAddress?: string,
    txid?: string,
    active: boolean,
    swapSpeedMode: string,
    distributionStatus: string,
    totalAmount: Schema.Types.Decimal128,
    totalWithdrawnAmount: number,
    withdrawPercent: number,
    withdrawReinitiate: boolean
    message: string,
};

const SwapProvider: Schema = new mongoose.Schema({
    totalAmount: {
        type: Schema.Types.Decimal128,
        required: true,
        default: 0        
    },
    totalWithdrawnAmount: {
        type: Schema.Types.Decimal128,
        required: true,
        default: 0        
    },
    distributionStatus: {
        type: String,
        required: true,
        enum : ['PENDING','PROCESSED', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
        uppercase: true
    },
    walletAddresses: {
        spAccount: {
            type: String,
            required: true
        },
        toSend: {
            type: String,
            required: true,  
        },
        toReceive: {
            type: String,
            required: true,  
        },
    },
    tokenA:  {
        address: {
            type: String,
            required: true,                    
        },
        recievedAmount:  {
            type: Schema.Types.Decimal128,
            required: true,
            default: 0       
        },
        consumedAmount:  {
            type: Schema.Types.Decimal128,
            required: true,        
            default: 0
        },
    },
    tokenB: {
        address: {
            type: String,
            required: true,                    
        },
        recievedAmount:  {
            type: Schema.Types.Decimal128,
            required: true,     
            default: 0   
        }
    },
    networkId: {
        type: Number,
        required: true
    },
    gasAndFeeAmount: {
        type: Schema.Types.Decimal128,
        required: true,  
    },
    swapSpeedMode: {
        type: String,
        required: true,
        enum : ['UPFRONT','REALTIME'],
        default: 'UPFRONT'
    },
    spreadAmount: {
        type: Schema.Types.Decimal128,
        required: false,     
        default: 0          
    },
    spProfitPercent:{
        type: Number,
        required: true
    },
    accumulateFundsLimit: {
        type: Number,
        required: true
    },
    stopRepeats: {
        mode: {
            type: Number,
            required: true
        },
        onDate: {
            type: Date
        },
        afterCalls: {
            type: Number
        },
    },
    withdraw: {
        mode: {
            type: Number,
            required: true
        },
        onDate: {
            type: Date
        },
        afterCalls: {
            type: Number
        },
    },
    cexData: {
        key: {
            type: String,
            required: false,
            default: null
        },
        secret: {
            type: String,
            required: false,
            default: null
        },
    },
    smartContractAddress: {
        type: String,
        required: false,
        default: null
    },
    txid:{
        type: String,
        required: false,
        default: null
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    fromBlock: {
        type: Number,
        default: null,
        required: false
    },
    message: {
        type: String,
        required: false,
        default: '',
        uppercase: true
    },
    withdrawPercent: {
        type: Number,
        required: true
    },
    withdrawReinitiate: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true, toJSON: {getters: true}
});

SwapProvider.plugin(uniqueValidator);

export default mongoose.model<ISwapProvider>('SwapProvider', SwapProvider, 'swap_providers');