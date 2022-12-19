import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { OrderSaleSetProcessService } from './order-sale-set-process.service';
import {
  ChangeProcessDescriptionOrderStatusDto,
  ChangeProcessOrderStatusDto,
  ChangeSubProcessOrderStatusDto,
  SetProcessCreateDto,
  SetProcessHistoryListDto,
  SetProcessTakebackDto,
  SetSubProcessHistoryListDto,
} from './order_sale_set_process.dto';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/Auth/roles.decorator';
import { request } from 'http';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Order Sale Set Process Docs')
@Controller('order-sale-set-process')
@UseGuards(RolesGuard)
export class OrderSaleSetProcessController {
  constructor(
    private readonly orderSaleSetProcessService: OrderSaleSetProcessService,
  ) {}

  @Post('create')
  create(@Body() dto: SetProcessCreateDto, @Request() req) {
    return this.orderSaleSetProcessService.create(dto, req['_userId_']);
  }

  @Post('changeProcessOrderStatus')
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
  changeProcessOrderStatus(
    @Body() dto: ChangeProcessOrderStatusDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.orderSaleSetProcessService.changeProcessOrderStatus(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }
  @Post('changeProcessDescriptionOrderStatus')
  changeProcessDescriptionOrderStatus(
    @Body() dto: ChangeProcessDescriptionOrderStatusDto,
    @Request() req,
  ) {
    return this.orderSaleSetProcessService.changeProcessDescriptionOrderStatus(
      dto,
      req['_userId_'],
    );
  }

  @Post('changeSubProcessOrderStatus')
  changeSubProcessOrderStatus(
    @Body() dto: ChangeSubProcessOrderStatusDto,
    @Request() req,
  ) {
    return this.orderSaleSetProcessService.changeSubProcessOrderStatus(
      dto,
      req['_userId_'],
    );
  }

  @Post('setProcessHistories')
  setProcessHistories(@Body() dto: SetProcessHistoryListDto, @Request() req) {
    return this.orderSaleSetProcessService.setProcessHistories(
      dto,
      req['_userId_'],
    );
  }

  @Post('setSubProcessHistories')
  setSubProcessHistories(
    @Body() dto: SetSubProcessHistoryListDto,
    @Request() req,
  ) {
    return this.orderSaleSetProcessService.setSubProcessHistories(
      dto,
      req['_userId_'],
    );
  }
  
  @Post('takeback')
  takeback(@Body() dto: SetProcessTakebackDto, @Request() req) {
    return this.orderSaleSetProcessService.takeback(
      dto,
      req['_userId_'],
    );
  }
}
