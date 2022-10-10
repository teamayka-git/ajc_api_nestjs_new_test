import { Body, Controller, Post, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import {
  ProductCreateDto,
  ProductEcommerceStatusChangeDto,
  ProductListDto,
} from './products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products Docs')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post() 
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'documents',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(@Body() dto: ProductCreateDto, @Request() req, @UploadedFiles() file) {
    return this.productsService.create(dto, req['_userId_'],
    file == null ? {} : JSON.parse(JSON.stringify(file)),);
  }

  @Post('list')
  list(@Body() dto: ProductListDto) {
    return this.productsService.list(dto);
  }

  @Post('change_e_commerce_status')
  change_e_commerce_status(
    @Body() dto: ProductEcommerceStatusChangeDto,
    @Request() req,
  ) {
    return this.productsService.change_e_commerce_status(dto, req['_userId_']);
  }
  @Post('tempGetMinJobPhotographer')
  tempGetMinJobPhotographer() {
    return this.productsService.tempGetMinJobPhotographer();
  }
}
