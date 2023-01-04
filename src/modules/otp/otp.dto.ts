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

const descriptionListDocType = '  0 - user password, 1 - order delivery bypass';

export class CreateOtp {
  @IsString()
  @ApiProperty({})
  mobile: string;
}

export class CreateGeneralOtp {
  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  type: number;
}
