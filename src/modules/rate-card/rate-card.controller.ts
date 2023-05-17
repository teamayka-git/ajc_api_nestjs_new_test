import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { RateCardService } from './rate-card.service';
import { RateCardCreateDto, RateCardEditDto, RateCardListDto, RateCardStatusChangeDto, RemovePercentagesDto, TempMigrateCurrentRatecardDto } from './rate_card.dto';


@ApiTags("rate cards") 
@Controller('rate-card')
export class RateCardController {
  constructor(private readonly rateCardService: RateCardService) {}



  @Post()
  create(@Body() dto: RateCardCreateDto,@Request() req) {
    return this.rateCardService.create(dto,req["_userId_"]);
  }
  @Post("remove_percentages")
   
  remove_percentages(@Body() dto: RemovePercentagesDto,@Request() req) {
    return this.rateCardService.remove_percentages(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: RateCardEditDto,@Request() req) {
    return this.rateCardService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: RateCardStatusChangeDto,@Request() req) {
    return this.rateCardService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:RateCardListDto) {
    return this.rateCardService.list(dto);
  }

  @Post('temp_migrateCurrentRatecardToPurchaseType')
  temp_migrateCurrentRatecardToPurchaseType(@Body() dto: TempMigrateCurrentRatecardDto, @Request() req) {
    return this.rateCardService.temp_migrateCurrentRatecardToPurchaseType(dto, req['_userId_']);
  }

}
