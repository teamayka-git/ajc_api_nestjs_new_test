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





class StoneCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  weight: number;

  
}


export class StoneCreateDto {
  @IsArray()
  @ApiProperty({type:[StoneCreateList]})
  @ValidateNested({ each: true })
  @Type(() => StoneCreateList)
  array: StoneCreateList[];

  
}
export class StoneEditDto {


  @IsString()
  @ApiProperty({})
  stoneId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  weight: number;

}

export class StoneListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  stoneIds: string[];

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


export class StoneStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  stoneIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
