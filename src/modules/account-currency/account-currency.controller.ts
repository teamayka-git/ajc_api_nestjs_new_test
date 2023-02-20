import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCurrencyCreateDto, AccountCurrencyEditDto, AccountCurrencyListDto, AccountCurrencyStatusChangeDto, CheckNameExistDto } from './account-currency.dto';
import { AccountCurrencyService } from './account-currency.service';

@ApiTags('Accounts Currency Docs')

@Controller('account-currency')
export class AccountCurrencyController {
  constructor(private readonly AccountCurrencyService: AccountCurrencyService) {}


  @Post()
  create(@Body() dto: AccountCurrencyCreateDto, @Request() req) {
    return this.AccountCurrencyService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountCurrencyEditDto, @Request() req) {
    return this.AccountCurrencyService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountCurrencyStatusChangeDto, @Request() req) {
    return this.AccountCurrencyService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountCurrencyListDto) {
    return this.AccountCurrencyService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.AccountCurrencyService.checkNameExisting(dto);
  }

}
