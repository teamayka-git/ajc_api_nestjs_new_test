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
  '0-total documents count,100-customer, 101-orderDetails, 102-subCategoryDetails, 103-CategoryDetails, 104-groupDetails, 105-stone details';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-Name, 3-designerId, 4-grossWeight, 5-type, 6-purity, 7-hmSealing, 8-huid, 9-eCommerceStatus';
const descriptionType = '0-order sale, 1-Stock sale';

class StonesList {
  @IsString()
  @ApiProperty({})
  stoneId: string;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  quantity: number;
}

export class ProductCreateDto {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  customerId: string;

  @IsString()
  @ApiProperty({})
  subCategoryCode: string;

  @IsString()
  @ApiProperty({})
  orderId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsNumber()
  @ApiProperty({})
  hmSealingStatus: number;

  @IsNumber()
  @ApiProperty({})
  eCommerceStatus: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsArray()
  @ApiProperty({ type: [StonesList] })
  @ValidateNested({ each: true })
  @Type(() => StonesList)
  stonesArray: StonesList[];
}

export class ProductListDto {
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
  @ApiProperty({ type: [String] })
  customerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  barcodes: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  groupIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  huId: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  type: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  eCommerceStatuses: number[];
  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  hmStealingStatus: number[];

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
