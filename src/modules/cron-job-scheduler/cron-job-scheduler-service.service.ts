import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobSchedulerServiceService {
    

    @Cron('0 0 * * *')
    handleCron() {
        console.log("_____ cronjob");
    }
}
