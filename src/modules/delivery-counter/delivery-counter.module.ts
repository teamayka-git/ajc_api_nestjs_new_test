import { Module } from '@nestjs/common';
import { DeliveryCounterService } from './delivery-counter.service';
import { DeliveryCounterController } from './delivery-counter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryCountersSchema } from 'src/tableModels/delivery_counters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.DELIVERY_COUNTERS,schema:DeliveryCountersSchema}])],
  controllers: [DeliveryCounterController],
  providers: [DeliveryCounterService]
})
export class DeliveryCounterModule {}
