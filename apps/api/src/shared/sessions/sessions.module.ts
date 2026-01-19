import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { SessionRepository } from './repositories/session.repository';
import { SessionService } from './services/session.service';

@Module({
  controllers: [],
  providers: [SessionRepository, SessionService],
  exports: [SessionRepository, SessionService],
  imports: [TypeOrmModule.forFeature([SessionEntity])],
})
export class SessionModule {}
