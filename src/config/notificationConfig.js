
import { immediateToast } from "izitoast-react";
import {
    EventEmitter
} from "events";

class NotificationConfig extends EventEmitter {
    lastMessage = '';
    info(message, position = 'topRight', timeout = 5000){
        immediateToast("info", {
            message: message,
            timeout: timeout,
            position: position,
            displayMode: this.lastMessage === message ? 2 : 0 // 2 means - replace duplicate old error with new toast
        })
        this.lastMessage = message;
    }

    error(message, position = 'topRight', timeout = 5000){
        immediateToast("error", {
            message: message,
            timeout: timeout,
            position: position,
            displayMode: this.lastMessage === message ? 2 : 0
        })
        this.lastMessage = message;
    }

    warning(message, position = 'topRight', timeout = 5000){
        immediateToast("warning", {
            message: message,
            timeout: timeout,
            position: position,
            displayMode: this.lastMessage === message ? 2 : 0
        })
        this.lastMessage = message;
    }

    success(message, position = 'topRight', timeout = 5000){
        immediateToast("success", {
            message: message,
            timeout: timeout,
            position: position,
            displayMode: this.lastMessage === message ? 2 : 0
        })
        this.lastMessage = message;
    }

    handleActions(action) {
        switch (action.type) { }
    }
}

const notificationConfig = new NotificationConfig();
export default notificationConfig;