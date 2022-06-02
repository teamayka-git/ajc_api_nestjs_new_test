import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckNameExistDto, PurityCreateDto, PurityEditDto, PurityListDto, PurityStatusChangeDto } from './purity.dto';
import { PurityService } from './purity.service';

@UseGuards(RolesGuard)
@ApiTags("Purity Docs") 
@Controller('purity')
export class PurityController {
  constructor(private readonly purityService: PurityService) {}


  @Post()
   
  create(@Body() dto: PurityCreateDto,@Request() req) {
    return this.purityService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: PurityEditDto,@Request() req) {
    return this.purityService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: PurityStatusChangeDto,@Request() req) {
    return this.purityService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:PurityListDto) {
    return this.purityService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.purityService.checkNameExisting(dto);
  }
  

}
