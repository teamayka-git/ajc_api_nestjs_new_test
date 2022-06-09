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
  '0-total documents count, 100-test center details, 101-root cause details, 102-created user details, 103-gold test items list, 104-group id in request irems only if item list exist, 105-tc done user id in request irems only if item list exist, 106-manufacre verification user id in request irems only if item list exist';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Uid, 3-work status';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-item details';
const descriptionWorkStatus="0 - created and pending at manufacture, 1 - Test out from manufacture, 2 - In scan in test center, 3 - completed in test center, 4 - test in at manufacture, 5 - verification done at manufacture, 6 - verification completed at manufacture, 7 - rejected from test center";
class GoldTestRequestCreateList {
  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsNumber()
  @ApiProperty({  })
  weight: number;

  @IsNumber()
  @ApiProperty({ })
  fineWeight: number;

  @IsNumber()
  @ApiProperty({ })
  expectedPurity: number;

  @IsNumber()
  @ApiProperty({  })
  purity: number;

  @IsNumber()
  @ApiProperty({  })
  allowedWeightLoss: number;


}

export class GoldTestRequestCreateDto {

  @IsString()
  @ApiProperty({})
  testCenterId: string;




  @IsArray()
  @ApiProperty({ type: [GoldTestRequestCreateList] })
  @ValidateNested({ each: true })
  @Type(() => GoldTestRequestCreateList)
  arrayItems: GoldTestRequestCreateList[];
}
export class GoldTestRequestEditList {
  @IsString()
  @ApiProperty({})
  goldTestRequestId: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;


  @IsNumber()
  @ApiProperty({description:descriptionWorkStatus  })
  workStatus: number;

}
export class GoldTestRequestEditDto {





  @IsArray()
  @ApiProperty({ type: [GoldTestRequestEditList] })
  @ValidateNested({ each: true })
  @Type(() => GoldTestRequestEditList)
  arrayItems: GoldTestRequestEditList[];
}
export class GoldTestRequestItemEditFromTestCenterDto {
  @IsString()
  @ApiProperty({})
  goldTestRequestItemId: string;


  @IsNumber()
  @ApiProperty({  })
  testedWeight: number;

  @IsNumber()
  @ApiProperty({  })
  testedPurity: number;

  @IsNumber()
  @ApiProperty({  })
  weightLoss: number;

  @IsNumber()
  @ApiProperty({  })
  testCharge: number;

  @IsNumber()
  @ApiProperty({  })
  total: number;

  @IsNumber()
  @ApiProperty({  })
  cgst: number;

  @IsNumber()
  @ApiProperty({  })
  sgst: number;

  @IsNumber()
  @ApiProperty({  })
  igst: number;

  @IsNumber()
  @ApiProperty({  description:"if every data of item done from test center, then need to update who done from test center, that update if this item in one"})
  isUpdateTestCenterItemVerificationComplete: number;

}
export class GoldTestRequestItemEditFromManufactorDto {
  @IsString()
  @ApiProperty({})
  goldTestRequestItemId: string;


  @IsNumber()
  @ApiProperty({  })
  receivedWeight: number;

  @IsNumber()
  @ApiProperty({  })
  actualFineWeight: number;


  @IsNumber()
  @ApiProperty({  description:"if every data of item done from manufacture, then need to update who done from manufacture, that update if this item in one"})
  isUpdateManufacureItemVerificationComplete: number;

}
export class GoldTestRequestStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  goldTestRequestIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class GoldTestRequestListDto {
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
  goldRequestIdsIds: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  rootCauseIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];


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



