import { Body, Controller, Delete, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { GlobalGalleryService } from './global-gallery.service';
import { GlobalGalleryCreateDto, GlobalGalleryListDto, GlobalGalleryStatusChangeDto } from './global_gallery.dto';

@UseGuards(RolesGuard)
@ApiTags("Global Gallery Docs") 
@Controller('global-gallery')
export class GlobalGalleryController {
  constructor(private readonly globalGalleryService: GlobalGalleryService) {}


  
  @Post()
  create(@Body() dto: GlobalGalleryCreateDto,@Request() req) {
    return this.globalGalleryService.create(dto,req["_userId_"]);
  }
  
  
  @Delete()
  status_change(@Body() dto: GlobalGalleryStatusChangeDto,@Request() req) {
    return this.globalGalleryService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:GlobalGalleryListDto) {
    return this.globalGalleryService.list(dto);
  }


}
