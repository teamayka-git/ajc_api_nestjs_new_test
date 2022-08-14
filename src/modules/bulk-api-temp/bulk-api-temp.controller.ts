import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BulkApiTempService } from './bulk-api-temp.service';
import { ShopBulkDataDto } from './bulk_api_temp.dto';


@ApiTags("Bulk Api Temp Docs") 
@Controller('bulk-api-temp')
export class BulkApiTempController {
  constructor(private readonly bulkApiTempService: BulkApiTempService) {}



  @Post()
  create(@Request() req) {
    return this.bulkApiTempService.create(req["_userId_"]);
  }
  
  @Post("1_stateCreate")
  stateCreate(@Request() req) {
    return this.bulkApiTempService.stateCreate(req["_userId_"]);
  }
  
  @Post("2_districtCreate")
  districtCreate(@Request() req) {
    return this.bulkApiTempService.districtCreate(req["_userId_"]);
  }
  
  @Post("3_cityCreate")
  cityCreate(@Request() req) {
    return this.bulkApiTempService.cityCreate(req["_userId_"]);
  }
  

  @Post("4_branchCreate")
  branchCreate(@Request() req) {
    return this.bulkApiTempService.branchCreate(req["_userId_"]);
  }
  
  @Post("5_departmentCreate")
  departmentCreate(@Request() req) {
    return this.bulkApiTempService.departmentCreate(req["_userId_"]);
  }
  
  @Post("7_employee")
  employee(@Request() req) {
    return this.bulkApiTempService.employee(req["_userId_"]);
  }
  @Post("8_rateCard")
  rateCard(@Request() req) {
    return this.bulkApiTempService.rateCard(req["_userId_"]);
  }
  @Post("9_rateBaseMaster")
  rateBaseMaster(@Request() req) {
    return this.bulkApiTempService.rateBaseMaster(req["_userId_"]);
  }
  

  @Post("10_tdsTcs")
  tdsTcs(@Request() req) {
    return this.bulkApiTempService.tdsTcs(req["_userId_"]);
  }
  @Post("11_shop")
  shop(@Body() dto: ShopBulkDataDto,@Request() req) {//ShopBulkDataDto
    return this.bulkApiTempService.shop(dto,req["_userId_"]);
  }
  








}
