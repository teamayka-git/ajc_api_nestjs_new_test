import { Module } from '@nestjs/common';
import { SalesReturnService } from './sales-return.service';
import { SalesReturnController } from './sales-return.controller';

@Module({
  controllers: [SalesReturnController],
  providers: [SalesReturnService]
})
export class SalesReturnModule {}
