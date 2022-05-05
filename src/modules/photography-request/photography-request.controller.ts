import { Body, Controller, Delete, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PhotographyRequestService } from './photography-request.service';
import {
  PhotographyRequestCreateDto,
  PhotographyRequestListDto,
  PhotographyRequestStatusChangeDto,
  PhotographyStatusChangeDto,
} from './photography_request.dto';

@ApiTags('Photography Requests Docs')
@Controller('photography-request')
export class PhotographyRequestController {
  constructor(
    private readonly photographyRequestService: PhotographyRequestService,
  ) {}
  @Post()
  create(@Body() dto: PhotographyRequestCreateDto, @Request() req) {
    return this.photographyRequestService.create(dto, req['_userId_']);
  }
  @Post('request_status_change')
  request_status_change(
    @Body() dto: PhotographyRequestStatusChangeDto,
    @Request() req,
  ) {
    return this.photographyRequestService.request_status_change(
      dto,
      req['_userId_'],
    );
  }
  @Delete()
  status_change(@Body() dto: PhotographyStatusChangeDto, @Request() req) {
    return this.photographyRequestService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: PhotographyRequestListDto) {
    return this.photographyRequestService.list(dto);
  }
}
