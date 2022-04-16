import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { RootCausesService } from './root-causes.service';
import {
  OrderSaleRootCauseCreateDto,
  OrderSaleRootCauseEditDto,
  OrderSaleRootCauseExistDto,
  OrderSaleRootCauseListDto,
  OrderSaleRootCauseStatusChangeDto,
} from './root_causes.dto';

@ApiTags('root causes Docs')
@Controller('root-causes')
export class RootCausesController {
  constructor(private readonly rootCausesService: RootCausesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: OrderSaleRootCauseCreateDto, @Request() req) {
    return this.rootCausesService.create(dto, req['_userId_']);
  }

  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: OrderSaleRootCauseEditDto, @Request() req) {
    return this.rootCausesService.edit(dto, req['_userId_']);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(
    @Body() dto: OrderSaleRootCauseStatusChangeDto,
    @Request() req,
  ) {
    return this.rootCausesService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: OrderSaleRootCauseListDto) {
    return this.rootCausesService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: OrderSaleRootCauseExistDto) {
    return this.rootCausesService.checkNameExisting(dto);
  }
}
