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
  '0-total documents count, 100- supplier user details, 101 - purchase order details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-Uid';

class PurchaseCreateList {
  @IsString()
  @ApiProperty({})
  supplierUserId: string;

  @IsString()
  @ApiProperty({})
  purchaseOrderId: string;

  @IsNumber()
  @ApiProperty({})
  manufacturePurchaseDate: number;

  @IsNumber()
  @ApiProperty({})
  supplierPurchaseDate: number;

  @IsString()
  @ApiProperty({})
  supplierRef: string;

  @IsString()
  @ApiProperty({})
  otherRemark: string;

  @IsString()
  @ApiProperty({})
  groupName: string;

  @IsNumber()
  @ApiProperty({})
  estimatedQty: number;

  @IsNumber()
  @ApiProperty({})
  allowedLimitPurchaseAdjustment: number;

  @IsNumber()
  @ApiProperty({})
  actualQty: number;

  @IsNumber()
  @ApiProperty({})
  unitPrice: number;

  @IsNumber()
  @ApiProperty({})
  amount: number;

  @IsNumber()
  @ApiProperty({})
  sgst: number;

  @IsNumber()
  @ApiProperty({})
  igst: number;

  @IsNumber()
  @ApiProperty({})
  cgst: number;


  @IsNumber()
  @ApiProperty({})
  grossAmount: number;


  @IsNumber()
  @ApiProperty({})
  actualAmount: number;


  @IsNumber()
  @ApiProperty({})
  bookingAmount: number;


  @IsNumber()
  @ApiProperty({})
  difference: number;



}

export class PurchaseCreateDto {
  @IsArray()
  @ApiProperty({ type: [PurchaseCreateList] })
  @ValidateNested({ each: true })
  @Type(() => PurchaseCreateList)
  array: PurchaseCreateList[];
}

export class PurchaseListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];






  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  supplierUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseOrderIds: string[];

  @IsNumber()
  @ApiProperty({})
  supplierPurchaseDateStart: number;

  @IsNumber()
  @ApiProperty({})
  supplierPurchaseDateEnd: number;

  
  @IsNumber()
  @ApiProperty({})
  manufacturePurchaseDateStart: number;

  @IsNumber()
  @ApiProperty({})
  manufacturePurchaseDateEnd: number;

  
  @IsNumber()
  @ApiProperty({})
  amountStart: number;

  @IsNumber()
  @ApiProperty({})
  amountEnd: number;

  
  
  






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