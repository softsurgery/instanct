jest.mock(
  '@softsurgery/nsa-auth/utils/public-strategy',
  () => ({
    Public: () => () => {},
    IS_PUBLIC_KEY: 'isPublic',
  }),
  { virtual: true },
);

jest.mock(
  '@softsurgery/nsa-configurations/services/configuration-namespace.service',
  () => ({
    ConfigurationNamespaceService: class ConfigurationNamespaceService {
      getSpecificParam = jest.fn();
    },
  }),
  { virtual: true },
);

import { Test, TestingModule } from '@nestjs/testing';
import { AppVersionController } from './app-version.controller';
import { ConfigurationNamespaceService } from '@softsurgery/nsa-configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from '../../app/enums/configuration-namespaces.enum';

describe('AppVersionController', () => {
  let controller: AppVersionController;
  let configService: jest.Mocked<Partial<ConfigurationNamespaceService>>;

  beforeEach(async () => {
    configService = {
      getSpecificParam: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppVersionController],
      providers: [
        {
          provide: ConfigurationNamespaceService,
          useValue: configService,
        },
      ],
    }).compile();

    controller = module.get<AppVersionController>(AppVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return valid semver versions and store URLs for both platforms', async () => {
    (configService.getSpecificParam as jest.Mock).mockImplementation(
      (namespace: string, param: string) => {
        if (namespace !== (ConfigurationNamespaces.APPLICATION as string)) {
          return null;
        }
        switch (param) {
          case 'version.ios.minVersion':
            return '1.2.0';
          case 'version.android.minVersion':
            return '1.3.1';
          case 'version.ios.storeUrl':
            return 'https://apps.apple.com/app/id1234567890';
          case 'version.android.storeUrl':
            return 'https://play.google.com/store/apps/details?id=com.instanct.instanctma';
          default:
            return null;
        }
      },
    );

    const result = await controller.getAppVersionPolicy();

    expect(result).toEqual({
      ios: {
        minVersion: '1.2.0',
        storeUrl: 'https://apps.apple.com/app/id1234567890',
      },
      android: {
        minVersion: '1.3.1',
        storeUrl:
          'https://play.google.com/store/apps/details?id=com.instanct.instanctma',
      },
    });
  });

  it('should safely return empty string if minimum version is invalid or malformed semver', async () => {
    (configService.getSpecificParam as jest.Mock).mockImplementation(
      (namespace: string, param: string) => {
        switch (param) {
          case 'version.ios.minVersion':
            return 'invalid_semver_v1';
          case 'version.android.minVersion':
            return 'not-a-version';
          default:
            return null;
        }
      },
    );

    const result = await controller.getAppVersionPolicy();

    expect(result.ios.minVersion).toBe('');
    expect(result.android.minVersion).toBe('');
    expect(result.android.storeUrl).toBe(
      'https://play.google.com/store/apps/details?id=com.instanct.instanctma',
    );
    expect(result.ios.storeUrl).toBe('');
  });

  it('should sanitize unsafe store URLs and reject dangerous URI schemes', async () => {
    (configService.getSpecificParam as jest.Mock).mockImplementation(
      (namespace: string, param: string) => {
        switch (param) {
          case 'version.ios.storeUrl':
            return 'javascript:alert("hacked")';
          case 'version.android.storeUrl':
            return 'file:///etc/passwd';
          default:
            return '1.0.0';
        }
      },
    );

    const result = await controller.getAppVersionPolicy();

    expect(result.ios.storeUrl).toBe('');
    expect(result.android.storeUrl).toBe(
      'https://play.google.com/store/apps/details?id=com.instanct.instanctma',
    );
  });
});
