import { Body, Controller, Delete, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { SubCategoriesService } from './sub-categories.service';
import { CheckItemExistDto, ListFilterLocadingSubCategoryDto, SubCategoriesCreateDto, SubCategoriesEditDto, SubCategoriesListDto, SubCategoriesStatusChangeDto } from './sub_categories.dto';


import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';

@ApiTags("SubCategories Docs") 
@UseGuards(RolesGuard)
@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [image]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempSubCategory,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: SubCategoriesCreateDto,@Request() req, @UploadedFiles() file) {
    return this.subCategoriesService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [image]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempSubCategory,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  edit(@Body() dto: SubCategoriesEditDto,@Request() req, @UploadedFiles() file) {
    return this.subCategoriesService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
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
  @Post("listFilterLoadingSubCategory")
  listFilterLoadingSubCategory(@Body() dto:ListFilterLocadingSubCategoryDto) {
    return this.subCategoriesService.listFilterLoadingSubCategory(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.subCategoriesService.checkCodeExisting(dto);
  }
  


}
