import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from '@softsurgery/nsa-database';
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
    userIds?: string[],
  ): Promise<Array<GeolocationEntity & { distance?: number }>> {
    if (userIds && userIds.length === 0) {
      return Promise.resolve([]);
    }

    const params: unknown[] = [latitude, longitude, latitude];
    let extraConditions = '';

    if (excludeUserId) {
      extraConditions += ' AND g.userId != ?';
      params.push(excludeUserId);
    }

    if (userIds && userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(', ');
      extraConditions += ` AND g.userId IN (${placeholders})`;
      params.push(...userIds);
    }

    params.push(radius);

    const query = `
    SELECT 
      g.*,
      (
        6371 * ACOS(
          LEAST(
            1,
            COS(RADIANS(?)) * COS(RADIANS(g.latitude)) *
            COS(RADIANS(g.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(g.latitude))
          )
        )
      ) AS distance
    FROM geolocations g
    WHERE g.latitude IS NOT NULL
      AND g.longitude IS NOT NULL
      ${extraConditions}
    HAVING distance < ?
    ORDER BY distance ASC;
  `;

    return this.rawQuery(query, params);
  }
}
