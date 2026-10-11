import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IQueryObject } from "nsa-database";
import { PageDto } from "nsa-database";
import { toDto, toDtoArray } from "nsa-database";
import { TemplateService } from "../services/template.service";
import { ResponseTemplateDto } from "../dtos/response-template.dto";
import { CreateTemplateDto } from "../dtos/create-template.dto";
import { UpdateTemplateDto } from "../dtos/update-template.dto";

@ApiTags("templates")
@ApiBearerAuth("access_token")
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: "1",
  path: "/templates",
})
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get("/list")
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseTemplateDto>> {
    const paginated = await this.templateService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseTemplateDto, paginated.data),
    };
  }

  @Get("/all")
  async findAll(@Query() query: IQueryObject): Promise<ResponseTemplateDto[]> {
    return toDtoArray(
      ResponseTemplateDto,
      await this.templateService.findAll(query),
    );
  }

  @Get(":id")
  async findOneById(@Param("id") id: string): Promise<ResponseTemplateDto> {
    return toDto(
      ResponseTemplateDto,
      await this.templateService.findOneById(id),
    );
  }

  @Post()
  async create(@Body() dto: CreateTemplateDto): Promise<ResponseTemplateDto> {
    const template = await this.templateService.save(dto);
    return toDto(ResponseTemplateDto, template);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<ResponseTemplateDto> {
    const template = await this.templateService.update(id, dto);
    return toDto(ResponseTemplateDto, template);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<ResponseTemplateDto | null> {
    const template = await this.templateService.delete(id);
    return toDto(ResponseTemplateDto, template);
  }
}
