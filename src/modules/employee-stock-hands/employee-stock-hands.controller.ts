
import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployeeStockHandsService } from './employee-stock-hands.service';
import { EmployeeStockInHandApproveStatusChangeDto, EmployeeStockInHandCreateDto, EmployeeStockInHandItemDeliveryStatusChangeDto, EmployeeStockInHandListDto, EmployeeStockInHandStatusChangeDto } from './employee_stock_in_hands.dto';

@ApiTags('Employee stock in hand Docs')
@Controller('employee-stock-hands')
export class EmployeeStockHandsController {
  constructor(private readonly employeeStockHandsService: EmployeeStockHandsService) {}
  
  @Post()
  create(@Body() dto: EmployeeStockInHandCreateDto, @Request() req) {
    return this.employeeStockHandsService.create(dto, req['_userId_']);
  }

  @Delete()
  status_change(@Body() dto: EmployeeStockInHandStatusChangeDto, @Request() req) {
    return this.employeeStockHandsService.status_change(dto, req['_userId_']);
  }
  @Post("changeApproveStatus")
  changeApproveStatus(@Body() dto: EmployeeStockInHandApproveStatusChangeDto, @Request() req) {
    return this.employeeStockHandsService.changeApproveStatus(dto, req['_userId_']);
  }

  
  @Post("changeItemDeliveryStatus")
  changeItemDeliveryStatus(@Body() dto: EmployeeStockInHandItemDeliveryStatusChangeDto, @Request() req) {
    return this.employeeStockHandsService.changeItemDeliveryStatus(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: EmployeeStockInHandListDto) {
    return this.employeeStockHandsService.list(dto);
  }
}
