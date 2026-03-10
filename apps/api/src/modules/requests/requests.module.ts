import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { RequestRepository } from './repositories/request.repository';
import { RequestService } from './services/request.service';
import { UserManagementModule } from '../users/user-management.module';

@Module({
  providers: [RequestRepository, RequestService],
  exports: [RequestRepository, RequestService],
  imports: [TypeOrmModule.forFeature([RequestEntity]), UserManagementModule],
})
export class RequestsModule {}
