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


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count, 100-city details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Code";
const descriptionListScreenTypeForFilterLoading="0-total documents count";



class DeliveryHubCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  

  
}


export class DeliveryHubCreateDto {
  @IsArray()
  @ApiProperty({type:[DeliveryHubCreateList]})
  @ValidateNested({ each: true })
  @Type(() => DeliveryHubCreateList)
  array: DeliveryHubCreateList[];

  
}
export class DeliveryHubEditDto {


  @IsString()
  @ApiProperty({})
  deliveryHubsId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  

}

export class DeliveryHubListDto {

  @IsNumber()
  @ApiProperty({description:descriptionListSortType})
  sortType: number;
  @IsNumber()
  @ApiProperty({description:descriptionListSortOrder})
  sortOrder: number;


  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryHubsIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

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


export class DeliveryHubStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryHubsIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class ListFilterLocadingDeliveryHubDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForFilterLoading })
  screenType:number[];
  
  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;

}