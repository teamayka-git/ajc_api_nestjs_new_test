import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { OrderSalesService } from './order-sales.service';
import { diskStorage } from 'multer';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import {
  EditOrderSaleGeneralRemarkDto,
  GetWorkCountDto,
  GlobalSearchDto,
  OrderSaleHistoryListDto,
  OrderSaleListDto,
  OrderSaleReportListDto,
  OrderSalesChangeDto,
  OrderSalesCreateDto,
  OrderSalesEditDto,
  OrderSalesGetOrderDetailsFromQrBarcodeDto,
  OrderSalesGetOrderIdFromQrBarcodeDto,
  OrderSalesWorkStatusChangeDto,
  SetProcessAssignedOrderSaleListDto,
} from './order_sales.dto';

@ApiTags('Order Sale Docs')
@Controller('order-sales')
export class OrderSalesController {
  constructor(private readonly orderSalesService: OrderSalesService) {}

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
  create(
    @Body() dto: OrderSalesCreateDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.orderSalesService.create(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Put()
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
  edit(@Body() dto: OrderSalesEditDto, @Request() req, @UploadedFiles() file) {
    return this.orderSalesService.edit(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }
  @Delete()
  status_change(@Body() dto: OrderSalesChangeDto, @Request() req) {
    return this.orderSalesService.status_change(dto, req['_userId_']);
  }

  @Post('change_work_status')
  change_work_status(
    @Body() dto: OrderSalesWorkStatusChangeDto,
    @Request() req,
  ) {
    return this.orderSalesService.change_work_status(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: OrderSaleListDto) {
    return this.orderSalesService.list(dto);
  }

  @Post('reportList')
  reportList(@Body() dto: OrderSaleReportListDto) {
    return this.orderSalesService.reportList(dto);
  }

  @Post('set_proccess_assigned_order_sale_list')
  set_proccess_assigned_order_sale_list(
    @Body() dto: SetProcessAssignedOrderSaleListDto,
    @Request() req,
  ) {
    return this.orderSalesService.set_proccess_assigned_order_sale_list(
      dto,
      req['_userId_'],
    );
  }

  @Post('orderSaleHistories')
  orderSaleHistories(@Body() dto: OrderSaleHistoryListDto, @Request() req) {
    return this.orderSalesService.orderSaleHistories(dto, req['_userId_']);
  }
  @Post('editOrderSaleGeneralRemarks')
  editOrderSaleGeneralRemarks(
    @Body() dto: EditOrderSaleGeneralRemarkDto,
    @Request() req,
  ) {
    return this.orderSalesService.editOrderSaleGeneralRemarks(
      dto,
      req['_userId_'],
    );
  }


  @Post('getOrderIdFromQrBarCode')
  getOrderIdFromQrBarCode(
    @Body() dto: OrderSalesGetOrderIdFromQrBarcodeDto,
    @Request() req,
  ) {
    return this.orderSalesService.getOrderIdFromQrBarCode(dto, req['_userId_']);
  }

  @Post('globalSearch')
  globalSearch(
    @Body() dto: GlobalSearchDto,
    @Request() req,
  ) {
    return this.orderSalesService.globalSearch(dto, req['_userId_']);
  }

  @Post('getOrderDetailsFromQrBarCode')
  getOrderDetailsFromQrBarCode(
    @Body() dto: OrderSalesGetOrderDetailsFromQrBarcodeDto,
    @Request() req,
  ) {
    return this.orderSalesService.getOrderDetailsFromQrBarCode(dto, req['_userId_']);
  }


  @Post('getWorkCount')
  getWorkCount(
    @Body() dto: GetWorkCountDto,
    @Request() req,
  ) {
    return this.orderSalesService.getWorkCount(dto, req['_userId_']);
  }


}
