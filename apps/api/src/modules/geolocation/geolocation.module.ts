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

@Module({
  controllers: [],
  providers: [GeolocationRepository, GeolocationService, GeolocationGateway],
  exports: [GeolocationRepository, GeolocationService, GeolocationGateway],
  imports: [
    TypeOrmModule.forFeature([GeolocationEntity]),
    ConfigurationsModule,
    RequestsModule,
    SessionModule,
    AuthModule,
  ],
})
export class GeolocationModule {}
