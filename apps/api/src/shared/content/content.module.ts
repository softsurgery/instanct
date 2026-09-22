import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { ContentPageEntity } from './entities/content-page.entity';
import { ContentPageRepository } from './repositories/content-page.repository';
import { ContentPageService } from './services/content-page.service';
import { ContentInterpolationService } from './services/content-interpolation.service';

@Module({
  controllers: [],
  providers: [
    ContentPageRepository,
    ContentPageService,
    ContentInterpolationService,
  ],
  exports: [
    ContentPageRepository,
    ContentPageService,
    ContentInterpolationService,
  ],
  imports: [
    TypeOrmModule.forFeature([ContentPageEntity]),
    ConfigurationsModule,
  ],
})
export class ContentModule {}
