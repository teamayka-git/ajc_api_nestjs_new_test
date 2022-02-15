import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { Counters } from 'src/tableModels/counters.model';
import { Customers } from 'src/tableModels/customers.model';
import { User } from 'src/tableModels/user.model';
import * as mongoose from 'mongoose';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { CustomerCreateDto, CustomerLoginDto } from './customers.dto';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { StringUtils } from 'src/utils/string_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
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
          __name:file['image'][0]['originalname'],
          _globalGalleryCategoryId:null,
          _docType:0,
          _type:3,
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
          _stateId:dto.stateId,
          _districtId:dto.districtId,
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
    
    
    
    
    
    
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result1 };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }















}
