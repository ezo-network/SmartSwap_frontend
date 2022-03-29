import uniqueValidator from 'mongoose-unique-validator';
import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapProviderTest extends Document {
    swapProvider: Schema.Types.ObjectId,
    contractOwnerCheck: boolean,
    contractGasAndFeeCheck: boolean,
    spProfitPercentCheck: boolean,
    apiKeysCheck: boolean,
    apiValidateCheck: boolean,
    accountCheck: boolean,
    balanceCheck: boolean,
    transferCheck: boolean,
    withdrawCheck: boolean,
    ipWhiteListCheck: boolean,
    spAddressWhiteListCheck: boolean,
    withdrawEnabledCheck: boolean
};

const SwapProviderTest: Schema = new mongoose.Schema({
    swapProvider: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    contractOwnerCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    contractGasAndFeeCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    spProfitPercentCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    apiKeysCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    apiValidateCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    accountCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    balanceCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    transferCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    withdrawCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    ipWhiteListCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    spAddressWhiteListCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    withdrawEnabledCheck: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true, toJSON: {getters: true}
});

SwapProviderTest.plugin(uniqueValidator);

export default mongoose.model<ISwapProviderTest>('SwapProviderTest', SwapProviderTest, 'swap_provider_tests');