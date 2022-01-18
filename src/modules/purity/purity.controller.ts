import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { PurityCreateDto, PurityEditDto, PurityListDto, PurityStatusChangeDto } from './purity.dto';
import { PurityService } from './purity.service';

@UseGuards(RolesGuard)
@ApiTags("Purity Docs") 
@Controller('purity')
export class PurityController {
  constructor(private readonly purityService: PurityService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: PurityCreateDto,@Request() req) {
    return this.purityService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: PurityEditDto,@Request() req) {
    return this.purityService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: PurityStatusChangeDto,@Request() req) {
    return this.purityService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:PurityListDto) {
    return this.purityService.list(dto);
  }


}
