import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompanyListDto, CompanyStatusChangeDto } from '../company/company.dto';
import { GoldTestingRequestService } from './gold-testing-request.service';
import { GoldTestRequestCreateDto, GoldTestRequestEditDto, GoldTestRequestItemEditFromManufactorDto, GoldTestRequestItemEditFromTestCenterDto, GoldTestRequestListDto, GoldTestRequestStatusChangeDto } from './gold_test_requests.dto';


@ApiTags('Gold test Requests Docs')
@Controller('gold-testing-request')
export class GoldTestingRequestController {
  constructor(private readonly goldTestingRequestService: GoldTestingRequestService) {}


  @Post()
  create(@Body() dto: GoldTestRequestCreateDto,@Request() req) {
    return this.goldTestingRequestService.create(dto,req["_userId_"]);
  }
  @Put("updateGoldRequest")
  updateGoldRequest(@Body() dto: GoldTestRequestEditDto,@Request() req) {
    return this.goldTestingRequestService.updateGoldRequest(dto,req["_userId_"]);
  }
  @Put("updateGoldRequestStatus")
  updateGoldRequestStatus(@Body() dto: GoldTestRequestEditDto,@Request() req) {
    return this.goldTestingRequestService.updateGoldRequestStatus(dto,req["_userId_"]);
  }
  @Put("updateGoldRequestItemFromTestCenter")
  updateGoldRequestItemFromTestCenter(@Body() dto: GoldTestRequestItemEditFromTestCenterDto,@Request() req) {
    return this.goldTestingRequestService.updateGoldRequestItemFromTestCenter(dto,req["_userId_"]);
  }

  @Put("updateGoldRequestItemFromManufactor")
  updateGoldRequestItemFromManufactor(@Body() dto: GoldTestRequestItemEditFromManufactorDto,@Request() req) {
    return this.goldTestingRequestService.updateGoldRequestItemFromManufactor(dto,req["_userId_"]);
  }

  @Delete()
  status_change(@Body() dto: GoldTestRequestStatusChangeDto,@Request() req) {
    return this.goldTestingRequestService.status_change(dto,req["_userId_"]);
  }
  @Post("list")
  list(@Body() dto:GoldTestRequestListDto) {
    return this.goldTestingRequestService.list(dto);
  }
}
