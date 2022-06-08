import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseFormatService } from './response-format.service';



@ApiTags("Response format") 
@Controller('response-format')
export class ResponseFormatController {
  constructor(private readonly responseFormatService: ResponseFormatService) {}


  @Post("deliveries")
  deliveries() {
    return this.responseFormatService.deliveries();
  }
  @Post("user")
  user() {
    return this.responseFormatService.user();
  }
  @Post("globalGallery")
  globalGallery() {
    return this.responseFormatService.globalGallery();
  }
  @Post("deliveryHub")
  deliveryHub() {
    return this.responseFormatService.deliveryHub();
  }
  @Post("shop")
  shop() {
    return this.responseFormatService.shop();
  }
  @Post("deliveryItems")
  deliveryItems() {
    return this.responseFormatService.deliveryItems();
  }
  @Post("orderSale")
  orderSale() {
    return this.responseFormatService.orderSale();
  }
  @Post("subCategories")
  subCategories() {
    return this.responseFormatService.subCategories();
  }
  @Post("invoice")
  invoice() {
    return this.responseFormatService.invoice();
  }
  @Post("invoiceItems")
  invoiceItems() {
    return this.responseFormatService.invoiceItems();
  }


}
