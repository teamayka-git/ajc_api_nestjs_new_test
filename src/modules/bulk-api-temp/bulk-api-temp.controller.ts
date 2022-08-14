import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BulkApiTempService } from './bulk-api-temp.service';
import { BranchBulkDataDto, CityBulkDataDto, DepartmentBulkDataDto, DistrictBulkDataDto, EmployeesBulkDataDto, RatebaseMasterBulkDataDto, RatecardBulkDataDto, ShopBulkDataDto, StateBulkDataDto, TdsTcsMasterBulkDataDto } from './bulk_api_temp.dto';


@ApiTags("Bulk Api Temp Docs") 
@Controller('bulk-api-temp')
export class BulkApiTempController {
  constructor(private readonly bulkApiTempService: BulkApiTempService) {}



  @Post()
  create(@Request() req) {
    return this.bulkApiTempService.create(req["_userId_"]);
  }
  
  @Post("1_stateCreate")
  stateCreate(@Body() dto: StateBulkDataDto,@Request() req) {
    return this.bulkApiTempService.stateCreate(dto,req["_userId_"]);
  }
  
  @Post("2_districtCreate")
  districtCreate(@Body() dto: DistrictBulkDataDto,@Request() req) {
    return this.bulkApiTempService.districtCreate(dto,req["_userId_"]);
  }
  
  @Post("3_cityCreate")
  cityCreate(@Body() dto: CityBulkDataDto,@Request() req) {
    return this.bulkApiTempService.cityCreate(dto,req["_userId_"]);
  }
  

  @Post("4_branchCreate")
  branchCreate(@Body() dto: BranchBulkDataDto,@Request() req) {
    return this.bulkApiTempService.branchCreate(dto,req["_userId_"]);
  }
  
  @Post("5_departmentCreate")
  departmentCreate(@Body() dto: DepartmentBulkDataDto,@Request() req) {
    return this.bulkApiTempService.departmentCreate(dto,req["_userId_"]);
  }
  
  @Post("7_employee")
  employee(@Body() dto: EmployeesBulkDataDto,@Request() req) {
    return this.bulkApiTempService.employee(dto,req["_userId_"]);
  }
  @Post("8_rateCard")
  rateCard(@Body() dto: RatecardBulkDataDto,@Request() req) {
    return this.bulkApiTempService.rateCard(dto,req["_userId_"]);
  }
  @Post("9_rateBaseMaster")
  rateBaseMaster(@Body() dto: RatebaseMasterBulkDataDto,@Request() req) {
    return this.bulkApiTempService.rateBaseMaster(dto,req["_userId_"]);
  }
  

  @Post("10_tdsTcs")
  tdsTcs(@Body() dto: TdsTcsMasterBulkDataDto,@Request() req) {
    return this.bulkApiTempService.tdsTcs(dto,req["_userId_"]);
  }
  @Post("11_shop")
  shop(@Body() dto: ShopBulkDataDto,@Request() req) {//ShopBulkDataDto
    return this.bulkApiTempService.shop(dto,req["_userId_"]);
  }
  








}
