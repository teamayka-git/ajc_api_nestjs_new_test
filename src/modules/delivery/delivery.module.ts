import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliverySchema } from 'src/tableModels/delivery.model';
import { DeliveryItemsSchema } from 'src/tableModels/delivery_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY, schema: DeliverySchema },
      { name: ModelNames.DELIVERY_ITEMS, schema: DeliveryItemsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService]
})
export class DeliveryModule {}
