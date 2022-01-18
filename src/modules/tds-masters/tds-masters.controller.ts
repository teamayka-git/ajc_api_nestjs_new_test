import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { TdsMastersService } from './tds-masters.service';
import { TdsMastersCreateDto, TdsMastersEditDto, TdsMastersListDto, TdsMastersStatusChangeDto } from './tds_masters.dto';

@Controller('tds-masters')
@UseGuards(RolesGuard)
@ApiTags("TDS masters Docs") 
export class TdsMastersController {
  constructor(private readonly tdsMastersService: TdsMastersService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: TdsMastersCreateDto,@Request() req) {
    return this.tdsMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: TdsMastersEditDto,@Request() req) {
    return this.tdsMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: TdsMastersStatusChangeDto,@Request() req) {
    return this.tdsMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TdsMastersListDto) {
    return this.tdsMastersService.list(dto);
  }

}
