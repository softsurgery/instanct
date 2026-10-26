import { Injectable } from '@nestjs/common';
import { IQueryObject } from '@softsurgery/nsa-database';
import { GeolocationRepository } from '../repositories/geolocation.repository';
import { GeolocationEntity } from '../entities/geolocation.entity';
import { CreateGeolocationDto } from '../dtos/create-geolocation.dto';
import { AbstractCrudService } from '@softsurgery/nsa-database';
import { RequestService } from '@/modules/requests/services/request.service';
import { SessionStatus } from '@softsurgery/nsa-sessions/enums/session-status.enum';

@Injectable()
export class GeolocationService extends AbstractCrudService<GeolocationEntity> {
  constructor(
    private readonly geolocationRepository: GeolocationRepository,
    private readonly requestService: RequestService,
  ) {
    super(geolocationRepository);
  }

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
      // Throttle DB write if position hasn't meaningfully changed (approx < 5 meters)
      const latDiff = Math.abs((location.latitude ?? 0) - (latitude ?? 0));
      const lonDiff = Math.abs((location.longitude ?? 0) - (longitude ?? 0));
      if (latDiff < 0.00005 && lonDiff < 0.00005) {
        return location;
      }

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
    } else {
      await this.geolocationRepository.save({ userId, latitude, longitude });
    }

    return this.geolocationRepository.findOne({ where: { userId } });
  }

  async findByUserIdWithRelations(
    userId: string,
  ): Promise<GeolocationEntity | null> {
    return this.geolocationRepository.findOne({
      where: { userId },
      relations: {
        user: {
          picture: true,
          industries: true,
          sessions: true,
        },
      },
    });
  }

  async findActiveSessionsByRadius(
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

    if (!geolocations.length) return [];

    const idsFilter = `id||$in||${geolocations.map((g) => g.id).join(',')}`;
    query.filter = query.filter ? `${query.filter};${idsFilter}` : idsFilter;

    // Ensure user and user.sessions relations are always joined so activeSession is reliably loaded
    const existingJoins = query.join
      ? Array.isArray(query.join)
        ? (query.join as string[])
        : String(query.join).split(',')
      : [];
    const requiredJoins = ['user', 'user.sessions', 'user.picture'];
    query.join = Array.from(new Set([...existingJoins, ...requiredJoins])).join(
      ',',
    );

    const data = (await this.findAll(query)).filter(
      (geo) =>
        geo.user?.activeSession ||
        geo.user?.sessions?.some((s) => s.status === SessionStatus.ACTIVE),
    );
    return data;
  }

  /**
   * Batch resolves which candidate users have an accepted request with userId in an active session.
   * Completely replaces O(N*M) table-scanning iterations with a single indexed SQL join.
   */
  async getAcceptedRequestUserIds(
    userId: string,
    candidateUserIds: string[],
  ): Promise<Set<string>> {
    if (!candidateUserIds || candidateUserIds.length === 0) {
      return new Set();
    }
    const accepted =
      await this.requestService.findAcceptedUserIdsInActiveSessions(
        userId,
        candidateUserIds,
      );
    return new Set(accepted);
  }
}
