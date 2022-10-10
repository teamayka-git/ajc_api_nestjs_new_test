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
  '0-total documents count , 100-list linked, 101 - list linked under[100] user details ';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListType =
  ' 0-Employee, 1-Shop, 2-Supplier, 3-Organisation, 4-Company';

class DeliveryCounterCreateList {
  @IsString()
  @ApiProperty({})
  name: string;
  
  @IsString()
  @ApiProperty({})
  code: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  userIdsForLink: string[];


}

export class DeliveryCounterCreateDto {
  @IsArray()
  @ApiProperty({ type: [DeliveryCounterCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryCounterCreateList)
  array: DeliveryCounterCreateList[];
}
export class DeliveryCounterEditDto {
  @IsString()
  @ApiProperty({})
  deliveryCounterId: string;

  @IsString()
  @ApiProperty({})
  code: string;

  @IsString()
  @ApiProperty({})
  name: string;


  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];

  
  
  @IsArray()
  @ApiProperty({ type: [String] })
  userIdsForLink: string[];


  
  
  @IsArray()
  @ApiProperty({ type: [String] })
  userLinkingIdsForUnlink: string[];

}

export class DeliveryCounterListDto {
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
  @ApiProperty({ type: [String] })
  deliveryCounterIds: string[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
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

export class DeliveryCounterStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryCounterIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class DeliveryCounterLinkUnlinkCreateDto {
 
  @IsString()
  @ApiProperty({})
  dcId: string;

  
  
  @IsArray()
  @ApiProperty({ type: [String] })
  userIdsForLink: string[];


  
  
  @IsArray()
  @ApiProperty({ type: [String] })
  userLinkingIdsForUnlink: string[];

}