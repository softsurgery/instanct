import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { GeolocationRepository } from '../repositories/geolocation.repository';
import { GeolocationEntity } from '../entities/geolocation.entity';
import { CreateGeolocationDto } from '../dtos/create-geolocation.dto';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';

@Injectable()
export class GeolocationService extends AbstractCrudService<GeolocationEntity> {
  constructor(private readonly geolocationRepository: GeolocationRepository) {
    super(geolocationRepository);
  }

  //Extended Methods ===========================================================================

  static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  async saveNewLocation(
    dto: CreateGeolocationDto,
    userId: string,
  ): Promise<GeolocationEntity | null> {
    const { latitude, longitude } = dto;

    const location = await this.geolocationRepository.findOne({
      where: { userId },
    });

    if (location) {
      await this.geolocationRepository.upsert(
        {
          id: location?.id,
          userId,
          latitude,
          longitude,
          updatedAt: new Date(),
        },
        ['userId'],
      );
    } else
      await this.geolocationRepository.save({ userId, latitude, longitude });

    return this.geolocationRepository.findOne({ where: { userId } });
  }

  async findByRadius(
    latitude: number,
    longitude: number,
    radius: number,
    excludeUserId?: string,
    query: IQueryObject = {},
  ): Promise<GeolocationEntity[]> {
    const geolocations = await this.geolocationRepository.findByKmRadius(
      latitude,
      longitude,
      radius,
      excludeUserId,
    );

    if (!geolocations.length) {
      return [];
    }

    const idsFilter = `id||$in||${geolocations.map((g) => g.id).join(',')}`;

    query.filter = query.filter ? `${query.filter};${idsFilter}` : idsFilter;

    query.join = query.join ? `${query.join},user` : 'user';

    const data = await this.findAll(query);
    return data;
  }
}
