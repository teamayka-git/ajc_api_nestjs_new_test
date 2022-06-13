import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";
const descriptionType = '1-image, 2-video, 3-audio, 4-document';
const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForFilterLoading =
  '50-global gallery details, 100-employee details, 101-agent detials, 102-supplier details, 103-shop details, 104-halmark details, 105-delivery hub id, 106-customer details ,107-test center,108-department details only if employee details exist,109-process master details only if employee details exist, 110-city details in agent details only if agent details exist, 111-city details in supplier details only if supplier details exist, 112-logistics partner id,';
const descriptionGenders = '0-male, 1-female, 2-other';
const descriptionCustomType =
  ' 0 - nil, 1 - Shop admin, 2 - Shop sales man, 3 - Shop casher, 4 - halmark staff, 5 - shop user, 6 - delivery hub, 7 - halmark center,8-shop customer';

export class MeDto {}

export class GetUserDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionGenders,
  })
  gender: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionCustomType,
  })
  customType: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  supplierIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  halmarkIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  customerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryHubIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForFilterLoading,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
}

export class ChatDocumentCreateDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  time: number;

  @IsString()
  @ApiProperty({})
  recipientId: string;

  @IsString()
  @ApiProperty({})
  groupUid: string;

  @IsString()
  @ApiProperty({})
  messageUid: string;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  @ApiProperty({})
  value: Object;

  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;
}
