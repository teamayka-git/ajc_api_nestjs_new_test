import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesReturnService } from './sales-return.service';
import { SalesReturnCreateDto, SalesReturnListDto, SalesReturnStatusChangeDto } from './sales_return.dto';

@ApiTags('Sales return Docs')
@Controller('sales-return')
export class SalesReturnController {
  constructor(private readonly salesReturnService: SalesReturnService) {}

  @Post()
  create(@Body() dto: SalesReturnCreateDto, @Request() req) {
    return this.salesReturnService.create(dto, req['_userId_']);
  }
  @Post('deliveryChallanStatusChange')
  edit(@Body() dto: SalesReturnStatusChangeDto, @Request() req) {
    return this.salesReturnService.deliveryChallanStatusChange(
      dto,
      req['_userId_'],
    );
  }

 
  
  
 

  @Post('list')
  list(@Body() dto: SalesReturnListDto) {
    return this.salesReturnService.list(dto);
  }

}
