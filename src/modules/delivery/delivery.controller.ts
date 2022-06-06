import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryCreateDto, DeliveryEmployeeAssignDto, DeliveryListDto } from './delivery.dto';
import { DeliveryService } from './delivery.service';


@ApiTags("Delivery Docs") 
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}



  @Post()
  create(@Body() dto: DeliveryCreateDto,@Request() req) {
    return this.deliveryService.create(dto,req["_userId_"]);
  }
    
  
  @Post("deliveryWorkStatusUpdate")
  deliveryWorkStatusUpdate(@Body() dto: DeliveryEmployeeAssignDto,@Request() req) {
    return this.deliveryService.deliveryWorkStatusUpdate(dto,req["_userId_"]);
  }
    
    @Post("list")
    list(@Body() dto:DeliveryListDto) {
      return this.deliveryService.list(dto);
    }


}
