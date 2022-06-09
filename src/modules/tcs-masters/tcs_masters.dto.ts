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
const descriptionListSortType="0-Created Date, 1-Status,2-Percentage";





class TcsMastersCreateList {

  @IsNumber()
  @ApiProperty({})
  percentage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class TcsMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[TcsMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TcsMastersCreateList)
  array: TcsMastersCreateList[];

  
}
export class TcsMastersEditDto {


  @IsString()
  @ApiProperty({})
  tcsMasterId: string;
 
  @IsNumber()
  @ApiProperty({})
  percentage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
  
}

export class TcsMastersListDto {

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
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  

  @IsArray()
  @ApiProperty({ type: [String] })
  tcsMasterIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;


  
}


export class TcsMastersStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  tcsMasterIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
