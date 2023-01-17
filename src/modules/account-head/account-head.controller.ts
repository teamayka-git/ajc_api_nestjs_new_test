import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountHeadCreateDto } from './account-head.dto';
import { AccountHeadService } from './account-head.service';

@ApiTags('Accounts Head Docs')

@Controller('account-head')
export class AccountHeadController {
  constructor(private readonly accountHeadService: AccountHeadService) {}


  @Post()
  create(@Body() dto: AccountHeadCreateDto, @Request() req) {
    return this.accountHeadService.create(dto, req['_userId_']);
  }


}
