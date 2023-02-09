import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountHeadCreateDto, AccountHeadEditDto, AccountHeadListDto, AccountHeadStatusChangeDto, CheckNameExistDto } from './account-head.dto';
import { AccountHeadService } from './account-head.service';

@ApiTags('Accounts Head Docs')

@Controller('account-head')
export class AccountHeadController {
  constructor(private readonly accountHeadService: AccountHeadService) {}


  @Post()
  create(@Body() dto: AccountHeadCreateDto, @Request() req) {
    return this.accountHeadService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountHeadEditDto, @Request() req) {
    return this.accountHeadService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountHeadStatusChangeDto, @Request() req) {
    return this.accountHeadService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountHeadListDto) {
    return this.accountHeadService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.accountHeadService.checkNameExisting(dto);
  }

}
