import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountBranchCreateDto, AccountBranchEditDto, AccountBranchListDto, AccountBranchStatusChangeDto, CheckNameExistDto } from './account-branch.dto';
import { AccountBranchService } from './account-branch.service';

@ApiTags('Accounts Branch Docs')

@Controller('account-branch')
export class AccountBranchController {
  constructor(private readonly AccountBranchService: AccountBranchService) {}


  @Post()
  create(@Body() dto: AccountBranchCreateDto, @Request() req) {
    return this.AccountBranchService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountBranchEditDto, @Request() req) {
    return this.AccountBranchService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountBranchStatusChangeDto, @Request() req) {
    return this.AccountBranchService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountBranchListDto) {
    return this.AccountBranchService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.AccountBranchService.checkNameExisting(dto);
  }

}
