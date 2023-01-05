import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { StorePromotionsService } from './store-promotions.service';
import {
  StorePromotionsCreateDto,
  StorePromotionsListDto,
  StorePromotionsStatusChangeDto,
} from './store_promotions.dto';

@ApiTags('Store Promotions Docs')
@Controller('store-promotions')
export class StorePromotionsController {
  constructor(
    private readonly storePromotionsService: StorePromotionsService,
  ) {}

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
        {
          name: 'documentsDesk',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempShop,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(
    @Body() dto: StorePromotionsCreateDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.storePromotionsService.create(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Delete()
  status_change(@Body() dto: StorePromotionsStatusChangeDto, @Request() req) {
    return this.storePromotionsService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: StorePromotionsListDto) {
    return this.storePromotionsService.list(dto);
  }
}
