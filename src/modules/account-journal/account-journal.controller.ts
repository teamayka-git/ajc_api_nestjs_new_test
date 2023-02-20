import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountJournalCreateDto, AccountJournalListDto, AccountJournalStatusChangeDto } from './account-journal.dto';
import { AccountJournalService } from './account-journal.service';

@ApiTags('Accounts Journal Docs')

@Controller('account-journal')
export class AccountJournalController {
  constructor(private readonly AccountJournalService: AccountJournalService) {}


  @Post()
  create(@Body() dto: AccountJournalCreateDto, @Request() req) {
    return this.AccountJournalService.create(dto, req['_userId_']);
  }

  // @Put()
  // edit(@Body() dto: AccountJournalEditDto, @Request() req) {
  //   return this.AccountJournalService.edit(dto, req['_userId_']);
  // }

  // @Delete()
  // status_change(@Body() dto: AccountJournalStatusChangeDto, @Request() req) {
  //   return this.AccountJournalService.status_change(dto, req['_userId_']);
  // }
 
  // @Post('list')
  // list(@Body() dto: AccountJournalListDto) {
  //   return this.AccountJournalService.list(dto);
  // }

  // @Post('checkNameExisting')
  // checkNameExisting(@Body() dto: CheckNameExistDto) {
  //   return this.AccountJournalService.checkNameExisting(dto);
  // }

}
