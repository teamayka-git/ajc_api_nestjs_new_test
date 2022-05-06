import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HalmarkingRequestsService } from './halmarking-requests.service';
import {
  HalmarkingRequestsCreateDto,
  HalmarkingRequestsEditDto,
  HalmarkingRequestsListDto,
  HalmarkingRequestsStatusChangeDto,
  HalmarkingRequestsUpdateEditDto,
} from './halmarking_requests.dto';

@ApiTags('Halmarking Requests Docs')
@Controller('halmarking-requests')
export class HalmarkingRequestsController {
  constructor(
    private readonly halmarkingRequestsService: HalmarkingRequestsService,
  ) {}

  @Post()
  create(@Body() dto: HalmarkingRequestsCreateDto, @Request() req) {
    return this.halmarkingRequestsService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: HalmarkingRequestsEditDto, @Request() req) {
    return this.halmarkingRequestsService.edit(dto, req['_userId_']);
  }
  @Delete()
  status_change(
    @Body() dto: HalmarkingRequestsStatusChangeDto,
    @Request() req,
  ) {
    return this.halmarkingRequestsService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: HalmarkingRequestsListDto) {
    return this.halmarkingRequestsService.list(dto);
  }
  @Post('updateRequest')
  updateRequest(@Body() dto: HalmarkingRequestsUpdateEditDto, @Request() req) {
    return this.halmarkingRequestsService.updateRequest(dto, req['_userId_']);
  }
}
