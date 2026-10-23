import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Transactional } from "@nestjs-cls/transactional";
import { AbstractCrudService, toDto } from "@softsurgery/nsa-database";
import { IsNull, LessThan } from "typeorm";
import { UserConnectionHistoryRepository } from "../repositories/user-connection-history.repository";
import { UserDeviceRepository } from "../repositories/user-device.repository";
import { UserConnectionHistoryEntity } from "../entities/user-connection-history.entity";
import { RegisterUserDeviceDto } from "../dtos/user-device/register-user-device.dto";
import { ResponseUserDeviceRegistrationDto } from "../dtos/user-device/response-user-device-registration.dto";
import { ResponseUserDeviceDto } from "../dtos/user-device/response-user-device.dto";
import { ResponseUserConnectionHistoryDto } from "../dtos/user-connection-history/response-user-connection-history.dto";
import { PresenceMetadata } from "../utils/presence-metadata";

@Injectable()
export class UserConnectionHistoryService extends AbstractCrudService<UserConnectionHistoryEntity> {
  private readonly logger = new Logger(UserConnectionHistoryService.name);

  constructor(
    private readonly userConnectionHistoryRepository: UserConnectionHistoryRepository,
    private readonly userDeviceRepository: UserDeviceRepository,
  ) {
    super(userConnectionHistoryRepository);
  }

  async findHistory(
    userId: string,
    deviceId?: string,
  ): Promise<UserConnectionHistoryEntity[]> {
    const where: Record<string, any> = { userId };
    if (deviceId) where.deviceId = deviceId;

    return this.repository.findAll({
      where,
      relations: { device: true },
      order: { createdAt: "DESC" },
    });
  }

  @Transactional()
  async registerConnection(
    dto: RegisterUserDeviceDto,
  ): Promise<ResponseUserDeviceRegistrationDto> {
    const macAddress = dto.macAddress || "02:00:00:00:00:00";
    let device = await this.userDeviceRepository.findOne({
      where: { userId: dto.userId, macAddress },
    });

    let isNew = false;
    if (device) {
      if (dto.deviceName) device.deviceName = dto.deviceName;
      if (dto.deviceModel) device.deviceModel = dto.deviceModel;
      if (dto.os) device.os = dto.os;
      device = await this.userDeviceRepository.save(device);
    } else {
      device = await this.userDeviceRepository.save({
        userId: dto.userId,
        macAddress,
        deviceName: dto.deviceName || "Unknown Device",
        deviceModel: dto.deviceModel,
        os: dto.os || "Unknown OS",
        isTrusted: true,
      });
      isNew = true;
    }

    // Close any previous open connections for this device
    const openConnections = await this.repository.findAll({
      where: {
        userId: dto.userId,
        deviceId: device.id,
        disconnectedAt: IsNull(),
      },
    });
    if (openConnections.length > 0) {
      const now = new Date();
      openConnections.forEach((conn) => {
        conn.disconnectedAt = now;
      });
      await this.repository.saveMany(openConnections);
    }

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

  @Transactional()
  async recordDisconnection(
    socketId: string,
    connectionHistoryId?: string,
    disconnectedAt: Date = new Date(),
  ): Promise<void> {
    if (!socketId && !connectionHistoryId) return;

    try {
      const record = connectionHistoryId
        ? await this.repository.findOne({
            where: { id: connectionHistoryId },
          })
        : await this.repository.findOne({
            where: { socketId, disconnectedAt: IsNull() },
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
