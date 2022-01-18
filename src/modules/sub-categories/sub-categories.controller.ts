import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesCreateDto, SubCategoriesEditDto, SubCategoriesListDto, SubCategoriesStatusChangeDto } from './sub_categories.dto';



@ApiTags("SubCategories Docs") 
@UseGuards(RolesGuard)
@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: SubCategoriesCreateDto,@Request() req) {
    return this.subCategoriesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: SubCategoriesEditDto,@Request() req) {
    return this.subCategoriesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: SubCategoriesStatusChangeDto,@Request() req) {
    return this.subCategoriesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:SubCategoriesListDto) {
    return this.subCategoriesService.list(dto);
  }



}
