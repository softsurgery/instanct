import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { ResponseRefTypeDto } from 'src/shared/reference-types/dtos/ref-type/response-ref-type.dto';
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

  @Get('/industry/:label')
  async getIndustryByLabel(
    @Param('label') label: string,
  ): Promise<ResponseRefTypeDto> {
    return toDto(
      ResponseRefTypeDto,
      await this.industryService.getIndustryByLabel(label),
    );
  }

  @Get('/industry')
  async getAllIndustries(): Promise<ResponseRefTypeDto[]> {
    return toDtoArray(
      ResponseRefTypeDto,
      await this.industryService.getAllIndustries(),
    );
  }

  @Get('/industry/:label/params')
  async getIndustryParams(
    @Param('label') label: string,
  ): Promise<ResponseRefParamDto[]> {
    return toDtoArray(
      ResponseRefParamDto,
      await this.industryService.getIndustryParams(label),
    );
  }

  @Get('/objectif/:label')
  async getObjectiveByLabel(
    @Param('label') label: string,
  ): Promise<ResponseRefTypeDto> {
    return toDto(
      ResponseRefTypeDto,
      await this.objectifService.getObjectifByLabel(label),
    );
  }

  @Get('/objectif')
  async getAllObjectives(): Promise<ResponseRefTypeDto[]> {
    return toDtoArray(
      ResponseRefTypeDto,
      await this.objectifService.getAllObjectifs(),
    );
  }

  @Get('/objectif/:label/params')
  async getObjectifParams(
    @Param('label') label: string,
  ): Promise<ResponseRefParamDto[]> {
    return toDtoArray(
      ResponseRefParamDto,
      await this.objectifService.getObjectifParams(label),
    );
  }
}
