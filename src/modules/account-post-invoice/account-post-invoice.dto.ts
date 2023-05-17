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

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList = '0-total documents count';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status, 2-Name, 3-Code';

class AccountPostInvoiceCreateList {
  @IsString()
  @ApiProperty({})
  ledgerId: string;

  @IsString()
  @ApiProperty({})
  invoiceNo: string;
  
  @IsNumber()
  @ApiProperty({})
  invoiceDate: number;
  
  @IsNumber()
  @ApiProperty({})
  rateBase: number;
  
  @IsNumber()
  @ApiProperty({})
  amount: number;

  @IsNumber()
  @ApiProperty({})
  rate: number;

  @IsNumber()
  @ApiProperty({})
  isFixed: number;

  @IsNumber()
  @ApiProperty({})
  pureWeight100: number;

  @IsNumber()
  @ApiProperty({})
  pureWeight: number;

  @IsNumber()
  @ApiProperty({})
  metalAmount: number;

  @IsNumber()
  @ApiProperty({})
  stoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  hmCharge: number;

  @IsNumber()
  @ApiProperty({})
  otherCharge: number;

  @IsNumber()
  @ApiProperty({})
  CGST: number;

  @IsNumber()
  @ApiProperty({})
  SGST: number;

  @IsNumber()
  @ApiProperty({})
  IGST: number;

  @IsNumber()
  @ApiProperty({})
  roundOff: number;


}

export class AccountPostInvoiceCreateDto {
  @IsArray()
  @ApiProperty({ type: [AccountPostInvoiceCreateList] })
  @ValidateNested({ each: true })
  @Type(() => AccountPostInvoiceCreateList)
  array: AccountPostInvoiceCreateList[];
}

export class AccountPostInvoiceEditDto {
  @IsString()
  @ApiProperty({})
  ledgerId: string;

  @IsString()
  @ApiProperty({})
  invoiceNo: string;
  
  @IsNumber()
  @ApiProperty({})
  invoiceDate: number;
  
  @IsNumber()
  @ApiProperty({})
  rateBase: number;
  
  @IsNumber()
  @ApiProperty({})
  amount: number;

  @IsNumber()
  @ApiProperty({})
  rate: number;

  @IsNumber()
  @ApiProperty({})
  isFixed: number;

  @IsNumber()
  @ApiProperty({})
  pureWeight100: number;

  @IsNumber()
  @ApiProperty({})
  pureWeight: number;

  @IsNumber()
  @ApiProperty({})
  metalAmount: number;

  @IsNumber()
  @ApiProperty({})
  stoneAmount: number;

  @IsNumber()
  @ApiProperty({})
  hmCharge: number;

  @IsNumber()
  @ApiProperty({})
  otherCharge: number;

  @IsNumber()
  @ApiProperty({})
  CGST: number;

  @IsNumber()
  @ApiProperty({})
  SGST: number;

  @IsNumber()
  @ApiProperty({})
  IGST: number;

  @IsNumber()
  @ApiProperty({})
  roundOff: number;

}
