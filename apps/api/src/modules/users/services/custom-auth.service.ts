import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestClientSpecializedSignUpDto } from '../dtos/custom-auth/request-client-specialized-signup.dto';
import { BasicRoles } from 'src/shared/abstract-user-management/enums/basic-roles.enum';
import { MailService } from 'src/shared/mail/services/mail.service';
import { ClientAuthService } from 'src/shared/auth/services/client-auth.service';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';
import { StorageService } from '@/shared/storage/services/storage.service';

@Injectable()
export class CustomAuthService extends ClientAuthService {
  constructor(
    protected readonly userService: UserService,
    protected readonly mailService: MailService,
    protected readonly userRepository: UserRepository,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly storageService: StorageService,
    protected readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {
    super(
      userRepository,
      userService,
      jwtService,
      configService,
      mailService,
      storageService,
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
