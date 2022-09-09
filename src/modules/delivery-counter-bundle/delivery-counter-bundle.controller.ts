import { Body, Controller, Post, Request } from '@nestjs/common';
import { DeliveryCounterBundleService } from './delivery-counter-bundle.service';
import { DeliveryCounterBundleCreateDto, DeliveryCounterModuleWorkStatusChangeDto, DeliveryReturnListDto } from './delivery-counter_bundle.dto';

@Controller('delivery-counter-bundle')
export class DeliveryCounterBundleController {
  constructor(private readonly deliveryCounterBundleService: DeliveryCounterBundleService) {}


  @Post()
  create(@Body() dto: DeliveryCounterBundleCreateDto, @Request() req) {
    return this.deliveryCounterBundleService.create(dto, req['_userId_']);
  }

  @Post('changeWorkStatus')
  changeWorkStatus(
    @Body() dto: DeliveryCounterModuleWorkStatusChangeDto,
    @Request() req,
  ) {
    return this.deliveryCounterBundleService.changeWorkStatus(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: DeliveryReturnListDto) {
    return this.deliveryCounterBundleService.list(dto);
  }

}
