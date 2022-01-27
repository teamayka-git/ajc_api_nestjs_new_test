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
const descriptionListScreenTypeForList="0-total documents count, 100-group details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";

const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Charge";
const descriptionListScreenTypeForFilterLoading="0-total documents count";




class TestChargeMastersCreateList {

  @IsString()
  @ApiProperty({})
  groupId: string;

  
  @IsNumber()
  @ApiProperty({})
  charge: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class TestChargeMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[TestChargeMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TestChargeMastersCreateList)
  array: TestChargeMastersCreateList[];

  
}
export class TestChargeMastersEditDto {


  @IsString()
  @ApiProperty({})
  testChargeMastersId: string;

  
  @IsString()
  @ApiProperty({})
  groupId: string;

  
  @IsNumber()
  @ApiProperty({})
  charge: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class TestChargeMastersListDto {

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
  testChargeMastersIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;


  
}


export class TestChargeMastersStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  testChargeMastersIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class ListFilterLocadingTestChargeDto {
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