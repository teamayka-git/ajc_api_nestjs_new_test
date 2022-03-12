import { HttpException, HttpStatus, Injectable, Session } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { Counters } from 'src/tableModels/counters.model';
import { Customers } from 'src/tableModels/customers.model';
import { User } from 'src/tableModels/user.model';
import * as mongoose from 'mongoose';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { CheckEmailExistDto, CheckMobileExistDto, CustomerCreateDto, CustomerEditeDto, CustomerLoginDto, ListCustomersDto } from './customers.dto';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { StringUtils } from 'src/utils/string_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleryCategories } from 'src/tableModels/globalGallerycategories.model';
import { CommonNames } from 'src/common/common_names';
const crypto = require('crypto');
@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(ModelNames.USER)
        private readonly userModel: mongoose.Model<User>,
        @InjectModel(ModelNames.CUSTOMERS)
        private readonly customersModel: mongoose.Model<Customers>,
        @InjectModel(ModelNames.COUNTERS)
        private readonly counterModel: mongoose.Model<Counters>,
        
        @InjectModel(ModelNames.GLOBAL_GALLERY_CATEGORIES) private readonly globalGalleryCategoriesModel: mongoose.Model<GlobalGalleryCategories>,
      @InjectModel(ModelNames.GLOBAL_GALLERIES) private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}


      async login(dto: CustomerLoginDto) {
        var dateTime = new Date().getTime();
    
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
          var resultEmployee = await this.customersModel
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
    
        var encryptedPassword = await crypto
          .pbkdf2Sync(
            dto.password,
            process.env.CRYPTO_ENCRYPTION_SALT,
            1000,
            64,
            `sha512`,
          )
          .toString(`hex`);
    
        let isEqual =
          encryptedPassword === resultEmployee[0]._password ? true : false;
    
        if (!isEqual) {
          throw new HttpException(
            'Wrong, Please check password',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    
        await this.customersModel.findOneAndUpdate(
          { _id: resultEmployee[0]._id },
          { $set: { _lastLogin: dateTime } },
          { new: true, session:transactionSession },
        );
    
        var resultUser = await this.userModel
          .aggregate([
            {
              $match: {
                _customerId: new mongoose.Types.ObjectId(resultEmployee[0]._id),
                _type: 3,
                _status: 1,
              },
            },
    
            { $sort: { _id: -1 } },
            {
              $lookup: {
                from: ModelNames.CUSTOMERS,
                let: { customerId: '$_customerId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
    


    async create(dto: CustomerCreateDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
    try{
    
    
        if (file.hasOwnProperty('image')) {
          var filePath =
            __dirname +
            `/../../../public${file['image'][0]['path'].split('public')[1]}`;
    
    
            new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER +
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
          _name:file['image'][0]['originalname'],
          _globalGalleryCategoryId:null,
          _docType:0,
          _type:7,
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
          { _tableName: ModelNames.AGENTS },
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
    
        const newsettingsModel = new this.customersModel({
          _name: dto.name,
          _gender: dto.gender,
          _email: dto.email,
          _password: encryptedPassword,
          _mobile: dto.mobile,
          _uid: resultCounterPurchase._count,
          _globalGalleryId:globalGalleryId,
          
          
          




          _orderSaleRate:dto.orderSaleRate,
          _stockSaleRate:dto.stockSaleRate,
          _customerType:dto.customerType,
          _branchId:dto.branchId,
          _orderHeadId:dto.orderHeadId,
          _relationshipManagerId:dto.relationshipManagerId,
          _supplierId:dto.supplierId,
          _panCardNumber:dto.panCardNumber,
          _billingModeSale:dto.billingModeSale,
          _billingModePurchase:dto.billingModePurchase,
          _hallmarkingMandatoryStatus:dto.hallmarkingMandatoryStatus,
          _rateCardId:dto.rateCardId,
          _gstNumber:dto.gstNumber,
          _cityId:dto.cityId,
          _tdsId:(dto.tdsId=="nil"||dto.tdsId=="")?null:dto.tdsId,
          _tcsId:(dto.tcsId=="nil"||dto.tcsId=="")?null:dto.tcsId,
          _creditAmount:dto.creditAmount,
          _creditDays:dto.creditDays,
          _rateBaseMasterId:dto.rateBaseMasterId,
          _stonePricing:dto.stonePricing,
          _chatPermissions:dto.chatPermissions,
          _agentId:dto.agentId,
          _agentCommision:dto.agentCommision,












          _dataGuard: dto.dataGuard,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        var result1 = await newsettingsModel.save({ session: transactionSession });
    
    
        const userModel = new this.userModel({
          _type:3,
          _employeeId:null,
          _agentId:null,
          _customerId:result1._id,
          _supplierId:null,
          _fcmId:"",
          _deviceUniqueId:"",
          _permissions:[],
          _userRole:1,
          _created_user_id: _userId_,
          _created_at: dateTime,
          _updated_user_id: null,
          _updated_at: -1,
          _status: 1,
        });
      await userModel.save({
          session: transactionSession,
        });
    
    var globalGalleryManinCategoryForCustomer=await this.globalGalleryCategoriesModel.find({_status:1,_name:CommonNames.GLOBAL_GALLERY_CUSTOMER,_type:1},{_id:1}).session(transactionSession);
    if(globalGalleryManinCategoryForCustomer.length==0){
      throw new HttpException('Global gallery category not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
    var globalGalleryCategory=new this.globalGalleryCategoriesModel({
      _name:dto.name,
    _globalGalleryCategoryId:globalGalleryManinCategoryForCustomer[0]._id,
    _dataGuard:[0,1,2],
    _type:2,
    _createdUserId:null,
    _createdAt:dateTime,
    _updatedUserId:null,
    _updatedAt:-1,
    _status:1
    });
    
    var globalGallerySpecificCustomer=await globalGalleryCategory.save({
      session: transactionSession,
    });


    var globalGalleryCategoryProducts=new this.globalGalleryCategoriesModel({
      _name:CommonNames.GLOBAL_GALLERY_CUSTOMER_PRODUCTS,
    _globalGalleryCategoryId:globalGallerySpecificCustomer._id,
    _dataGuard:[0,1,2],
    _type:2,
    _createdUserId:null,
    _createdAt:dateTime,
    _updatedUserId:null,
    _updatedAt:-1,
    _status:1
    });
    
    await globalGalleryCategoryProducts.save({
      session: transactionSession,
    });



















    
    
    
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result1 };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }



    async edit(dto: CustomerEditeDto, _userId_: string, file: Object) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{

 

        if (file.hasOwnProperty('image')) {
          var filePath =
            __dirname +
            `/../../../public${file['image'][0]['path'].split('public')[1]}`;
    
    
            new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT +
              new StringUtils().makeThumbImageFileName(
                file['image'][0]['filename'],
              ));
    
    
       
    
        }
    var resultOldCustomerName=await this.customersModel.find({_id:dto.customerId},{_name:1});
if(resultOldCustomerName.length==0){
  throw new HttpException('Old customer data not found', HttpStatus.INTERNAL_SERVER_ERROR);
}
    var oldCustomerName=resultOldCustomerName[0]._name;









    
        var updateObject= {
            _name: dto.name,
            _gender: dto.gender,
            _mobile: dto.mobile,
            _globalGalleryId:globalGalleryId,
            
            
            
  
  
  
  
            _orderSaleRate:dto.orderSaleRate,
            _stockSaleRate:dto.stockSaleRate,
            _customerType:dto.customerType,
            _branchId:dto.branchId,
            _orderHeadId:dto.orderHeadId,
            _relationshipManagerId:dto.relationshipManagerId,
            _supplierId:dto.supplierId,
            _panCardNumber:dto.panCardNumber,
            _billingModeSale:dto.billingModeSale,
            _billingModePurchase:dto.billingModePurchase,
            _hallmarkingMandatoryStatus:dto.hallmarkingMandatoryStatus,
            _rateCardId:dto.rateCardId,
            _gstNumber:dto.gstNumber,
            _cityId:dto.cityId,
            _tdsId:(dto.tdsId=="nil"||dto.tdsId=="")?null:dto.tdsId,
            _tcsId:(dto.tcsId=="nil"||dto.tcsId=="")?null:dto.tcsId,
            _creditAmount:dto.creditAmount,
            _creditDays:dto.creditDays,
            _rateBaseMasterId:dto.rateBaseMasterId,
            _stonePricing:dto.stonePricing,
            _chatPermissions:dto.chatPermissions,
            _agentId:dto.agentId,
            _agentCommision:dto.agentCommision,
        _dataGuard: dto.dataGuard,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
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
          _name:file['image'][0]['originalname'],
          _globalGalleryCategoryId:null,
          _docType:0,
          _type:7,
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
    
    
    
        var result = await this.customersModel.findOneAndUpdate(
          {
            _id: dto.customerId,
          },
          {
            $set: updateObject
          },
          { new: true,session: transactionSession },
        );
    

if(oldCustomerName!=dto.name){
  var globalGalleryManinCategoryForCustomer=await this.globalGalleryCategoriesModel.find({_status:1,_name:CommonNames.GLOBAL_GALLERY_CUSTOMER,_type:1},{_id:1}).session(transactionSession);
  if(globalGalleryManinCategoryForCustomer.length==0){
    throw new HttpException('Global gallery category not found', HttpStatus.INTERNAL_SERVER_ERROR);
  }
await this.globalGalleryCategoriesModel.findOneAndUpdate({_name:oldCustomerName,_globalGalleryCategoryId:globalGalleryManinCategoryForCustomer[0]._id,_status:1},{$set:{_name:dto.name}},{ new: true,session: transactionSession });
}













        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    



    async list(dto: ListCustomersDto) {
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
              { _mobile: dto.searchingText },
              { _uid: dto.searchingText },
              {_panCardNumber:dto.searchingText},
              {_gstNumber:dto.searchingText},
              ],
          },
        });
      }
      if (dto.customerIds.length > 0) {
        var newSettingsId = [];
        dto.customerIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
  
      
    
        if (dto.gender.length > 0) {
          
          arrayAggregation.push({ $match: { _gender: { $in:dto.gender } } });
        }
      
  
  
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
          case 3: arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });               break;
          case 4: arrayAggregation.push({ $sort: { _gender: dto.sortOrder } });               break;
          case 5: arrayAggregation.push({ $sort: { _email: dto.sortOrder } });               break;
          case 6: arrayAggregation.push({ $sort: { _orderSaleRate: dto.sortOrder } });               break;
          case 7: arrayAggregation.push({ $sort: { _stockSaleRate: dto.sortOrder } });               break;
          case 8: arrayAggregation.push({ $sort: { _customerType: dto.sortOrder } });               break;
          case 9: arrayAggregation.push({ $sort: { _billingModeSale: dto.sortOrder } });               break;
          case 10: arrayAggregation.push({ $sort: { _billingModePurchase: dto.sortOrder } });               break;
          case 11: arrayAggregation.push({ $sort: { _hallmarkingMandatoryStatus: dto.sortOrder } });               break;
          case 12: arrayAggregation.push({ $sort: { _creditAmount: dto.sortOrder } });               break;
          case 13: arrayAggregation.push({ $sort: { _creditDays: dto.sortOrder } });               break;
          case 14: arrayAggregation.push({ $sort: { _stonePricing: dto.sortOrder } });               break;
          case 15: arrayAggregation.push({ $sort: { _agentCommision: dto.sortOrder } });               break;
          
        }

        if (dto.orderSaleRates.length > 0) {
          
          arrayAggregation.push({ $match: { _orderSaleRate: { $in:dto.orderSaleRates } } });
        }
        if (dto.stockSaleRates.length > 0) {
          
          arrayAggregation.push({ $match: { _stockSaleRate: { $in:dto.stockSaleRates } } });
        }
        if (dto.customerTypes.length > 0) {
          
          arrayAggregation.push({ $match: { _customerType: { $in:dto.customerTypes } } });
        }
        if (dto.billingModelSales.length > 0) {
          
          arrayAggregation.push({ $match: { _billingModeSale: { $in:dto.billingModelSales } } });
        }
        if (dto.billingModelPurchases.length > 0) {
          
          arrayAggregation.push({ $match: { _billingModePurchase: { $in:dto.billingModelPurchases } } });
        }
        if (dto.hallmarkingMandatoryStatuses.length > 0) {
          
          arrayAggregation.push({ $match: { _hallmarkingMandatoryStatus: { $in:dto.hallmarkingMandatoryStatuses } } });
        }


  
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
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
  

      if (dto.screenType.findIndex((it) => it == 111) != -1) {

        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.USER,
                let: { userId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$_customerId', '$$userId'] } } }],
                as: 'userDetails',
              },
            },
            {
              $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }
  


      if (dto.screenType.findIndex((it) => it == 100) != -1) {
  
        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.BRANCHES,
                let: { branchId: '$_branchId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$branchId'] } } }],
                as: 'branchDetails',
              },
            },
            {
              $unwind: { path: '$branchDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }
     
      if (dto.screenType.findIndex((it) => it == 104) != -1) {
  
        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.RATE_CARDS,
                let: { rateCardId: '$_rateCardId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$rateCardId'] } } }],
                as: 'rateCardDetails',
              },
            },
            {
              $unwind: { path: '$rateCardDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }

      if (dto.screenType.findIndex((it) => it == 106) != -1) {
  
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
      if (dto.screenType.findIndex((it) => it == 107) != -1) {
  
        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.TDS_MASTERS,
                let: { tdsId: '$_tdsId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$tdsId'] } } }],
                as: 'tdsDetails',
              },
            },
            {
              $unwind: { path: '$tdsDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }
      if (dto.screenType.findIndex((it) => it == 108) != -1) {
  
        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.TCS_MASTERS,
                let: { tcsId: '$_tcsId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$tcsId'] } } }],
                as: 'tcsDetails',
              },
            },
            {
              $unwind: { path: '$tcsDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }
      if (dto.screenType.findIndex((it) => it == 109) != -1) {
  
        arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.RATE_BASE_MASTERS,
                let: { ratebaseId: '$_rateBaseMasterId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$ratebaseId'] } } }],
                as: 'ratebaseMasterDetails',
              },
            },
            {
              $unwind: { path: '$ratebaseMasterDetails', preserveNullAndEmptyArrays: true },
            },
          );
      }
     
      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push( {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_orderHeadId' },
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
                      {
                        $lookup: {
                          from: ModelNames.GLOBAL_GALLERIES,
                          let: { globalGalleryId: '$_globalGalleryId' },
                          pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
                          ],
                          as: 'globalGalleryDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$globalGalleryDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      }
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
            as: 'orderHeadDetails',
          },
        },
        {
          $unwind: {
            path: '$orderHeadDetails',
            preserveNullAndEmptyArrays: true,
          },
        },);
    }
    if (dto.screenType.findIndex((it) => it == 102) != -1) {
      arrayAggregation.push( {
        $lookup: {
          from: ModelNames.USER,
          let: { userId: '$_relationshipManagerId' },
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
                    {
                      $lookup: {
                        from: ModelNames.GLOBAL_GALLERIES,
                        let: { globalGalleryId: '$_globalGalleryId' },
                        pipeline: [
                          { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
                        ],
                        as: 'globalGalleryDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$globalGalleryDetails',
                        preserveNullAndEmptyArrays: true,
                      },
                    }
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
          as: 'relationshipManagerDetails',
        },
      },
      {
        $unwind: {
          path: '$relationshipManagerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },);
  }


  if (dto.screenType.findIndex((it) => it == 103) != -1) {
    arrayAggregation.push( {
      $lookup: {
        from: ModelNames.USER,
        let: { supplierId: '$_supplierId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$supplierId'] },
            },
          },

          {
              $lookup: {
                from: ModelNames.SUPPLIERS,
                let: { supplieruerId: '$_supplierId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$supplieruerId'] },
                    },
                  },
                  {
                    $lookup: {
                      from: ModelNames.GLOBAL_GALLERIES,
                      let: { globalGalleryId: '$_globalGalleryId' },
                      pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
                      ],
                      as: 'globalGalleryDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$globalGalleryDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  }
                ],
                as: 'supplierDetails',
              },
            },
            {
              $unwind: {
                path: '$supplierDetails',
                preserveNullAndEmptyArrays: true,
              },
            }


        ],
        as: 'supplierUserDetails',
      },
    },
    {
      $unwind: {
        path: '$supplierUserDetails',
        preserveNullAndEmptyArrays: true,
      },
    },);
}

if (dto.screenType.findIndex((it) => it == 110) != -1) {
  arrayAggregation.push( {
    $lookup: {
      from: ModelNames.USER,
      let: { agentUserId: '$_agentId' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$agentUserId'] },
          },
        },

        {
            $lookup: {
              from: ModelNames.AGENTS,
              let: { agentId: '$_agentId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$agentId'] },
                  },
                },
                {
                  $lookup: {
                    from: ModelNames.GLOBAL_GALLERIES,
                    let: { globalGalleryId: '$_globalGalleryId' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
                    ],
                    as: 'globalGalleryDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$globalGalleryDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                }
              ],
              as: 'agentDetails',
            },
          },
          {
            $unwind: {
              path: '$agentDetails',
              preserveNullAndEmptyArrays: true,
            },
          }


      ],
      as: 'agentUserDetails',
    },
  },
  {
    $unwind: {
      path: '$agentUserDetails',
      preserveNullAndEmptyArrays: true,
    },
  },);
}






























      var result = await this.customersModel
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
  
        var resultTotalCount = await this.customersModel
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
      var resultCount = await this.customersModel
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
      var resultCount = await this.customersModel
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
