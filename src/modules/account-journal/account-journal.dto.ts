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
const descriptionListCrDr = 'Credit: -1,  Debit: 1';
const descriptionListSortType = '0-Created Date, 1-Status, 2-Name, 3-Code';

class AccountJournalCreateListItems {


  @IsString()
  @ApiProperty({})
  ledgerId: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  currencyId: string;
  
  @IsNumber()
  @ApiProperty({})
  exRate: number;

  @IsNumber()
  @ApiProperty({})
  crdr: number;

  @IsNumber()
  @ApiProperty({})
  amount: number;  

  @IsNumber()
  @ApiProperty({})
  total: number;

}

class AccountJournalCreateList {

  @IsString()
  @ApiProperty({})
  branchId: string;

  @IsString()
  @ApiProperty({})
  remarks: string;

  @IsString()
  @ApiProperty({}) 
  voucherNo: string;

  @IsNumber()
  @ApiProperty({})
  voucherDate: number;

  @IsNumber()
  @ApiProperty({})
  postingDate: number;

  @IsArray()
  @ApiProperty({ type: [AccountJournalCreateListItems] })
  @ValidateNested({ each: true })
  @Type(() => AccountJournalCreateListItems)
  arrayAccountJournalItems: AccountJournalCreateListItems[];
}

export class AccountJournalCreateDto {

  @IsArray()
  @ApiProperty({ type: [AccountJournalCreateList] })
  @ValidateNested({ each: true })
  @Type(() => AccountJournalCreateList)
  AccountJournals: AccountJournalCreateList[];
}

export class AccountJournalListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  AccountJournalIds: string[];

  @IsNumber()
  @ApiProperty({})
  AccountJournalDateStartDate: number;

  @IsNumber()
  @ApiProperty({})
  AccountJournalDateEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
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

  @IsString()
  @ApiProperty({})
  searchingText: string;
}

export class AccountJournalStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  AccountJournalIds: string[];

  @IsString()
  @ApiProperty({})
  description: string;

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
