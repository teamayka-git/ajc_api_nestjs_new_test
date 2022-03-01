import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { OrderSaleRootCausesService } from './order-sale-root-causes.service';
import { OrderSaleRootCauseCreateDto, OrderSaleRootCauseEditDto, OrderSaleRootCauseExistDto, OrderSaleRootCauseListDto, OrderSaleRootCauseStatusChangeDto } from './order_sale_root_causes.dto';

@ApiTags("Order sale root causes Docs") 
@Controller('order-sale-root-causes')
export class OrderSaleRootCausesController {
  constructor(private readonly orderSaleRootCausesService: OrderSaleRootCausesService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: OrderSaleRootCauseCreateDto,@Request() req) {
    return this.orderSaleRootCausesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: OrderSaleRootCauseEditDto,@Request() req) {
    return this.orderSaleRootCausesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: OrderSaleRootCauseStatusChangeDto,@Request() req) {
    return this.orderSaleRootCausesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:OrderSaleRootCauseListDto) {
    return this.orderSaleRootCausesService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:OrderSaleRootCauseExistDto) {
    return this.orderSaleRootCausesService.checkNameExisting(dto);
  }
  

}
