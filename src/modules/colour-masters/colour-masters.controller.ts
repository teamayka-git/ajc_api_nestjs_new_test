import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ColourMastersService } from './colour-masters.service';
import {
  ColourCreateDto,
  ColoursCheckNameExistDto,
  ColoursEditDto,
  ColoursListDto,
  ColoursStatusChangeDto,
} from './colour_masters.dto';

@ApiTags('Colours Docs')
@Controller('colour-masters')
export class ColourMastersController {
  constructor(private readonly colourMastersService: ColourMastersService) {}

  @Post()
  create(@Body() dto: ColourCreateDto, @Request() req) {
    return this.colourMastersService.create(dto, req['_userId_']);
  }

  @Put()
  edit(@Body() dto: ColoursEditDto, @Request() req) {
    return this.colourMastersService.edit(dto, req['_userId_']);
  }
  @Delete()
  status_change(@Body() dto: ColoursStatusChangeDto, @Request() req) {
    return this.colourMastersService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: ColoursListDto) {
    return this.colourMastersService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: ColoursCheckNameExistDto) {
    return this.colourMastersService.checkNameExisting(dto);
  }
  @Post('checkHexCodeExisting')
  checkHexCodeExisting(@Body() dto: ColoursCheckNameExistDto) {
    return this.colourMastersService.checkHexCodeExisting(dto);
  }
}
