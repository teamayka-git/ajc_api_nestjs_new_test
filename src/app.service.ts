import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MeDto } from './app.dto';
import { ModelNames } from './common/model_names';
import { Company } from './tableModels/companies.model';
import { Counters } from './tableModels/counters.model';
import { Departments } from './tableModels/departments.model';
import { Employee } from './tableModels/employee.model';
import { Generals } from './tableModels/generals.model';
import { GlobalGalleryCategories } from './tableModels/globalGallerycategories.model';
import { ProcessMaster } from './tableModels/processMaster.model';
import { Purity } from './tableModels/purity.model';
import { User } from './tableModels/user.model';
import { IndexUtils } from './utils/IndexUtils';
const crypto = require('crypto');


@Injectable()
export class AppService {
  constructor( @InjectModel(ModelNames.USER) private readonly userModel: mongoose.Model<User>,
  @InjectModel(ModelNames.GENERALS) private readonly generalsModel: mongoose.Model<Generals>,
  @InjectModel(ModelNames.DEPARTMENT)
  private readonly departmentModel: mongoose.Model<Departments>,
  @InjectModel(ModelNames.PURITY) private readonly purityModel: mongoose.Model<Purity>,
  @InjectModel(ModelNames.COMPANIES) private readonly companyModel: mongoose.Model<Company>,
  @InjectModel(ModelNames.PROCESS_MASTER) private readonly processMastersModel: mongoose.Model<ProcessMaster>,
  @InjectModel(ModelNames.GLOBAL_GALLERY_CATEGORIES) private readonly globalGalleryCategoriesModel: mongoose.Model<GlobalGalleryCategories>,
  @InjectModel(ModelNames.COUNTERS)
  private readonly countersModel: mongoose.Model<Counters>, @InjectModel(ModelNames.EMPLOYEES) private readonly employeeModel: mongoose.Model<Employee>,

    @InjectConnection() private readonly connection: mongoose.Connection,){}
  getHello(): string {


    return 'Hello Worldwwwww!';
  }


  async me(dto: MeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();



    var resultEmployee = await this.userModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_userId_) } },
        { $sort: { _id: -1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { employeeId: '$_employeeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
            ],
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        }
        // ,
        // {
        //   $lookup: {
        //     from: ModelNames.AGENTS,
        //     let: { agentId: '$_agentId' },
        //     pipeline: [
        //       { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
        //     ],
        //     as: 'userDetails',
        //   },
        // },
        // {
        //   $unwind: {
        //     path: '$userDetails',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        // {
        //   $lookup: {
        //     from: ModelNames.SUPPLIERS,
        //     let: { supplierId: '$_supplierId' },
        //     pipeline: [
        //       { $match: { $expr: { $eq: ['$_id', '$$supplierId'] } } },
        //     ],
        //     as: 'userDetails',
        //   },
        // },
        // {
        //   $unwind: {
        //     path: '$userDetails',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
       
      ])
      .session(transactionSession);

    if (resultEmployee.length == 0) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }
 
    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return { message: 'success', data: resultEmployee[0] };
  } 
  
  async  project_init() {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    var userId = '';
    var resultCheckUser = await this.userModel.find({}).limit(1);
    if (resultCheckUser.length == 0) {//only first time

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.EMPLOYEES },
        {
          $setOnInsert: {
            _count: 1,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true,session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.SUPPLIERS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true,session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.AGENTS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session:transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.GLOBAL_GALLERIES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session:transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.BRANCHES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true,session: transactionSession },
      );



      var encryptedPassword = await crypto.pbkdf2Sync("123456", process.env.CRYPTO_ENCRYPTION_SALT, 
      1000, 64, `sha512`).toString(`hex`);
    
         
    
          var resultEmployee = await this.employeeModel.findOneAndUpdate(
            {
              _email: 'admin@ayka.com',
            },
            {
              $setOnInsert: {
                _name:"super admin",
                _gender:0,
                _password:encryptedPassword,
                _uid:1,
                _mobile:"",
                _lastLogin:-1,
                _globalGalleryId:null,
                _dataGuard:[1,2],
                _createdUserId:null,
                _createdAt:dateTime,
                _updatedUserId:null,
                _updatedAt:-1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          var resultUser = await this.userModel.findOneAndUpdate(
            { _employeeId: resultEmployee._id },
            {
              $setOnInsert: {
                _type:0,
                _fcmId:"",
                _deviceUniqueId:"",
                _permissions:[],
                _userRole:0,
                _createdUserId:null,
                _createdAt:-1,
                _updatedUserId:null,
                _updatedAt:-1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
    
          userId = resultUser._id;

          

          await this.companyModel.findOneAndUpdate(
            { _email: "ajc@gmail.com" },
            {
              $setOnInsert: {
                _name:"AJC",
                _place:"Malappuram",
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1000 },
            {
              $setOnInsert: {
                _string:"Rs",
                _number:-1,
                _vlaueType:1,
                _json:{basic:"basic"},
                _type:2,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1001 },
            {
              $setOnInsert: {
                _string:"₹",
                _number:-1,
                _json:{basic:"basic"},
                _vlaueType:1,
                _type:2,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1002 },
            {
              $setOnInsert: {
                _string:"",
                _number:2,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:3,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1003 },
            {
              $setOnInsert: {
                _string:"",
                _number:10,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:3,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1004 },
            {
              $setOnInsert: {
                _string:"",
                _number:30,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:1,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1005 },
            {
              $setOnInsert: {
                _string:"",
                _number:14,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:1,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1006 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1007 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1008 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _json:{basic:"basic"},
                _vlaueType:0,
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1009 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1010 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1011 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1012 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:0,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1013 },
            {
              $setOnInsert: {
                _string:"AJC",
                _vlaueType:1,
                _number:-1,
                _json:{basic:"basic"},
                _type:4,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.generalsModel.findOneAndUpdate(
            { _code: 1014 },
            {
              $setOnInsert: {
                _string:"GOLD",
                _number:-1,
                _json:{basic:"basic"},
                _vlaueType:1,
                _type:4,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );
    
          await this.generalsModel.findOneAndUpdate(
            { _code: 1015 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _json:{basic:"basic"},
                _vlaueType:0,
                _type:4,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.generalsModel.findOneAndUpdate(
            { _code: 1016 },
            {
              $setOnInsert: {
                _string:"",
                _number:1,
                _vlaueType:0,
                _json:{basic:"basic"},
                _type:4,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );

          await this.generalsModel.findOneAndUpdate(
            { _code: 1017 },
            {
              $setOnInsert: {
                _string:"AJC",
                _number:-1,
                _vlaueType:1,
                _json:{basic:"basic"},
                _type:4,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );







          await this.purityModel.findOneAndUpdate(
            { _name: "916" },
            {
              $setOnInsert: {
                _purity:916,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );



          await this.purityModel.findOneAndUpdate(
            { _name: "22" },
            {
              $setOnInsert: {
                _purity:22,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );



          await this.purityModel.findOneAndUpdate(
            { _name: "18" },
            {
              $setOnInsert: {
                _purity:18,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );



          await this.purityModel.findOneAndUpdate(
            { _name: "144" },
            {
              $setOnInsert: {
                _purity:144,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.departmentModel.findOneAndUpdate(
            { _name: "Order head" },
            {
              $setOnInsert: {
                _prefix:"OH",
                _processMasterStatus:0,
                _code:1000,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.departmentModel.findOneAndUpdate(
            { _name: "Sales executive" },
            {
              $setOnInsert: {
                _prefix:"SE",
                _processMasterStatus:0,
                _code:1001,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.departmentModel.findOneAndUpdate(
            { _name: "Relationship manager" },
            {
              $setOnInsert: {
                _prefix:"RM",
                _processMasterStatus:0,
                _code:1002,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.departmentModel.findOneAndUpdate(
            { _name: "Worker" },
            {
              $setOnInsert: {
                _prefix:"WK",
                _processMasterStatus:1,
                _code:1003,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, session:transactionSession },
          );



          await this.processMastersModel.findOneAndUpdate(
            { _code: 1000 },
            {
              $setOnInsert: {
                _name: "Master Design",
                _parentId:null,
                _dataGuard:[0,1,2],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );


/*

  0-category
    1-sub category
    2-stone
    3-agent
    4-branch
    5-employee
    6-supplier
*/


          
          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Categories" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:0,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          
          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Sub Categories" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:1,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Stones" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:2,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Agents" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:3,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Branches" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:4,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );
          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Employees" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:5,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

          await this.globalGalleryCategoriesModel.findOneAndUpdate(
            { _name: "Suppliers" },
            {
              $setOnInsert: {
                _globalGalleryCategoryId:null,
                _type:6,
                _dataGuard:[0,1,2,3],
                _createdUserId: null,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true,session: transactionSession },
          );

        
          


          





    } else {
      userId = resultCheckUser[0]._id;
    }
    //always work






    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return { message: 'Success', data: {} };
  }
}
