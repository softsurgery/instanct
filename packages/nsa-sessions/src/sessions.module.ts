import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { SessionRepository } from './repositories/session.repository';
import { SessionService } from './services/session.service';
import { SESSION_TYPE, sessionTypeRegistry } from './enums/session-type.registry';

@Module({
  controllers: [],
  providers: [
    SessionRepository,
    SessionService,
    { provide: SESSION_TYPE, useValue: sessionTypeRegistry },
  ],
  exports: [SessionRepository, SessionService, SESSION_TYPE],
  imports: [
    TypeOrmModule.forFeature([SessionEntity]),
  ],
})
export class SessionModule {}
