
import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FactoryStockTransferService } from './factory-stock-transfer.service';
import { FactoryStockTransferCreateDto, FactoryStockTransferListDto, FactoryStockTransferStatusChangeDto } from './factory_stock_transfer.dto';

@ApiTags('Factory Stock Transfer Docs')
@Controller('factory-stock-transfer')
export class FactoryStockTransferController {
  constructor(private readonly factoryStockTransferService: FactoryStockTransferService) {}



  
  @Post()
  create(@Body() dto: FactoryStockTransferCreateDto, @Request() req) {
    return this.factoryStockTransferService.create(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: FactoryStockTransferStatusChangeDto, @Request() req) {
    return this.factoryStockTransferService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: FactoryStockTransferListDto) {
    return this.factoryStockTransferService.list(dto);
  }

}
