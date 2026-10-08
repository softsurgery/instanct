import {
  Body,
  Controller,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogEvent } from 'nsa-logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'nsa-helpers/http';
import { LogInterceptor } from 'nsa-logger/decorators/logger.interceptor';
import { NotificationInterceptor } from 'nsa-notifications/decorators/notification.interceptor';
import { identifyUser } from 'nsa-um/utils/identify-user';
import { RequestClientSpecializedSignUpDto } from '../dtos/custom-auth/request-client-specialized-signup.dto';
import { Public } from 'nsa-auth/utils/public-strategy';
import { CustomAuthService } from '../services/custom-auth.service';

@ApiTags('client-custom-auth')
@Controller({ version: '1', path: '/client-custom-auth' })
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
export class ClientCustomAuthController {
  constructor(private customAuthService: CustomAuthService) {}

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
    const response = await this.customAuthService.extendedSignup(registerDto);
    req.logInfo = {
      userId: response?.id,
      clientName: identifyUser(response),
    };
    return response;
  }
}
