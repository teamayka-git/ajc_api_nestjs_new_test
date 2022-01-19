import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListGender="0-male, 1-female, 2-other";
const descriptionListCommisionType="0-Commision Percentage, 1-Commision amount";


export class AgentLoginDto {
 
  @IsEmail()
  @ApiProperty({})
  email: string;

    @IsString()
    @ApiProperty({})
    password: string;
}


export class AgentCreateDto {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsEmail()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  password: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  cityId: string;


  @IsString()
  @ApiProperty({description:descriptionListCommisionType})
  commisionType: string;

  @IsString()
  @ApiProperty({})
  commisionAmount: string;

  @IsString()
  @ApiProperty({})
  commisionPercentage: string;


  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}



export class AgentEditDto {


  @IsString()
  @ApiProperty({})
  agentId: string;

  
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  cityId: string;


  @IsString()
  @ApiProperty({description:descriptionListCommisionType})
  commisionType: string;

  @IsString()
  @ApiProperty({})
  commisionAmount: string;

  @IsString()
  @ApiProperty({})
  commisionPercentage: string;


  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
}

export class AgentListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListGender })
  genders:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListCommisionType })
  commisionType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];

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


export class AgentStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
