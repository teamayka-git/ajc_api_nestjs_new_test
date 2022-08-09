import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliverySchema } from 'src/tableModels/delivery.model';
import { DeliveryItemsSchema } from 'src/tableModels/delivery_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';
import { RootCausesSchema } from 'src/tableModels/rootCause.model';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY, schema: DeliverySchema },
      { name: ModelNames.DELIVERY_ITEMS, schema: DeliveryItemsSchema },
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.ROOT_CAUSES, schema: RootCausesSchema },
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService]
})
export class DeliveryModule {}
