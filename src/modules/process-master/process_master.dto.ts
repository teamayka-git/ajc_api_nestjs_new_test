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
const descriptionListScreenTypeForList="0-total documents count, 100-process master details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";





class ProcessMasterCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  
  @IsString()
  @ApiProperty({})
  parentId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}


export class ProcessMasterCreateDto {
  @IsArray()
  @ApiProperty({type:[ProcessMasterCreateList]})
  @ValidateNested({ each: true })
  @Type(() => ProcessMasterCreateList)
  array: ProcessMasterCreateList[];

  
}
export class ProcessMasterEditDto {


  @IsString()
  @ApiProperty({})
  processMasterId: string;
 
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  
  @IsString()
  @ApiProperty({})
  parentId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class ProcessMasterListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  processMasterIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  parentIds: string[];

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


export class ProcessMasterStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  processMasterIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
