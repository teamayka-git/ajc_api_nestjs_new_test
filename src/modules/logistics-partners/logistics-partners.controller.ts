import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogisticsPartnersService } from './logistics-partners.service';
import { CheckNameExistDto, LogisticsPartnersCreateDto, LogisticsPartnersEditDto, LogisticsPartnersListDto, LogisticsPartnersStatusChangeDto } from './logistics_partners.dto';

@ApiTags("Logistics Partners Docs") 
@Controller('logistics-partners')
export class LogisticsPartnersController {
  constructor(private readonly logisticsPartnersService: LogisticsPartnersService) {}


  @Post()
   
  create(@Body() dto: LogisticsPartnersCreateDto,@Request() req) {
    return this.logisticsPartnersService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: LogisticsPartnersEditDto,@Request() req) {
    return this.logisticsPartnersService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: LogisticsPartnersStatusChangeDto,@Request() req) {
    return this.logisticsPartnersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:LogisticsPartnersListDto) {
    return this.logisticsPartnersService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.logisticsPartnersService.checkNameExisting(dto);
  }

}
