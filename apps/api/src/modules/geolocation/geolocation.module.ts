import { Module } from '@nestjs/common';
import { GeolocationRepository } from './repositories/geolocation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationEntity } from './entities/geolocation.entity';
import { GeolocationService } from './services/geolocation.service';
import { GeolocationGateway } from './gateways/geolocation.gateway';
import { ConfigurationsModule } from '@softsurgery/nsa-configurations/configurations.module';
import { RequestsModule } from '../requests/requests.module';
import { SessionModule } from '@softsurgery/nsa-sessions/sessions.module';
import { AuthModule } from '@softsurgery/nsa-auth/auth.module';
import { ExperimentalGeolocationService } from './services/experimental-geolocation.service';
import { ExperimentalGeolocationController } from './controllers/experimental-geolocation.controller';
import { ExperimentalGeolocationGateway } from './gateways/experimental-geolocation.gateway';

@Module({
  controllers: [ExperimentalGeolocationController],
  providers: [
    GeolocationRepository,
    GeolocationService,
    ExperimentalGeolocationService,
    GeolocationGateway,
    ExperimentalGeolocationGateway,
  ],
  exports: [
    GeolocationRepository,
    GeolocationService,
    ExperimentalGeolocationService,
    GeolocationGateway,
    ExperimentalGeolocationGateway,
  ],
  imports: [
    TypeOrmModule.forFeature([GeolocationEntity]),
    ConfigurationsModule,
    RequestsModule,
    SessionModule,
    AuthModule,
  ],
})
export class GeolocationModule {}
