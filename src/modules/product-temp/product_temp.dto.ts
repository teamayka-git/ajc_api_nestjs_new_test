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
  '0-total documents count, 100- design populate, 101 - shop details, 102-order item details, 103-group details, 104-category details, 105 - sub category details, 106-stone linking, 107 - stone linking under[106] stone details, 108 - stone linking under[106] stone colour details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status';

const descriptionType = 'refer product module';

class ProductTempStoneLinkingCreateList {
  @IsString()
  @ApiProperty({})
  stoneId: string;

  @IsString()
  @ApiProperty({})
  stoneColorId: string;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  stoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  quantity: number;
}

class ProductTempCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  designUid: string;

  @IsString()
  @ApiProperty({})
  designId: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  orderItemId: string;

  @IsString()
  @ApiProperty({})
  factoryTransferItemId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsString()
  @ApiProperty({})
  groupName: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  hmSealingStatus: number;

  @IsNumber()
  @ApiProperty({})
  totalStoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  totalStoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  ecommerceStatus: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  moldNumber: string[];

  @IsNumber()
  @ApiProperty({})
  isStone: number;

  @IsArray()
  @ApiProperty({ type: [ProductTempStoneLinkingCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ProductTempStoneLinkingCreateList)
  arrayStoneLinking: ProductTempStoneLinkingCreateList[];
}

export class ProductTempCreateDto {
  @IsArray()
  @ApiProperty({ type: [ProductTempCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ProductTempCreateList)
  array: ProductTempCreateList[];
}

export class ProductTempEditDto {
  @IsString()
  @ApiProperty({})
  productTempId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  designUid: string;

  @IsString()
  @ApiProperty({})
  designId: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  orderItemId: string;

  @IsString()
  @ApiProperty({})
  factoryTransferItemId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  hmSealingStatus: number;

  @IsNumber()
  @ApiProperty({})
  totalStoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  totalStoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  ecommerceStatus: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  moldNumber: string[];

  @IsNumber()
  @ApiProperty({})
  isStone: number;

  @IsArray()
  @ApiProperty({ type: [ProductTempStoneLinkingCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ProductTempStoneLinkingCreateList)
  arrayNewStoneLinking: ProductTempStoneLinkingCreateList[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deleteStoneLinkingIds: string[];
}
export class ProductTempListDto {
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
  productTempIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  designerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderItemIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  groupIds: string[];

  // @IsNumber()
  // @ApiProperty({})
  // bookingThroughEnd: number;

  // @IsArray()
  // @ApiProperty({ type: [Number], })
  // isPurchaseOrgerGenerated: number[];

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

export class ProductTempStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  productTempIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
