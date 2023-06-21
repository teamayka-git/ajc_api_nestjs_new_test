import { MaterialReceiptService } from './material-receipt.service';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { MaterialReceiptCreateDto, MaterialReceiptEditDto, MaterialReceiptListDto, MaterialReceiptStatusChangeDto } from './material_receipt.dto';


@ApiTags('Material Receipt Docs')
@Controller('material-receipt')
export class MaterialReceiptController {
  constructor(private readonly materialReceiptService: MaterialReceiptService) {}


  @Post()
  create(@Body() dto: MaterialReceiptCreateDto, @Request() req) {
    return this.materialReceiptService.create(dto, req['_userId_']);
  }
  @Put()
  edit(@Body() dto: MaterialReceiptEditDto, @Request() req) {
    return this.materialReceiptService.edit(dto, req['_userId_']);
  }



  @Delete()
  status_change(@Body() dto: MaterialReceiptStatusChangeDto, @Request() req) {
    return this.materialReceiptService.status_change(dto, req['_userId_']);
  }


  @Post('list')
  list(@Body() dto: MaterialReceiptListDto) {
    return this.materialReceiptService.list(dto);
  }

}
