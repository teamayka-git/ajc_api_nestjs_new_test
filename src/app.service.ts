import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MeDto } from './app.dto';
import { ModelNames } from './common/model_names';
import { Counters } from './tableModels/counters.model';
import { Employee } from './tableModels/employee.model';
import { User } from './tableModels/user.model';
const crypto = require('crypto');


@Injectable()
export class AppService {
  constructor( @InjectModel(ModelNames.USER) private readonly userModel: mongoose.Model<User>,@InjectModel(ModelNames.COUNTERS)
  private readonly countersModel: mongoose.Model<Counters>, @InjectModel(ModelNames.EMPLOYEES) private readonly employeeModel: mongoose.Model<Employee>,

    @InjectConnection() private readonly connection: mongoose.Connection,){}
  getHello(): string {
    return 'Hello World!';
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
            as: 'employeeDetails',
          },
        },
        {
          $unwind: {
            path: '$employeeDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
       
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
            _createdUser_id: null,
            _createdAt: dateTime,
            _updatedUser_id: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, transactionSession },
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
                _lastLogin:-1,
                _createdUserId:null,
                _createdAt:dateTime,
                _updatedUserId:null,
                _updatedAt:-1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, transactionSession },
          );
    
          var resultUser = await this.userModel.findOneAndUpdate(
            { _employeeId: resultEmployee._id },
            {
              $setOnInsert: {
                _type:0,
                _fcmId:"",
                _device_unique_id:"",
                _permissions:[],
                _createdUserId:null,
                _createdAt:-1,
                _updatedUserId:null,
                _updatedAt:-1,
              },
              $set: { _status: 1 },
            },
            { upsert: true, new: true, transactionSession },
          );
    
          userId = resultUser._id;
    } else {
      userId = resultCheckUser[0]._id;
    }
    //always work






    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return { message: 'Success', data: {} };
  }
}
