import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Cities } from 'src/tableModels/cities.model';
import * as mongoose from 'mongoose';
import {
  CheckItemExistDto,
  CheckNameExistDto,
  CitiesCreateDto,
  CitiesEditDto,
  CitiesListDto,
  CitiesStatusChangeDto,
  ListFilterLocadingCityDto,
} from './cities.dto';
import { GlobalConfig } from 'src/config/global_config';
import { Company } from 'src/tableModels/companies.model';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(ModelNames.CITIES) private readonly citiesModel: Model<Cities>,
    @InjectModel(ModelNames.COMPANIES) private readonly companyModel: Model<Company>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: CitiesCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      dto.citiesArray.map((mapItem) => {
        arrayToStates.push({
          _name: mapItem.name,
          _code: mapItem.code,
          _districtsId: mapItem.districtsId,
          _dataGuard: mapItem.dataGuard,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.citiesModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

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

  async edit(dto: CitiesEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.citiesModel.findOneAndUpdate(
        {
          _id: dto.citiesId,
        },
        {
          $set: {
            _name: dto.name,
            _code: dto.code,
            _districtsId: dto.districtsId,
            _dataGuard: dto.dataGuard,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
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

  async status_change(dto: CitiesStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.citiesModel.updateMany(
        {
          _id: { $in: dto.citiesIds },
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

  async list(dto: CitiesListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [
              { _name: new RegExp(dto.searchingText, 'i') },
              { _code: new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }
      if (dto.citiesIds.length > 0) {
        var newSettingsId = [];
        dto.citiesIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.districtIds.length > 0) {
        var newSettingsId = [];
        dto.districtIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _districtsId: { $in: newSettingsId } },
        });
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
        case 3:
          arrayAggregation.push({ $sort: { _code: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes( 100) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DISTRICTS,
              let: { districtId: '$_districtsId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$districtId'] } } },
                {
                  $lookup: {
                    from: ModelNames.STATES,
                    let: { stateId: '$_statesId' },
                    pipeline: [
                      {
                        $match: { $expr: { $eq: ['$_id', '$$stateId'] } },
                      },
                    ],
                    as: 'stateDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$stateDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'districtDetails',
            },
          },
          {
            $unwind: {
              path: '$districtDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.citiesModel
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

        var resultTotalCount = await this.citiesModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }
      var resultCompany={};
      if (dto.screenType.includes(200) ) {
        var resultCompanyList = await this.companyModel.aggregate([
          { $match: { _status: 1 } },

          {
            $lookup: {
              from: ModelNames.CITIES,
              let: { cityId: '$_cityId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$cityId'] } } },

                {
                  $lookup: {
                    from: ModelNames.DISTRICTS,
                    let: { districtId: '$_districtsId' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$districtId'] } } },
                      {
                        $lookup: {
                          from: ModelNames.STATES,
                          let: { stateId: '$_statesId' },
                          pipeline: [
                            {
                              $match: { $expr: { $eq: ['$_id', '$$stateId'] } },
                            },
                          ],
                          as: 'stateDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$stateDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: 'districtDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$districtDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'cityDetails',
            },
          },
          {
            $unwind: {
              path: '$cityDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        if (resultCompanyList.length == 0) {
          throw new HttpException(
            'Company not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        resultCompany = resultCompanyList[0];
      }
      const responseJSON = {
        message: 'success',
        data: { list: result, totalCount: totalCount ,
          company: resultCompany,},
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

  async listFilterLoadingCity(dto: ListFilterLocadingCityDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push({ $group: { _id: '$_districtsId' } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes( 100) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DISTRICTS,
              let: { districtId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$districtId'] } } },
              ],
              as: 'districtDetails',
            },
          },
          {
            $unwind: {
              path: '$districtDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.citiesModel
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

        var resultTotalCount = await this.citiesModel
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

  async checkCodeExisting(dto: CheckItemExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.citiesModel
        .count({ _code: dto.value, _id: { $nin: dto.existingIds } })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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
  async checkNameExisting(dto: CheckNameExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.citiesModel
        .count({
          _name: dto.value,
          _id: { $nin: dto.existingIds },
          _status: { $in: [1, 0] },
        })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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
