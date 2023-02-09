import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountLedgerCreateDto, AccountLedgerEditDto, AccountLedgerListDto, AccountLedgerStatusChangeDto, CheckNameExistDto } from './account-ledger.dto';
import { AccountLedgerService } from './account-ledger.service';

@ApiTags('Accounts Ledger Docs')

@Controller('account-ledger')
export class AccountLedgerController {
  constructor(private readonly AccountLedgerService: AccountLedgerService) {}

  @Post()
  create(@Body() dto: AccountLedgerCreateDto, @Request() req) {
    return this.AccountLedgerService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountLedgerEditDto, @Request() req) {
    return this.AccountLedgerService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountLedgerStatusChangeDto, @Request() req) {
    return this.AccountLedgerService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountLedgerListDto) {
    return this.AccountLedgerService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.AccountLedgerService.checkNameExisting(dto);
  }

}

  