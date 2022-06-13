import { Module } from '@nestjs/common';
import { LogisticsPartnersService } from './logistics-partners.service';
import { LogisticsPartnersController } from './logistics-partners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { LogisticsPartnersSchema } from 'src/tableModels/logistics_partners.model';
import { UserSchema } from 'src/tableModels/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.LOGISTICS_PARTNERS, schema: LogisticsPartnersSchema },
      { name: ModelNames.USER, schema: UserSchema },
    ]),
  ],
  controllers: [LogisticsPartnersController],
  providers: [LogisticsPartnersService],
})
export class LogisticsPartnersModule {}
