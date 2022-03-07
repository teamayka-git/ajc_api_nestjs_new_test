import { ApiTags } from '@nestjs/swagger';
import { OrderSaleSetProcessService } from './order-sale-set-process.service';
import { SetProcessCreateDto } from './order_sale_set_process.dto';
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



    @Post()
    @Roles(GuardUserRole.SUPER_ADMIN)
    create(@Body() dto: SetProcessCreateDto,@Request() req) {
      return this.orderSaleSetProcessService.create(dto,req["_userId_"]);
    }

  }

