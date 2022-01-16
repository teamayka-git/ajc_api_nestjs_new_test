import { Module } from '@nestjs/common';
import { GoldRateTimelinesService } from './gold-rate-timelines.service';
import { GoldRateTimelinesController } from './gold-rate-timelines.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GoldRateTimelinesSchema } from 'src/tableModels/gold_rate_timelines.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GOLD_RATE_TIMELINES,schema:GoldRateTimelinesSchema}])],
  controllers: [GoldRateTimelinesController],
  providers: [GoldRateTimelinesService]
})
export class GoldRateTimelinesModule {}
