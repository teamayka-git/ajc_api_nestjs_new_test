import {
  IsEmail,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";

export class EmployeeLoginDto {
 
  @IsEmail()
  @ApiProperty({})
  email: string;

    @IsString()
    @ApiProperty({})
    password: string;
}