import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toDtoArray } from 'src/shared/database/utils/dtos';
import { IndustryService } from './industry.service';
import { ObjectifService } from './objectif.service';
import { ResponseRefParamDto } from 'src/shared/reference-types/dtos/ref-param/response-ref-param.dto';

@ApiTags('reference-impl')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: '/reference-impl',
})
export class RefImplementationController {
  constructor(
    private readonly industryService: IndustryService,
    private readonly objectifService: ObjectifService,
  ) {}

  @Get('industries')
  async getAllIndustries(): Promise<ResponseRefParamDto[]> {
    return toDtoArray(
      ResponseRefParamDto,
      await this.industryService.getIndustryParams(),
    );
  }

  @Get('objectives')
  async getAllObjectives(): Promise<ResponseRefParamDto[]> {
    return toDtoArray(
      ResponseRefParamDto,
      await this.objectifService.getObjectifParams(),
    );
  }
}
