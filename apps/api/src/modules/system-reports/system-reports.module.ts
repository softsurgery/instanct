import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEntity } from './entities/feedback.entity';
import { BugEntity } from './entities/bug.entity';
import { BugInterestedUserEntity } from './entities/bug-interested-user.entity';
import { FeedbackRepository } from './repositories/feedback.repository';
import { BugRepository } from './repositories/bug.repository';
import { BugInterestedUserRepository } from './repositories/bug-interested-user.repository';
import { FeedbackService } from './services/feedback.service';
import { BugService } from './services/bug.service';
import { BugInterestedUserService } from './services/bug-interested-user.service';
import { AuthModule } from '@softsurgery/nsa-auth/auth.module';
import { MailModule } from '@softsurgery/nsa-mail/mail.module';

@Module({
  controllers: [],
  providers: [
    FeedbackRepository,
    FeedbackService,
    BugRepository,
    BugService,
    BugInterestedUserRepository,
    BugInterestedUserService,
  ],
  exports: [
    FeedbackRepository,
    BugRepository,
    BugInterestedUserRepository,
    FeedbackService,
    BugService,
    BugInterestedUserService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      FeedbackEntity,
      BugEntity,
      BugInterestedUserEntity,
    ]),
    AuthModule,
    MailModule,
  ],
})
export class SystemReportsModule {}
