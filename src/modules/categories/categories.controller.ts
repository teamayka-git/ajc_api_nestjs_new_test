import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CategoriesCreateDto, CategoriesEditDto, CategoriesListDto, CategoriesStatusChangeDto, ListFilterLocadingCategoryDto } from './categories.dto';
import { CategoriesService } from './categories.service';

@ApiTags("Categories Docs") 
@UseGuards(RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: CategoriesCreateDto,@Request() req) {
    return this.categoriesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: CategoriesEditDto,@Request() req) {
    return this.categoriesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: CategoriesStatusChangeDto,@Request() req) {
    return this.categoriesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:CategoriesListDto) {
    return this.categoriesService.list(dto);
  }  
  @Post("listFilterLoadingCategory")
  listFilterLoadingCategory(@Body() dto:ListFilterLocadingCategoryDto) {
    return this.categoriesService.listFilterLoadingCategory(dto);
  }


}
