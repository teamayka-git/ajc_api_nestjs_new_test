import { ApiTags } from '@nestjs/swagger';
import { OrderSaleSetProcessService } from './order-sale-set-process.service';
import { ChangeProcessOrderStatusDto, ChangeSubProcessOrderStatusDto, SetProcessCreateDto } from './order_sale_set_process.dto';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { Roles } from 'src/Auth/roles.decorator';
import { request } from 'http';


@ApiTags("Order Sale Set Process Docs") 
@Controller('order-sale-set-process')
@UseGuards(RolesGuard)
export class OrderSaleSetProcessController {
  constructor(private readonly orderSaleSetProcessService: OrderSaleSetProcessService) {}

 

  @Post("create")
  create(@Body() dto: SetProcessCreateDto,@Request() req) {
    return this.orderSaleSetProcessService.create(dto,req["_userId_"]);
  }


  
  @Post("changeProcessOrderStatus")
  changeProcessOrderStatus(@Body() dto: ChangeProcessOrderStatusDto,@Request() req) {
    return this.orderSaleSetProcessService.changeProcessOrderStatus(dto,req["_userId_"]);
  }
  
  @Post("changeSubProcessOrderStatus")
  changeSubProcessOrderStatus(@Body() dto: ChangeSubProcessOrderStatusDto,@Request() req) {
    return this.orderSaleSetProcessService.changeSubProcessOrderStatus(dto,req["_userId_"]);
  }

  }

