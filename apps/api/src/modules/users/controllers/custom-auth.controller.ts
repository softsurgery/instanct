import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { NotificationInterceptor } from 'src/shared/notifications/decorators/notification.interceptor';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';
import { RequestClientSpecializedSignUpDto } from '../dtos/custom-auth/request-client-specialized-signup.dto';
import { Public } from 'src/shared/auth/utils/public-strategy';
import { UserService } from '../services/user.service';
import { BasicRoles } from 'src/shared/abstract-user-management/enums/basic-roles.enum';

@ApiTags('client-custom-auth')
@Controller({ version: '1', path: '/client-custom-auth' })
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
export class ClientCustomAuthController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('sign-up')
  @ApiOperation({
    summary: 'Register a new specialized client user',
    description:
      'Create a new specialized client user account with username, email, password, industries, and picture.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: RequestClientSpecializedSignUpDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @LogEvent(EventType.CLIENT_SIGNUP)
  async register(
    @Body() registerDto: RequestClientSpecializedSignUpDto,
    @Request() req: AdvancedRequest,
  ) {
    const { industries, ...rest } = registerDto;
    try {
      const result = await this.userService.extendedSave(
        {
          ...rest,
          roleId: BasicRoles.User,
          isActive: true,
        },
        industries,
      );
      req.logInfo = {
        userId: result?.id,
        clientName: identifyUser(result),
      };
      return result;
    } catch (error) {
      throw new BadRequestException(`User registration failed: ${error}`);
    }
  }
}
