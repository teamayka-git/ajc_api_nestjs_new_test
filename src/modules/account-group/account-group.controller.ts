import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountGroupCreateDto, AccountGroupEditDto, AccountGroupListDto, AccountGroupStatusChangeDto, CheckNameExistDto } from './account-group.dto';
import { AccountGroupService } from './account-group.service';

@ApiTags('Accounts Group Docs')

@Controller('account-group')
export class AccountGroupController {
  constructor(private readonly accountGroupService: AccountGroupService) {}

  @Post()
  create(@Body() dto: AccountGroupCreateDto, @Request() req) {
    return this.accountGroupService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountGroupEditDto, @Request() req) {
    return this.accountGroupService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountGroupStatusChangeDto, @Request() req) {
    return this.accountGroupService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountGroupListDto) {
    return this.accountGroupService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.accountGroupService.checkNameExisting(dto);
  }

}
