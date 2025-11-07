import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { GeolocationRepository } from '../repositories/geolocation.repository';
import { GeolocationEntity } from '../entities/geolocation.entity';
import { GeolocationNotFoundException } from '../errors/geolocation.notfound.error';
import { CreateGeolocationDto } from '../dtos/create-geolocation.dto';

@Injectable()
export class GeolocationService {
  constructor(private readonly geolocationRepository: GeolocationRepository) {}

  async findOneById(id: string): Promise<GeolocationEntity> {
    const location = await this.geolocationRepository.findOneById(id);
    if (!location) {
      throw new GeolocationNotFoundException();
    }
    return location;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<GeolocationEntity | null> {
    const queryBuilder = new QueryBuilder(
      this.geolocationRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const location = await this.geolocationRepository.findOne(
      queryOptions as FindOneOptions<GeolocationEntity>,
    );
    if (!location) return null;
    return location;
  }

  async findAll(query: IQueryObject = {}): Promise<GeolocationEntity[]> {
    const queryBuilder = new QueryBuilder(
      this.geolocationRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    return await this.geolocationRepository.findAll(
      queryOptions as FindManyOptions<GeolocationEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<GeolocationEntity>> {
    const queryBuilder = new QueryBuilder(
      this.geolocationRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const count = await this.geolocationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.geolocationRepository.findAll(
      queryOptions as FindManyOptions<GeolocationEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  @Transactional()
  async save(geolocationEntity: Partial<GeolocationEntity>) {
    return this.geolocationRepository.save(geolocationEntity);
  }

  async saveMany(geolocationEntities: Partial<GeolocationEntity>[]) {
    return this.geolocationRepository.saveMany(geolocationEntities);
  }

  async softDelete(id: string): Promise<GeolocationEntity | null> {
    return this.geolocationRepository.softDelete(id);
  }

  async delete(id: string): Promise<GeolocationEntity | null> {
    const geolocation = await this.findOneById(id);
    return this.geolocationRepository.remove(geolocation);
  }

  //Extended Methods ===========================================================================

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
    radiusKm: number = 5,
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
      ? [latitude, longitude, latitude, excludeUserId, radiusKm]
      : [latitude, longitude, latitude, radiusKm];

    return this.geolocationRepository.rawQuery(query, params);
  }
}
