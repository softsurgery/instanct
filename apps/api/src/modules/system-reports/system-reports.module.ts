import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEntity } from './entities/feedback.entity';
import { BugEntity } from './entities/bug.entity';
import { FeedbackRepository } from './repositories/feedback.repository';
import { BugRepository } from './repositories/bug.repository';
import { FeedbackService } from './services/feedback.service';
import { BugService } from './services/bug.service';
import { AuthModule } from '@softsurgery/nsa-auth/auth.module';

@Module({
  controllers: [],
  providers: [FeedbackRepository, FeedbackService, BugRepository, BugService],
  exports: [FeedbackRepository, BugRepository, FeedbackService, BugService],
  imports: [TypeOrmModule.forFeature([FeedbackEntity, BugEntity]), AuthModule],
})
export class SystemReportsModule {}
