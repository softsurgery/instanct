import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../utils/public-strategy';
import { AuthService } from '../services/auth.service';
import { RefreshTokenDto } from '../dtos/web/response-refresh-token';
import { ResponseSigninDto } from '../dtos/web/response-signin.dto';
import { RequestSignInDto } from '../dtos/web/request-signin.dto';
import { OAuthRequestDto } from '../dtos/web/response-oauth.dto';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { RequestResetTokenDto } from '../dtos/web/request-reset-token.dto';
import { ResponseResetTokenDto } from '../dtos/web/response-reset-token.dto';
import { RequestCheckResetTokenDto } from '../dtos/web/request-check-reset-token.dto';
import { ResponseCheckResetTokenDto } from '../dtos/web/response-check-reset-token.dto';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';

import { Notify } from 'src/shared/notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';
import { NotificationInterceptor } from 'src/shared/notifications/decorators/notification.interceptor';
import { getSigninMetadata } from '../utils/signin-metadata';
import { UserDeviceService } from '../services/user-device.service';

@ApiTags('auth')
@Controller({ version: '1', path: '/auth' })
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private userDeviceService: UserDeviceService,
  ) {}

  @Public()
  @Post('sign-in')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in a user',
    description: 'Authenticate user with email or username and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful sign in.',
    type: ResponseSigninDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @LogEvent(EventType.SIGNIN)
  @Notify(NotificationType.NEW_SIGNIN)
  async signIn(
    @Body() signInDto: RequestSignInDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseSigninDto> {
    const result = await this.authService.signin(
      signInDto.usernameOrEmail,
      signInDto.password,
    );
    const meta = await getSigninMetadata(req, signInDto);
    let deviceId: string | undefined;
    if (result.user?.id) {
      const userDevice = await this.userDeviceService.registerOrUpdateDevice(
        result.user.id,
        meta,
      );
      deviceId = userDevice.id;
    }
    req.logInfo = {
      userId: result.user?.id,
      fullname: identifyUser(result?.user as AbstractUserEntity),
      device: meta.device,
      ip: meta.ip,
      deviceId,
      fingerprint: meta.fingerprint,
    };
    if (result.user?.id) {
      req.notificationInfo = {
        userId: result.user.id,
        clientName: identifyUser(result.user as AbstractUserEntity),
        device: meta.device,
        os: meta.os,
        ip: meta.ip,
        latitude: meta.latitude,
        longitude: meta.longitude,
        location: meta.location,
        time: meta.time,
        when: meta.when,
        deviceId,
        fingerprint: meta.fingerprint,
      };
    }
    return result;
  }

  @Public()
  @Post('oauth')
  @ApiOperation({
    summary: 'Handle OAuth sign-in/signup',
    description:
      'Accepts an ID token or access token from a supported OAuth provider and signs in or registers the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful OAuth sign in or registration.',
    type: ResponseSigninDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid OAuth data.',
  })
  @LogEvent(EventType.SIGNIN)
  @Notify(NotificationType.NEW_SIGNIN)
  async oauth(
    @Body() oauthDto: OAuthRequestDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseSigninDto> {
    const { provider, idToken } = oauthDto;
    if (!provider || !idToken) {
      throw new BadRequestException('Missing provider or idToken');
    }
    const result = await this.authService.handleOAuth(provider, idToken);
    if (result?.user?.id) {
      const meta = await getSigninMetadata(req, oauthDto);
      const userDevice = await this.userDeviceService.registerOrUpdateDevice(
        result.user.id,
        meta,
      );
      req.logInfo = {
        userId: result.user.id,
        fullname: identifyUser(result.user as AbstractUserEntity),
        device: meta.device,
        ip: meta.ip,
        deviceId: userDevice.id,
        fingerprint: meta.fingerprint,
      };
      req.notificationInfo = {
        userId: result.user.id,
        clientName: identifyUser(result.user as AbstractUserEntity),
        device: meta.device,
        os: meta.os,
        ip: meta.ip,
        location: meta.location,
        time: meta.time,
        when: meta.when,
        deviceId: userDevice.id,
        fingerprint: meta.fingerprint,
      };
    }
    return result;
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Obtain a new access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed.',
    type: ResponseSigninDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refreshToken(
    @Body() body: RefreshTokenDto,
  ): Promise<ResponseSigninDto> {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send an email with a link to reset the user password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async requestPasswordReset(
    @Body() body: RequestResetTokenDto,
  ): Promise<ResponseResetTokenDto> {
    return this.authService.requestResetToken(body);
  }

  @Public()
  @Post('check-reset-token')
  @ApiOperation({
    summary: 'Check reset token validity',
    description: 'Check if the reset token is valid.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token is invalid.',
  })
  async checkResetToken(
    @Body() body: RequestCheckResetTokenDto,
  ): Promise<ResponseCheckResetTokenDto> {
    return this.authService.checkRestTokenValidity(body);
  }
}
