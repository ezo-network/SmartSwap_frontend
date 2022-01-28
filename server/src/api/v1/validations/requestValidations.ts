import { object, string, number, date,  boolean, ref } from "yup";
import * as yup from 'yup';


const requestValidations = {
  becomeSwapProviderRequest: object({
    body: object({
      // become swap provider fields
      spAccount: string().required('Required - Swap provider wallet address.'),
      networkId: number().required('Required - Network ID'),
      tokenA: string().required('Required - Token A address.'),
      tokenB: string().required('Required - Token B address.'),
      amountA: string().required('[amountA] Required - The amount of token A to sell on Smartswap.'),
      walletAddressToSend: string().required('[walletAddressToSend] Required - Wallet address that send token A.'),
      walletAddressToReceive: string().required('[walletAddressToReceive] Required - Wallet address that receive token B.'),
      gasAndFeeAmount: number().required('[gasAndFeeAmount] Set the maximum amount which the smart contract is authorized to withdraw from your CEX account to cover the gas and fees.'),
      swapSpeedMode: string().required('[swapSpeedMode] CHOOSE YOUR SWAPPING SPEED.'),
      spProfitPercent: number().required('[spProfitPercent] Required - The minimum profit % that you want to gain on each repeat'),
      accumulateFundsLimit: number().required('[accumulateFundsLimit] Required - Choose the minimum % of funds to accumulate before calming it back to your CEX account'),

      stopRepeatsMode: number().required('[stopRepeatsMode] Required - Choose an option how you want to Stop repeat on CEX. (3=Never stop, 2=After X repeats, 3=On date]'),
      stopRepeatsOnDate: date().nullable(true).when("stopRepeatsMode", {
          is: val => val == 1,
          then: date().required("[stopRepeatsOnDate] Required - Stop repeat on CEX at date")
      }),
      stopRepeatsAfterCalls: number().nullable(true).when("stopRepeatsMode", {
        is: val => val == 2,
        then: number().required("[stopRepeatsAfterCalls] Required - Stop repeat after X calls")
      }),

      withdrawMode: number().required('[withdrawMode] Required - Choose an option how you want to withdraw from Smartswap. (3=Never stop, 2=After X repeats, 3=On date]'),
      withdrawOnDate: date().nullable(true).when("withdrawMode", {
        is: val => val == 1,
        then: date().required("[withdrawOnDate] Required - Withdraw at date")
      }),
      withdrawAfterCalls: number().nullable(true).when("withdrawMode", {
        is: val => val == 2,
        then: number().required("[withdrawAfterCalls] Required -  Withdraw after X repeats")
      }),
      withdrawPercent: number().required('[withdrawPercent] Required. And valid range is from 0% to 45%'),
      // cexApiKey: string().required('[cexApiKey] Required - Your specific API key to the CEX of your choice'),
      // cexApiSecret: string().required('[cexApiSecret] Required - Your specific API key secret to the CEX of your choice'),
    })
  }),

  updateTransactionHashRequest: object({
    body: object({
      txid: string().required('Transaction Hash is required.'),
      docId: string().required('Document Id is required.'),
      blockNumber: number().required('Block number is required.'),
      networkId: number().required('Network id is required.')
    })
  }),

  getContractAddressRequest: object({
    query: object({
      docId: string().required('Document Id is required.'),
    })
  }),

  getActiveContractsRequest: object({
    body: object({
      spAccount: string().required('sp wallet address is required.')
    })
  }),
  
  updateRequest: object({
    body: object({
      smartContractAddress: string().required("smartContractAddress is required to update swap provider"),
      gasAndFeeAmount: number().nullable(true),
      swapSpeedMode: string().nullable(true),
      amountA: number().nullable(true),
      walletAddressToSend: string().nullable(true),
      walletAddressToReceive: string().nullable(true),
      spProfitPercent: number().nullable(true),
      accumulateFundsLimit: number().nullable(true),
      stopRepeatsMode: number().nullable(),
      stopRepeatsOnDate: date().nullable(true).when("stopRepeatsMode", {
        is: val => val == 1,
        then: date().required("[stopRepeatsOnDate] Required - Stop repeat on CEX at date")
      }),
      stopRepeatsAfterCalls: number().nullable(true).when("stopRepeatsMode", {
        is: val => val == 2,
        then: number().required("[stopRepeatsAfterCalls] Required - Stop repeat after X calls")
      }),

      withdrawMode: number().nullable(),
      withdrawOnDate: date().nullable(true).when("withdrawMode", {
        is: val => val == 1,
        then: date().required("[withdrawOnDate] Required - Withdraw at date")
      }),
      withdrawAfterCalls: number().nullable(true).when("withdrawMode", {
        is: val => val == 2,
        then: number().required("[withdrawAfterCalls] Required -  Withdraw after X repeats")
      }),

      cexApiKey: string().nullable(true),
      cexApiSecret: string().nullable(true),

      active: boolean().nullable(true),

      spreadAmount: number().nullable(true),

      withdrawPercent: number().nullable(true)

    })
  })

}

export default requestValidations;