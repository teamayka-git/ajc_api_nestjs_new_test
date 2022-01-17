import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { BranchCreateDto, BranchEditDto, BranchListDto, BranchStatusChangeDto } from './branch.dto';
import { BranchService } from './branch.service';

@ApiTags("Branch Docs") 
@Controller('branch')
@UseGuards(RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

 
  @Post()
  create(@Body() dto: BranchCreateDto,@Request() req) {
    return this.branchService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  edit(@Body() dto: BranchEditDto,@Request() req) {
    return this.branchService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  status_change(@Body() dto: BranchStatusChangeDto,@Request() req) {
    return this.branchService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  @Roles(GuardUserRole.SUPER_ADMIN)
  list(@Body() dto:BranchListDto) {
    return this.branchService.list(dto);
  }


}
