import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count,100-shop details,101-employee details, 102-hub details, 103-delivery items list,105-delivery items under[103] invoice details, 106-employee details under[101] global gallery,108-delivery items under[103]  invoice details under[105] invoice item details, 109-delivery items under[103]  invoice details under[105] invoice item under[108] ordersaleItem details, 110 - delivery items under[103]  invoice details under[105] invoice item under[108] ordersaleItem under[109] sub category, 111 - proof global gallery details, 112 - shop Received User Details, 113 - shop Received User under[112] global gallery details, 114 - proof accepted User Details, 115 - proof accepted User under[115] global gallery details, 116 - proof rejected root cause details     , 500 - root cause list for delivery reject, 501 - rootcause list for prrof rejected';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-type,3-uid,4-work status';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-item details';
const descriptionWorkStatus =
  '  0 - intransit, 1 - delivery done, not uploaded proof, 2 - delivery proof verification pending, 3 - delivery proof verification rejected, 4 - delivery completed';

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


  @IsArray()
  @ApiProperty({ type: [String] })
  orderIds: string[];

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

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  branchIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  ordersaleUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  relationshipManagerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryExecutiveIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hubIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  proofRootCauseId: string[];

  
  @IsOptional()
  @IsNumber()
  @ApiProperty({  })
  deliveryAssignedStartDate: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({  })
  deliveryAssignedEndDate: number;

  

  @IsArray()
  @ApiProperty({ type: [String] })
  shopReceivedUserId: string[];

  
  @IsNumber()
  @ApiProperty({})
  deliveryCompleteStartDate: number;

  @IsNumber()
  @ApiProperty({})
  deliveryCompleteEndDate: number;

  

  @IsArray()
  @ApiProperty({ type: [String] })
  proofAcceptedUserId: string[];

  
  

  @IsArray()
  @ApiProperty({ type: [Number] })
  isBypassed: number[];

  

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

  @IsString()
  @ApiProperty({})
  rootCauseIdName: string;

  @IsNumber()
  @ApiProperty({ description: descriptionReWorkStatus })
  reWorkStatus: number;

  @IsNumber()
  @ApiProperty({ description: descriptionMistakeType })
  mistakeType: number;
}

export class DeliveryEmployeeAssignDto {

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryIds: string[];

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  fromWorkStatus: number;

  
  @IsString()
  @ApiProperty({})
  shopAcceptUserId: string;

  
  @IsString()
  @ApiProperty({})
  proofAcceptUserId: string;

  @IsString()
  @ApiProperty({})
  proofRootCause: string;

  @IsString()
  @ApiProperty({})
  proofRootCauseId: string;

  @IsString()
  @ApiProperty({})
  proofRootCauseIdName: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isBypass: number;


  @IsOptional()
  @IsString()
  @ApiProperty({})
  otpId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  otpValue: string;

}
