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
      amountA: string().required('Required - The amount of token A to sell on Smartswap.'),
      walletAddressToSend: string().required('Required - Wallet address that send token A.'),
      walletAddressToReceive: string().required('Required - Wallet address that receive token B.'),
      gasAndFeeAmount: number().required('Set the maximum amount which the smart contract is authorized to withdraw from your CEX account to cover the gas and fees.'),
      spProfitPercent: number().required('Required - The minimum profit % that you want to gain on each repeat'),
      accumulateFundsLimit: number().required('Required - Choose the minimum % of funds to accumulate before calming it back to your CEX account'),

      stopRepeatsMode: number().required('Required - Choose an option how you want to Stop repeat on CEX. (3=Never stop, 2=After X repeats, 3=On date]'),
      stopRepeatsOnDate: date().when("stopRepeatsMode", {
          is: val => val == 1,
          then: date().required("Required - Stop repeat on CEX at date")
      }),
      stopRepeatsAfterCalls: number().when("stopRepeatsMode", {
        is: val => val == 2,
        then: number().required("Required - Stop repeat after X calls")
      }),

      withdrawMode: number().required('Required - Choose an option how you want to withdraw from Smartswap. (3=Never stop, 2=After X repeats, 3=On date]'),
      withdrawOnDate: date().when("withdrawMode", {
        is: val => val == 1,
        then: date().required("Required - Withdraw at date")
      }),
      withdrawAfterCalls: number().when("withdrawMode", {
        is: val => val == 2,
        then: number().required("Required -  Withdraw after X repeats")
      }),


      cexApiKey: string().required('Required - Your specific API key to the CEX of your choice'),
      cexApiSecret: string().required('Required - Your specific API key secret to the CEX of your choice'),
    })
  })
}

export default requestValidations;