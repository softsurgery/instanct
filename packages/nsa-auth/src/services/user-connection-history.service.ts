import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Transactional } from "@nestjs-cls/transactional";
import { AbstractCrudService, toDto } from "@softsurgery/nsa-database";
import { FindOptionsWhere, IsNull, LessThan } from "typeorm";
import { UserConnectionHistoryRepository } from "../repositories/user-connection-history.repository";
import { UserDeviceService } from "./user-device.service";
import { UserConnectionHistoryEntity } from "../entities/user-connection-history.entity";
import { RegisterUserDeviceDto } from "../dtos/user-device/register-user-device.dto";
import { ResponseUserDeviceRegistrationDto } from "../dtos/user-device/response-user-device-registration.dto";
import { ResponseUserDeviceDto } from "../dtos/user-device/response-user-device.dto";
import { ResponseUserConnectionHistoryDto } from "../dtos/user-connection-history/response-user-connection-history.dto";
import { PresenceMetadata } from "../utils/presence-metadata";
import { SigninMetadata } from "../utils/signin-metadata";

@Injectable()
export class UserConnectionHistoryService extends AbstractCrudService<UserConnectionHistoryEntity> {
  private readonly logger = new Logger(UserConnectionHistoryService.name);

  constructor(
    private readonly userConnectionHistoryRepository: UserConnectionHistoryRepository,
    private readonly userDeviceService: UserDeviceService,
  ) {
    super(userConnectionHistoryRepository);
  }

  /**
   * Retrieves connection history records for a user, optionally filtered by device.
   */
  async findHistory(
    userId: string,
    deviceId?: string,
  ): Promise<UserConnectionHistoryEntity[]> {
    const where: FindOptionsWhere<UserConnectionHistoryEntity> = { userId };
    if (deviceId) where.deviceId = deviceId;

    return this.repository.findAll({
      where,
      relations: { device: true },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Registers a connection session for a user device, resolving or creating the device via UserDeviceService,
   * merging fast sign-in + presence transitions into a single session, and maintaining connection records.
   */
  @Transactional()
  async registerConnection(
    dto: RegisterUserDeviceDto,
  ): Promise<ResponseUserDeviceRegistrationDto> {
    const { device, isNew } = await this.userDeviceService.getOrCreateDevice(
      dto.userId,
      {
        macAddress: dto.macAddress,
        deviceName: dto.deviceName,
        deviceModel: dto.deviceModel,
        os: dto.os,
      },
    );

    const now = new Date();
    const active = await this.repository.findOne({
      where: {
        userId: dto.userId,
        deviceId: device.id,
        disconnectedAt: IsNull(),
      },
      order: { createdAt: "DESC" },
    });

    if (active) {
      const createdAt = active.createdAt ? new Date(active.createdAt) : now;
      const ageMs = now.getTime() - createdAt.getTime();

      // Merge incoming socket into recent sign-in (<5 min) or socket reconnect (<60s)
      const isRecentSignin =
        !active.socketId && dto.socketId && ageMs < 5 * 60 * 1000;
      const isRecentReconnect =
        dto.socketId &&
        (active.socketId === dto.socketId || ageMs < 60 * 1000);

      if (isRecentSignin || isRecentReconnect) {
        if (dto.socketId) active.socketId = dto.socketId;
        if (dto.source && dto.source !== "signin") active.source = dto.source;
        if (dto.ipAddress) active.ipAddress = dto.ipAddress;
        if (dto.latitude !== undefined) active.latitude = dto.latitude;
        if (dto.longitude !== undefined) active.longitude = dto.longitude;
        if (dto.location) active.location = dto.location;

        const updated = await this.repository.save(active);
        return {
          device: toDto(ResponseUserDeviceDto, device)!,
          connection: toDto(ResponseUserConnectionHistoryDto, updated)!,
          isNew,
        };
      }

      // Starting a distinct new session: close previous session
      active.disconnectedAt = now;
      await this.repository.save(active);
    }

    // Create a new connection history record
    const connection = await this.repository.save({
      userId: dto.userId,
      deviceId: device.id,
      source: dto.source || "signin",
      socketId: dto.socketId,
      ipAddress: dto.ipAddress,
      latitude: dto.latitude,
      longitude: dto.longitude,
      location: dto.location,
    });

    return {
      device: toDto(ResponseUserDeviceDto, device)!,
      connection: toDto(ResponseUserConnectionHistoryDto, connection)!,
      isNew,
    };
  }

  /**
   * Helper to register a connection during user sign-in.
   */
  @Transactional()
  async recordSignin(
    userId: string,
    meta: SigninMetadata,
  ): Promise<ResponseUserDeviceRegistrationDto> {
    return this.registerConnection({
      userId,
      source: "signin",
      macAddress: meta.macAddress,
      deviceName: meta.device,
      os: meta.os,
      ipAddress: meta.ip,
      latitude: meta.latitude,
      longitude: meta.longitude,
      location: meta.location,
    });
  }

  /**
   * Helper to register a connection during WebSocket presence handshake.
   */
  @Transactional()
  async recordPresenceConnection(params: {
    userId: string;
    socketId?: string;
    source?: string;
    metadata: PresenceMetadata;
  }): Promise<ResponseUserDeviceRegistrationDto> {
    return this.registerConnection({
      userId: params.userId,
      socketId: params.socketId,
      source: params.source || "mobile",
      macAddress: params.metadata.macAddress,
      deviceName: params.metadata.device,
      deviceModel: params.metadata.deviceModel,
      os: params.metadata.os,
      ipAddress: params.metadata.ipAddress,
      latitude: params.metadata.latitude,
      longitude: params.metadata.longitude,
      location: params.metadata.location,
    });
  }

  /**
   * Records socket disconnection timestamp for active connection history.
   */
  @Transactional()
  async recordDisconnection(
    socketId: string,
    connectionHistoryId?: string,
    disconnectedAt: Date = new Date(),
  ): Promise<void> {
    if (!socketId && !connectionHistoryId) return;

    try {
      const where: FindOptionsWhere<UserConnectionHistoryEntity> =
        connectionHistoryId
          ? { id: connectionHistoryId }
          : { socketId, disconnectedAt: IsNull() };

      const record = await this.repository.findOne({
        where,
        order: { createdAt: "DESC" },
      });

      if (record && !record.disconnectedAt) {
        record.disconnectedAt = disconnectedAt;
        await this.repository.save(record);
      }
    } catch (err) {
      this.logger.error(
        `Failed to record disconnection for socket ${socketId}`,
        err,
      );
    }
  }

  /**
   * Updates coordinates of the currently active connection session when location updates occur.
   */
  @Transactional()
  async updateActiveLocation(
    userId: string,
    latitude: number,
    longitude: number,
    location?: string,
  ): Promise<void> {
    if (!userId) return;

    try {
      const active = await this.repository.findOne({
        where: { userId, disconnectedAt: IsNull() },
        order: { createdAt: "DESC" },
      });

      if (active) {
        const latDiff = Math.abs((active.latitude ?? 0) - latitude);
        const lonDiff = Math.abs((active.longitude ?? 0) - longitude);
        if (latDiff > 0.0001 || lonDiff > 0.0001) {
          active.latitude = latitude;
          active.longitude = longitude;
          if (location) active.location = location;
          await this.repository.save(active);
        }
      }
    } catch (err) {
      this.logger.debug(
        `Failed to update active location for user ${userId}`,
        err,
      );
    }
  }

  /**
   * Removes connection history older than 30 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldConnectionHistory(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    try {
      const oldRecords = await this.repository.findAll({
        where: { createdAt: LessThan(cutoffDate) },
        withDeleted: true,
      });

      if (oldRecords.length > 0) {
        await this.repository.deleteMany(oldRecords.map((r) => r.id));
      }
    } catch (err) {
      this.logger.error("Failed to clean old connection history", err);
    }
  }
}
