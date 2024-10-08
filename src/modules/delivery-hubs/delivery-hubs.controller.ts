import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { DeliveryHubsService } from './delivery-hubs.service';
import { CheckItemExistDto, CheckNameExistDto, DeliveryHubAcrossEmployeesAndCustomersDto, DeliveryHubCreateDto, DeliveryHubEditDto, DeliveryHubListDto, DeliveryHubStatusChangeDto, ListFilterLocadingDeliveryHubDto } from './delivery_hubs.dto';

@ApiTags("Delivery_hubs Docs") 
@Controller('delivery-hubs')
@UseGuards(RolesGuard)
export class DeliveryHubsController {
  constructor(private readonly deliveryHubsService: DeliveryHubsService) {}

  @Post()
   
  create(@Body() dto: DeliveryHubCreateDto,@Request() req) {
    return this.deliveryHubsService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: DeliveryHubEditDto,@Request() req) {
    return this.deliveryHubsService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: DeliveryHubStatusChangeDto,@Request() req) {
    return this.deliveryHubsService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:DeliveryHubListDto) {
    return this.deliveryHubsService.list(dto);
  }
  @Post("listFilterLoadingDeliveryHub")
  listFilterLoadingDeliveryHub(@Body() dto:ListFilterLocadingDeliveryHubDto) {
    return this.deliveryHubsService.listFilterLoadingDeliveryHub(dto);
  }
  @Post('listUsersDeliveryHubAcross')
  listUsersDeliveryHubAcross(
    @Body() dto: DeliveryHubAcrossEmployeesAndCustomersDto,
    @Request() req,
  ) {
    return this.deliveryHubsService.listUsersDeliveryHubAcross(
      dto,
      req['_userId_'],
    );
  }

  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.deliveryHubsService.checkCodeExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.deliveryHubsService.checkNameExisting(dto);
  }
  
}
