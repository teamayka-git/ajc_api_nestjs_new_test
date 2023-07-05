import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  InvoiceCreateDto,
  InvoiceListDto,
  InvoiceMigrationDto,
  InvoiceStatusChangeDto,
} from './invoices.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoice Docs')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() dto: InvoiceCreateDto, @Request() req) {
    return this.invoicesService.create(dto, req['_userId_']);
  }
  @Post('deliveryChallanStatusChange')
  edit(@Body() dto: InvoiceStatusChangeDto, @Request() req) {
    return this.invoicesService.deliveryChallanStatusChange(
      dto,
      req['_userId_'],
    );
  }

  @Post('temp_migrateCurrentInvoiceToNewFeild')
  temp_migrateCurrentInvoiceToNewFeild(@Body() dto: InvoiceMigrationDto, @Request() req) {
    return this.invoicesService.temp_migrateCurrentInvoiceToNewFeild(dto, req['_userId_']);
  }
  @Post('temp_migrateCurrentInvoiceToMakingCharge')
  temp_migrateCurrentInvoiceToMakingCharge(@Body() dto: InvoiceMigrationDto, @Request() req) {
    return this.invoicesService.temp_migrateCurrentInvoiceToMakingCharge(dto, req['_userId_']);
  }

  
 

  @Post('list')
  list(@Body() dto: InvoiceListDto) {
    return this.invoicesService.list(dto);
  }
}
