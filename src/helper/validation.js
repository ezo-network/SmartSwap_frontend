import {
    EventEmitter
} from "events";
import { contractAddressesByPairs } from "../config/constantConfig";



class Validation extends EventEmitter {


    constructor() {
        super();
    }

    floatOnly(event) {
        if (event.shiftKey === true) event.preventDefault();

        var code = event.keyCode;

        if (
            (code >= 48 && code <= 57) ||
            (code >= 96 && code <= 105) ||
            code === 8 ||
            code === 9 ||
            code === 37 ||
            code === 39 ||
            code === 46 ||
            code === 190 ||
            code === 110
        ) {
            // allowed characters
        } else event.preventDefault();

        if (
            event.target.value.indexOf(".") !== -1 &&
            (code === 190 || code === 110)
        )
            event.preventDefault();
    }

    getPairAddress(sendCurrency, receiveCurrency) {
        return contractAddressesByPairs.smartswap[sendCurrency + "/" + receiveCurrency];
    }

    handleActions(action) {
        switch (action.type) { }
    }


}


const validation = new Validation();
//dispatcher.register(Validation.handleActions.bind(validation));
export default validation;