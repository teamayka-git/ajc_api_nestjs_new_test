import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { TestChargeMastersService } from './test-charge-masters.service';
import { ListFilterLocadingTestChargeDto, TestChargeMastersCreateDto, TestChargeMastersEditDto, TestChargeMastersListDto, TestChargeMastersStatusChangeDto } from './testChargeMasters.dto';

@UseGuards(RolesGuard)
@ApiTags("Test Charge Masters Docs") 
@Controller('test-charge-masters')
export class TestChargeMastersController {
  constructor(private readonly testChargeMastersService: TestChargeMastersService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: TestChargeMastersCreateDto,@Request() req) {
    return this.testChargeMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: TestChargeMastersEditDto,@Request() req) {
    return this.testChargeMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: TestChargeMastersStatusChangeDto,@Request() req) {
    return this.testChargeMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TestChargeMastersListDto) {
    return this.testChargeMastersService.list(dto);
  }
  @Post("listFilterLoadingTestCharge")
  listFilterLoadingTestCharge(@Body() dto:ListFilterLocadingTestChargeDto) {
    return this.testChargeMastersService.listFilterLoadingTestCharge(dto);
  }

}
