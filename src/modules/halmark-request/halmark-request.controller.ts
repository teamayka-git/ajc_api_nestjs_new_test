
import { HalmarkRequestService } from './halmark-request.service';
import { Body, Controller, Post, Put, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AddTestPiecesDto, AssignHmCenterHalmarkBundleDto, BypassMainOrderDto, ListDto, ListPendingHmRequestMainDto, MakeNewHalmarkBundleDto, UpdateHmBundleWorkStatusDto, UpdateHmItemsValueDto } from './halmark_request.dto';
@ApiTags("halmark-request Docs") 
@Controller('halmark-request')
export class HalmarkRequestController {
  constructor(private readonly halmarkRequestService: HalmarkRequestService) {}


  @Post('makeNewHalmarkBundle')
  makeNewHalmarkBundle(@Body() dto: MakeNewHalmarkBundleDto,
  @Request() req,) {
    return this.halmarkRequestService.makeNewHalmarkBundle(dto, req['_userId_']);
  }


  @Post('assignHmCenterHalmarkBundle')
  assignHmCenterHalmarkBundle(@Body() dto: AssignHmCenterHalmarkBundleDto,
  @Request() req,) {
    return this.halmarkRequestService.assignHmCenterHalmarkBundle(dto, req['_userId_']);
  }

  @Post('listPendingHmRequestMain')
  listPendingHmRequestMain(@Body() dto: ListPendingHmRequestMainDto) {
    return this.halmarkRequestService.listPendingHmRequestMain(dto);
  }


  @Post('list')
  list(@Body() dto: ListDto) {
    return this.halmarkRequestService.list(dto);
  }


  @Post('updateHmItemsValue')
  updateHmItemsValue(@Body() dto: UpdateHmItemsValueDto,@Request() req) {
    return this.halmarkRequestService.updateHmItemsValue(dto, req['_userId_']);
  }
  @Post('updateHmBundleWorkStatus')
  updateHmBundleWorkStatus(@Body() dto: UpdateHmBundleWorkStatusDto,@Request() req) {
    return this.halmarkRequestService.updateHmBundleWorkStatus(dto, req['_userId_']);
  }
  
  @Post('addTestPieces')
  addTestPieces(@Body() dto: AddTestPiecesDto,@Request() req) {
    return this.halmarkRequestService.addTestPieces(dto, req['_userId_']);
  }


  
  @Post('bypassMainOrder')
  bypassMainOrder(@Body() dto: BypassMainOrderDto,@Request() req) {
    return this.halmarkRequestService.bypassMainOrder(dto, req['_userId_']);
  }


}
