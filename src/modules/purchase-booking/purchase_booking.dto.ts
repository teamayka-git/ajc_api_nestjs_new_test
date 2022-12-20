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
const descriptionListScreenTypeForList = '0-total documents count, 100-booking items, 101 - booking items under[100] group details, 102 - booking items under[100] group details under [101] category details, 103 - booking items under[100] group details under [101] category details under[102] sub category details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Confirmation status, 3-total metal weight';



const descriptionListConfirmationStatus =
  ' 0 - not confirmed, 1 - confirmed';


  class PurchaseBookingCreateListItem {
    @IsString()
    @ApiProperty({})
    groupId: string;
  
    @IsNumber()
    @ApiProperty({})
    metalWeight: number;
  
    
    
  }

  class PurchaseBookingCreateList {
    @IsString()
    @ApiProperty({})
    invoiceId: string;
  
    @IsNumber()
    @ApiProperty({})
    totalMetalWeight: number;
  
    
    @IsNumber()
    @ApiProperty({description:descriptionListConfirmationStatus})
    confirmationStatus: number;
  
    @IsArray()
    @ApiProperty({ type: [PurchaseBookingCreateListItem] })
    @ValidateNested({ each: true })
    @Type(() => PurchaseBookingCreateListItem)
    items: PurchaseBookingCreateListItem[];
    
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


  @IsNumber()
  @ApiProperty({})
  totalMetalWeightStart: number;

  @IsNumber()
  @ApiProperty({})
  totalMetalWeightEnd: number;


  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListConfirmationStatus,
  })
  confirmationStatus: number[];



  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  // @IsString()
  // @ApiProperty({})
  // searchingText: string;
}

export class PurchaseBookingStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  purchaseBookingIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
