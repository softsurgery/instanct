import { Module } from '@nestjs/common';
import { GeolocationRepository } from './repositories/geolocation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationEntity } from './entities/geolocation.entity';
import { GeolocationService } from './services/geolocation.service';
import { GeolocationGateway } from './gateways/geolocation.gateway';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { RequestsModule } from '../requests/requests.module';
import { SessionModule } from 'src/shared/sessions/sessions.module';

@Module({
  controllers: [],
  providers: [GeolocationRepository, GeolocationService, GeolocationGateway],
  exports: [GeolocationRepository, GeolocationService, GeolocationGateway],
  imports: [
    TypeOrmModule.forFeature([GeolocationEntity]),
    ConfigurationsModule,
    RequestsModule,
    SessionModule,
  ],
})
export class GeolocationModule {}
