
import { immediateToast } from "izitoast-react";
import {
    EventEmitter
} from "events";


const defaultPosition = 'topRight';
const defaultTimeout = 5000; // ms


class ToastNotification extends EventEmitter {
    lastMessage = '';
    notify(type, message, timeout, position){
        
        if(message === undefined || message === null || message.toString().length === 0){
            console.error(`Must specify message to show on ToastNotification.`, message)
            return;
        }

        immediateToast(type, {
            message: message,
            timeout: timeout,
            position: position,
            displayMode: this.lastMessage === message ? 2 : 0 // 2 means - replace duplicate old error with new toast
        })      
        this.lastMessage =  message;
    }
}

class NotificationConfig extends ToastNotification {
    info(message, position = defaultPosition, timeout = defaultTimeout){
        this.notify('info', message, timeout, position)
    }

    error(message, position = defaultPosition, timeout = defaultTimeout){
        this.notify('error', message, timeout, position)
    }

    warning(message, position = defaultPosition, timeout = defaultTimeout){
        this.notify('warning', message, timeout, position)
    }

    success(message, position = defaultPosition, timeout = defaultTimeout){
        this.notify('success', message, timeout, position)        
    }
}

const notificationConfig = new NotificationConfig();
export default notificationConfig;