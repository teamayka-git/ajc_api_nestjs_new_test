import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Suppliers } from 'src/tableModels/suppliers.model';
import { User } from 'src/tableModels/user.model';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { CheckEmailExistDto, CheckMobileExistDto, ListFilterLocadingSupplierDto, SupplierCreateDto, SupplierEditDto, SupplierListDto, SupplierLoginDto, SupplierStatusChangeDto } from './supplier.dto';

const crypto = require('crypto');
@Injectable()
export class SupplierService {

    constructor(  @InjectModel(ModelNames.USER) private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.SUPPLIERS)
    private readonly suppliersModel: mongoose.Model<Suppliers>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
     
  @InjectModel(ModelNames.GLOBAL_GALLERIES) private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
      @InjectConnection() private readonly connection: mongoose.Connection,){}
      async login(dto: SupplierLoginDto) {
        var dateTime = new Date().getTime();
    
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var resultEmployee = await this.suppliersModel
          .aggregate([{ $match: { _email: dto.email } }])
          .session(transactionSession);
        if (resultEmployee.length == 0) {
          throw new HttpException(
            'Wrong, Please check email and password',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        } else if (resultEmployee[0]._status == 0) {
          throw new HttpException(
            'User is disabled',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        } else if (resultEmployee[0]._status == 2) {
          throw new HttpException(
            'User is deleted',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    
    
    
        var encryptedPassword = await crypto.pbkdf2Sync(dto.password, process.env.CRYPTO_ENCRYPTION_SALT, 
          1000, 64, `sha512`).toString(`hex`);
    
    
        let isEqual = (encryptedPassword===resultEmployee[0]._password)?true:false
    
    
    
        if (!isEqual) {
          throw new HttpException(
            'Wrong, Please check password',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    
    
    await this.suppliersModel.findOneAndUpdate({_id:resultEmployee[0]._id},{$set:{_lastLogin:dateTime}} , { new: true,session: transactionSession });
    
        var resultUser = await this.userModel
          .aggregate([
            {
              $match: {
                _supplierId: new mongoose.Types.ObjectId(resultEmployee[0]._id),
                _type: 2,
                _status: 1,
              },
            },
    
            { $sort: { _id: -1 } },
            {
              $lookup: {
                from: ModelNames.SUPPLIERS,
                let: { supplierId: '$_supplierId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$supplierId'] } } },
                  { $project: { _password: 0 } },
                ],
                as: 'userDetails',
              },
            },
            {
              $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
           
          ])
          .session(transactionSession);
        if (resultUser.length == 0) {
          throw new HttpException(
            'User not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
    
        return resultUser[0];
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
    
      async create(dto: SupplierCreateDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
try{







        if (file.hasOwnProperty('image')) {
          var filePath =
            __dirname +
            `/../../../public${file['image'][0]['path'].split('public')[1]}`;


            new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER +
              new StringUtils().makeThumbImageFileName(
                file['image'][0]['filename'],
              ));

       
    
        }
    
    
        var globalGalleryId=null;
        //globalGalleryAdd
        if (file.hasOwnProperty('image')) {
    
          var resultCounterPurchase= await this.counterModel.findOneAndUpdate(
              { _tableName: ModelNames.GLOBAL_GALLERIES},
              {
                $inc: {
                  _count:1,
                  },
                },
              {  new: true,session: transactionSession },
            );
    
        const globalGallery = new this.globalGalleryModel({
          __name:file['image'][0]['originalname'],
          _globalGalleryCategoryId:null,
          _docType:0,
          _type:6,
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
      }
    









        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
            { _tableName: ModelNames.SUPPLIERS },
            {
              $inc: {
                _count: 1,
              },
            },
            { new: true,session: transactionSession },
          );
      
          var password = '';
          if (dto.password == '') {
            password = new StringUtils().makeid(6);
          }else{
            password=dto.password;
          }
      
          var encryptedPassword = await crypto
            .pbkdf2Sync(
              password,
              process.env.CRYPTO_ENCRYPTION_SALT,
              1000,
              64,
              `sha512`,
            )
            .toString(`hex`);
    
        const newsettingsModel = new this.suppliersModel({
            _name: dto.name,
            _gender: dto.gender,
            _email: dto.email,
            _password: encryptedPassword,
            _mobile: dto.mobile,
            _uid: resultCounterPurchase._count,
            _globalGalleryId:globalGalleryId,
            _cityId: dto.cityId,
            _address: dto.address,
            _lastLogin: 0,
            _dataGuard: dto.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          var result1 = await newsettingsModel.save({ session: transactionSession });




    
          const userModel = new this.userModel({
            _type:2,
            _employeeId:null,
            _agentId:null,
            _supplierId:result1._id,
            _fcmId:"",
            _deviceUniqueId:"",
            _permissions:[],
            _userRole:2,
            _created_user_id: _userId_,
            _created_at: dateTime,
            _updated_user_id: null,
            _updated_at: -1,
            _status: 1,
          });
        await userModel.save({
            session: transactionSession,
          });



    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async edit(dto: SupplierEditDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{

      console.log("___a1");

        if (file.hasOwnProperty('image')) {
          var filePath =
            __dirname +
            `/../../../public${file['image'][0]['path'].split('public')[1]}`;

            new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER +
              new StringUtils().makeThumbImageFileName(
                file['image'][0]['filename'],
              ));
              console.log("___a2");
    
        }

        console.log("___a3");
        var updateObject= {
          _name: dto.name,
          _gender: dto.gender,
          _mobile: dto.mobile,
          _cityId: dto.cityId,
          _address: dto.address,
        _dataGuard:dto.dataGuard,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
        }    
        console.log("___a4");


        var globalGalleryId=null;
        //globalGalleryAdd
        if (file.hasOwnProperty('image')) {
          console.log("___a5");
          var resultCounterPurchase= await this.counterModel.findOneAndUpdate(
              { _tableName: ModelNames.GLOBAL_GALLERIES},
              {
                $inc: {
                  _count:1,
                  },
                },
              {  new: true,session: transactionSession },
            );
            console.log("___a6");
console.log("file['image'][0]['originalname']   "+file['image'][0]['originalname']);

        const globalGallery = new this.globalGalleryModel({
          __name:file['image'][0]['originalname'],
          _globalGalleryCategoryId:null,
          _docType:0,
          _type:6,
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
        console.log("___a7");
      var resultGlobalGallery=  await globalGallery.save({
          session: transactionSession,
        });
        
        globalGalleryId=resultGlobalGallery._id;

        console.log("___a8");


        updateObject["_globalGalleryId"]=globalGalleryId
      }
    




      console.log("___a9");

        var result = await this.suppliersModel.findOneAndUpdate(
          {
            _id: dto.supplierId,
          },
          {
            $set: updateObject
          },
          { new: true,session: transactionSession },
        );
        console.log("___a10");
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async status_change(dto: SupplierStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.suppliersModel.updateMany(
          {
            _id: { $in: dto.supplierIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _status: dto.status,
            },
          },
          { new: true,session: transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async list(dto: SupplierListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        if (dto.searchingText != '') {
          //todo
          arrayAggregation.push({
            $match: {
              $or: [
                { _name: new RegExp(dto.searchingText, 'i') },
                { _email: dto.searchingText },
                { _mobile: new RegExp(dto.searchingText, 'i') },
                { _address: new RegExp(dto.searchingText, 'i') },
              ],
            },
          });
        }
        if (dto.supplierIds.length > 0) {
          var newSettingsId = [];
          dto.supplierIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
        if (dto.cityIds.length > 0) {
          var newSettingsId = [];
          dto.cityIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _cityId: { $in: newSettingsId } } });
        }
        if (dto.genders.length > 0) {
        
          arrayAggregation.push({ $match: { _gender: { $in: dto.genders } } });
        }
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
          case 3: arrayAggregation.push({ $sort: { _gender: dto.sortOrder } });               break;
          case 4: arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });               break;
          
        }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }

        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.CITIES,
                  let: { cityId: '$_cityId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$cityId'] } } }],
                  as: 'cityDetails',
                },
              },
              {
                $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
        if (dto.screenType.findIndex((it) => it == 101) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { Id: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_supplierId', '$$Id'] } } }],
                  as: 'userDetails',
                },
              },
              {
                $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
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
        var result = await this.suppliersModel
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
    
          var resultTotalCount = await this.suppliersModel
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }


      async listFilterLoadingSupplier(dto: ListFilterLocadingSupplierDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_cityId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.CITIES,
                  let: { cityId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$cityId'] } } }],
                  as: 'cityDetails',
                },
              },
              {
                $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.suppliersModel
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
    
          var resultTotalCount = await this.suppliersModel
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }

      
async checkEmailExisting(dto: CheckEmailExistDto) {
  var dateTime = new Date().getTime();
  const transactionSession = await this.connection.startSession();
  transactionSession.startTransaction();
  try {
    var resultCount = await this.suppliersModel
      .count({ _email: dto.value,_status:{$in:[1,0]} })
      .session(transactionSession);

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return {
      message: 'success',
      data: { count: resultCount },
    };
  } catch (error) {
    await transactionSession.abortTransaction();
    await transactionSession.endSession();
    throw error;
  }
}

async checkMobileExisting(dto: CheckMobileExistDto) {
  var dateTime = new Date().getTime();
  const transactionSession = await this.connection.startSession();
  transactionSession.startTransaction();
  try {
    var resultCount = await this.suppliersModel
      .count({ _mobile: dto.value,_status:{$in:[1,0]} })
      .session(transactionSession);

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return {
      message: 'success',
      data: { count: resultCount },
    };
  } catch (error) {
    await transactionSession.abortTransaction();
    await transactionSession.endSession();
    throw error;
  }
}
}
