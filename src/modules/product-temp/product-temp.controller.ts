import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductTempService } from './product-temp.service';import {
  Body,
  Delete,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductTempCreateDto, ProductTempEditDto, ProductTempListDto, ProductTempStatusChangeDto } from './product_temp.dto';

@ApiTags('Product Docs')
@Controller('product-temp')
export class ProductTempController {
  constructor(private readonly productTempService: ProductTempService) {}

  
  @Post()
  create(@Body() dto: ProductTempCreateDto, @Request() req) {
    return this.productTempService.create(dto, req['_userId_']);
  }
 
  @Put()
  edit(@Body() dto: ProductTempEditDto,@Request() req) {
    return this.productTempService.edit(dto,req["_userId_"]);
  }
  @Delete()
  status_change(@Body() dto: ProductTempStatusChangeDto, @Request() req) {
    return this.productTempService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: ProductTempListDto) {
    return this.productTempService.list(dto);
  }
}
