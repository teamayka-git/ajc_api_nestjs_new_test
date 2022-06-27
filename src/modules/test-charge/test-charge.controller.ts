import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestChargeService } from './test-charge.service';
import { RemovePercentagesDto, TestChargeCreateDto, TestChargeEditDto, TestChargeListDto, TestChargeStatusChangeDto } from './test_charge.dto';


@ApiTags("test charges") 
@Controller('test-charge')
export class TestChargeController {
  constructor(private readonly testChargeService: TestChargeService) {}





  @Post()
  create(@Body() dto: TestChargeCreateDto,@Request() req) {
    return this.testChargeService.create(dto,req["_userId_"]);
  }
  @Post("remove_percentages")
   
  remove_percentages(@Body() dto: RemovePercentagesDto,@Request() req) {
    return this.testChargeService.remove_percentages(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: TestChargeEditDto,@Request() req) {
    return this.testChargeService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: TestChargeStatusChangeDto,@Request() req) {
    return this.testChargeService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TestChargeListDto) {
    return this.testChargeService.list(dto);
  }





}
