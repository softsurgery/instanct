import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../utils/public-strategy";
import { AuthService } from "../services/auth.service";
import { RefreshTokenDto } from "../dtos/web/response-refresh-token";
import { ResponseSigninDto } from "../dtos/web/response-signin.dto";
import { RequestSignInDto } from "../dtos/web/request-signin.dto";
import { OAuthRequestDto } from "../dtos/web/response-oauth.dto";
import { LogEvent } from "@softsurgery/nsa-logger/decorators/log-event.decorator";
import { EventType } from "@softsurgery/nsa-logger/enums/event-type.registry";
import { AdvancedRequest } from "@softsurgery/nsa-helpers/http";
import { LogInterceptor } from "@softsurgery/nsa-logger/decorators/logger.interceptor";
import { RequestResetTokenDto } from "../dtos/web/request-reset-token.dto";
import { ResponseResetTokenDto } from "../dtos/web/response-reset-token.dto";
import { RequestCheckResetTokenDto } from "../dtos/web/request-check-reset-token.dto";
import { ResponseCheckResetTokenDto } from "../dtos/web/response-check-reset-token.dto";
import { AbstractUserEntity } from "@softsurgery/nsa-um/entities/abstract-user.entity";
import { identifyUser } from "@softsurgery/nsa-um/utils/identify-user";

import { Notify } from "@softsurgery/nsa-notifications/decorators/notify.decorator";
import { NotificationType } from "@softsurgery/nsa-notifications/enums/notification-type.registry";
import { NotificationInterceptor } from "@softsurgery/nsa-notifications/decorators/notification.interceptor";
import { getSigninMetadata } from "../utils/signin-metadata";
import { UserDeviceService } from "../services/user-device.service";

@ApiTags("auth")
@Controller({ version: "1", path: "/auth" })
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private userDeviceService: UserDeviceService,
  ) {}

  @Public()
  @Post("sign-in")
  @HttpCode(200)
  @ApiOperation({
    summary: "Sign in a user",
    description: "Authenticate user with email or username and password.",
  })
  @ApiResponse({
    status: 200,
    description: "Successful sign in.",
    type: ResponseSigninDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
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
    let connectionId: string | undefined;
    let isNewDevice = false;
    if (result.user?.id) {
      const {
        device: userDevice,
        connection,
        isNew,
      } = await this.userDeviceService.registerOrUpdateDevice(
        result.user.id,
        meta,
      );
      deviceId = userDevice.id;
      connectionId = connection.id;
      isNewDevice = isNew;
    }
    req.logInfo = {
      fullname: identifyUser(result?.user as AbstractUserEntity),
    };
    if (result.user?.id && isNewDevice) {
      req.notificationInfo = {
        userId: result.user.id,
        deviceId,
        connectionId,
      };
    }
    return result;
  }

  @Public()
  @Post("oauth")
  @ApiOperation({
    summary: "Handle OAuth sign-in/signup",
    description:
      "Accepts an ID token or access token from a supported OAuth provider and signs in or registers the user.",
  })
  @ApiResponse({
    status: 200,
    description: "Successful OAuth sign in or registration.",
    type: ResponseSigninDto,
  })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid OAuth data.",
  })
  @LogEvent(EventType.SIGNIN)
  @Notify(NotificationType.NEW_SIGNIN)
  async oauth(
    @Body() oauthDto: OAuthRequestDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseSigninDto> {
    const { provider, idToken } = oauthDto;
    if (!provider || !idToken) {
      throw new BadRequestException("Missing provider or idToken");
    }
    const result = await this.authService.handleOAuth(provider, idToken);
    if (result?.user?.id) {
      const meta = await getSigninMetadata(req, oauthDto);
      const {
        device: userDevice,
        connection,
        isNew,
      } = await this.userDeviceService.registerOrUpdateDevice(
        result.user.id,
        meta,
      );
      req.logInfo = {
        fullname: identifyUser(result.user as AbstractUserEntity),
      };
      if (isNew) {
        req.notificationInfo = {
          userId: result.user.id,
          deviceId: userDevice.id,
          connectionId: connection.id,
        };
      }
    }
    return result;
  }

  @Public()
  @Post("refresh-token")
  @ApiOperation({
    summary: "Refresh access token",
    description: "Obtain a new access token using a valid refresh token.",
  })
  @ApiResponse({
    status: 200,
    description: "Token successfully refreshed.",
    type: ResponseSigninDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid or expired refresh token.",
  })
  async refreshToken(
    @Body() body: RefreshTokenDto,
  ): Promise<ResponseSigninDto> {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Public()
  @Post("forgot-password")
  @ApiOperation({
    summary: "Request password reset",
    description: "Send an email with a link to reset the user password.",
  })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid email address.",
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
  })
  async requestPasswordReset(
    @Body() body: RequestResetTokenDto,
  ): Promise<ResponseResetTokenDto> {
    return this.authService.requestResetToken(body);
  }

  @Public()
  @Post("check-reset-token")
  @ApiOperation({
    summary: "Check reset token validity",
    description: "Check if the reset token is valid.",
  })
  @ApiResponse({
    status: 200,
    description: "Token is valid.",
  })
  @ApiResponse({
    status: 401,
    description: "Token is invalid.",
  })
  async checkResetToken(
    @Body() body: RequestCheckResetTokenDto,
  ): Promise<ResponseCheckResetTokenDto> {
    return this.authService.checkRestTokenValidity(body);
  }
}
