import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { GlobalGallerySubCategoryService } from './global-gallery-sub-category.service';
import { GlobalGallerySubCategoryCreateDto, GlobalGallerySubCategoryEditDto, GlobalGallerySubCategoryListDto, GlobalGallerySubCategoryStatusChangeDto } from './global_gallery_sub_category.dto';

@UseGuards(RolesGuard)
@ApiTags("Global Gallery Sub Catterogy Docs") 
@Controller('global-gallery-sub-category')
export class GlobalGallerySubCategoryController {
  constructor(private readonly globalGallerySubCategoryService: GlobalGallerySubCategoryService) {}




  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: GlobalGallerySubCategoryCreateDto,@Request() req) {
    return this.globalGallerySubCategoryService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: GlobalGallerySubCategoryEditDto,@Request() req) {
    return this.globalGallerySubCategoryService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: GlobalGallerySubCategoryStatusChangeDto,@Request() req) {
    return this.globalGallerySubCategoryService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:GlobalGallerySubCategoryListDto) {
    return this.globalGallerySubCategoryService.list(dto);
  }


}
