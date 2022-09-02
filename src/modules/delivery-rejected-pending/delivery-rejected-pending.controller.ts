import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryRejectListListDto, DeliveryRejectPendingCreateDto } from './delivery-rejected-pending.dto';
import { DeliveryRejectedPendingService } from './delivery-rejected-pending.service';


@ApiTags("Delivery reject pending Docs") 
@Controller('delivery-rejected-pending')
export class DeliveryRejectedPendingController {
  constructor(private readonly deliveryRejectedPendingService: DeliveryRejectedPendingService) {}


  @Post()
  create(@Body() dto: DeliveryRejectPendingCreateDto,@Request() req) {
    return this.deliveryRejectedPendingService.create(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:DeliveryRejectListListDto) {
    return this.deliveryRejectedPendingService.list(dto);
  }
}
