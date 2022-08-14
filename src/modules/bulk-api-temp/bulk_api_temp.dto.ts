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




export class ShopBulkDataDto {
  
  @IsNumber()
  @ApiProperty({description:"for all document give this value ",default:1  })
  tdsTcsValue: number;
  

  @IsString()
  @ApiProperty({description:"for all document this value will give to tcs"})
  tcsIdAlways: string;
}
