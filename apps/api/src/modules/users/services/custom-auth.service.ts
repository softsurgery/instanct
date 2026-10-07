import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestClientSpecializedSignUpDto } from '../dtos/custom-auth/request-client-specialized-signup.dto';
import { BasicRoles } from 'nsa-um/enums/basic-roles.enum';
import { MailService } from 'nsa-mail/services/mail.service';
import { ClientAuthService } from 'nsa-auth/services/client-auth.service';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationNamespaceService } from 'nsa-configurations/services/configuration-namespace.service';
import { CONFIGURATION_NAMESPACES } from 'nsa-configurations/enums/configuration-namespaces.registry';
import { StorageService } from 'nsa-storage/services/storage.service';
import { STORAGE_SYSTEMATICS_TOKEN } from 'nsa-storage/constants/storage-systematics.registry';

@Injectable()
export class CustomAuthService extends ClientAuthService {
  constructor(
    protected readonly userService: UserService,
    protected readonly mailService: MailService,
    protected readonly userRepository: UserRepository,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly storageService: StorageService,
    @Inject(CONFIGURATION_NAMESPACES)
    configurationNamespaces: Record<string, string>,
    @Inject(STORAGE_SYSTEMATICS_TOKEN)
    storageSystematics: Record<string, string>,
    protected readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {
    super(
      userRepository,
      userService,
      jwtService,
      configService,
      mailService,
      storageService,
      configurationNamespaces,
      storageSystematics,
      configurationNamespaceService,
    );
  }

  async extendedSignup(request: RequestClientSpecializedSignUpDto) {
    const { industries, ...rest } = request;
    try {
      const result = await this.userService.extendedSave(
        {
          ...rest,
          roleId: BasicRoles.User,
          isActive: true,
        },
        industries,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(`User registration failed: ${error}`);
    }
  }
}
