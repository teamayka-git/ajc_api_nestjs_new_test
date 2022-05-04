import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryProviderService } from './delivery-provider.service';
import {
  CheckNameExistDto,
  DeliveryProviderCreateDto,
  DeliveryProviderEditDto,
  DeliveryProviderListDto,
  DeliveryProviderStatusChangeDto,
} from './delivery_provider.dto';

@Controller('delivery-provider')
@ApiTags('Delivery Provider Docs')
export class DeliveryProviderController {
  constructor(
    private readonly deliveryProviderService: DeliveryProviderService,
  ) {}

  @Post()
  create(@Body() dto: DeliveryProviderCreateDto, @Request() req) {
    return this.deliveryProviderService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: DeliveryProviderEditDto, @Request() req) {
    return this.deliveryProviderService.edit(dto, req['_userId_']);
  }
  @Delete()
  status_change(@Body() dto: DeliveryProviderStatusChangeDto, @Request() req) {
    return this.deliveryProviderService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: DeliveryProviderListDto) {
    return this.deliveryProviderService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.deliveryProviderService.checkNameExisting(dto);
  }
}
