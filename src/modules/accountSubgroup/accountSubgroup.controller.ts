import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { AccountSubgroupService } from './accountSubgroup.service';
import { AccountSubgroupCreateDto, AccountSubgroupEditDto, AccountSubgroupListDto, AccountSubgroupStatusChangeDto,CheckNameExistDto } from './accountSubgroup.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Accounts Sub Group Docs')

@Controller('account-Subgroup')
export class AccountSubgroupController {
  
  constructor(private readonly AccountSubgroupService: AccountSubgroupService) {}

  @Post()
  create(@Body() dto: AccountSubgroupCreateDto, @Request() req) {
    return this.AccountSubgroupService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: AccountSubgroupEditDto, @Request() req) {
    return this.AccountSubgroupService.edit(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: AccountSubgroupStatusChangeDto, @Request() req) {
    return this.AccountSubgroupService.status_change(dto, req['_userId_']);
  }
 
  @Post('list')
  list(@Body() dto: AccountSubgroupListDto) {
    return this.AccountSubgroupService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.AccountSubgroupService.checkNameExisting(dto);
  }

}
