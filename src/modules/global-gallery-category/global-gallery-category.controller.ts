import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { GlobalGalleryCategoryService } from './global-gallery-category.service';
import { CheckNameExistDto, GlobalGalleryCategoryCreateDto, GlobalGalleryCategoryEditDto, GlobalGalleryCategoryListDto, GlobalGalleryCategoryStatusChangeDto } from './global_gallery_category.dto';

@UseGuards(RolesGuard)
@ApiTags("Global Gallery Catterogy Docs") 
@Controller('global-gallery-category')
export class GlobalGalleryCategoryController {
  constructor(private readonly globalGalleryCategoryService: GlobalGalleryCategoryService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: GlobalGalleryCategoryCreateDto,@Request() req) {
    return this.globalGalleryCategoryService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: GlobalGalleryCategoryEditDto,@Request() req) {
    return this.globalGalleryCategoryService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: GlobalGalleryCategoryStatusChangeDto,@Request() req) {
    return this.globalGalleryCategoryService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:GlobalGalleryCategoryListDto) {
    return this.globalGalleryCategoryService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.globalGalleryCategoryService.checkNameExisting(dto);
  }
  
}
