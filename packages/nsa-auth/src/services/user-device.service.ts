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

  async findByUser(userId: string): Promise<UserDeviceEntity[]> {
    return this.repository.findAll({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async revokeAll(userId: string): Promise<void> {
    const devices = await this.findByUser(userId);
    if (devices.length > 0) {
      await this.repository.deleteMany(devices.map((d) => d.id));
    }
  }

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

  // ---------------------------------------------------------------------------
  // Backward-Compatible Delegates
  // ---------------------------------------------------------------------------

  async getUserDevices(userId: string): Promise<UserDeviceEntity[]> {
    return this.findByUser(userId);
  }

  async getDeviceById(id: string, userId?: string): Promise<UserDeviceEntity> {
    if (userId) {
      const device = await this.repository.findOne({ where: { id, userId } });
      if (!device) throw new NotFoundException("Device record not found");
      return device;
    }
    const device = await this.findOneById(id);
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

  async trustDevice(id: string, _userId?: string): Promise<UserDeviceEntity> {
    const updated = await this.update(id, { isTrusted: true });
    return updated!;
  }

  async untrustDevice(id: string, _userId?: string): Promise<UserDeviceEntity> {
    const updated = await this.update(id, { isTrusted: false });
    return updated!;
  }

  async revokeDevice(id: string, _userId?: string): Promise<void> {
    await this.delete(id);
  }

  async revokeAllDevices(userId: string): Promise<void> {
    await this.revokeAll(userId);
  }
}
