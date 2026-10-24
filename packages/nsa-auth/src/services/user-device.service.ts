import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AbstractCrudService } from "@softsurgery/nsa-database";
import { UserDeviceRepository } from "../repositories/user-device.repository";
import { UserDeviceEntity } from "../entities/user-device.entity";
import { CreateUserDeviceDto } from "../dtos/user-device/create-user-device.dto";
import { UpdateUserDeviceDto } from "../dtos/user-device/update-user-device.dto";

@Injectable()
export class UserDeviceService extends AbstractCrudService<UserDeviceEntity> {
  private readonly logger = new Logger(UserDeviceService.name);

  constructor(private readonly userDeviceRepository: UserDeviceRepository) {
    super(userDeviceRepository);
  }

  /**
   * Retrieves all registered devices for a specific user.
   */
  async findByUser(userId: string): Promise<UserDeviceEntity[]> {
    return this.repository.findAll({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  /**
   * Finds an existing device or creates a new one, handling synthetic MAC addresses (e.g. web/macOS)
   * with fallback name+os matching to prevent duplicate device entries.
   */
  async getOrCreateDevice(
    userId: string,
    data: {
      macAddress?: string;
      deviceName?: string;
      deviceModel?: string;
      os?: string;
    },
  ): Promise<{ device: UserDeviceEntity; isNew: boolean }> {
    const macAddress = data.macAddress || "02:00:00:00:00:00";
    const deviceName = data.deviceName || "Unknown Device";
    const os = data.os || "Unknown OS";

    // 1. Try finding device by exact (userId, macAddress)
    let device = await this.repository.findOne({
      where: { userId, macAddress },
    });

    if (device) {
      let changed = false;
      if (data.deviceName && device.deviceName !== data.deviceName) {
        device.deviceName = data.deviceName;
        changed = true;
      }
      if (data.deviceModel && device.deviceModel !== data.deviceModel) {
        device.deviceModel = data.deviceModel;
        changed = true;
      }
      if (data.os && device.os !== data.os) {
        device.os = data.os;
        changed = true;
      }
      if (changed) {
        device = await this.repository.save(device);
      }
      return { device, isNew: false };
    }

    // 2. Fallback matching for devices with synthetic MAC addresses (match existing user device by name and OS)
    const existingNamedDevice = await this.repository.findOne({
      where: { userId, deviceName, os },
    });

    if (existingNamedDevice) {
      if (data.deviceModel && !existingNamedDevice.deviceModel) {
        existingNamedDevice.deviceModel = data.deviceModel;
        await this.repository.save(existingNamedDevice);
      }
      return { device: existingNamedDevice, isNew: false };
    }

    // 3. Register new trusted device
    device = await this.repository.save({
      userId,
      macAddress,
      deviceName,
      deviceModel: data.deviceModel,
      os,
      isTrusted: true,
    });

    return { device, isNew: true };
  }

  /**
   * Resolves the device ID for a given user context (explicit ID, MAC lookup, or latest device).
   */
  async resolveDeviceId(
    userId?: string,
    options?: { deviceId?: string; macAddress?: string },
  ): Promise<string | undefined> {
    if (options?.deviceId) return options.deviceId;
    if (!userId) return undefined;

    if (options?.macAddress) {
      const match = await this.repository.findOne({
        where: { userId, macAddress: options.macAddress },
      });
      if (match) return match.id;
    }

    const latest = await this.repository.findOne({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
    return latest?.id;
  }

  /**
   * Marks a registered device as trusted.
   */
  async trustDevice(id: string): Promise<UserDeviceEntity> {
    const updated = await this.update(id, { isTrusted: true });
    return updated!;
  }

  /**
   * Marks a registered device as untrusted.
   */
  async untrustDevice(id: string): Promise<UserDeviceEntity> {
    const updated = await this.update(id, { isTrusted: false });
    return updated!;
  }

  /**
   * Revokes and removes all devices for a user.
   */
  async revokeAll(userId: string): Promise<void> {
    const devices = await this.findByUser(userId);
    if (devices.length > 0) {
      await this.repository.deleteMany(devices.map((d) => d.id));
    }
  }

  // ---------------------------------------------------------------------------
  // Backward-Compatible Delegates
  // ---------------------------------------------------------------------------

  async getUserDevices(userId: string): Promise<UserDeviceEntity[]> {
    return this.findByUser(userId);
  }

  async getDeviceById(id: string, userId?: string): Promise<UserDeviceEntity> {
    const device = userId
      ? await this.repository.findOne({ where: { id, userId } })
      : await this.findOneById(id);
    if (!device) throw new NotFoundException("Device record not found");
    return device;
  }

  async createDevice(
    userId: string,
    createDto: CreateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    return this.save({ ...createDto, userId });
  }

  async updateDevice(
    id: string,
    _userId: string,
    updateDto: UpdateUserDeviceDto,
  ): Promise<UserDeviceEntity> {
    const updated = await this.update(id, updateDto);
    return updated!;
  }

  async revokeDevice(id: string): Promise<void> {
    await this.delete(id);
  }

  async revokeAllDevices(userId: string): Promise<void> {
    await this.revokeAll(userId);
  }
}
