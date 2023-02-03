import { Logger, Module } from '@nestjs/common';
import { SubscribeController } from './subscribe.controller';
import { SubscribeService } from './subscribe.service';

@Module({
  controllers: [SubscribeController],
  providers: [SubscribeService, Logger],
})
export class SubscribeModule {}
