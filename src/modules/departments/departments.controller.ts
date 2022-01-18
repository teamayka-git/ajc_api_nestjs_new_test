import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { DepartmentCreateDto, DepartmentEditDto, DepartmentListDto, DepartmentStatusChangeDto } from './departments.dto';
import { DepartmentsService } from './departments.service';

@Controller('departments')
@UseGuards(RolesGuard)
@ApiTags("Department Docs") 
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: DepartmentCreateDto,@Request() req) {
    return this.departmentsService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: DepartmentEditDto,@Request() req) {
    return this.departmentsService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: DepartmentStatusChangeDto,@Request() req) {
    return this.departmentsService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:DepartmentListDto) {
    return this.departmentsService.list(dto);
  }

}
