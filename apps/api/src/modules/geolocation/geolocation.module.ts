import { Module } from '@nestjs/common';
import { GeolocationRepository } from './repositories/geolocation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationEntity } from './entities/geolocation.entity';
import { GeolocationService } from './services/geolocation.service';
import { GeolocationGateway } from './gateways/geolocation.gateway';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';

@Module({
  controllers: [],
  providers: [GeolocationRepository, GeolocationService, GeolocationGateway],
  exports: [GeolocationRepository, GeolocationService, GeolocationGateway],
  imports: [
    TypeOrmModule.forFeature([GeolocationEntity]),
    ConfigurationsModule,
  ],
})
export class GeolocationModule {}
