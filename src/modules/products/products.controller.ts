import { Body, Controller, Post, Request } from '@nestjs/common';
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
  create(@Body() dto: ProductCreateDto, @Request() req) {
    return this.productsService.create(dto, req['_userId_']);
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
