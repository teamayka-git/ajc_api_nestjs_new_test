import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Categories } from 'src/tableModels/categories.model';
import { CategoriesCreateDto, CategoriesEditDto, CategoriesListDto, CategoriesStatusChangeDto, ListFilterLocadingCategoryDto } from './categories.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { GlobalConfig } from 'src/config/global_config';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectModel(ModelNames.CATEGORIES) private readonly categoriesModel: Model<Categories>,
        @InjectModel(ModelNames.GLOBAL_GALLERIES) private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
        @InjectModel(ModelNames.COUNTERS)
        private readonly counterModel: mongoose.Model<Counters>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: CategoriesCreateDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
        var arrayGlobalGalleries=[];
    


        
        if (file.hasOwnProperty('image')) {
          var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
            { _table_name: ModelNames.GLOBAL_GALLERIES },
            {
              $inc: {
                _count: file['image'].length,
              },
            },
            { new: true, transactionSession },
          );
    
          for (var i = 0; i < file['image'].length; i++) {
            var filePath =
              __dirname +
              `/../../../public${file['image'][i]['path'].split('public')[1]}`;
    
            new ThumbnailUtils().generateThumbnail(
              filePath,
              UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH +
                new StringUtils().makeThumbImageFileName(
                  file['image'][i]['filename'],
                ),
            );
    
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              __name: '',
              _globalGalleryCategoryId: null,
              _globalGallerySubCategoryId: null,
              _docType: 0,
              _type: 4,
              _uid: resultCounterPurchase._count - file['image'].length + (i + 1),
              _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                process.env.SERVER_DOMAIN
              }:${process.env.PORT}${file['image'][i]['path'].split('public')[1]}`,
              _thumbUrl: new StringUtils().makeThumbImageFileName(
                `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                  process.env.SERVER_DOMAIN
                }:${process.env.PORT}${
                  file['image'][i]['path'].split('public')[1]
                }`,
              ),
              _created_user_id: _userId_,
              _created_at: dateTime,
              _updated_user_id: null,
              _updated_at: -1,
              _status: 1,
            });
    
            var count = dto.array.findIndex(
              (it) => it.fileOriginalName == file['image'][i]['originalname'],
            );
            if (count != -1) {
              dto.array[count]['globalGalleryId'] = globalGalleryId;
            } else {
              dto.array[count]['globalGalleryId'] = 'nil';
            }
          }
        }

 







        dto.array.map((mapItem) => {
          arrayToStates.push({
            // _id:new MongooseModule.Types.ObjectId(),
            _name:mapItem.name,
            _code:mapItem.code,
            _description:mapItem.description,
            _groupId:mapItem.groupId,
            _globalGalleryId:
              mapItem['globalGalleryId'] == 'nil'
                ? null
                : mapItem['globalGalleryId'],
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.categoriesModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: CategoriesEditDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    


        if (file.hasOwnProperty('image')) {
          var filePath =
            __dirname +
            `/../../../public${file['image'][0]['path'].split('public')[1]}`;

            new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH +
              new StringUtils().makeThumbImageFileName(
                file['image'][0]['filename'],
              ));


         
    
        }
    


        var updateObject= {
          _name:dto.name,
          _code:dto.code,
          _description:dto.description,
          _groupId:dto.groupId,
          _dataGuard:dto.dataGuard,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
        }





        var globalGalleryId=null;
        //globalGalleryAdd
        if (file.hasOwnProperty('image')) {
    
          var resultCounterPurchase= await this.counterModel.findOneAndUpdate(
              { _table_name: ModelNames.GLOBAL_GALLERIES},
              {
                $inc: {
                  _count:1,
                  },
                },
              {  new: true, transactionSession },
            );
    
        const globalGallery = new this.globalGalleryModel({
          // _id:new MongooseModule.Types.ObjectId(),
          __name:"",
          _globalGalleryCategoryId:null,
          _globalGallerySubCategoryId:null,
          _docType:0,
          _type:4,
          _uid:resultCounterPurchase._count,
          _url:`${process.env.SSL== 'true'?"https":"http"}://${process.env.SERVER_DOMAIN}:${
              process.env.PORT
            }${file['image'][0]['path'].split('public')[1]}`,
          _thumbUrl: new StringUtils().makeThumbImageFileName(
              `${process.env.SSL== 'true'?"https":"http"}://${process.env.SERVER_DOMAIN}:${
                process.env.PORT
              }${file['image'][0]['path'].split('public')[1]}`,
            ),
          _created_user_id: _userId_,
          _created_at: dateTime,
          _updated_user_id: null,
          _updated_at: -1,
          _status: 1,
        });
      var resultGlobalGallery=  await globalGallery.save({
          session: transactionSession,
        });
        
        globalGalleryId=resultGlobalGallery._id;
        updateObject["_globalGalleryId"]=globalGalleryId
      }
    



        var result = await this.categoriesModel.findOneAndUpdate(
          {
            _id: dto.categoryId,
          },
          {
            $set: updateObject
          },
          { new: true, transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }
    
      async status_change(dto: CategoriesStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.categoriesModel.updateMany(
          {
            _id: { $in: dto.categoryIds },
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
    
      async list(dto: CategoriesListDto) {
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
                { _description: new RegExp(dto.searchingText, 'i') },
                { _code: dto.searchingText },
              ],
            },
          });
        }
        if (dto.categoryIds.length > 0) {
          var newSettingsId = [];
          dto.categoryIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
        
        if (dto.groupIds.length > 0) {
            var newSettingsId = [];
            dto.groupIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _groupId: { $in: newSettingsId } } });
          }
    

  



          switch(dto.sortType){
            case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
            case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
            case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
            case 3: arrayAggregation.push({ $sort: { _code: dto.sortOrder } });               break;
            
          }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_groupId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: { path: '$groupDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
        if (dto.screenType.findIndex((it) => it == 50) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } }],
                  as: 'globalGalleryDetails',
                },
              },
              {
                $unwind: { path: '$globalGalleryDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
        var result = await this.categoriesModel
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
    
          var resultTotalCount = await this.categoriesModel
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





      
    
      async listFilterLoadingCategory(dto: ListFilterLocadingCategoryDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_groupId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: { path: '$groupDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.categoriesModel
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
    
          var resultTotalCount = await this.categoriesModel
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
