import { Module } from "@nestjs/common";
import { MailService } from "./services/mail.service";
import { TemplateModule } from "@softsurgery/nsa-templates/template.module";

@Module({
  controllers: [],
  providers: [MailService],
  exports: [MailService],
  imports: [TemplateModule],
})
export class MailModule {}
