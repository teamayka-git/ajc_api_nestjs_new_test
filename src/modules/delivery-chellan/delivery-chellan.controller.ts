import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryChellanService } from './delivery-chellan.service';
import {
  DeliveryChallanCreateDto,
  DeliveryChallanListDto,
  DeliveryChallanStatusChangeDto,
} from './delivery_chellan.dto';

@ApiTags('Delivery Challan Docs')
@Controller('delivery-chellan')
export class DeliveryChellanController {
  constructor(
    private readonly deliveryChellanService: DeliveryChellanService,
  ) {}

  @Post()
  create(@Body() dto: DeliveryChallanCreateDto, @Request() req) {
    return this.deliveryChellanService.create(dto, req['_userId_']);
  }
  @Post('deliveryChallanStatusChange')
  edit(@Body() dto: DeliveryChallanStatusChangeDto, @Request() req) {
    return this.deliveryChellanService.deliveryChallanStatusChange(
      dto,
      req['_userId_'],
    );
  }

  @Post('list')
  list(@Body() dto: DeliveryChallanListDto) {
    return this.deliveryChellanService.list(dto);
  }
}
