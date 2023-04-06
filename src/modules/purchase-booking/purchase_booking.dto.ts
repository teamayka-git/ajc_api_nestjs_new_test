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
const descriptionListScreenTypeForList = '0-total documents count, 100- group details,101-group details under [100] category details,102-group details under [100] category details under[101] sub category details, 103 - invoice details, 104-supplier user details, 105-shop details, 106-created user details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Is Puchase Generated';






  class PurchaseBookingCreateList {
    @IsString()
    @ApiProperty({})
    invoiceId: string;
  
    @IsNumber()
    @ApiProperty({})
    bookingWeight: number;
  
    
    @IsNumber()
    @ApiProperty({})
    bookingRate: number;
  
    
    @IsNumber()
    @ApiProperty({})
    bookingAmount: number;
  
    
    @IsString()
    @ApiProperty({})
    groupId: string;

    
    @IsString()
    @ApiProperty({})
    referenceNumber: string;
    
  @IsString()
  @ApiProperty({})
  supplierUserId: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

    
    @IsNumber()
    @ApiProperty({})
    bookingThrough: number;
  
    
    @IsNumber()
    @ApiProperty({})
    isPurchaseGenerated: number;
  
    

    
    
  }

export class PurchaseBookingCreateDto {
  @IsArray()
  @ApiProperty({ type: [PurchaseBookingCreateList] })
  @ValidateNested({ each: true })
  @Type(() => PurchaseBookingCreateList)
  array: PurchaseBookingCreateList[];
}


export class PurchaseBookingListDto {
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
  purchaseBookingIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  supplierUserIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  groupIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceUids: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];


  @IsNumber()
  @ApiProperty({})
  bookingWeightStart: number;

  @IsNumber()
  @ApiProperty({})
  bookingWeightEnd: number;



  @IsNumber()
  @ApiProperty({})
  bookingRateStart: number;

  @IsNumber()
  @ApiProperty({})
  bookingRateEnd: number;


  @IsNumber()
  @ApiProperty({})
  bookingAmountStart: number;

  @IsNumber()
  @ApiProperty({})
  bookingAmountEnd: number;

  @IsArray()
  @ApiProperty({ type: [Number], })
  isPurchaseOrgerGenerated: number[];
  
  @IsArray()
  @ApiProperty({ type: [Number], })
  bookingThrough: number[];
  

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

export class PurchaseBookingStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseBookingIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
