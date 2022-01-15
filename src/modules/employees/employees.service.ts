import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmployeeLoginDto } from './employees.dto';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { User } from 'src/tableModels/user.model';
import { Employee } from 'src/tableModels/employee.model';
import { Counters } from 'src/tableModels/counters.model';
const crypto = require('crypto');

@Injectable()
export class EmployeesService {
constructor(  @InjectModel(ModelNames.USER) private readonly userModel: mongoose.Model<User>,
@InjectModel(ModelNames.EMPLOYEES)
private readonly employeeModel: mongoose.Model<Employee>,
@InjectModel(ModelNames.COUNTERS)
private readonly counterModel: mongoose.Model<Counters>,
  @InjectConnection() private readonly connection: mongoose.Connection,){}
  async login(dto: EmployeeLoginDto) {
    var dateTime = new Date().getTime();

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var resultEmployee = await this.employeeModel
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

    var resultUser = await this.userModel
      .aggregate([
        {
          $match: {
            _employeeId: new mongoose.Types.ObjectId(resultEmployee[0]._id),
            _type: 0,
            _status: 1,
          },
        },

        { $sort: { _id: -1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { employeeId: '$_employeeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
              { $project: { _password: 0 } },
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
    if (resultUser.length == 0) {
      throw new HttpException(
        'User not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return resultUser[0];
  }



}
