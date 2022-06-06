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
  '0-total documents count, 100-user details, 101-delivery provider details, 102-delivery executive details, 103-root cause details, 104-created user details, 105-challan items';
const descriptionDeliveryMode = '0 - executive,  1 - courier,  2 - third party';
const descriptionType = '0 - halmark, 1 - hub transfer';
const descriptionSaleType = ' 0 - order sale, 1 - stock sale, 2 - job work';

class DeliveryChallanCreateListItems {
  @IsString()
  @ApiProperty({})
  orderId: string;

  @IsString()
  @ApiProperty({})
  categoryName: string;

  @IsString()
  @ApiProperty({})
  subCategoryName: string;

  @IsString()
  @ApiProperty({})
  productName: string;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsString()
  @ApiProperty({})
  hsnCode: string;

  @IsString()
  @ApiProperty({})
  huid: string;

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
  tough: number;

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
  grossAmount: number;

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

  @IsNumber()
  @ApiProperty({})
  makingChargeWithHundredPercentage: number;

  @IsNumber()
  @ApiProperty({})
  makingChargeAmount: number;

  @IsString()
  @ApiProperty({})
  productBarcide: string;

  @IsString()
  @ApiProperty({})
  productId: string;
}

class DeliveryChallanCreateList {
  @IsString()
  @ApiProperty({})
  customerId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionDeliveryMode })
  deliveryMode: number;

  @IsString()
  @ApiProperty({})
  deliveryProviderId: string;

  @IsString()
  @ApiProperty({})
  deliveryExecutiveId: string;
  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  referenceUrl: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;
  @IsNumber()
  @ApiProperty({ description: descriptionSaleType })
  saleType: number;

  @IsArray()
  @ApiProperty({ type: [DeliveryChallanCreateListItems] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryChallanCreateListItems)
  arrayDeliveryChallanItems: DeliveryChallanCreateListItems[];
}

export class DeliveryChallanCreateDto {
  @IsArray()
  @ApiProperty({ type: [DeliveryChallanCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryChallanCreateList)
  arrayDeliveryChallan: DeliveryChallanCreateList[];
}

export class DeliveryChallanListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryChallanIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryProviderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryExecutiveIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  types: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionDeliveryMode })
  deliveryModes: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionSaleType })
  saleTypes: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

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

export class DeliveryChallanStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryChallanIds: string[];

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
