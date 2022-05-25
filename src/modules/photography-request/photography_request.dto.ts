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
const descriptionListScreenTypeForList =
  '0-total documents count, 100 - order details, 101-root cause details, 102-user details, 103-created user details';
const descriptionRequestStatus =
  ' 0 - pending, 1 - accept, 2 - reject, 3 - completed';
class PhotographyRequestCreateList {
  @IsString()
  @ApiProperty({})
  orderId: string;
  @IsString()
  @ApiProperty({})
  productId: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  assignUserId: string;
}

export class PhotographyRequestCreateDto {
  @IsArray()
  @ApiProperty({ type: [PhotographyRequestCreateList] })
  @ValidateNested({ each: true })
  @Type(() => PhotographyRequestCreateList)
  array: PhotographyRequestCreateList[];
}

export class PhotographyRequestListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  photographerRequestIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  requestedUserIds: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionRequestStatus })
  requestStatusArray: number[];

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

export class PhotographyStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  photographyIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class ProductDocumentsStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  productDocumentsIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class PhotographyRequestStatusChangeDto {
  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  photographyIds: string[];

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  productId: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionRequestStatus })
  requestStatus: number;
}
