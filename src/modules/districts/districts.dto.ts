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



class DistrictsCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  stateId: string;


  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class DistrictsCreateDto {
  @IsArray()
  @ApiProperty({type:[DistrictsCreateList]})
  @ValidateNested({ each: true })
  @Type(() => DistrictsCreateList)
  districtArray: DistrictsCreateList[];

  
}
export class DistrictsEditDto {


  @IsString()
  @ApiProperty({})
  districtId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  
  @IsString()
  @ApiProperty({})
  stateId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class DistrictsListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  districtIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  stateIds: string[];


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


export class DistrictsStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  districtIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
