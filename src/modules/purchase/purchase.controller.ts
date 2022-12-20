import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchase Docs')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}
}
