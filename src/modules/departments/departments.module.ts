import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DepartmentsSchema } from 'src/tableModels/departments.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.DEPARTMENT,schema:DepartmentsSchema}])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService]
})
export class DepartmentsModule {}
