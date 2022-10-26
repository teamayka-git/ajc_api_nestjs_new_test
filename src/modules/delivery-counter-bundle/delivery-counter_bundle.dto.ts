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
  '0-total documents count, 100 - employee details, 101-delivery counter details,102 - order sale details, 103 - order sale under[102] order sale item list, 104 -  order sale under[102] order sale item list under [103] sub category details, 105 - order sale under[102] shop details, 106 - order sale under[102] document list,107 - order sale under[102] document list under[106] global gallery, 108 - received user details, 109 -  order sale under[102] order sale item list under [103] product details, 110 - order sale under[102] oh details , 111 - order sale under[102] order sale item under[103] invoice item details, 112 - order sale under[102] order sale item under[103] invoice item details under[111] invoice details, 113 - order sale under[102] order sale item under[103] invoice item details under[111] invoice details under[112] delivery item details, 114 - order sale under[102] order sale item under[103] invoice item details under[111] invoice details under[112] delivery item details under[113] delivery details, 115 - response deliveryCounterItems items filter with order head ';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-uid,3-type, 4-work status';

const descriptionWorkStatus = '0 - intransit,  1 - delivery  completed, 2 - delivery rejected ';
const descriptionType = '0 - delivery return from shop, 1 - hub transfer';





 


export class DeliveryCounterBundleCreateDto {


  @IsString()
  @ApiProperty({})
  employeeId: string;

  @IsString()
  @ApiProperty({})
  deliveryCounterId: string;

  

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];


}





export class DeliveryCounterModuleWorkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCounterModuleIds: string[];




  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;


  @IsString()
  @ApiProperty({})
  receivingUsertoUser: string;

  
  @IsString()
  @ApiProperty({})
  deliveryCounterId: string;

  
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
  deliveryBundleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  receivedUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCounterIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];

  
  @IsNumber()
  @ApiProperty({  })
  deliveryBundleCompletedStartTime: number;

  @IsNumber()
  @ApiProperty({  })
  deliveryBundleCompletedEndTime: number;


  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;



  @IsArray()
  @ApiProperty({ type: [Number] })
  isInvoiceGenerated: number[];






  @IsNumber()
  @ApiProperty({})
  dcbCreatedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  dcbCreatedEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  dcbTransferDoneUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsNumber()
  @ApiProperty({})
  invoiceDateStartDate: number;

  @IsNumber()
  @ApiProperty({})
  invoiceDateEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceUids: string[];

  @IsNumber()
  @ApiProperty({})
  deliveryCompleteStartDate: number;

  @IsNumber()
  @ApiProperty({})
  deliveryCompleteEndDate: number;









  
}
