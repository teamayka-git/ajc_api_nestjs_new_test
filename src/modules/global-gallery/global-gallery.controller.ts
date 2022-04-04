import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { GlobalGalleryService } from './global-gallery.service';
import {
  GlobalGalleryCreateDto,
  GlobalGalleryListDto,
  GlobalGalleryStatusChangeDto,
  HomeDefaultFolderDto,
  HomeItemsDto,
} from './global_gallery.dto';
import { diskStorage } from 'multer';

@UseGuards(RolesGuard)
@ApiTags('Global Gallery Docs')
@Controller('global-gallery')
export class GlobalGalleryController {
  constructor(private readonly globalGalleryService: GlobalGalleryService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [documents]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'documents',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathGlobalGalleries,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(
    @Body() dto: GlobalGalleryCreateDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.globalGalleryService.create(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Delete()
  status_change(@Body() dto: GlobalGalleryStatusChangeDto, @Request() req) {
    return this.globalGalleryService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: GlobalGalleryListDto) {
    return this.globalGalleryService.list(dto);
  }

  @Post('home')
  home() {
    return this.globalGalleryService.home();
  }

  @Post('homeDefaultFolder')
  homeDefaultFolder(@Body() dto: HomeDefaultFolderDto) {
    return this.globalGalleryService.homeDefaultFolder(dto);
  }

  @Post('homeItems')
  homeItems(@Body() dto: HomeItemsDto) {
    return this.globalGalleryService.homeItems(dto);
  }
}
