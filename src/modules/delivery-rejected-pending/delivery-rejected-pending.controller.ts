import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryRejectListListDto } from './delivery-rejected-pending.dto';
import { DeliveryRejectedPendingService } from './delivery-rejected-pending.service';

@Controller('delivery-rejected-pending')
export class DeliveryRejectedPendingController {
  constructor(private readonly deliveryRejectedPendingService: DeliveryRejectedPendingService) {}


  
  @Post("list")
  list(@Body() dto:DeliveryRejectListListDto) {
    return this.deliveryRejectedPendingService.list(dto);
  }
}
