import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { UserDeviceRepository } from '../repositories/user-device.repository';
import { UserDeviceEntity } from '../entities/user-device.entity';
import { SigninMetadata } from '../utils/signin-metadata';

@Injectable()
export class UserDeviceService {
  private readonly logger = new Logger(UserDeviceService.name);

  constructor(private readonly userDeviceRepository: UserDeviceRepository) {}

  @Transactional()
  async registerOrUpdateDevice(
    userId: string,
    metadata: SigninMetadata & { fingerprint?: string },
  ): Promise<{ device: UserDeviceEntity; isNew: boolean }> {
    if (!userId) {
      throw new Error('UserId is required for device registration');
    }

    const fingerprint = metadata.fingerprint || 'unknown-device';

    let device = await this.userDeviceRepository.findOne({
      where: {
        userId,
        fingerprint,
      },
    });

    // If not matched by exact fingerprint, check if this is an existing device that was updated
    if (!device && metadata.os && metadata.device) {
      const isCurrentIos =
        metadata.os.toLowerCase().includes('ios') ||
        metadata.device.toLowerCase().includes('iphone') ||
        metadata.device.toLowerCase().includes('ipad');

      const isCurrentAndroid =
        metadata.os.toLowerCase().includes('android');

      if (isCurrentIos || isCurrentAndroid) {
        const existingDevices = await this.userDeviceRepository.findAll({
          where: { userId },
          order: { lastSignInAt: 'DESC' },
        });

        const matchingDevice = existingDevices.find((d) => {
          if (isCurrentIos) {
            const isTargetIos =
              d.os?.toLowerCase().includes('ios') ||
              d.deviceName?.toLowerCase().includes('iphone') ||
              d.deviceName?.toLowerCase().includes('ipad');
            if (
              isTargetIos &&
              (d.deviceName === metadata.device ||
                (d.deviceName?.toLowerCase().includes('iphone') &&
                  metadata.device?.toLowerCase().includes('iphone')) ||
                (d.deviceName?.toLowerCase().includes('ipad') &&
                  metadata.device?.toLowerCase().includes('ipad')))
            ) {
              return true;
            }
          }

          if (isCurrentAndroid) {
            const isTargetAndroid = d.os?.toLowerCase().includes('android');
            if (isTargetAndroid && d.deviceName === metadata.device) {
              return true;
            }
          }

          return false;
        });

        if (matchingDevice) {
          device = matchingDevice;
          this.logger.log(
            `Matched existing device ${device.id} (${device.deviceName}) across update for user ${userId}. Preserving device identity and updating fingerprint to ${fingerprint}`,
          );
          device.fingerprint = fingerprint;
        }
      }
    }

    const now = new Date();

    if (device) {
      device.signInCount = (device.signInCount || 1) + 1;
      device.lastSignInAt = now;
      if (metadata.device) device.deviceName = metadata.device;
      if (metadata.os) device.os = metadata.os;
      if (metadata.ip) device.ipAddress = metadata.ip;
      if (metadata.latitude !== undefined) device.latitude = metadata.latitude;
      if (metadata.longitude !== undefined)
        device.longitude = metadata.longitude;
      if (metadata.location) device.location = metadata.location;

      const updated = await this.userDeviceRepository.save(device);
      this.logger.log(
        `Updated existing device ${updated.id} for user ${userId} (Sign-in #${updated.signInCount})`,
      );
      return { device: updated, isNew: false };
    }

    const newDevice = await this.userDeviceRepository.save({
      userId,
      fingerprint,
      deviceName: metadata.device || 'Unknown Device',
      os: metadata.os || 'Unknown OS',
      ipAddress: metadata.ip || '127.0.0.1',
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      location: metadata.location || 'Unknown Location',
      signInCount: 1,
      lastSignInAt: now,
      isTrusted: true,
    });

    this.logger.log(
      `Registered new device ${newDevice.id} (fingerprint: ${fingerprint}) for user ${userId}`,
    );

    return { device: newDevice, isNew: true };
  }

  async getUserDevices(userId: string): Promise<UserDeviceEntity[]> {
    return this.userDeviceRepository.findAll({
      where: { userId },
      order: { lastSignInAt: 'DESC' },
    });
  }

  @Transactional()
  async trustDevice(id: string, userId: string): Promise<UserDeviceEntity> {
    const device = await this.userDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException('Device record not found');
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
      throw new NotFoundException('Device record not found');
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
      throw new NotFoundException('Device record not found');
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
}
