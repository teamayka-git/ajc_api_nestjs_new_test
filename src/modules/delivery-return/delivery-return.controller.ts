import { Body, Controller, Post, Request } from '@nestjs/common';
import { DeliveryRejectWorkStatusChangeDto, DeliveryReturnCreateDto, DeliveryReturnListDto } from './delivery-return.dto';
import { DeliveryReturnService } from './delivery-return.service';

@Controller('delivery return')
@Controller('delivery-return')
export class DeliveryReturnController {
  constructor(private readonly deliveryReturnService: DeliveryReturnService) {}


  @Post()
   
  create(@Body() dto: DeliveryReturnCreateDto,@Request() req) {
    return this.deliveryReturnService.create(dto,req["_userId_"]);
  }
  @Post("changeWorkStatus")
   
  changeWorkStatus(@Body() dto: DeliveryRejectWorkStatusChangeDto,@Request() req) {
    return this.deliveryReturnService.changeWorkStatus(dto,req["_userId_"]);
  }

  @Post("list")
  list(@Body() dto:DeliveryReturnListDto) {
    return this.deliveryReturnService.list(dto);
  }
}
