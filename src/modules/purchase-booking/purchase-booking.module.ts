import { Module } from '@nestjs/common';
import { PurchaseBookingService } from './purchase-booking.service';
import { PurchaseBookingController } from './purchase-booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PurchaseBookingSchema } from 'src/tableModels/purchase_booking.model';
import { PurchaseBookingItemSchema } from 'src/tableModels/purchase_booking_item.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PURCHASE_BOOKINGS, schema: PurchaseBookingSchema },
      { name: ModelNames.PURCHASE_BOOKING_ITEMS, schema: PurchaseBookingItemSchema },
    ]),
  ],
  controllers: [PurchaseBookingController],
  providers: [PurchaseBookingService],
})
export class PurchaseBookingModule {}
