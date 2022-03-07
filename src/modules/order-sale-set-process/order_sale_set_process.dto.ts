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


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count,100-district details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Code";
const descriptionListScreenTypeForFilterLoading="0-total documents count, 100-item details";



class SetProcessCreateList {


  
  @IsString()
  @ApiProperty({})
  orderSaleId: string;


  @IsString()
  @ApiProperty({})
  initialProcessId: string;
  @IsString()
  @ApiProperty({})
  initialUserId: string;



  @IsArray()
  @ApiProperty({ type: [String] })
  processIds: string[];
  
}


export class SetProcessCreateDto {
  @IsArray()
  @ApiProperty({type:[SetProcessCreateList]})
  @ValidateNested({ each: true })
  @Type(() => SetProcessCreateList)
  array: SetProcessCreateList[];

  
}
