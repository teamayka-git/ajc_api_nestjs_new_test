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
const descriptionListScreenTypeForList="0-total documents count,50-populate image global gallery";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Weight";
const descriptionFileOriginalName="file name givent while uploading, if there is no image then give 'nil; here";





class StoneCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({description:descriptionFileOriginalName})
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class StoneCreateDto {
  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({type:[StoneCreateList]})
  @ValidateNested({ each: true })
  @Type(() => StoneCreateList)
  array: StoneCreateList[];

  
}
export class StoneEditDto {


  @IsString()
  @ApiProperty({})
  stoneId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class StoneListDto {

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
  @ApiProperty({ type: [String] })
  stoneIds: string[];

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


export class StoneStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  stoneIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
