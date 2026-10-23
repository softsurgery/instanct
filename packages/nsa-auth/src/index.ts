export { AuthModule } from "./auth.module";
export { UserDeviceService } from "./services/user-device.service";
export { UserConnectionHistoryService } from "./services/user-connection-history.service";
export { UserDeviceController } from "./controllers/user-device.controller";
export { UserDeviceHistoryController } from "./controllers/user-device-history.controller";
export { UserDeviceRepository } from "./repositories/user-device.repository";
export { UserConnectionHistoryRepository } from "./repositories/user-connection-history.repository";
export { UserDeviceEntity } from "./entities/user-device.entity";
export { UserConnectionHistoryEntity } from "./entities/user-connection-history.entity";
export {
  ResponseUserDeviceDto,
  CreateUserDeviceDto,
  UpdateUserDeviceDto,
  RegisterUserDeviceDto,
  ResponseUserDeviceRegistrationDto,
} from "./dtos/user-device";
export {
  ResponseUserConnectionHistoryDto,
  CreateUserConnectionHistoryDto,
} from "./dtos/user-connection-history";
export {
  detectPresenceMetadata,
  extractClientIp,
  resolveIpGeolocation,
  parseDeviceUserAgent,
  type PresenceMetadata,
  type ClientConnectionPayload,
} from "./utils/presence-metadata";
export { AppleAuthUtils } from "./utils/apple-auth.utils";
export {
  type AppleTokenResponse,
  type AppleIdTokenPayload,
  type AppleUserIdentity,
  type AppleClientSecretConfig,
  type AppleJWK,
  type AppleJWKSResponse,
} from "./interfaces/apple.interface";
export { AuthProvidersService } from "./services/auth-provider.service";
