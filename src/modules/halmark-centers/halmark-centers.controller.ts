import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HalmarkCentersService } from './halmark-centers.service';
import {
  HalmarkAddRemoveUsersDto,
  HalmarkCreateDto,
  HalmarkEditDto,
  HalmarkListDto,
  HalmarkStatusChangeDto,
} from './halmark_center.dto';

@ApiTags('Halmark Docs')
@Controller('halmark-centers')
export class HalmarkCentersController {
  constructor(private readonly halmarkCentersService: HalmarkCentersService) {}

  @Post()
  create(@Body() dto: HalmarkCreateDto, @Request() req) {
    return this.halmarkCentersService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: HalmarkEditDto, @Request() req) {
    return this.halmarkCentersService.edit(dto, req['_userId_']);
  }
  @Delete()
  status_change(@Body() dto: HalmarkStatusChangeDto, @Request() req) {
    return this.halmarkCentersService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: HalmarkListDto) {
    return this.halmarkCentersService.list(dto);
  }
  @Post('addRemoveUsers')
  addRemoveUsers(@Body() dto: HalmarkAddRemoveUsersDto, @Request() req) {
    return this.halmarkCentersService.addRemoveUsers(dto, req['_userId_']);
  }
}
