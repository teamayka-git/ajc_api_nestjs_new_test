import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CitiesCreateDto, CitiesEditDto, CitiesListDto, CitiesStatusChangeDto } from './cities.dto';
import { CitiesService } from './cities.service';



@ApiTags("Cities Docs") 
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() dto: CitiesCreateDto,@Request() req) {
    return this.citiesService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  edit(@Body() dto: CitiesEditDto,@Request() req) {
    return this.citiesService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  status_change(@Body() dto: CitiesStatusChangeDto,@Request() req) {
    return this.citiesService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  list(@Body() dto:CitiesListDto) {
    return this.citiesService.list(dto);
  }

}
