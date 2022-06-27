import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { FactoryCalculationTypeMaster } from 'src/tableModels/factory_calculation_type_master.model';
import { FactoryCalculationTypeMasterItems } from 'src/tableModels/factory_calculation_type_master_items.model';
import * as mongoose from 'mongoose';
import {
  FactoriesCalculationMasterCreateDto,
  FactoryCalculationMasterEditDto,
  FactoryCalculationMasterListDto,
  FactoryCalculationMasterStatusChangeDto,
} from './factories_calculation_type_master.dto';
import { GlobalConfig } from 'src/config/global_config';

@Injectable()
export class FactoryCalculationTypeMasterService {
  constructor(
    @InjectModel(ModelNames.FACTORY_CALCULATION_TYPE_MASTER)
    private readonly factoryCalculationMasterModel: mongoose.Model<FactoryCalculationTypeMaster>,
    @InjectModel(ModelNames.FACTORY_CALCULATION_TYPE_MASTER_ITEMS)
    private readonly factoryCalculationMasterItemsModel: mongoose.Model<FactoryCalculationTypeMasterItems>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: FactoriesCalculationMasterCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToCalculationMaster = [];
      var arrayToCalculationMasterItems = [];

      dto.array.map((mapItem) => {
        var calculationMasterId = new mongoose.Types.ObjectId();
        arrayToCalculationMaster.push({
          _id: calculationMasterId,
          _name: mapItem.name,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.arrayItems.map((mapitem1) => {
          arrayToCalculationMasterItems.push({
            _subCategoryId: mapitem1.subCategoryId,
            _factoryCalculationMasterId: calculationMasterId,
            _percentage: mapitem1.percentage,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var result1 = await this.factoryCalculationMasterModel.insertMany(
        arrayToCalculationMaster,
        {
          session: transactionSession,
        },
      );
      await this.factoryCalculationMasterItemsModel.insertMany(
        arrayToCalculationMasterItems,
        {
          session: transactionSession,
        },
      );

      const responseJSON = { message: 'success', data: { list: result1 } };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async edit(dto: FactoryCalculationMasterEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.factoryCalculationMasterModel.findOneAndUpdate(
        {
          _id: dto.calculationMasterId,
        },
        {
          $set: {
            _name: dto.name,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );
      var arrayToCalculationMasterItems = [];
      dto.newItems.map((mapitem1) => {
        arrayToCalculationMasterItems.push({
          _subCategoryId: mapitem1.subCategoryId,
          _factoryCalculationMasterId: dto.calculationMasterId,
          _percentage: mapitem1.percentage,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      if (arrayToCalculationMasterItems.length > 0) {
        await this.factoryCalculationMasterItemsModel.insertMany(
          arrayToCalculationMasterItems,
          {
            session: transactionSession,
          },
        );
      }
      

for(var i=0;i<dto.arrayUpdate.length;i++){
  await this.factoryCalculationMasterItemsModel.findOneAndUpdate(
    {
      _id: dto.arrayUpdate[i].factoryCalculationItemId,
    },
    {
      $set: {
        _subCategoryId: dto.arrayUpdate[i].subCategoryId,
        _percentage: dto.arrayUpdate[i].percentage,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      },
    },
    { new: true, session: transactionSession },
  );
}





      const responseJSON = { message: 'success', data: result };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async status_change(
    dto: FactoryCalculationMasterStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.factoryCalculationMasterModel.updateMany(
        {
          _id: { $in: dto.calculationMasterIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: dto.status,
          },
        },
        { new: true, session: transactionSession },
      );

      const responseJSON = { message: 'success', data: result };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async list(dto: FactoryCalculationMasterListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _name: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }
      if (dto.calculationMasterIds.length > 0) {
        var newSettingsId = [];
        dto.calculationMasterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _name: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes(100)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.FACTORY_CALCULATION_TYPE_MASTER_ITEMS,
            let: { itemsId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_factoryCalculationMasterId', '$$itemsId'] },
                },
              },
            ],
            as: 'items',
          },
        });
      }

      if (dto.screenType.includes( 101)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.FACTORY_CALCULATION_TYPE_MASTER_ITEMS,
            let: { itemsId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_factoryCalculationMasterId', '$$itemsId'] },
                },
              },
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: {
                    subCategoryId: '$_subCategoryId',
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$subCategoryId'],
                        },
                      },
                    },
                  ],
                  as: 'subCategoryDetails',
                },
              },
              {
                $unwind: {
                  path: '$subCategoryDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'advancedItems',
          },
        });
      }

      var result = await this.factoryCalculationMasterModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes( 0) ) {
        //Get total count
        var limitIndexCount = arrayAggregation.findIndex(
          (it) => it.hasOwnProperty('$limit') === true,
        );
        if (limitIndexCount != -1) {
          arrayAggregation.splice(limitIndexCount, 1);
        }
        var skipIndexCount = arrayAggregation.findIndex(
          (it) => it.hasOwnProperty('$skip') === true,
        );
        if (skipIndexCount != -1) {
          arrayAggregation.splice(skipIndexCount, 1);
        }
        arrayAggregation.push({
          $group: { _id: null, totalCount: { $sum: 1 } },
        });

        var resultTotalCount = await this.factoryCalculationMasterModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      const responseJSON = {
        message: 'success',
        data: { list: result, totalCount: totalCount },
      };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
