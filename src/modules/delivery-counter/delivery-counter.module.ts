import { Module } from '@nestjs/common';
import { DeliveryCounterService } from './delivery-counter.service';
import { DeliveryCounterController } from './delivery-counter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryCountersSchema } from 'src/tableModels/delivery_counters.model';
import { DeliveryCounterUserLinkingsSchema } from 'src/tableModels/delivery_counter_user_linkings.model';
import { UserSchema } from 'src/tableModels/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_COUNTERS, schema: DeliveryCountersSchema },
      { name: ModelNames.DELIVERY_COUNTER_USER_LINKINGS, schema: DeliveryCounterUserLinkingsSchema },
      
      { name: ModelNames.USER, schema: UserSchema },
    ]),
  ],
  controllers: [DeliveryCounterController],
  providers: [DeliveryCounterService],
})
export class DeliveryCounterModule {}
