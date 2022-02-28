import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckNameExistDto, FactoriesCreateDto, FactoriesEditDto, FactoriesListDto, FactoriesStatusChangeDto, ListFilterLocadingFactoryDto } from './factories.dto';
import { FactoriesService } from './factories.service';

@UseGuards(RolesGuard)
@ApiTags("Factory Docs") 
@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: FactoriesCreateDto,@Request() req) {
    return this.factoriesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: FactoriesEditDto,@Request() req) {
    return this.factoriesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: FactoriesStatusChangeDto,@Request() req) {
    return this.factoriesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:FactoriesListDto) {
    return this.factoriesService.list(dto);
  }
  @Post("listFilterLoadingFactory")
  listFilterLoadingFactory(@Body() dto:ListFilterLocadingFactoryDto) {
    return this.factoriesService.listFilterLoadingFactory(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.factoriesService.checkNameExisting(dto);
  }
  

}
