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


  
}


export class DeliveryHubCreateDto {
  @IsArray()
  @ApiProperty({type:[DeliveryHubCreateList]})
  @ValidateNested({ each: true })
  @Type(() => DeliveryHubCreateList)
  stateArray: DeliveryHubCreateList[];

  
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


}

export class DeliveryHubListDto {
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
