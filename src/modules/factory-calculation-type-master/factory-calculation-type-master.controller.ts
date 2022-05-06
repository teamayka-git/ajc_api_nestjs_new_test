import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  FactoriesCalculationMasterCreateDto,
  FactoryCalculationMasterEditDto,
  FactoryCalculationMasterListDto,
  FactoryCalculationMasterStatusChangeDto,
} from './factories_calculation_type_master.dto';
import { FactoryCalculationTypeMasterService } from './factory-calculation-type-master.service';

@ApiTags('Factory Calculation Type Master Docs')
@Controller('factory-calculation-type-master')
export class FactoryCalculationTypeMasterController {
  constructor(
    private readonly factoryCalculationTypeMasterService: FactoryCalculationTypeMasterService,
  ) {}

  @Post()
  create(@Body() dto: FactoriesCalculationMasterCreateDto, @Request() req) {
    return this.factoryCalculationTypeMasterService.create(
      dto,
      req['_userId_'],
    );
  }

  @Put()
  edit(@Body() dto: FactoryCalculationMasterEditDto, @Request() req) {
    return this.factoryCalculationTypeMasterService.edit(dto, req['_userId_']);
  }
  @Delete()
  status_change(
    @Body() dto: FactoryCalculationMasterStatusChangeDto,
    @Request() req,
  ) {
    return this.factoryCalculationTypeMasterService.status_change(
      dto,
      req['_userId_'],
    );
  }

  @Post('list')
  list(@Body() dto: FactoryCalculationMasterListDto) {
    return this.factoryCalculationTypeMasterService.list(dto);
  }
}
