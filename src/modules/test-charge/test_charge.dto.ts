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
const descriptionListScreenTypeForList="0-total documents count, 100-list linked percentages";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-name";





class TestChargeCreateList {

  @IsNumber()
  @ApiProperty({})
  percentage: number;
  
  @IsString()
  @ApiProperty({})
  groupId:string;

}
class TestChargeEditList {

  @IsNumber()
  @ApiProperty({})
  percentage: number;
  
  @IsString()
  @ApiProperty({})
  groupId:string;

}

class TestChargePercentageEditList {

  @IsNumber()
  @ApiProperty({})
  testChargePercentageId: number;

  @IsNumber()
  @ApiProperty({})
  percentage: number;
  
  
}


export class TestChargeCreateDto {
  @IsArray()
  @ApiProperty({type:[TestChargeCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TestChargeCreateList)
  array: TestChargeCreateList[];

  
  @IsString()
  @ApiProperty({})
  testChargeName:string;

  
}
export class RemovePercentagesDto {
 
  @IsArray()
  @ApiProperty({ type: [String] })
  removePercentageIds: string[];

  
}
export class TestChargeEditDto {



  @IsString()
  @ApiProperty({})
  testChargeId:string;
  @IsString()
  @ApiProperty({})
  testChargeName:string;

  @IsArray()
  @ApiProperty({type:[TestChargeEditList]})
  @ValidateNested({ each: true })
  @Type(() => TestChargeEditList)
  arrayAdd: TestChargeEditList[];
  

  
  @IsArray()
  @ApiProperty({type:[TestChargePercentageEditList]})
  @ValidateNested({ each: true })
  @Type(() => TestChargePercentageEditList)
  arrayUpdate: TestChargePercentageEditList[];
  
  
}

export class TestChargeListDto {

  @IsNumber()
  @ApiProperty({description:descriptionListSortType})
  sortType: number;
  @IsNumber()
  @ApiProperty({description:descriptionListSortOrder})
  sortOrder: number;


  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  

  @IsArray()
  @ApiProperty({ type: [String] })
  testChargeIds: string[];

  
  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;


  
}


export class TestChargeStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  testChargeIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
