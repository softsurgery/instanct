import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Transactional } from "@nestjs-cls/transactional";
import { IsNull, LessThan } from "typeorm";
import { UserDeviceRepository } from "../repositories/user-device.repository";
import { UserConnectionHistoryRepository } from "../repositories/user-connection-history.repository";
import { UserDeviceEntity } from "../entities/user-device.entity";
import { UserConnectionHistoryEntity } from "../entities/user-connection-history.entity";
import { SigninMetadata } from "../utils/signin-metadata";
import { PresenceMetadata } from "../utils/presence-metadata";
import { CreateUserDeviceDto } from "../dtos/user-device/create-user-device.dto";
import { UpdateUserDeviceDto } from "../dtos/user-device/update-user-device.dto";

@Injectable()
export class UserDeviceService {
  private readonly logger = new Logger(UserDeviceService.name);

  constructor(
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly userConnectionHistoryRepository: UserConnectionHistoryRepository,
  ) {}

  @Transactional()
  async registerOrUpdateDevice(
    userId: string,
    metadata: SigninMetadata & { macAddress?: string },
  ): Promise<{
    device: UserDeviceEntity;
    connection: UserConnectionHistoryEntity;
    isNew: boolean;
  }> {
    if (!userId) {
      throw new Error("UserId is required for device registration");
    }

    const macAddress = metadata.macAddress || "02:00:00:00:00:00";

    let device = await this.userDeviceRepository.findOne({
      where: {
        userId,
        macAddress,
      },
    });

    let isNew = false;
    if (device) {
      if (metadata.device) device.deviceName = metadata.device;
      if (metadata.os) device.os = metadata.os;

      device = await this.userDeviceRepository.save(device);
      this.logger.log(
        `Updated existing device ${device.id} for user ${userId}`,
      );
    } else {
      device = await this.userDeviceRepository.save({
        userId,
        macAddress,
        deviceName: metadata.device || "Unknown Device",
        os: metadata.os || "Unknown OS",
        isTrusted: true,
      });
      isNew = true;
      this.logger.log(
        `Registered new device ${device.id} (macAddress: ${macAddress}) for user ${userId}`,
      );
    }

    // Close previous open connections for this device
    const openConnections = await this.userConnectionHistoryRepository.findAll({
      where: { userId, deviceId: device.id, disconnectedAt: IsNull() },
    });
    if (openConnections.length > 0) {
      const closedAt = new Date();
      for (const openConn of openConnections) {
        openConn.disconnectedAt = closedAt;
      }
      await this.userConnectionHistoryRepository.saveMany(openConnections);
    }

    // Insert new history record in user_connection_history
    const connection = await this.userConnectionHistoryRepository.save({
      userId,
      deviceId: device.id,
      source: "signin",
      ipAddress: metadata.ip,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      location: metadata.location,
    });

    this.logger.log(
      `Recorded signin connection [${connection.id}] for user ${userId} on device "${device.deviceName}"`,
    );

    return { device, connection, isNew };
  }

  async getUserDevices(userId: string): Promise<UserDeviceEntity[]> {
    return this.userDeviceRepository.findAll({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async getDeviceById(id: string, userId: string): Promise<UserDeviceEntity> {
    const device = await this.userDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException("Device record not found");
    }

    return device;
  }

  @Transactional()
  async createDevice(
    userId: string,
    createDto: CreateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    return this.userDeviceRepository.save({
      userId,
      macAddress: createDto.macAddress,
      deviceName: createDto.deviceName,
      deviceModel: createDto.deviceModel,
      os: createDto.os,
      isTrusted: createDto.isTrusted ?? true,
    });
  }

  @Transactional()
  async updateDevice(
    id: string,
    userId: string,
    updateDto: UpdateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    const device = await this.getDeviceById(id, userId);

    if (updateDto.deviceName !== undefined) {
      device.deviceName = updateDto.deviceName;
    }
    if (updateDto.deviceModel !== undefined) {
      device.deviceModel = updateDto.deviceModel;
    }
    if (updateDto.os !== undefined) {
      device.os = updateDto.os;
    }
    if (updateDto.isTrusted !== undefined) {
      device.isTrusted = updateDto.isTrusted;
    }

    return this.userDeviceRepository.save(device);
  }

  @Transactional()
  async trustDevice(id: string, userId: string): Promise<UserDeviceEntity> {
    const device = await this.userDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException("Device record not found");
    }

    device.isTrusted = true;
    return this.userDeviceRepository.save(device);
  }

  @Transactional()
  async untrustDevice(id: string, userId: string): Promise<UserDeviceEntity> {
    const device = await this.userDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException("Device record not found");
    }

    device.isTrusted = false;
    return this.userDeviceRepository.save(device);
  }

  @Transactional()
  async revokeDevice(id: string, userId: string): Promise<void> {
    const device = await this.userDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException("Device record not found");
    }

    await this.userDeviceRepository.remove(device);
    this.logger.log(`Removed and logged out device ${id} for user ${userId}`);
  }

  @Transactional()
  async revokeAllDevices(userId: string): Promise<void> {
    const devices = await this.userDeviceRepository.findAll({
      where: { userId },
    });

    if (devices.length > 0) {
      const ids = devices.map((d) => d.id);
      await this.userDeviceRepository.deleteMany(ids);
      this.logger.log(
        `Removed and logged out all (${devices.length}) devices for user ${userId}`,
      );
    }
  }

  /**
   * Tracks a connection event: associates or registers the device in user_devices,
   * and records a new entry in user_connection_history with detected device, IP address, and geolocation.
   */
  @Transactional()
  async recordPresenceConnection(params: {
    userId: string;
    socketId?: string;
    source?: string;
    metadata: PresenceMetadata;
  }): Promise<{
    connection: UserConnectionHistoryEntity;
    device: UserDeviceEntity;
  }> {
    const { userId, socketId, source = "mobile", metadata } = params;
    if (!userId) {
      throw new Error("UserId is required to record connection history");
    }

    const macAddress = metadata.macAddress || "02:00:00:00:00:00";

    // 1. Find or create/update the device in user_devices
    let device = await this.userDeviceRepository.findOne({
      where: {
        userId,
        macAddress,
      },
    });

    if (device) {
      if (metadata.device) device.deviceName = metadata.device;
      if (metadata.deviceModel) device.deviceModel = metadata.deviceModel;
      if (metadata.os) device.os = metadata.os;
      device = await this.userDeviceRepository.save(device);
    } else {
      device = await this.userDeviceRepository.save({
        userId,
        macAddress,
        deviceName: metadata.device || "Mobile Device",
        deviceModel: metadata.deviceModel,
        os: metadata.os || "Mobile OS",
        isTrusted: true,
      });
    }

    // 2. Close any previous open connections for this device so only the newest is active
    const openConnections = await this.userConnectionHistoryRepository.findAll({
      where: { userId, deviceId: device.id, disconnectedAt: IsNull() },
    });
    if (openConnections.length > 0) {
      const closedAt = new Date();
      for (const openConn of openConnections) {
        openConn.disconnectedAt = closedAt;
      }
      await this.userConnectionHistoryRepository.saveMany(openConnections);
    }

    // 3. Insert new history record in user_connection_history
    const connection = await this.userConnectionHistoryRepository.save({
      userId,
      deviceId: device.id,
      source,
      socketId,
      ipAddress: metadata.ipAddress,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      location: metadata.location,
    });

    this.logger.log(
      `Recorded presence connection [${connection.id}] for user ${userId} on device "${metadata.device}" (IP: ${metadata.ipAddress}, Location: ${metadata.location || "N/A"})`,
    );

    return { connection, device };
  }

  /**
   * Marks a connection as disconnected in user_connection_history.
   */
  @Transactional()
  async recordDisconnection(
    socketId: string,
    connectionHistoryId?: string,
    disconnectedAt: Date = new Date(),
  ): Promise<void> {
    if (!socketId && !connectionHistoryId) return;

    try {
      let record: UserConnectionHistoryEntity | null = null;
      if (connectionHistoryId) {
        record = await this.userConnectionHistoryRepository.findOne({
          where: { id: connectionHistoryId },
        });
      }

      if (!record && socketId) {
        record = await this.userConnectionHistoryRepository.findOne({
          where: { socketId, disconnectedAt: IsNull() },
          order: { createdAt: "DESC" },
        });
      }

      if (record && !record.disconnectedAt) {
        record.disconnectedAt = disconnectedAt;
        await this.userConnectionHistoryRepository.save(record);
        this.logger.debug(
          `Marked connection [${record.id}] disconnected at ${disconnectedAt.toISOString()}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to record disconnection for socket ${socketId}`,
        err,
      );
    }
  }

  /**
   * Retrieves connection history for a single device.
   */
  async getDeviceConnectionHistory(
    userId: string,
    deviceId: string,
  ): Promise<UserConnectionHistoryEntity[]> {
    const history = await this.userConnectionHistoryRepository.findAll({
      where: { userId, deviceId },
      order: { createdAt: "DESC" },
    });

    const staleToClose: UserConnectionHistoryEntity[] = [];
    for (let i = 1; i < history.length; i++) {
      const item = history[i];
      if (!item.disconnectedAt) {
        item.disconnectedAt =
          history[i - 1]?.createdAt ||
          item.updatedAt ||
          item.createdAt ||
          new Date();
        staleToClose.push(item);
      }
    }

    if (staleToClose.length > 0) {
      await this.userConnectionHistoryRepository.saveMany(staleToClose);
    }

    return history;
  }

  /**
   * Retrieves all connection history entries for a given user.
   */
  async getUserConnectionHistory(
    userId: string,
  ): Promise<UserConnectionHistoryEntity[]> {
    const history = await this.userConnectionHistoryRepository.findAll({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    const seenLatestByDevice = new Map<string, Date>();
    const staleToClose: UserConnectionHistoryEntity[] = [];

    for (const item of history) {
      const key = item.deviceId || "unknown";
      const newerCreatedAt = seenLatestByDevice.get(key);
      if (newerCreatedAt !== undefined && !item.disconnectedAt) {
        item.disconnectedAt =
          newerCreatedAt || item.updatedAt || item.createdAt || new Date();
        staleToClose.push(item);
      }
      seenLatestByDevice.set(key, item.createdAt || new Date());
    }

    if (staleToClose.length > 0) {
      await this.userConnectionHistoryRepository.saveMany(staleToClose);
    }

    return history;
  }

  /**
   * Resolves a target device ID for a user.
   * If explicit deviceId is provided, returns it.
   * Otherwise falls back to matching by user + macAddress,
   * or user's most recently active device.
   */
  async resolveDeviceId(
    userId?: string,
    options?: { deviceId?: string; macAddress?: string },
  ): Promise<string | undefined> {
    if (options?.deviceId) {
      return options.deviceId;
    }

    if (!userId) {
      return undefined;
    }

    if (options?.macAddress) {
      const matchingDevice = await this.userDeviceRepository.findOne({
        where: { userId, macAddress: options.macAddress },
      });
      if (matchingDevice) {
        return matchingDevice.id;
      }
    }

    const latestDevice = await this.userDeviceRepository.findOne({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
    return latestDevice?.id;
  }

  /**
   * Permanently deletes (hard deletes) connection history records older than 1 month.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldConnectionHistory(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);

    try {
      const oldRecords = await this.userConnectionHistoryRepository.findAll({
        where: { createdAt: LessThan(cutoffDate) },
        withDeleted: true,
      });

      if (oldRecords.length > 0) {
        const ids = oldRecords.map((record) => record.id);
        await this.userConnectionHistoryRepository.deleteMany(ids);
        this.logger.log(
          `Permanently deleted ${ids.length} connection history records older than 1 month`,
        );
      }
    } catch (err) {
      this.logger.error(
        "Failed to permanently delete connection history records older than 1 month",
        err,
      );
    }
  }
}
