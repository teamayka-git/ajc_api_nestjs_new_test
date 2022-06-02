import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckItemExistDto, GeneralsCreateDto, GeneralsEditDto, GeneralsListDto, GeneralsStatusChangeDto } from './generals.dto';
import { GeneralsService } from './generals.service';

@ApiTags("General Docs") 
@Controller('generals')
@UseGuards(RolesGuard)
export class GeneralsController {
  constructor(private readonly generalsService: GeneralsService) {}

  @Post()
   
  create(@Body() dto: GeneralsCreateDto,@Request() req) {
    return this.generalsService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: GeneralsEditDto,@Request() req) {
    return this.generalsService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: GeneralsStatusChangeDto,@Request() req) {
    return this.generalsService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:GeneralsListDto) {
    return this.generalsService.list(dto);
  }

  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.generalsService.checkCodeExisting(dto);
  }
  
}
