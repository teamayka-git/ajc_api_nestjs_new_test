import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { RateBaseMastersService } from './rate-base-masters.service';
import { RateBaseMastersCreateDto, RateBaseMastersEditDto, RateBaseMastersListDto, RateBaseMastersStatusChangeDto } from './rate_base_masters.dto';

@ApiTags("rate base masters") 
@Controller('rate-base-masters')
export class RateBaseMastersController {
  constructor(private readonly rateBaseMastersService: RateBaseMastersService) {}



  @Post()
   
  create(@Body() dto: RateBaseMastersCreateDto,@Request() req) {
    return this.rateBaseMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: RateBaseMastersEditDto,@Request() req) {
    return this.rateBaseMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: RateBaseMastersStatusChangeDto,@Request() req) {
    return this.rateBaseMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:RateBaseMastersListDto) {
    return this.rateBaseMastersService.list(dto);
  }



}
