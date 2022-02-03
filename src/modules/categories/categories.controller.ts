import { Body, Controller, Delete, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CategoriesCreateDto, CategoriesEditDto, CategoriesListDto, CategoriesStatusChangeDto, ListFilterLocadingCategoryDto } from './categories.dto';
import { CategoriesService } from './categories.service';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';

@ApiTags("Categories Docs") 
@UseGuards(RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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
          destination: FileMulterHelper.filePathTempCategory,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: CategoriesCreateDto,@Request() req, @UploadedFiles() file) {
    return this.categoriesService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
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
          destination: FileMulterHelper.filePathTempCategory,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  edit(@Body() dto: CategoriesEditDto,@Request() req, @UploadedFiles() file) {
    return this.categoriesService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
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
