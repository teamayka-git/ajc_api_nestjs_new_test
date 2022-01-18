import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { StoneCreateDto, StoneEditDto, StoneListDto, StoneStatusChangeDto } from './stone.dto';
import { StoneService } from './stone.service';

@UseGuards(RolesGuard)
@ApiTags("Stone Docs") 
@Controller('stone')
export class StoneController {
  constructor(private readonly stoneService: StoneService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: StoneCreateDto,@Request() req) {
    return this.stoneService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: StoneEditDto,@Request() req) {
    return this.stoneService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: StoneStatusChangeDto,@Request() req) {
    return this.stoneService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:StoneListDto) {
    return this.stoneService.list(dto);
  }



}
