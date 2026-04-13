import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { RequestRepository } from './repositories/request.repository';
import { RequestService } from './services/request.service';
import { UserManagementModule } from '../users/user-management.module';
import { SessionModule } from 'src/shared/sessions/sessions.module';

@Module({
  providers: [RequestRepository, RequestService],
  exports: [RequestRepository, RequestService],
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    UserManagementModule,
    SessionModule,
  ],
})
export class RequestsModule {}
