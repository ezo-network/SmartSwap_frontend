import { Request, Response } from "express";
import { log, constants } from "../../../config";
import { v4 as uuidv4 } from 'uuid';
import SwapProvider, {ISwapProvider} from '../models/SwapProvider';

const swapProviderController = {
    becomeSwapProvider: async (req: Request, res: Response) => {

        try {
            const { 
                spAccount, networkId, tokenA, tokenB, amountA,
                walletAddressToSend, walletAddressToReceive, 
                gasAndFeeAmount, spProfitPercent, accumulateFundsLimit, 
                stopRepeatsMode, stopRepeatsOnDate, stopRepeatsAfterCalls,
                withdrawMode, withdrawOnDate, withdrawAfterCalls,
                cexApiKey, cexApiSecret, txid, smartContractAddress         
            } = req.body;
            
            // SP exist?
            const isSwapProviderExists: ISwapProvider = await SwapProvider.findOne({
                'walletAddresses.spAccount' : spAccount,
                'networkId': networkId,
                'tokenA.address': tokenA,
                'tokenB.address': tokenB
            }).exec();
            if (isSwapProviderExists) return res.status(401).json({ message: "Swap provider already exists" });

            const swapProvider = await new SwapProvider({
                walletAddresses: {
                    toSend: walletAddressToSend,
                    toReceive: walletAddressToReceive,
                    spAccount
                },
                tokenA: {
                    address: tokenA,
                    recievedAmount: amountA
                },
                tokenB: {
                    address: tokenB
                },
                networkId,
                gasAndFeeAmount,
                spProfitPercent,
                accumulateFundsLimit,
                stopRepeats: {
                    mode: stopRepeatsMode,
                    onDate: stopRepeatsOnDate,
                    afterCalls: stopRepeatsAfterCalls
                },
                withdraw: {
                    mode: withdrawMode,
                    onDate: withdrawOnDate,
                    afterCalls: withdrawAfterCalls
                },
                cexData: {
                    key: cexApiKey,
                    secret: cexApiSecret
                },
                txid,
                smartContractAddress
            }).save();

            return res.status(201).json(swapProvider);

        } catch (err) {
            err['errorOrigin'] = "becomeSwapProvider";
            return res.status(500).json({ message: err });
        }
    },

    testConnection: async (req: Request, res: Response) => {
        return res.status(200).send({
            msg: 'ok'
        });
    }
}

export default swapProviderController;