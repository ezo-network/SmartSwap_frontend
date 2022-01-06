import uniqueValidator from 'mongoose-unique-validator';
import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapProviderTest extends Document {
    swapProvider: Schema.Types.ObjectId,
    contractOwnerCheck: boolean,
    contractGasAndFeeCheck: boolean,
    spProfitPercentCheck: boolean,
    binanceApiKeysCheck: boolean,
    binanceApiValidateCheck: boolean,
    binanceAccountCheck: boolean,
    binanceBalanceCheck: boolean,
    binanceTransferCheck: boolean,
    binanceWithdrawCheck: boolean,
    binanceIpWhiteListCheck: boolean,
    binanceSpAddressWhiteListCheck: boolean,
    binanceWithdrawEnabledCheck: boolean
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
    binanceApiKeysCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceApiValidateCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceAccountCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceBalanceCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceTransferCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceWithdrawCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceIpWhiteListCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceSpAddressWhiteListCheck: {
        type: Boolean,
        required: true,
        default: false
    },
    binanceWithdrawEnabledCheck: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true, toJSON: {getters: true}
});

SwapProviderTest.plugin(uniqueValidator);

export default mongoose.model<ISwapProviderTest>('SwapProviderTest', SwapProviderTest, 'swap_provider_tests');