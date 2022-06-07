import { Body, Controller, Delete, Post, Put,Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryTempService } from './delivery-temp.service';
import { DeliveryTempCreateDto, DeliveryTempEmployeeAssignDto, DeliveryTempListDto } from './delivery_temp.dto';


@ApiTags("Delivery temp Docs") 
@Controller('delivery-temp')
export class DeliveryTempController {
  constructor(private readonly deliveryTempService: DeliveryTempService) {
  }



  @Post()
  create(@Body() dto: DeliveryTempCreateDto,@Request() req) {
    return this.deliveryTempService.create(dto,req["_userId_"]);
  }
    
  
  @Post("employeeAssign")
  employeeAssign(@Body() dto: DeliveryTempEmployeeAssignDto,@Request() req) {
    return this.deliveryTempService.employeeAssign(dto,req["_userId_"]);
  }
    
    @Post("list")
    list(@Body() dto:DeliveryTempListDto,@Request() req) {
      return this.deliveryTempService.list(dto,req["_userId_"]);
    }

}
