import { Body, Controller, Post, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryCreateDto, DeliveryEmployeeAssignDto, DeliveryListDto } from './delivery.dto';
import { DeliveryService } from './delivery.service';


@ApiTags("Delivery Docs") 
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}



  @Post()
  create(@Body() dto: DeliveryCreateDto,@Request() req) {
    return this.deliveryService.create(dto,req["_userId_"]);
  }
    
  
  @Post("deliveryWorkStatusUpdate")
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [document]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'document',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathGlobalGalleries,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  deliveryWorkStatusUpdate(@Body() dto: DeliveryEmployeeAssignDto,@Request() req,
  @UploadedFiles() file,) {
    return this.deliveryService.deliveryWorkStatusUpdate(dto,req["_userId_"],
    file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
    
    @Post("list")
    list(@Body() dto:DeliveryListDto) {
      return this.deliveryService.list(dto);
    }


}
