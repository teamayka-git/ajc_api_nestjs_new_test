import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count, 100-user details, 103-root cause details, 104-created user details, 105-invoice items, 106-sub category only if invoice items exist,107 -  user details under[100] global gallery ,108 -  created user details under[104] global gallery, 109 - invoice items under[105] sub category, 110 - shop details, 111 - shop under[110] shop user details';
const descriptionDeliveryMode = '0 - executive,  1 - courier,  2 - third party';
const descriptionType = '0 - halmark, 1 - hub transfer';
const descriptionBillMode = ' 0 - PureWeight, 1 - net weight, 2 - job work';

class InvoiceCreateListItems {
  @IsString()
  @ApiProperty({})
  orderId: string;
  @IsString()
  @ApiProperty({})
  orderSaleItemId: string;
  @IsString()
  @ApiProperty({})
  orderUid: string;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  categoryName: string;

  @IsString()
  @ApiProperty({})
  subCategoryName: string;

  
  @IsNumber()
  @ApiProperty({})
  grossAmount: number;


  @IsString()
  @ApiProperty({})
  productName: string;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsNumber()
  @ApiProperty({})
  makingChargeGst: number;

  @IsString()
  @ApiProperty({})
  hsnCode: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  huid: string[];
  

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @IsNumber()
  @ApiProperty({})
  touch: number;

  @IsNumber()
  @ApiProperty({})
  pureWeight: number;

  @IsNumber()
  @ApiProperty({})
  pureWeightHundredPercentage: number;

  @IsNumber()
  @ApiProperty({})
  unitRate: number;

  @IsNumber()
  @ApiProperty({})
  amount: number;

  @IsNumber()
  @ApiProperty({})
  stoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  totalValue: number;

  @IsNumber()
  @ApiProperty({})
  cgst: number;

  @IsNumber()
  @ApiProperty({})
  sgst: number;

  @IsNumber()
  @ApiProperty({})
  igst: number;

  @IsNumber()
  @ApiProperty({})
  metalAmountGst: number;

  @IsNumber()
  @ApiProperty({})
  stoneAmountGst: number;


  @IsNumber()
  @ApiProperty({})
  makingChargeWithHundredPercentage: number;

  @IsNumber()
  @ApiProperty({})
  makingChargeAmount: number;

  @IsString()
  @ApiProperty({})
  productBarcode: string;

  @IsString()
  @ApiProperty({})
  productId: string;
}

class InvoiceCreateList {
  @IsString()
  @ApiProperty({})
  localId: string;

  @IsString()
  @ApiProperty({})
  customerId: string;

  @IsString()
  @ApiProperty({}) 
  description: string;

  @IsNumber()
  @ApiProperty({ description: descriptionBillMode })
  billMode: number;

  
  @IsNumber()
  @ApiProperty({})
  halmarkingCharge: number;

  @IsNumber()
  @ApiProperty({})
  otherCharge: number;

  @IsNumber()
  @ApiProperty({})
  roundOff: number;

  @IsNumber()
  @ApiProperty({})
  netTotal: number;

  @IsNumber()
  @ApiProperty({})
  tdsReceivable: number;

  @IsNumber()
  @ApiProperty({})
  tdsPayable: number;

  @IsNumber()
  @ApiProperty({})
  netReceivableAmount: number;

  @IsNumber()
  @ApiProperty({})
  cgstHalmarkCharge: number;

  @IsNumber()
  @ApiProperty({})
  cgstOtherCharge: number;

  @IsNumber()
  @ApiProperty({})
  sgstHalmarkCharge: number;

  @IsNumber()
  @ApiProperty({})
  sgstOtherCharge: number;

  @IsNumber()
  @ApiProperty({})
  igstHalmarkCharge: number;

  @IsNumber()
  @ApiProperty({})
  igstOtherCharge: number;

  @IsArray()
  @ApiProperty({ type: [InvoiceCreateListItems] })
  @ValidateNested({ each: true })
  @Type(() => InvoiceCreateListItems)
  arrayInvoiceItems: InvoiceCreateListItems[];
}

export class InvoiceCreateDto {


  @IsNumber()
  @ApiProperty({})
  isOrderComplete: number;



  @IsArray()
  @ApiProperty({ type: [InvoiceCreateList] })
  @ValidateNested({ each: true })
  @Type(() => InvoiceCreateList)
  invoices: InvoiceCreateList[];
}

export class InvoiceListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsNumber()
  @ApiProperty({})
  invoiceDateStartDate: number;

  @IsNumber()
  @ApiProperty({})
  invoiceDateEndDate: number;


  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionBillMode })
  billMode: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;
}

export class InvoiceStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceIds: string[];

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
