import { Module } from '@nestjs/common';
import { DeliveryRejectedPendingService } from './delivery-rejected-pending.service';
import { DeliveryRejectedPendingController } from './delivery-rejected-pending.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';
import { DeliveryReturnSchema } from 'src/tableModels/delivery_return.model';
import { DeliveryReturnItemsSchema } from 'src/tableModels/delivery_return_items.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
    ]),
  ],
  controllers: [DeliveryRejectedPendingController],
  providers: [DeliveryRejectedPendingService]
})
export class DeliveryRejectedPendingModule {}
