import { Module } from '@nestjs/common';
import { CronJobSchedulerServiceService } from './cron-job-scheduler-service.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports:[
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [CronJobSchedulerServiceService]
})
export class CronJobSchedulerModule {}
