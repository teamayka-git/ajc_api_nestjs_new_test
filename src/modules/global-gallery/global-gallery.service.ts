import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { GlobalGalleryCreateDto, GlobalGalleryListDto, GlobalGalleryStatusChangeDto } from './global_gallery.dto';

@Injectable()
export class GlobalGalleryService {

    constructor(
        @InjectModel(ModelNames.GLOBAL_GALLERIES) private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: GlobalGalleryCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            // _id:new MongooseModule.Types.ObjectId(),
            _name:mapItem.name,
            _globalGalleryCategoryId:mapItem.globalGalleryCategoryId,
            _globalGallerySubCategoryId:mapItem.globalGallerySubCategoryId,
            _docType:mapItem.docType,
            _type:mapItem.type,
            _url:"nil",
            _thumbUrl:"nil",
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.globalGalleryModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
    
    
      async status_change(dto: GlobalGalleryStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.globalGalleryModel.updateMany(
          {
            _id: { $in: dto.globalGalleryIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _status: dto.status,
            },
          },
          { new: true, transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }
    
      async list(dto: GlobalGalleryListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        if (dto.searchingText != '') {
          //todo
          arrayAggregation.push({
            $match: {
              $or: [
                { _name: new RegExp(dto.searchingText, 'i') },
              ],
            },
          });
        }
        if (dto.globalGalleryIds.length > 0) {
          var newSettingsId = [];
          dto.globalGalleryIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    
        if (dto.categoryIds.length > 0) {
            var newSettingsId = [];
            dto.categoryIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _globalGalleryCategoryId: { $in: newSettingsId } } });
          }
    
          if (dto.subCategoryIds.length > 0) {
            var newSettingsId = [];
            dto.subCategoryIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _globalGallerySubCategoryId: { $in: newSettingsId } } });
          }
          if (dto.types.length > 0) {
           
            arrayAggregation.push({ $match: { _type: { $in: dto.types } } });
          }
          if (dto.docTypes.length > 0) {
           
            arrayAggregation.push({ $match: { _type: { $in: dto.docTypes } } });
          }
        
        arrayAggregation.push({ $sort: { _id: -1 } });
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.globalGalleryModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
    
        var totalCount = 0;
        if (dto.screenType.findIndex((it) => it == 0) != -1) {
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
          arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });
    
          var resultTotalCount = await this.globalGalleryModel
            .aggregate(arrayAggregation)
            .session(transactionSession);
          if (resultTotalCount.length > 0) {
            totalCount = resultTotalCount[0].totalCount;
          }
        }
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return {
          message: 'success',
          data: { list: result, totalCount: totalCount },
        };
      }


}
