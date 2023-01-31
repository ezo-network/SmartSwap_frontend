import bigInt from 'big-integer';
import web3 from "web3";



export const debounce = (func, delay) => {
  let debounceHandler;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceHandler);
    debounceHandler = setTimeout(() => func.apply(context, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};


/********************************************************
 * Converts Exponential (e-Notation) Numbers to Decimals
 ********************************************************
 * @function numberExponentToLarge()
 * @version  1.00
 * @param   {string}  Number in exponent format.
 *                   (other formats returned as is).
 * @return  {string}  Returns a decimal number string.
 *
 * Notes: No check is made for NaN or undefined inputs
 *
 *******************************************************/
export const numberExponentToLarge = (numIn) => {
  numIn += "";                                            // To cater to numric entries
  var sign = "";                                           // To remember the number sign
  numIn.charAt(0) == "-" && (numIn = numIn.substring(1), sign = "-"); // remove - sign & remember it
  var str = numIn.split(/[eE]/g);                        // Split numberic string at e or E
  if (str.length < 2) return sign + numIn;                   // Not an Exponent Number? Exit with orginal Num back
  var power = str[1];                                    // Get Exponent (Power) (could be + or -)
  if (power === '0' || power == '-0') return sign + str[0];       // If 0 exponents (i.e. 0|-0|+0) then That's any easy one

  var deciSp = 1.1.toLocaleString().substring(1, 2);  // Get Deciaml Separator
  str = str[0].split(deciSp);                        // Split the Base Number into LH and RH at the decimal point
  var baseRH = str[1] || "",                         // RH Base part. Make sure we have a RH fraction else ""
      baseLH = str[0];                               // LH base part.

  if (power > 0) {   // ------- Positive Exponents (Process the RH Base Part)
      if (power > baseRH.length) baseRH += "0".repeat(power - baseRH.length); // Pad with "0" at RH
      baseRH = baseRH.slice(0, power) + deciSp + baseRH.slice(power);      // Insert decSep at the correct place into RH base
      if (baseRH.charAt(baseRH.length - 1) == deciSp) baseRH = baseRH.slice(0, -1); // If decSep at RH end? => remove it

  } else {         // ------- Negative Exponents (Process the LH Base Part)
      let num = Math.abs(power) - baseLH.length;                               // Delta necessary 0's
      if (num > 0) baseLH = "0".repeat(num) + baseLH;                       // Pad with "0" at LH
      baseLH = baseLH.slice(0, power) + deciSp + baseLH.slice(power);     // Insert "." at the correct place into LH base
      if (baseLH.charAt(0) == deciSp) baseLH = "0" + baseLH;                // If decSep at LH most? => add "0"
  }
  return sign + baseLH + baseRH;                                          // Return the long number (with sign)
}

export const checkTransactionOnExplorer = (explorerUrl, txHash) => {
  if(explorerUrl !== undefined && txHash !== undefined){
      window.open(explorerUrl + '/tx/' + txHash, "_blank");
  }
}

export const goToExplorer = (explorerUrl, address, type = 'address') => {
  if(explorerUrl !== undefined){
    if(web3.utils.isAddress(address)){
      window.open(explorerUrl + '/' + type + '/' + address, "_blank");
      return true;
    }
  } else {
    return false;
  }
}

// defualt to tx hash masking, for address set - 3, 5, 5
export const textMasking = (text, maskingChar = '.', noOfMaskingChar = 16, startingLettersLength = 25, endingLettersLength = 25) => {
  const notValidValues = ["", null, undefined];
  if(notValidValues.includes(text)){
    return;
  }
  return text.substring(0, startingLettersLength) + maskingChar.repeat(noOfMaskingChar) + text.slice(-endingLettersLength)
}

export const toFixedWithoutRounding = (input, decimalPoints) => {
  let regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
  return regExp.test(input.toString()) ? input.toString().match(regExp) : Number('0.00000').toFixed(decimalPoints);
}

export const numberToBn = (number, decimalPoints, toString = false) => {
  const pow = bigInt(10).pow(decimalPoints);
  const regExp = new RegExp("^-?\\d+(?:\\.\\d{0," + decimalPoints + "})?", "g"); // toFixed without rounding
  number = number.toString().match(regExp)[0];
  number = Number(number * pow.toJSNumber()).toFixed(0);
  number = bigInt(number).toString();
  number = web3.utils.toBN(number);
  return toString ? number.toString() : number;
}

