const CronJob = require('cron').CronJob;
let scheduler = false;
let scheduledTask = null;

// controllers
import swapProviderController from '../controllers/swapProvider.controller';


class TaskScheduler {
    // sp processing
    static async amountDestributionTaskHandler(scheduler, scheduledTask){
        if(scheduler == true) {
            console.log(`\n⌛ - ${scheduledTask} is already running time:  ` + new Date());
            return;
        }

        console.log('\n⌛ - amountDestributionTaskHandler Job started.' + " : time:  " + new Date());
        scheduledTask = 'amountDestributionTaskHandler';
        scheduler = true;
        await swapProviderController.amountDistributionHandler();
        scheduledTask = null;
        scheduler = false;
        console.log('\n⌛ - amountDestributionTaskHandler Job finished.'+ " : time:  " + new Date());
    }

    static async start(){
        await new CronJob({
            /* eveny x seconds */
            cronTime: '*/10 * * * * *',
            onTick: async() => {
                await TaskScheduler.amountDestributionTaskHandler(scheduler, scheduledTask);
            },
            start: true,
            runOnInit: true,
            timeZone: "GMT"
        });
    }

}



export default TaskScheduler;