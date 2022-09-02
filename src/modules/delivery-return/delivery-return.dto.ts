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
  '0-total documents count, 100 - employee details, 101-hub details, 102 - shop details, 103 - delivery return items list, 104 - delivery return items list under[103] delivery rejectpending item details, 105 - delivery return items list under[103] delivery rejectpending item details under[104] order sale item details, 106 - delivery return items list under[103] delivery rejectpending item details under[104] order sale itemunder[105] sub category details, 107 - delivery return items list under[103] delivery rejectpending item details under[104] order sale main details, 108 - delivery return items list under[103] delivery rejectpending item details under[104] order sale main under[107] order sale documents list , 109 - delivery return items list under[103] delivery rejectpending item details under[104] order sale main under[107] order sale documents list under[108] global gallery details, 110 - delivery return items list under[103] delivery rejectpending item details under[104] delivery details, 111 - delivery return items list under[103] delivery rejectpending item details under[104] invoice details, 112 - delivery return items list under[103] delivery rejectpending item details under[104] shop details, 113 - delivery return items list under[103] delivery rejectpending item details under[104] root cause details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-uid,3-type, 4-work status';

const descriptionWorkStatus = '0 - intransit,  1 - delivery return pending,  2 - delivery return completed';
const descriptionType = '0 - delivery return from shop, 1 - hub transfer';





class DeliveryReturnCreateList {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsString()
  @ApiProperty({})
  orderSaleItemId: string;

  @IsString()
  @ApiProperty({})
  deliveryRejectId: string;


}

export class DeliveryReturnCreateDto {


  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  
  @IsNumber()
  @ApiProperty({description:descriptionWorkStatus})
  workStatus: number;


  @IsString()
  @ApiProperty({})
  employeeId: string;

  @IsString()
  @ApiProperty({})
  hubId: string;

  @IsString()
  @ApiProperty({})
  shopId: string;



  @IsArray()
  @ApiProperty({ type: [DeliveryReturnCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryReturnCreateList)
  array: DeliveryReturnCreateList[];
}





export class DeliveryRejectWorkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryReturnIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryReceivingOrderSaleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCompleteOrderSaleIds: string[];




  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCompleteReworkOrderSaleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCompleteCancelOrderSaleIds: string[];




  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;


  @IsString()
  @ApiProperty({})
  toUser: string;

  
  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  fromWorkStatus: number;


}



export class DeliveryReturnListDto {
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

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryReturnids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  receivedUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hubIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];

  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  types: number[];


  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
}
