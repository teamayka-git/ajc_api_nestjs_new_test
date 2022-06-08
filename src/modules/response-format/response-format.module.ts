import { Module } from '@nestjs/common';
import { ResponseFormatService } from './response-format.service';
import { ResponseFormatController } from './response-format.controller';

@Module({
  controllers: [ResponseFormatController],
  providers: [ResponseFormatService]
})
export class ResponseFormatModule {}
