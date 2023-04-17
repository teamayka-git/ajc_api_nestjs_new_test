import { Module } from '@nestjs/common';
import { CronJobSchedulerServiceService } from './cron-job-scheduler-service.service';

@Module({
  controllers: [],
  providers: [CronJobSchedulerServiceService]
})
export class CronJobSchedulerModule {}
