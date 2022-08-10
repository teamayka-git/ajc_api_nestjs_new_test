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
  '0-total documents count,100-shop details,101-employee details, 102-hub details, 103-delivery items list,105-delivery items under[103] invoice details, 106-employee details under[101] global gallery,108-delivery items under[103]  invoice details under[105] invoice item details, 109-delivery items under[103]  invoice details under[105] invoice item under[108] ordersaleItem details, 110 - delivery items under[103]  invoice details under[105] invoice item under[108] ordersaleItem under[109] sub category    , 500 - root cause list for delivery reject';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-type,3-uid,4-work status';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-item details';
const descriptionWorkStatus =
  '  0 - intransit,1 - delivery pending,2 - delivery accept,3 - delivery reject,';

const descriptionType = '0 - delivery to shop, 1 - hub transfer';
const descriptionReWorkStatus = '0 - do cancel, 1 - do rework';
const descriptionMistakeType = '0 - mistake by ajc,1 - mistake by customer,';
class DeliveryCreateList {
  @IsString()
  @ApiProperty({})
  invoiceId: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  deliveryTempId: string;
}

export class DeliveryCreateDto {
  @IsString()
  @ApiProperty({})
  employeeId: string;

  @IsString()
  @ApiProperty({})
  hubId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsArray()
  @ApiProperty({ type: [DeliveryCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryCreateList)
  array: DeliveryCreateList[];
}

export class DeliveryListDto {
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
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hubIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  receivedUserIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  verifiedUserIds: string[];



  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  typeArray: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
}

class DeliveryRejectList {
  @IsString()
  @ApiProperty({})
  salesItemId: string;

  @IsString()
  @ApiProperty({})
  salesId: string;

  @IsString()
  @ApiProperty({})
  deliveryId: string;

  @IsString()
  @ApiProperty({})
  invoiceId: string;

  @IsString()
  @ApiProperty({})
  productBarcode: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;

  @IsString()
  @ApiProperty({})
  rootCause: string;

  @IsNumber()
  @ApiProperty({ description: descriptionReWorkStatus })
  reWorkStatus: number;

  @IsNumber()
  @ApiProperty({ description: descriptionMistakeType })
  mistakeType: number;
}

export class DeliveryEmployeeAssignDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;

  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  fromWorkStatus: number;


  @IsString()
  @ApiProperty({})
  toUser: string;



  @IsArray()
  @ApiProperty({ type: [DeliveryRejectList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryRejectList)
  deliveryRejectedList: DeliveryRejectList[];
}
