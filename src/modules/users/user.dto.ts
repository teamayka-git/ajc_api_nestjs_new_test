import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';
const descriptionListSortOrderUserNotification = '1-ascending, -1-descending';
const descriptionListSortTypeUserNotification = '0-Created Date, 1-Status';
const descriptionStatusUserNotification = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForListUserNotification =
  '0-total documents count, 200 - clear viewed notifications';

export class UserCheckEmailExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
export class UserCheckMobileExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}

class UserAndFcmArray {
  @IsString()
  @ApiProperty({})
  fcmId: string;


  @IsString()
  @ApiProperty({})
  userId: string;

}

export class UserNotificationCreatetDto {
  @IsString()
  @ApiProperty({})
  title: string;

  @IsString()
  @ApiProperty({})
  body: string;

  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsArray()
  @ApiProperty({ type: [UserAndFcmArray] })
  @ValidateNested({ each: true })
  @Type(() => UserAndFcmArray)
  array: UserAndFcmArray[];

}


export class UserNotificationListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortTypeUserNotification })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrderUserNotification })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatusUserNotification })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForListUserNotification,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  notificationIds: string[];

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