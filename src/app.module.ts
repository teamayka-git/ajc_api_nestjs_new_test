import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalConfig } from './config/global_config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { ModelNames } from './common/model_names';
import { UserSchema } from './tableModels/user.model';
import { EmployeeSchema } from './tableModels/employee.model';
import { CountersSchema } from './tableModels/counters.model';
import { EmployeesModule } from './modules/employees/employees.module';


@Module({
  imports: [   ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }),
  JwtModule.register({
    secret: GlobalConfig().JWT_SECRET_KEY,
    signOptions: {},
  }), //jwt implement
  ConfigModule.forRoot({ isGlobal: true }),
  MongooseModule.forRoot(process.env.DB_GULL_URL),
  MongooseModule.forFeature([
    { name: ModelNames.USER, schema: UserSchema },
    { name: ModelNames.EMPLOYEES, schema: EmployeeSchema },
    { name: ModelNames.COUNTERS, schema:CountersSchema },
  ]),
  EmployeesModule,
  
  
  // SalesReturnRequestStatusesModule,
],
  controllers: [AppController],
  providers: [ AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },],
})
export class AppModule {
    //for middleware
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggerMiddleware)
        .exclude(
          // process.env.GLOBAL_PREFIX_FOR_API + '/(.*)',
          // process.env.GLOBAL_PREFIX_FOR_API + '/store_front/(.*)',
          process.env.GLOBAL_PREFIX_FOR_API + '/employees/login',
       
        )
        .forRoutes('*');
    }
}
