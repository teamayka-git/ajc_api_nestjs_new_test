import { Body, Controller, Delete, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderCreateDto, PurchaseOrderListDto, PurchaseOrderStatusChangeDto } from './purchase_order.dto';

@ApiTags('Purchase Order Docs')
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}
  
  @Post()
  create(@Body() dto: PurchaseOrderCreateDto, @Request() req) {
    return this.purchaseOrderService.create(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: PurchaseOrderStatusChangeDto, @Request() req) {
    return this.purchaseOrderService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: PurchaseOrderListDto) {
    return this.purchaseOrderService.list(dto);
  }

}
 