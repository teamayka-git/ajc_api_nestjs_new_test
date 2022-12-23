import {
  Body,
  Delete,
  Post,
  Put,
  Request,Controller,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseCreateDto, PurchaseListDto } from './purchase.dto';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchase Docs')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}


  @Post()
  create(@Body() dto: PurchaseCreateDto, @Request() req) {
    return this.purchaseService.create(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: PurchaseListDto) {
    return this.purchaseService.list(dto);
  }


}
