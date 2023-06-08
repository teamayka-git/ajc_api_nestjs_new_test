import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountPostInvoiceCreateDto, AccountPostInvoiceEditDto } from './account-post-invoice.dto';
import { AccountPostInvoiceService } from './account-post-invoice.service';

@ApiTags('Accounts Post Invoice Docs')

@Controller('account-post-invoice')
export class AccountPostInvoiceController {
  constructor(private readonly AccountPostInvoiceService: AccountPostInvoiceService) {}


  @Post()
  create(@Body() dto: AccountPostInvoiceCreateDto, @Request() req) {
    return this.AccountPostInvoiceService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountPostInvoiceEditDto, @Request() req) {
    return this.AccountPostInvoiceService.edit(dto, req['_userId_']);
  }

  

}//
