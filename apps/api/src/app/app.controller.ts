import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from 'src/shared/auth/utils/public-strategy';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get('storage')
  getStorageType() {
    return this.appService.getStorageType();
  }
}
