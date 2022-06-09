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

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count, ,50-populate image global gallery only if user details exist,100-city detail,101-user table details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListGender = '0-male, 1-female, 2-other';
const descriptionListCommisionType =
  '0-Commision Percentage, 1-Commision amount';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date,1-Status  2-commision type, 3-UID';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-city details';
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

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListGender })
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

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListCommisionType })
  commisionType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  commisionAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  commisionPercentage: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class AgentEditDto {
  @IsString()
  @ApiProperty({})
  agentId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListGender })
  gender: number;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  cityId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListCommisionType })
  commisionType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  commisionAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  commisionPercentage: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class AgentListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListCommisionType })
  commisionType: number[];

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
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class ListFilterLocadingAgentDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForFilterLoading,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
}

export class CheckEmailExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
export class CheckMobileExistDto {
  @IsString()
  @ApiProperty({})
  value: string;
  
  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];

}
