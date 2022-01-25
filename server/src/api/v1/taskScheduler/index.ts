const CronJob = require('cron').CronJob;
import { boolean } from 'yup/lib/locale';
// controllers
import swapProviderController from '../controllers/swapProvider.controller';


class TaskScheduler {
    static scheduler: boolean;
    static scheduledTask: string;

    constructor(){
        TaskScheduler.scheduler = false
    }

    // sp processing
    static async amountDestributionTaskHandler(){
        if(this.scheduler == true) {
            console.log(`\n⌛ - ${this.scheduledTask} is already running time:  ` + new Date());
            return;
        }

        console.log('\n⌛ - amountDestributionTaskHandler Job started.' + " : time:  " + new Date());
        this.scheduledTask = 'amountDestributionTaskHandler';
        this.scheduler = true;
        await swapProviderController.amountDistributionHandler();
        this.scheduledTask = null;
        this.scheduler = false;
        console.log('\n⌛ - amountDestributionTaskHandler Job finished.'+ " : time:  " + new Date());
    }

    // sp processing
    static async updateGasAndFeeAmountHandler(){
        if(this.scheduler == true) {
            console.log(`\n⌛ - ${this.scheduledTask} is already running time:  ` + new Date());
            return;
        }

        console.log('\n⌛ - updateGasAndFeeAmountHandler Job started.' + " : time:  " + new Date());
        this.scheduledTask = 'updateGasAndFeeAmountHandler';
        this.scheduler = true;
        await swapProviderController.updateGasAndFeeAmountHandler();
        this.scheduledTask = null;
        this.scheduler = false;
        console.log('\n⌛ - updateGasAndFeeAmountHandler Job finished.'+ " : time:  " + new Date());
    }    

    static async start(){
        await new CronJob({
            /* every 10 seconds */
            cronTime: '*/10 * * * * *',
            onTick: async() => {
                await TaskScheduler.amountDestributionTaskHandler();
            },
            start: true,
            runOnInit: false,
            timeZone: "GMT"
        });

        await new CronJob({
            /* every 05 seconds */
            cronTime: '*/05 * * * * *',
            onTick: async() => {
                await TaskScheduler.updateGasAndFeeAmountHandler();
            },
            start: true,
            runOnInit: false,
            timeZone: "GMT"
        });
    }

}



export default TaskScheduler;