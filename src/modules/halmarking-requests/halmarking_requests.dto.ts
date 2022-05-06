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
  '0-total documents count,100-order details, 101-halmark center details, 102-halmark center user details, 103-verify user details,104- root cause details,105- created user details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-uid, 3-Request status';
const descriptionRequestStatus =
  '0 - Pending,,1 - accept,,2 - Complete,,3 - Reject,,4 - Verification Completed,';

class HalmarkingRequestsCreateList {
  @IsString()
  @ApiProperty({})
  orderId: string;

  @IsNumber()
  @ApiProperty({})
  halmarkCenterId: number;

  @IsString()
  @ApiProperty({})
  description: string;
}

export class HalmarkingRequestsCreateDto {
  @IsArray()
  @ApiProperty({ type: [HalmarkingRequestsCreateList] })
  @ValidateNested({ each: true })
  @Type(() => HalmarkingRequestsCreateList)
  array: HalmarkingRequestsCreateList[];
}
export class HalmarkingRequestsEditDto {
  @IsString()
  @ApiProperty({})
  hmRequestId: string;

  @IsString()
  @ApiProperty({})
  orderId: string;

  @IsNumber()
  @ApiProperty({})
  halmarkCenterId: number;

  @IsString()
  @ApiProperty({})
  description: string;
}

export class HalmarkingRequestsListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

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
  hmRequestIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hmCenterIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hmCenterUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  verifyUserIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionRequestStatus })
  requestStatus: number[];

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

export class HalmarkingRequestsStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  hmRequestIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class HalmarkingRequestsUpdateEditDto {
  @IsString()
  @ApiProperty({})
  hmRequestId: string;

  @IsString()
  @ApiProperty({})
  hmCenterUserId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionRequestStatus })
  requestStatus: number;

  @IsString()
  @ApiProperty({})
  verifyUserId: string;

  @IsString()
  @ApiProperty({})
  description: string;
  @IsString()
  @ApiProperty({})
  rootCauseId: string;
}
