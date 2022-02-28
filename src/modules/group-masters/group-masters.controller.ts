import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { GroupMastersService } from './group-masters.service';
import { CheckNameExistDto, GroupMastersCreateDto, GroupMastersEditDto, GroupMastersListDto, GroupMastersStatusChangeDto } from './group_masters.dto';

@Controller('group-masters')
@ApiTags("Group master Docs") 
@UseGuards(RolesGuard)
export class GroupMastersController {
  constructor(private readonly groupMastersService: GroupMastersService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: GroupMastersCreateDto,@Request() req) {
    return this.groupMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: GroupMastersEditDto,@Request() req) {
    return this.groupMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: GroupMastersStatusChangeDto,@Request() req) {
    return this.groupMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:GroupMastersListDto) {
    return this.groupMastersService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.groupMastersService.checkNameExisting(dto);
  }
  

}
