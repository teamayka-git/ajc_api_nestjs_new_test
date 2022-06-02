import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { TcsMastersService } from './tcs-masters.service';
import { TcsMastersCreateDto, TcsMastersEditDto, TcsMastersListDto, TcsMastersStatusChangeDto } from './tcs_masters.dto';

@Controller('tcs-masters')
@UseGuards(RolesGuard)
@ApiTags("TCS masters Docs") 
export class TcsMastersController {
  constructor(private readonly tcsMastersService: TcsMastersService) {}



  @Post()
   
  create(@Body() dto: TcsMastersCreateDto,@Request() req) {
    return this.tcsMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: TcsMastersEditDto,@Request() req) {
    return this.tcsMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: TcsMastersStatusChangeDto,@Request() req) {
    return this.tcsMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TcsMastersListDto) {
    return this.tcsMastersService.list(dto);
  }


}
