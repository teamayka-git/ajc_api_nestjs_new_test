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
const descriptionListScreenTypeForListPendingMain =
  '0-total documents count, 100-order details, 101-order details under[100] oh details, 102-order details under[100] oh details under[101] global gallery details,  103- order details under[100] os documents,  104- order details under[100] os documents under[103] global gallery details,  105- order details under[100] shop details,  106- order details under[100] shop details under[105] global gallery details, 107 - order details under[100] order sale items, 108 - order details under[100] order sale items under[107] documents, 109 - order details under[100] order sale items under[107] documents under[108] global gallery details,  110 - order details under[100] order sale items under[107] product details,  111 - order details under[100] order sale items under[107] design details, 112 - order details under[100] order sale items under[107] sub category details, 113 - order details under[100] order sale items under[107] sub category under[112] category details, 114 - order details under[100] order sale items under[107] sub category under[112] category details under[113] group details';

const descriptionListScreenTypeForList =
  '0-total documents count,90- list hm main items,91-root cause details,92-hm center details, 100-list hm main items under[90] order details, 101-list hm main items under[90] order details under[100] oh details, 102-list hm main items under[90] order details under[100] oh details under[101] global gallery details,  103- list hm main items under[90] order details under[100] os documents,  104- list hm main items under[90] order details under[100] os documents under[103] global gallery details,  105- list hm main items under[90] order details under[100] shop details,  106-list hm main items under[90]  order details under[100] shop details under[105] global gallery details, 107 - list hm main items under[90] order details under[100] order sale items, 108 - list hm main items under[90] order details under[100] order sale items under[107] documents, 109 - list hm main items under[90] order details under[100] order sale items under[107] documents under[108] global gallery details,  110 - list hm main items under[90] order details under[100] order sale items under[107] product details,  111 - list hm main items under[90] order details under[100] order sale items under[107] design details, 112 - list hm main items under[90] order details under[100] order sale items under[107] sub category details, 113 - list hm main items under[90] order details under[100] order sale items under[107] sub category under[112] category details, 114 -list hm main items under[90]  order details under[100] order sale items under[107] sub category under[112] category details under[113] group details';

const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Name';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-item details';
const descriptionBundleListMainWorkStatus =
  '0 - bundle not assigned, 1 - bundle assigned, 2 - bundle not created,  3 - bypassed';
const descriptionBundleListMainType = ' 0 - order,  1 - test';
const descriptionHmBundleWorkStatus =
  ' 0 - pending, 1 - accept, 2 - reject, 3 - completed, 4 - bypassed, 5 - assigned hm center';
class MakeNewHalmarkBundleArray {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsString()
  @ApiProperty({})
  hmMainId: string;
}

export class MakeNewHalmarkBundleDto {
  @IsArray()
  @ApiProperty({ type: [MakeNewHalmarkBundleArray] })
  @ValidateNested({ each: true })
  @Type(() => MakeNewHalmarkBundleArray)
  items: MakeNewHalmarkBundleArray[];
}

export class AssignHmCenterHalmarkBundleDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  hmBundleIds: string[];

  @IsString()
  @ApiProperty({})
  hmCenterId: string;
}

export class ListPendingHmRequestMainDto {
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
    description: descriptionListScreenTypeForListPendingMain,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionBundleListMainWorkStatus,
  })
  workStatus: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionBundleListMainType,
  })
  type: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  salesOrderUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  salesOrderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hmMainIds: string[];

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

export class ListDto {
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
  @ApiProperty({
    type: [Number],
    description: descriptionHmBundleWorkStatus,
  })
  workStatus: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  bundleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hmCenterIds: string[];

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

class UpdateHmItemsValue {
  @IsString()
  @ApiProperty({})
  hmItemId: string;

  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsString()
  @ApiProperty({})
  huid: string;

  @IsNumber()
  @ApiProperty({})
  weight: number;
}

export class UpdateHmItemsValueDto {
  @IsArray()
  @ApiProperty({ type: [UpdateHmItemsValue] })
  @ValidateNested({ each: true })
  @Type(() => UpdateHmItemsValue)
  items: UpdateHmItemsValue[];
}

export class UpdateHmBundleWorkStatusDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  hmBundleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionHmBundleWorkStatus })
  workStatus: number;

  @IsNumber()
  @ApiProperty({})
  fromWorkStatus: number;

  @IsNumber()
  @ApiProperty({})
  orderSaleHistoryType: number;
}
class AddTestPiecesItems {
  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsNumber()
  @ApiProperty({})
  weight: number;
}

export class AddTestPiecesDto {
  @IsString()
  @ApiProperty({})
  hmBundleId: string;

  @IsArray()
  @ApiProperty({ type: [AddTestPiecesItems] })
  @ValidateNested({ each: true })
  @Type(() => AddTestPiecesItems)
  itemList: AddTestPiecesItems[];
}


class BypassMainOrderList{
  @IsString()
  @ApiProperty({})
  orderSaleId: string;
  
  @IsString()
  @ApiProperty({})
  hmMainId: string;

}
export class BypassMainOrderDto {
  @IsString()
  @ApiProperty({})
  hmBundleId: string;


  @IsNumber()
  @ApiProperty({})
  isAnyItemExist: number;


  @IsArray()
  @ApiProperty({ type: [BypassMainOrderList] })
  @ValidateNested({ each: true })
  @Type(() => BypassMainOrderList)
  itemList: BypassMainOrderList[];
  
}
