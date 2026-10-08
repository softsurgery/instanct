import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';
import { LogRepository } from './repositories/log.repository';
import { LogInterceptor } from './decorators/logger.interceptor';
import { EVENT_TYPE, eventTypeRegistry } from './enums/event-type.registry';

@Module({
  controllers: [],
  providers: [
    LogRepository,
    LoggerService,
    LogInterceptor,
    { provide: EVENT_TYPE, useValue: eventTypeRegistry },
  ],
  exports: [LoggerService, LogInterceptor, EVENT_TYPE],
  imports: [TypeOrmModule.forFeature([LogEntity])],
})
export class LoggerModule {}
