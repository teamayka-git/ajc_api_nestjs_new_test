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
  '0-total documents count, 100 - order sale item details, 101 - order sale main details, 102 - delivery details, 103 - invoice details, 104 - shop details, 105 - root cause details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-shop,3-mistake type, 4-rework status';

const descriptionReWorkStatus = '0 - do cancel, 1 - do rework';
const descriptionMistakeType = '0 - mistake by ajc,1 - mistake by customer,';

export class DeliveryRejectListListDto {
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
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryRejectedPendingsIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  salesItemsIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  salesIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionReWorkStatus })
  reworkStatusArray: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionMistakeType })
  mistakeTypes: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
}
