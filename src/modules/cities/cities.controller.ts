import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckItemExistDto, CheckNameExistDto, CitiesCreateDto, CitiesEditDto, CitiesListDto, CitiesStatusChangeDto, ListFilterLocadingCityDto } from './cities.dto';
import { CitiesService } from './cities.service';



@ApiTags("Cities Docs") 
@Controller('cities')
@UseGuards(RolesGuard)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() dto: CitiesCreateDto,@Request() req) {
    return this.citiesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  edit(@Body() dto: CitiesEditDto,@Request() req) {
    return this.citiesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  status_change(@Body() dto: CitiesStatusChangeDto,@Request() req) {
    return this.citiesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:CitiesListDto) {
    return this.citiesService.list(dto);
  }
  @Post("listFilterLoadingCity")
  listFilterLoadingCity(@Body() dto:ListFilterLocadingCityDto) {
    return this.citiesService.listFilterLoadingCity(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.citiesService.checkCodeExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.citiesService.checkNameExisting(dto);
  }
  
}
