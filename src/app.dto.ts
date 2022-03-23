import {
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

const descriptionFileOriginalName="file name givent while uploading, if there is no image then give 'nil; here";
const descriptionType="1-image, 2-video, 3-audio, 4-document";

export class MeDto {
 


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
  @ApiProperty({description:descriptionType})
  type: number;

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsObject()
  @ApiProperty({})
  value: Object;

  @IsString()
  @ApiProperty({description:descriptionFileOriginalName})
  fileOriginalName: string;





}