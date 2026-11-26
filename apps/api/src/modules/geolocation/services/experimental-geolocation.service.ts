import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';
import { UserPresenceService } from '@softsurgery/nsa-um/services/user-presence.service';
import { SessionService } from '@softsurgery/nsa-sessions/services/session.service';
import type { SessionEntity } from '@softsurgery/nsa-sessions/entities/session.entity';
import { ConfigurationNamespaceService } from '@softsurgery/nsa-configurations/services/configuration-namespace.service';
import { ConfigurationParamService } from '@softsurgery/nsa-configurations/services/configuration-param.service';
import { ParamVariant } from '@softsurgery/nsa-configurations/enums/param-variant.enum';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { SessionType } from 'src/app/enums/session.enum';
import { GeolocationEntity } from '../entities/geolocation.entity';
import { GeolocationRepository } from '../repositories/geolocation.repository';
import { EXPERIMENTAL_INCLUDE_CONNECTED_PARAM } from '../constants/experimental-include-connected-param.constants';
import { EXPERIMENTAL_SESSION_DURATION_MS } from '../constants/experimental-session-duration.constants';
import { EXPERIMENTAL_VISIBILITY_PARAM } from '../constants/experimental-visibility-param.constants';
import type { UpdateExperimentalGeolocationFlagsDto } from '../dtos/experimental/update-experimental-geolocation-flags.dto';
import type { ExperimentalConnectedUserState } from '../interface/experimental-connected-user-state.interface';
import type { ExperimentalGeolocationState } from '../interface/experimental-geolocation-state.interface';

@Injectable()
export class ExperimentalGeolocationService implements OnModuleInit {
  private readonly logger = new Logger(ExperimentalGeolocationService.name);
  private positionsVisibleToEveryone = false;
  private includeConnectedUsers = false;
  private readonly experimentalUserIds = new Set<string>();

  constructor(
    private readonly geolocationRepository: GeolocationRepository,
    private readonly userPresenceService: UserPresenceService,
    private readonly sessionService: SessionService,
    @Optional()
    private readonly configurationNamespaceService?: ConfigurationNamespaceService,
    @Optional()
    private readonly configurationParamService?: ConfigurationParamService,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.loadPersistedFlags(),
      this.restoreExperimentalSessions(),
    ]);
  }

  isPositionsVisibleToEveryone(): boolean {
    return this.positionsVisibleToEveryone;
  }

  isIncludeConnectedUsers(): boolean {
    return this.includeConnectedUsers;
  }

  async augmentNearbyGeolocations(
    currentUserId: string,
    existingGeolocations: GeolocationEntity[],
  ): Promise<{ geolocations: GeolocationEntity[]; forceVisible: boolean }> {
    const forceVisible = this.positionsVisibleToEveryone;
    if (!forceVisible && !this.includeConnectedUsers) {
      return { geolocations: existingGeolocations, forceVisible: false };
    }

    try {
      const seenUserIds = new Set(existingGeolocations.map((g) => g.userId));
      const extraUserIds = new Set<string>();

      for (const id of this.experimentalUserIds) {
        if (id !== currentUserId && !seenUserIds.has(id)) {
          extraUserIds.add(id);
        }
      }

      if (this.includeConnectedUsers) {
        const activeSessions =
          await this.sessionService.findAllActiveUserSessions({});
        for (const session of activeSessions) {
          if (
            session.userId &&
            session.userId !== currentUserId &&
            !seenUserIds.has(session.userId)
          ) {
            extraUserIds.add(session.userId);
          }
        }
      }

      if (extraUserIds.size === 0) {
        return { geolocations: existingGeolocations, forceVisible };
      }

      const extraGeos = await this.geolocationRepository
        .createQueryBuilder('geo')
        .leftJoinAndSelect('geo.user', 'user')
        .leftJoinAndSelect('user.picture', 'picture')
        .leftJoinAndSelect('user.sessions', 'sessions')
        .where('geo.userId IN (:...userIds)', {
          userIds: Array.from(extraUserIds),
        })
        .andWhere('geo.latitude IS NOT NULL')
        .andWhere('geo.longitude IS NOT NULL')
        .getMany();

      return {
        geolocations: [...existingGeolocations, ...extraGeos],
        forceVisible,
      };
    } catch (error) {
      this.logger.warn(
        `Failed augmenting nearby geolocations: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { geolocations: existingGeolocations, forceVisible };
    }
  }

  async updateFlags(dto: UpdateExperimentalGeolocationFlagsDto): Promise<{
    positionsVisibleToEveryone: boolean;
    includeConnectedUsers: boolean;
  }> {
    const tasks: Promise<void>[] = [];

    if (dto.positionsVisibleToEveryone !== undefined) {
      this.positionsVisibleToEveryone = Boolean(dto.positionsVisibleToEveryone);
      tasks.push(
        this.persistBooleanParam(
          EXPERIMENTAL_VISIBILITY_PARAM,
          'Show user positions to everyone in the app even without an accepted request',
          this.positionsVisibleToEveryone,
        ),
      );
    }

    if (dto.includeConnectedUsers !== undefined) {
      this.includeConnectedUsers = Boolean(dto.includeConnectedUsers);
      tasks.push(
        this.persistBooleanParam(
          EXPERIMENTAL_INCLUDE_CONNECTED_PARAM,
          'Show real users currently connected to the map and broadcast everyone on the socket',
          this.includeConnectedUsers,
        ),
      );
    }

    await Promise.all(tasks);

    return {
      positionsVisibleToEveryone: this.positionsVisibleToEveryone,
      includeConnectedUsers: this.includeConnectedUsers,
    };
  }

  async getState(): Promise<ExperimentalGeolocationState> {
    const activeSessions = await this.sessionService.findAllActiveUserSessions(
      {},
    );
    const activeSessionUserIds = new Set(
      activeSessions
        .map((s) => s.userId)
        .filter((id): id is string => Boolean(id)),
    );

    const activeSessionByUserId = new Map<string, SessionEntity>();
    const trackedUserIds = new Set(this.experimentalUserIds);
    const experimentalSessionUserIds = new Set(this.experimentalUserIds);
    for (const session of activeSessions) {
      if (!session.userId) continue;
      if (!activeSessionByUserId.has(session.userId)) {
        activeSessionByUserId.set(session.userId, session);
      }
      const isExp = this.isExperimentalSession(session);
      if (isExp) {
        experimentalSessionUserIds.add(session.userId);
      }
      if (this.includeConnectedUsers || isExp) {
        trackedUserIds.add(session.userId);
      }
    }

    const userIds = Array.from(trackedUserIds);
    const geolocations = userIds.length
      ? await this.geolocationRepository
          .createQueryBuilder('geo')
          .leftJoinAndSelect('geo.user', 'user')
          .where('geo.userId IN (:...userIds)', { userIds })
          .getMany()
      : [];
    const geoByUserId = new Map(geolocations.map((g) => [g.userId, g]));

    return {
      positionsVisibleToEveryone: this.positionsVisibleToEveryone,
      includeConnectedUsers: this.includeConnectedUsers,
      connectedUsers: userIds.map((userId) =>
        this.buildConnectedUserState(
          userId,
          geoByUserId.get(userId),
          activeSessionUserIds.has(userId),
          experimentalSessionUserIds.has(userId),
          activeSessionByUserId.get(userId),
        ),
      ),
    };
  }

  async connectUser(
    userId: string,
    coords?: { latitude?: number; longitude?: number },
  ): Promise<ExperimentalConnectedUserState> {
    this.experimentalUserIds.add(userId);
    this.userPresenceService.trackConnection(
      userId,
      this.getExperimentalSocketId(userId),
      'mobile',
      'experimental',
    );

    const activeSessions = await this.sessionService.findAllActiveUserSessions(
      {},
      userId,
    );
    if (activeSessions.length === 0) {
      const now = new Date();
      await this.sessionService.save({
        userId,
        sessionType: SessionType.MAP_SESSION,
        plannedStart: now,
        plannedEnd: new Date(now.getTime() + EXPERIMENTAL_SESSION_DURATION_MS),
        payload: { experimental: true },
      });
    }

    if (
      typeof coords?.latitude === 'number' &&
      typeof coords?.longitude === 'number'
    ) {
      await this.upsertUserLocation(userId, coords.latitude, coords.longitude);
    }

    const geo = await this.geolocationRepository.findOne({
      where: { userId },
      relations: { user: true },
    });

    return this.buildConnectedUserState(userId, geo, true, true);
  }

  async disconnectUser(
    userId: string,
  ): Promise<ExperimentalConnectedUserState> {
    this.experimentalUserIds.delete(userId);
    this.userPresenceService.trackDisconnection(
      userId,
      this.getExperimentalSocketId(userId),
      'experimental',
    );

    const activeSessions = await this.sessionService.findAllActiveUserSessions(
      {},
      userId,
    );
    const now = new Date();
    const experimentalSessions = activeSessions.filter((s) =>
      this.isExperimentalSession(s),
    );
    await Promise.all(
      experimentalSessions.map((s) =>
        this.sessionService.update(s.id, { ended: now }),
      ),
    );

    const [remainingActive, geo] = await Promise.all([
      this.sessionService.findAllActiveUserSessions({}, userId),
      this.geolocationRepository.findOne({
        where: { userId },
        relations: { user: true },
      }),
    ]);

    return this.buildConnectedUserState(
      userId,
      geo,
      remainingActive.length > 0,
      false,
    );
  }

  async upsertUserLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<{ userId: string; latitude: number; longitude: number }> {
    const existing = await this.geolocationRepository.findOne({
      where: { userId },
    });

    await this.geolocationRepository.upsert(
      {
        ...(existing ? { id: existing.id } : {}),
        userId,
        latitude,
        longitude,
        updatedAt: new Date(),
      },
      ['userId'],
    );

    return { userId, latitude, longitude };
  }

  private async loadPersistedFlags(): Promise<void> {
    if (!this.configurationNamespaceService) return;
    const [visibility, includeConnected] = await Promise.all([
      this.loadBooleanParam(EXPERIMENTAL_VISIBILITY_PARAM),
      this.loadBooleanParam(EXPERIMENTAL_INCLUDE_CONNECTED_PARAM),
    ]);
    if (visibility !== undefined) this.positionsVisibleToEveryone = visibility;
    if (includeConnected !== undefined) {
      this.includeConnectedUsers = includeConnected;
    }
  }

  private async loadBooleanParam(
    paramName: string,
  ): Promise<boolean | undefined> {
    if (!this.configurationNamespaceService) return undefined;
    try {
      const value = await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.MAPS,
        paramName,
      );
      if (value == null) return undefined;
      return (
        value === true ||
        (typeof value === 'string' && value.toLowerCase() === 'true')
      );
    } catch {
      return undefined;
    }
  }

  private async persistBooleanParam(
    paramName: string,
    description: string,
    enabled: boolean,
  ): Promise<void> {
    if (
      !this.configurationNamespaceService ||
      !this.configurationParamService
    ) {
      return;
    }

    try {
      const namespace =
        await this.configurationNamespaceService.findGlobalByName(
          ConfigurationNamespaces.MAPS,
          { join: 'params' },
        );
      if (!namespace) return;

      const existingParam = namespace.params?.find((p) => p.name === paramName);
      if (existingParam) {
        await this.configurationParamService.update(existingParam.id, {
          value: String(enabled),
        });
        return;
      }

      await this.configurationParamService.save({
        name: paramName,
        description,
        variant: ParamVariant.BOOLEAN,
        value: String(enabled),
        namespaceId: namespace.id,
      });
    } catch (error) {
      this.logger.warn(
        `Could not persist ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async restoreExperimentalSessions(): Promise<void> {
    try {
      const activeSessions =
        await this.sessionService.findAllActiveUserSessions({});
      for (const session of activeSessions) {
        if (!this.isExperimentalSession(session) || !session.userId) continue;
        this.experimentalUserIds.add(session.userId);
        this.userPresenceService.trackConnection(
          session.userId,
          this.getExperimentalSocketId(session.userId),
          'mobile',
          'experimental',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to restore experimental sessions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private buildConnectedUserState(
    userId: string,
    geo: GeolocationEntity | null | undefined,
    hasActiveSession: boolean,
    isExperimental: boolean,
    activeSession?: SessionEntity,
  ): ExperimentalConnectedUserState {
    return {
      userId,
      isConnected: this.userPresenceService.isUserConnected(userId),
      hasActiveSession,
      isExperimental,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      activeSession: activeSession
        ? {
            plannedStart: activeSession.plannedStart,
            plannedEnd: activeSession.plannedEnd,
          }
        : undefined,
      user: geo?.user
        ? plainToInstance(ResponseUserDto, geo.user, {
            excludeExtraneousValues: true,
          })
        : undefined,
    };
  }

  private isExperimentalSession(session: { payload?: unknown }): boolean {
    const payload = session.payload as Record<string, unknown> | undefined;
    return payload?.experimental === true;
  }

  private getExperimentalSocketId(userId: string): string {
    return `experimental:${userId}`;
  }
}
