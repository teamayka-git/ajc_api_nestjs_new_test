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
const descriptionListScreenTypeForList="0-total documents count";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Percentage,3-sub category";





class RateCardCreateList {

  @IsNumber()
  @ApiProperty({})
  percentage: number;
  
  @IsString()
  @ApiProperty({})
  subCategoryId:string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class RateCardCreateDto {
  @IsArray()
  @ApiProperty({type:[RateCardCreateList]})
  @ValidateNested({ each: true })
  @Type(() => RateCardCreateList)
  array: RateCardCreateList[];

  
}
export class RateCardEditDto {



  @IsString()
  @ApiProperty({})
  rateCardId:string;
  @IsString()
  @ApiProperty({})
  subCategoryId:string;

  @IsNumber()
  @ApiProperty({})
  percentage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
  
}

export class RateCardListDto {

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
  rateCardIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;


  
}


export class RateCardStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  rateCardIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
