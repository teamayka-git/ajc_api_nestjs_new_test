import {
  ArrayMinSize,
  isArray,
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

const descriptionListTime = 'if -1 then no validate, otherwise if will check';
const descriptionListScreenTypeForList = '0-full count, 50-my punching list';

export class UserAttendanceDto {}

export class UserAttendanceListDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  userAttendanceIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionListTime })
  startTime: number;

  @IsNumber()
  @ApiProperty({ description: descriptionListTime })
  stopTime: number;
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
}
