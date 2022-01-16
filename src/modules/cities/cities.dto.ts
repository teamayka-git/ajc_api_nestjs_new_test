import {
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



class CitiesCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;


  @IsString()
  @ApiProperty({})
  districtsId: string;

  
}


export class CitiesCreateDto {
  @IsArray()
  @ApiProperty({type:[CitiesCreateList]})
  @ValidateNested({ each: true })
  @Type(() => CitiesCreateList)
  citiesArray: CitiesCreateList[];

  
}
export class CitiesEditDto {


  @IsString()
  @ApiProperty({})
  citiesId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  districtsId: string;

  
}

export class CitiesListDto {

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  citiesIds: string[];

  

  @IsArray()
  @ApiProperty({ type: [String] })
  districtIds: string[];

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


export class CitiesStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  citiesIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
