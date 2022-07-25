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
  @Post("colourMaster")
  colourMaster() {
    return this.responseFormatService.colourMaster();
  }

  @Post("stoneMaster")
  stoneMaster() {
    return this.responseFormatService.stoneMaster();
  }
  @Post("productStoneLinking")
  productStoneLinking() {
    return this.responseFormatService.productStoneLinking();
  }
  
  @Post("productDocumentsLinking")
  productDocumentsLinking() {
    return this.responseFormatService.productDocumentsLinking();
  }
  
  @Post("groupMaster")
  groupMaster() {
    return this.responseFormatService.groupMaster();
  }
  
  @Post("rateBaseMaster")
  rateBaseMaster() {
    return this.responseFormatService.rateBaseMaster();
  }
  
  @Post("tcsMaster")
  tcsMaster() {
    return this.responseFormatService.tcsMaster();
  }
  
  @Post("tdsMaster")
  tdsMaster() {
    return this.responseFormatService.tdsMaster();
  }
  
  @Post("city")
  city() {
    return this.responseFormatService.city();
  }
  
  @Post("rateCardPercentage")
  rateCardPercentage() {
    return this.responseFormatService.rateCardPercentage();
  }
  
  @Post("rateCard")
  rateCard() {
    return this.responseFormatService.rateCard();
  }
  
  @Post("orderSaleItems")
  orderSaleItems() {
    return this.responseFormatService.orderSaleItems();
  }
  
  @Post("processMasters")
  processMasters() {
    return this.responseFormatService.processMasters();
  }
  
  @Post("ordersaleSetSubProcess")
  ordersaleSetSubProcess() {
    return this.responseFormatService.ordersaleSetSubProcess();
  }
  
  @Post("subProcessMaster")
  subProcessMaster() {
    return this.responseFormatService.subProcessMaster();
  }
  
  @Post("ordersaleHistories")
  ordersaleHistories() {
    return this.responseFormatService.ordersaleHistories();
  }
  
  @Post("ordersaleDocuments")
  ordersaleDocuments() {
    return this.responseFormatService.ordersaleDocuments();
  }
  
  @Post("product")
  product() {
    return this.responseFormatService.product();
  }
  
  @Post("category")
  category() {
    return this.responseFormatService.category();
  }
  
  @Post("rootcause")
  rootcause() {
    return this.responseFormatService.rootcause();
  }
  
  @Post("deliveryChallan")
  deliveryChallan() {
    return this.responseFormatService.deliveryChallan();
  }
  
  @Post("deliveryProvider")
  deliveryProvider() {
    return this.responseFormatService.deliveryProvider();
  }
  
  @Post("customer")
  customer() {
    return this.responseFormatService.customer();
  }
  
  @Post("deliveryTemp")
  deliveryTemp() {
    return this.responseFormatService.deliveryTemp();
  }
  
  @Post("branch")
  branch() {
    return this.responseFormatService.branch();
  }
  


}
