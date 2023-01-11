import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList = '0-total documents count, 100-user details, 101 - employee stock in hand items, 102 - employee stock in hand items under[101] product details, 103 - employee stock in hand items under[101] product details under[102] design details, 104 - employee stock in hand items under[101] product details under[102] design details under[103] design document list, 105 - employee stock in hand items under[101] product details under[102] design details under[103] design document list under[104] global gallery details';
const descriptionListScreenTypeForListInHand = '0-total documents count, 102 - employee stock in hand items under[101] product details, 103 - employee stock in hand items under[101] product details under[102] design details, 104 - employee stock in hand items under[101] product details under[102] design details under[103] design document list, 105 - employee stock in hand items under[101] product details under[102] design details under[103] design document list under[104] global gallery details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Approved status';



const descriptionApprovedStatus =
  '  -1 - pending, 0 - rejected, 1 - approved';
  const descriptionDeliveryStatus =
    '   -1 - pending, 1 - delivered,  2 - returned to ajc pending,  3 - returned to ajc completed';


  class EmployeeStockInHandCreateListItem {
 
    @IsNumber()
    @ApiProperty({description:descriptionDeliveryStatus})
    deliveryStatus: number;
  
    
    @IsString()
    @ApiProperty({})
    productId: string;
    
  }

  class EmployeeStockInHandCreateList {
    @IsString()
    @ApiProperty({})
    userId: string;
  
    
    @IsNumber()
    @ApiProperty({description:descriptionApprovedStatus})
    approvedStatus: number;
  
    @IsArray()
    @ApiProperty({ type: [EmployeeStockInHandCreateListItem] })
    @ValidateNested({ each: true })
    @Type(() => EmployeeStockInHandCreateListItem)
    items: EmployeeStockInHandCreateListItem[];
    
  }

export class EmployeeStockInHandCreateDto {
  @IsArray()
  @ApiProperty({ type: [EmployeeStockInHandCreateList] })
  @ValidateNested({ each: true })
  @Type(() => EmployeeStockInHandCreateList)
  array: EmployeeStockInHandCreateList[];
}


export class EmployeeStockInHandListDto {
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
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeStockInHandIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionApprovedStatus,
  })
  approvedStatus: number[];


  @IsNumber()
  @ApiProperty({})
  createdDateStart: number;

  @IsNumber()
  @ApiProperty({})
  createdDateEnd: number;


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
export class ListInHandDto {
  
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForListInHand,
  })
  screenType: number[];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionDeliveryStatus,
  })
  deliveryStatus: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
}
export class InHandReturnToManufactureDto {
  

  @IsArray()
  @ApiProperty({ type: [String] })
  productIds: string[];

  
}
export class EmployeeStockInHandStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeStockInHandIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class EmployeeStockInHandApproveStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeStockInHandIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionApprovedStatus })
  approvedStatus: number;
}


export class EmployeeStockInHandItemDeliveryStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeStockInHandItemIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionDeliveryStatus })
  deliveryStatus: number;
}
