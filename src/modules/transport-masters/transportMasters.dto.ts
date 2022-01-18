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


const descriptionType="0-Courier, 1-By Hand";
const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";





class TransportMastersCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class TransportMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[TransportMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TransportMastersCreateList)
  array: TransportMastersCreateList[];

  
}
export class TransportMastersEditDto {


  @IsString()
  @ApiProperty({})
  transportMasterId: string;

  
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class TransportMastersListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionType })
  types:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  transportMasterIds: string[];

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


export class TransportMastersStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  transportMasterIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
