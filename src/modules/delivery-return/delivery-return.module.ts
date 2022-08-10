import { Module } from '@nestjs/common';
import { DeliveryReturnService } from './delivery-return.service';
import { DeliveryReturnController } from './delivery-return.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryReturnSchema } from 'src/tableModels/delivery_return.model';
import { DeliveryReturnItemsSchema } from 'src/tableModels/delivery_return_items.model';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_RETURN, schema: DeliveryReturnSchema },
      { name: ModelNames.DELIVERY_RETURN_ITEMS, schema: DeliveryReturnItemsSchema },
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
      { name: ModelNames.COUNTERS, schema:CountersSchema },
    ]),
  ],
  controllers: [DeliveryReturnController],
  providers: [DeliveryReturnService]
})
export class DeliveryReturnModule {}
