import { Module } from '@nestjs/common';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { IndustryService } from './industry.service';
import { ObjectifService } from './objectif.service';

@Module({
  controllers: [],
  providers: [IndustryService, ObjectifService],
  exports: [IndustryService, ObjectifService],
  imports: [ReferenceTypesModule],
})
export class ReferenceImplModule {}
