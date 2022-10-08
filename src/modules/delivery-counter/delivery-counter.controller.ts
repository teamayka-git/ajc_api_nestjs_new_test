import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryCounterService } from './delivery-counter.service';
import { DeliveryCounterCreateDto, DeliveryCounterEditDto, DeliveryCounterLinkUnlinkCreateDto, DeliveryCounterListDto, DeliveryCounterStatusChangeDto } from './delivery_counter.dto';


@ApiTags("Delivery Counter Docs") 
@Controller('delivery-counter')
export class DeliveryCounterController {
  constructor(private readonly deliveryCounterService: DeliveryCounterService) {}



  @Post()
  create(@Body() dto: DeliveryCounterCreateDto,@Request() req) {
    return this.deliveryCounterService.create(dto,req["_userId_"]);
  }
  
  @Put()
  edit(@Body() dto: DeliveryCounterEditDto,@Request() req) {
    return this.deliveryCounterService.edit(dto,req["_userId_"]);
  }
  @Delete()
  status_change(@Body() dto: DeliveryCounterStatusChangeDto,@Request() req) {
    return this.deliveryCounterService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:DeliveryCounterListDto) {
    return this.deliveryCounterService.list(dto);
  }



  @Post("linkAndUnlinkUser")
  linkAndUnlinkUser(@Body() dto: DeliveryCounterLinkUnlinkCreateDto,@Request() req) {
    return this.deliveryCounterService.linkAndUnlinkUser(dto,req["_userId_"]);
  }

}
