import { Module } from '@nestjs/common';
import { MeModule } from './me';

@Module({
  imports: [MeModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserAccessManagementModule {}
