import { Controller } from '@nestjs/common';
import { OrderSaleChangeRequestService } from './order-sale-change-request.service';
import {
  Body,
  Delete,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderSaleChangeRequestCreateDto, OrderSaleChangeRequestListDto, OrderSaleChangeRequestStatusChangeDto } from './order_sale_change_request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Order Sale Change Request Docs')
@Controller('order-sale-change-request')
export class OrderSaleChangeRequestController {
  constructor(private readonly orderSaleChangeRequestService: OrderSaleChangeRequestService) {}


  @Post()
  create(@Body() dto: OrderSaleChangeRequestCreateDto, @Request() req) {
    return this.orderSaleChangeRequestService.create(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: OrderSaleChangeRequestStatusChangeDto, @Request() req) {
    return this.orderSaleChangeRequestService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: OrderSaleChangeRequestListDto) {
    return this.orderSaleChangeRequestService.list(dto);
  }


}
