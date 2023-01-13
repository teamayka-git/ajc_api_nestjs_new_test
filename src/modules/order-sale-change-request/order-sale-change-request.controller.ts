import { Controller } from '@nestjs/common';
import { OrderSaleChangeRequestService } from './order-sale-change-request.service';
import {
  Body,
  Delete,
  Post,
  Put,
  Request,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { CancelRequestAcceptDto, OrderSaleChangeRequestCreateDto, OrderSaleChangeRequestListDto, OrderSaleChangeRequestStatusChangeDto } from './order_sale_change_request.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Order Sale Change Request Docs')
@Controller('order-sale-change-request')
export class OrderSaleChangeRequestController {
  constructor(private readonly orderSaleChangeRequestService: OrderSaleChangeRequestService) {}


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
          destination: FileMulterHelper.filePathTempShop,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(@Body() dto: OrderSaleChangeRequestCreateDto, @Request() req,
  @UploadedFiles() file,) {
    return this.orderSaleChangeRequestService.create(dto, req['_userId_'],
    file == null ? {} : JSON.parse(JSON.stringify(file)),);
  }

  @Delete()
  status_change(@Body() dto: OrderSaleChangeRequestStatusChangeDto, @Request() req) {
    return this.orderSaleChangeRequestService.status_change(dto, req['_userId_']);
  }

  @Post("cancelRequestAccept")
  cancelRequestAccept(@Body() dto: CancelRequestAcceptDto, @Request() req) {
    return this.orderSaleChangeRequestService.cancelRequestAccept(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: OrderSaleChangeRequestListDto) {
    return this.orderSaleChangeRequestService.list(dto);
  }


}
