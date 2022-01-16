import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GoldRateTimelines } from 'src/tableModels/gold_rate_timelines.model';
import * as mongoose from 'mongoose';
import { GoldRateTimelinesCreateDto, GoldRateTimelinesListDto } from './gold_rate_timelines.dto';

@Injectable()
export class GoldRateTimelinesService {

    constructor(@InjectModel(ModelNames.GOLD_RATE_TIMELINES) private readonly goldRateTimelinesModel: Model<GoldRateTimelines>,
    @InjectConnection() private readonly connection: mongoose.Connection) { }
    async create(dto: GoldRateTimelinesCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
  
  
  
        
        const newsettingsModel = new this.goldRateTimelinesModel({
            // _id:new MongooseModule.Types.ObjectId(),
            _ratePerGram:dto.rate,
            _createdUserId:_userId_,
            _createdAt:  dateTime,
            _updatedUserId: null,
            _updatedAt:  -1,
            _status: 1
        });
        var result1 = await newsettingsModel.save({ session: transactionSession });
  
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: "success", data: result1 };
    }
  
    async list(dto: GoldRateTimelinesListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
  
  
  
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: 1} });
  
      
        if (dto.goldRateTimelinesIds.length > 0) {
  
            var newSettingsId = [];
            dto.goldRateTimelinesIds.map(mapItem => {
                newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
  
  if(dto.startDate!=-1 && dto.endDate!=-1){

    arrayAggregation.push({ $match: {_createdAt:{$lte:dto.endDate,$gte:dto.startDate}}});
  }


  
  if (dto.screenType.findIndex((it) => it == 0) != -1) {
      arrayAggregation.push( {
        $lookup: {
          from: ModelNames.USER,
          let: { userId: '$_updatedUserId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },

            {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { employeeId: '$_employeeId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$employeeId'] },
                      },
                    },
                  ],
                  as: 'employeeDetails',
                },
              },
              {
                $unwind: {
                  path: '$employeeDetails',
                  preserveNullAndEmptyArrays: true,
                },
              }


          ],
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },);
  }
  
        
        arrayAggregation.push({ $sort: { _id: -1 } });
  
        if (dto.skip != -1) {
            arrayAggregation.push({ $skip: dto.skip });
            arrayAggregation.push({ $limit: dto.limit});
        }
  
  
  
        var result = await this.goldRateTimelinesModel.aggregate(arrayAggregation).session(transactionSession);
  
  
        var totalCount = 0;
        if (dto.screenType.findIndex((it) => it == 0) != -1) {
        //Get total count
        var limitIndexCount = arrayAggregation.findIndex(it => it.hasOwnProperty("$limit") === true)
        if (limitIndexCount != -1) {
            arrayAggregation.splice(limitIndexCount, 1);
        }
        var skipIndexCount = arrayAggregation.findIndex(it => it.hasOwnProperty("$skip") === true)
        if (skipIndexCount != -1) {
            arrayAggregation.splice(skipIndexCount, 1);
        }
        arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });
       
        var resultTotalCount = await this.goldRateTimelinesModel.aggregate(arrayAggregation).session(transactionSession);
        if (resultTotalCount.length > 0) {
            totalCount = resultTotalCount[0].totalCount;
        }
  
      }
  
  
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: "success", data: { list: result, totalCount: totalCount } };
    }


}
