import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckNameExistDto, UnitMasterCreateDto, UnitMasterEditDto, UnitMasterListDto, UnitMasterStatusChangeDto } from './process_master.dto';
import { UnitMastersService } from './unit-masters.service';

@Controller('unit-masters')
@UseGuards(RolesGuard)
@ApiTags("Unit Masters Docs") 
export class UnitMastersController {
  constructor(private readonly unitMastersService: UnitMastersService) {}


  @Post()
   
  create(@Body() dto: UnitMasterCreateDto,@Request() req) {
    return this.unitMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: UnitMasterEditDto,@Request() req) {
    return this.unitMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: UnitMasterStatusChangeDto,@Request() req) {
    return this.unitMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:UnitMasterListDto) {
    return this.unitMastersService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.unitMastersService.checkNameExisting(dto);
  }
  

}
