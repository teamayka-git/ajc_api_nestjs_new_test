import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { AgentsSchema } from 'src/tableModels/agents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({ imports: [
  JwtModule.register({
    secret: GlobalConfig().JWT_SECRET_KEY,
    signOptions: {},
  }), //jwt implement
  MongooseModule.forFeature([
    { name: ModelNames.USER, schema: UserSchema },
    { name: ModelNames.AGENTS, schema: AgentsSchema },
    { name: ModelNames.COUNTERS, schema: CountersSchema },

    
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
  ]),
],
  controllers: [AgentController],
  providers: [AgentService]
})
export class AgentModule {}
