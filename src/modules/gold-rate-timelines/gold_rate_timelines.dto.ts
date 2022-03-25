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
const descriptionListScreenTypeForList="0-total documents count, 1-populate user";




export class GoldRateTimelinesCreateDto {
  @IsNumber()
  @ApiProperty({})
  rate: number;

  

  
}


export class GoldRateTimelinesListDto {

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  goldRateTimelinesIds: string[];



  
  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;

  
  @IsNumber()
  @ApiProperty({})
  startDate: number;

  @IsNumber()
  @ApiProperty({})
  endDate: number;


  
}
