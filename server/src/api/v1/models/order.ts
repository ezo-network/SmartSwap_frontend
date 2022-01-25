import uniqueValidator from 'mongoose-unique-validator';
import mongoose, { Schema, Document } from 'mongoose';


export interface BinanceWithdrawOrder extends Document {
    refId: string,
    asset: string,
    amount: string,
    status: string
    failedTry: number
}

export interface BinanceSpotOrder extends Document {
    asset: string,
    type: string,
    side: string,
    orderId: number,
    price: string,
    origQty: string,
    executedQty: string,
    cummulativeQuoteQty: string,
    // cancelledOrderIds: object,
    status: string
}


export interface IOrder extends Document {
    swapProvider: Schema.Types.ObjectId,
    type: string,
    withdraw: BinanceWithdrawOrder,
    spot: BinanceSpotOrder,
    message: string,
    status: string
};


const Order: Schema = new mongoose.Schema({
    swapProvider: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum : ['TEST', 'DISTRIBUTION'],
        uppercase: true
    },
    withdraw: {
        refId: {
            type: String,
            default: null
        },
        asset: {
            type: String,
            default: null
        },
        amount: {
            type: String,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSED', 'FAILED', 'COMPLETED'],
            /**
             * PENDING - Request need to process yet.
             * PROCESSED - Request is under process on CEX withdraw.
             * FAILED - if any error occured while processing request on CEX.
             * COMPLETED - Completed successfully, no futher action require.
             * */
            default: 'PENDING',
            uppercase: true, 
            trim: true
        },
        failedTry: {
            type: Number,
            default: 0,
            max: 3
        },                 
    },
    spot: {
        asset: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: false,
        },
        side: {
            type: String,
            required: false,
        },        
        orderId: {
            type: Number,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        origQty: {
            type: String,
            required: false,
        },
        executedQty: {
            type: String,
            required: false,
        },
        cummulativeQuoteQty: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            required: false,
        },
        cancelledOrderIds: [{
            type: String,
            required: false
        }],
        message: {
            type: String,
            required: false            
        }
    },
    message: {
        type: String,
        required: false,
        uppercase: true,
        default: ''
    },
    status: {
        type: String,
        required: true,
        default: 'PENDING',
        enum : ['PENDING', 'COMPLETED', 'FAILED'],
        uppercase: true        
    }
}, {
    timestamps: true, toJSON: {getters: true}
});

Order.plugin(uniqueValidator);

export default mongoose.model<IOrder>('Order', Order, 'orders');

