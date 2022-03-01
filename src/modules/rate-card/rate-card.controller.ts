import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { RateCardService } from './rate-card.service';
import { RateCardCreateDto, RateCardEditDto, RateCardListDto, RateCardStatusChangeDto, RemovePercentagesDto } from './rate_card.dto';


@ApiTags("rate cards") 
@Controller('rate-card')
export class RateCardController {
  constructor(private readonly rateCardService: RateCardService) {}



  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: RateCardCreateDto,@Request() req) {
    return this.rateCardService.create(dto,req["_userId_"]);
  }
  @Post("remove_percentages")
  @Roles(GuardUserRole.SUPER_ADMIN)
  remove_percentages(@Body() dto: RemovePercentagesDto,@Request() req) {
    return this.rateCardService.remove_percentages(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: RateCardEditDto,@Request() req) {
    return this.rateCardService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: RateCardStatusChangeDto,@Request() req) {
    return this.rateCardService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:RateCardListDto) {
    return this.rateCardService.list(dto);
  }


}
