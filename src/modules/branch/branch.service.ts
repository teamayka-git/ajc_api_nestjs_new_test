import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Branch } from 'src/tableModels/branch.model';
import * as mongoose from 'mongoose';
import { BranchCreateDto, BranchEditDto, BranchListDto, BranchStatusChangeDto } from './branch.dto';
import { Counters } from 'src/tableModels/counters.model';

@Injectable()
export class BranchService {
  constructor(@InjectModel(ModelNames.BRANCHES) private readonly branchModel: Model<Branch>,
  @InjectModel(ModelNames.COUNTERS) private readonly countersModel: Model<Counters>,
  @InjectConnection() private readonly connection: mongoose.Connection) { }
  async create(dto: BranchCreateDto, _userId_: string) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();



      
var resultCounterPurchase= await this.countersModel.findOneAndUpdate(
    { _table_name: ModelNames.BRANCHES},
    {
      $inc: {
        _count:1,
        },
      },
    {  new: true, transactionSession },
  );
      const newsettingsModel = new this.branchModel({
          // _id:new MongooseModule.Types.ObjectId(),
          _name:dto.name,
          _uid: resultCounterPurchase._count,
          _email:  dto.email,
          _mobile: dto.mobile,
          _tectCode: dto.textCode,
          _dataGuard:dto.dataGuard,
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


  async edit(dto: BranchEditDto, _userId_: string) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();



      var result = await this.branchModel.findOneAndUpdate({
          _id: dto.branchId
      }, {
          $set: {
            _name:dto.name,
            _email:  dto.email,
            _mobile: dto.mobile,
            _tectCode: dto.textCode,
            _dataGuard:dto.dataGuard,
            _updatedUserId:_userId_,
            _updatedAt:  dateTime,
          }
      }, { new: true, transactionSession });

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: "success", data: result };
  }




  async status_change(dto: BranchStatusChangeDto, _userId_: string) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();

      var result = await this.branchModel.updateMany({
          _id: { $in: dto.branchIds }
      }, {
          $set: {
            
            _updatedUserId:_userId_,
            _updatedAt:  dateTime,
              _status: dto.status

          }
      }, { new: true, transactionSession });


      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: "success", data: result };
  }



  async list(dto: BranchListDto) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();



      var arrayAggregation = [];
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      if (dto.searchingText != "") {//todo
          arrayAggregation.push({ $match: { $or: [{ _name: new RegExp(dto.searchingText, "i") },
          { _uid: dto.searchingText },
        
        ] } });
      }
      if (dto.branchIds.length > 0) {

          var newSettingsId = [];
          dto.branchIds.map(mapItem => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }



      
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit});
      }



      var result = await this.branchModel.aggregate(arrayAggregation).session(transactionSession);


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
     
      var resultTotalCount = await this.branchModel.aggregate(arrayAggregation).session(transactionSession);
      if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
      }

    }


      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: "success", data: { list: result, totalCount: totalCount } };
  }
}