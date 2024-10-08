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
const descriptionListScreenTypeForList = '0-total documents count,100- purchase order items, 101-purchase order items under [100] purchase booking, 102-booking items, 103 - purchase order items under [100] purchase booking items under[102] group details, 104 - purchase order items under [100] purchase booking items under[102] group details under [103] category details, 105 - purchase order items under [100] purchase booking items under[102] group details under [103] category details under[104] sub category details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Confirmation status, 3-total metal weight';



const descriptionListPurchaseStatus =
  ' -1 - pending,0 - rejected, 1 - accepted, ';




  class PurchaseOrderCreateList {
    @IsString()
    @ApiProperty({})
    supplierUserId: string;
  

    
    @IsNumber()
    @ApiProperty({description:descriptionListPurchaseStatus})
    purchaseStatus: number;
  

    @IsArray()
    @ApiProperty({ type: [String] })
    purchaseBookingIds: string[];
  
    
    
  }

export class PurchaseOrderCreateDto {
  @IsArray()
  @ApiProperty({ type: [PurchaseOrderCreateList] })
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderCreateList)
  array: PurchaseOrderCreateList[];
}


export class PurchaseOrderListDto {
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
  purchaseOrderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  supplierUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];



  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListPurchaseStatus,
  })
  purchaseStatus: number[];



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

export class PurchaseOrderStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseOrderIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class PurchaseOrderPurchaseStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseOrderIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionListPurchaseStatus })
  purchaseStatus: number;
  
  @IsNumber()
  @ApiProperty({ description: descriptionListPurchaseStatus })
  purchaseFromStatus: number;
}
