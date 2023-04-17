import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobSchedulerServiceService {
    

    @Cron('* * * * * *')
    handleCron() {
        console.log("_____ cronjob");
    }
}
