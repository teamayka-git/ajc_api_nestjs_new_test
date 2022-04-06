import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CitiesCreateDto, CitiesListDto } from './products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products Docs')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CitiesCreateDto, @Request() req) {
    return this.productsService.create(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: CitiesListDto) {
    return this.productsService.list(dto);
  }
}
