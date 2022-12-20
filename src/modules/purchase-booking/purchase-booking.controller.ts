import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseBookingService } from './purchase-booking.service';
import {
  Body,
  Delete,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PurchaseBookingCreateDto, PurchaseBookingListDto, PurchaseBookingStatusChangeDto } from './purchase_booking.dto';

@ApiTags('Purchase booking Docs')
@Controller('purchase-booking')
export class PurchaseBookingController {
  constructor(private readonly purchaseBookingService: PurchaseBookingService) {}

  
  @Post()
  create(@Body() dto: PurchaseBookingCreateDto, @Request() req) {
    return this.purchaseBookingService.create(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: PurchaseBookingStatusChangeDto, @Request() req) {
    return this.purchaseBookingService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: PurchaseBookingListDto) {
    return this.purchaseBookingService.list(dto);
  }

}
