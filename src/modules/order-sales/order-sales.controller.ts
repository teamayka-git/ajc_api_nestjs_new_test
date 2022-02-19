import { Body, Controller, Delete, Post, Put, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { OrderSalesService } from './order-sales.service';
import { diskStorage } from 'multer';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { OrderSaleListDto, OrderSalesChangeDto, OrderSalesCreateDto, OrderSalesEditDto } from './order_sales.dto';



@ApiTags("Order Sale Docs") 
@Controller('order-sales')
export class OrderSalesController {
  constructor(private readonly orderSalesService: OrderSalesService) {}


  @Post()
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [documents]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempCustomer,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: OrderSalesCreateDto,@Request() req, @UploadedFiles() file) {
    return this.orderSalesService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  
  @Put()
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [documents]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  edit(@Body() dto: OrderSalesEditDto,@Request() req, @UploadedFiles() file) {
    return this.orderSalesService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  @Delete()
  status_change(@Body() dto: OrderSalesChangeDto,@Request() req) {
    return this.orderSalesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:OrderSaleListDto) {
    return this.orderSalesService.list(dto);
  }


}
