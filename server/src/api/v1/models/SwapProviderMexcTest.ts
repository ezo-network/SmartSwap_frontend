import uniqueValidator from 'mongoose-unique-validator';
import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapProviderMexcTest extends Document {
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

const SwapProviderMexcTest: Schema = new mongoose.Schema({
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

SwapProviderMexcTest.plugin(uniqueValidator);

export default mongoose.model<ISwapProviderMexcTest>('SwapProviderMexcTest', SwapProviderMexcTest, 'swap_provider_mexc_tests');