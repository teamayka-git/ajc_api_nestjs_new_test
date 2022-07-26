import {
  ArrayContains,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  ValidationTypes,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionListScreenTypeForBranchList =
  '0-total documents count, 101-list documents, 102-shop id, 103-root cause populate, 104-order sale histories, 105-set process, 106-setprocess and sub process also, 107-workers list and department list, 108 - set process under[105] process master, 109 - set process under[105] user, 110 - set process under[105] set sub process,111 - set process under[105] sub process under[110] sub process master,112 - set process under[105] sub process under[110] user populate,113 - set process under[105] sub process under[110] user under global gallery, 114 - order sale history under[104] user details, 115 - order sale history under[104] user details under[114] global gallery, 116 - order sale history under[104] created user details ,117 - order sale history under[104] created user details under[116] global gallery, 118- order sale document under[101] global galleryu populate, 119 - shop under[102] global gallery details, 120 - shop under[102] order head details, 121 - shop under[102] order head under[120] global gallery, 122 - shop under[102] relationship manager details,123 - shop under[102] relationship manager under[122] global gallery , 124 - order sale list sales order items ,125 - order sale items list under[124] product details,126 - order sale items list under[124] design details, 127 -  order sale items list under[124] sub category, 128 -  order sale items list under[124] sub category under[127] category details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-due date';
const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";

const descriptionWorkStatus = '0-pending, 1-accepted, 2-rejected';
const descriptionListScreenTypeForSetProcessOrdersaleList =
  '0-total count,100-order details,101-process and sub process details, 102-process master  500-order list assigned by me, 103 - set sub process under[101] sub processmaster, 104 - order sale main under[100] shop details, 105 - order sale main under[100] documents details, 106 - order sale main under[100] documents under global gallery details ';

const DescriptionOrderSaleProcessOrderStatus =
  '0-Pending, 1-Assigned, 2-On Working, 3-Completed, 4-Hold, Request To Assign';
const DescriptionOrderSalesHistoriesType =
  '  0 - order pending  1 - order accept  2 - order reject  3 - set process done  4 - finished goods  5 - product generate request  6 - product generated   7 - deliverychalan generated//need to discuss  8 - halmark issuence requested  9 - halmark issuence bypassed  10 - send to halmark issuence  11 - halmarking issued  12 - halmark request cancelled  13 - halmark request rejected  14 - halmark error occured  15 - send to reissuence   16 - invoice pending  17 - invoice generated  18 - outof delivery pending  19 - hub transfer pending  20 - delivery job assigned  21 - delivery in transit  22 - delivered to customer            23 - delivey accepted  24 - order declined collection pending   25 - order declined collected  26 - order declined inscan  27 - order cancelled  28 - delivery reshedule requested  29 - hub tranfer pending  30 - hub assigned  31 - hub tranfer intransit  32 - hub transfer delivered  33 - hub transfer accepted    100 - order editted  101- sales order actived  102- sales order disabled  103- sales order deleted  104- sales order general remark editted';
const descriptionType = '0 - order sale, 1 - stock sale';
const descriptionDeliveryType=" 0 - bundle delivery,1 - get me the ready item first";
const descriptionStockStatus="0 - out of stock, 1 - in stock";

class orderSaleCreateList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}
class orderSaleItemsCreateList {

  
  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  quantity: number;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionStockStatus })
  stockStatus: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  size: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;

}

export class OrderSalesCreateDto {

  @IsString()
  @ApiProperty({})
  shopId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description: descriptionDeliveryType })
  deliveryType: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleCreateList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleCreateList)
  arrayDocuments: orderSaleCreateList[];
  
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleItemsCreateList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleItemsCreateList)
  arrayItems: orderSaleItemsCreateList[];


  
}

class orderSaleEditList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}
class orderSaleItemEditList {
  
  @IsString()
  @ApiProperty({})
  orderSaleItemId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;

  
  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  quantity: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  size: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;
}

export class OrderSalesEditDto {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  
  @IsString()
  @ApiProperty({})
  ordderSaleHistoryDescription: string;


  @IsString()
  @ApiProperty({})
  shopId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @IsString()
  @ApiProperty({})
  description: string;


  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  documentsLinkingIdsForDelete: string[];

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleEditList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleEditList)
  arrayDocuments: orderSaleEditList[];

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleItemEditList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleItemEditList)
  arrayItemEdit: orderSaleItemEditList[];


  
}

export class OrderSaleListDto {
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
    description: descriptionListScreenTypeForBranchList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIdsIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsNumber()
  @ApiProperty({})
  dueStartDate: number;

  @IsNumber()
  @ApiProperty({})
  dueEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];

}

export class OrderSalesChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class OrderSalesProcessMasterChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleProcessMasterIds: string[];

  @IsString()
  @ApiProperty({ description: descriptionStatus })
  description: string;
}
export class OrderSalesWorkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;

  @IsString()
  @ApiProperty({})
  rootCause: string;
  @IsString()
  @ApiProperty({})
  rootCauseId: string;
}
export class SetProcessAssignedOrderSaleListDto {
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForSetProcessOrdersaleList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  employeesArray: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  idsArray: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSaleProcessOrderStatus,
  })
  workStatusArray: number[];
}

export class OrderSaleHistoryListDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSalesHistoriesType,
  })
  types: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  statusArray: number[];
}

export class EditOrderSaleGeneralRemarkDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsString()
  @ApiProperty({})
  generalRemark: string;
}
