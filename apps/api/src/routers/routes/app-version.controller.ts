import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@softsurgery/nsa-auth/utils/public-strategy';
import { ConfigurationNamespaceService } from '@softsurgery/nsa-configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from '../../app/enums/configuration-namespaces.enum';
import * as semver from 'semver';

export interface PlatformVersionPolicy {
  minVersion: string;
  storeUrl: string;
}

export interface AppVersionPolicyResponse {
  ios: PlatformVersionPolicy;
  android: PlatformVersionPolicy;
}

@ApiTags('app-version')
@Controller({
  version: '1',
  path: '/app-version',
})
export class AppVersionController {
  private readonly logger = new Logger(AppVersionController.name);

  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {}

  @Public()
  @Get()
  async getAppVersionPolicy(): Promise<AppVersionPolicyResponse> {
    const rawIosMinVersion =
      (await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.APPLICATION,
        'version.ios.minVersion',
      )) as string | null;

    const rawAndroidMinVersion =
      (await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.APPLICATION,
        'version.android.minVersion',
      )) as string | null;

    const rawIosStoreUrl =
      (await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.APPLICATION,
        'version.ios.storeUrl',
      )) as string | null;

    const rawAndroidStoreUrl =
      (await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.APPLICATION,
        'version.android.storeUrl',
      )) as string | null;

    const iosMinVersion = this.sanitizeVersion(rawIosMinVersion, 'iOS');
    const androidMinVersion = this.sanitizeVersion(
      rawAndroidMinVersion,
      'Android',
    );

    const iosStoreUrl = this.sanitizeStoreUrl(rawIosStoreUrl, 'iOS');
    const androidStoreUrl = this.sanitizeStoreUrl(
      rawAndroidStoreUrl,
      'Android',
      'https://play.google.com/store/apps/details?id=com.instanct.instanctma',
    );

    return {
      ios: {
        minVersion: iosMinVersion,
        storeUrl: iosStoreUrl,
      },
      android: {
        minVersion: androidMinVersion,
        storeUrl: androidStoreUrl,
      },
    };
  }

  private sanitizeVersion(
    raw: string | null | undefined,
    platform: string,
  ): string {
    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      return '';
    }

    const trimmed = raw.trim();
    const valid = semver.valid(trimmed);
    if (!valid) {
      this.logger.warn(
        `Invalid minimum version configured for ${platform}: "${raw}". Failing safely by ignoring this value.`,
      );
      return '';
    }

    return valid;
  }

  private sanitizeStoreUrl(
    raw: string | null | undefined,
    platform: string,
    fallback = '',
  ): string {
    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      return fallback;
    }

    const trimmed = raw.trim();
    const isAllowedScheme =
      /^https:\/\//i.test(trimmed) ||
      /^itms-apps:\/\//i.test(trimmed) ||
      /^market:\/\//i.test(trimmed);

    if (!isAllowedScheme) {
      this.logger.warn(
        `Disallowed or unsafe store URL scheme configured for ${platform}: "${raw}". Using fallback.`,
      );
      return fallback;
    }

    return trimmed;
  }
}
