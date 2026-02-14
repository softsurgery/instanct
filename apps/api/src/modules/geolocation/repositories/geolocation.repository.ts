import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { GeolocationEntity } from '../entities/geolocation.entity';

@Injectable()
export class GeolocationRepository extends DatabaseAbstractRepository<GeolocationEntity> {
  constructor(
    @InjectRepository(GeolocationEntity)
    private readonly geolocationRepository: Repository<GeolocationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(geolocationRepository, txHost);
  }

  findByKmRadius(
    latitude: number,
    longitude: number,
    radius: number,
    excludeUserId?: string,
  ): Promise<GeolocationEntity[]> {
    const query = `
    SELECT 
      g.*,
      (
        6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(g.latitude)) *
          COS(RADIANS(g.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(g.latitude))
        )
      ) AS distance
    FROM geolocations g
    WHERE g.latitude IS NOT NULL
      AND g.longitude IS NOT NULL
      ${excludeUserId ? 'AND g.userId != ?' : ''}
    HAVING distance < ?
    ORDER BY distance ASC;
  `;
    const params = excludeUserId
      ? [latitude, longitude, latitude, excludeUserId, radius]
      : [latitude, longitude, latitude, radius];

    return this.rawQuery(query, params);
  }
}
