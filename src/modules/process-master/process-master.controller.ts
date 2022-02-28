import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { ProcessMasterService } from './process-master.service';
import { CheckItemExistDto, ListFilterLocadingProcessMasterDto, ProcessMasterCreateDto, ProcessMasterEditDto, ProcessMasterListDto, ProcessMasterStatusChangeDto } from './process_master.dto';

@Controller('process-master')
@UseGuards(RolesGuard)
@ApiTags("Process Masters Docs") 
export class ProcessMasterController {
  constructor(private readonly processMasterService: ProcessMasterService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: ProcessMasterCreateDto,@Request() req) {
    return this.processMasterService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: ProcessMasterEditDto,@Request() req) {
    return this.processMasterService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: ProcessMasterStatusChangeDto,@Request() req) {
    return this.processMasterService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:ProcessMasterListDto) {
    return this.processMasterService.list(dto);
  }

  @Post("listFilterLoadingProcessMaster")
  listFilterLoadingProcessMaster(@Body() dto:ListFilterLocadingProcessMasterDto) {
    return this.processMasterService.listFilterLoadingProcessMaster(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.processMasterService.checkCodeExisting(dto);
  }
  

}
