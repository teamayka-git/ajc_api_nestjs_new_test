import { Module } from '@nestjs/common';
import { PurchaseBookingService } from './purchase-booking.service';
import { PurchaseBookingController } from './purchase-booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PurchaseBookingSchema } from 'src/tableModels/purchase_booking.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PURCHASE_BOOKINGS, schema: PurchaseBookingSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [PurchaseBookingController],
  providers: [PurchaseBookingService],
})
export class PurchaseBookingModule {}
