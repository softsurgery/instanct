import { Transactional } from '@nestjs-cls/transactional';
import { ConflictException, Injectable } from '@nestjs/common';
import { ContentPageRepository } from '../repositories/content-page.repository';
import { ContentPageEntity } from '../entities/content-page.entity';
import { CreateContentPageDto } from '../dtos/create-content-page.dto';
import { UpdateContentPageDto } from '../dtos/update-content-page.dto';
import { ContentInterpolationService } from './content-interpolation.service';
import { AbstractCrudService } from '@/shared/database/services/abstract-crud.service';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';

@Injectable()
export class ContentPageService extends AbstractCrudService<ContentPageEntity> {
  constructor(
    private readonly contentPageRepository: ContentPageRepository,
    private readonly contentInterpolationService: ContentInterpolationService,
  ) {
    super(contentPageRepository);
  }

  override async findAll(
    query: IQueryObject = {},
    locale?: string,
  ): Promise<ContentPageEntity[]> {
    if (locale) {
      const localeFilter = `locale||$eq||${locale}`;
      query = {
        ...query,
        filter: query.filter ? `${query.filter};${localeFilter}` : localeFilter,
      };
    }
    return super.findAll(query);
  }

  override async findAllPaginated(query: IQueryObject, locale?: string) {
    if (locale) {
      const localeFilter = `locale||$eq||${locale}`;
      query = {
        ...query,
        filter: query.filter ? `${query.filter};${localeFilter}` : localeFilter,
      };
    }
    return super.findAllPaginated(query);
  }

  async findOneBySlug(
    slug: string,
    locale: string = 'fr',
  ): Promise<ContentPageEntity | null> {
    return this.contentPageRepository.findOne({
      where: { slug, locale },
    });
  }

  async findBySlug(slug: string, locale: string = 'fr') {
    const page = await this.findOneBySlug(slug, locale);
    if (!page) return null;

    const interpolated = await this.contentInterpolationService.interpolate(
      page.body,
    );

    return {
      ...page,
      body: interpolated.body,
      unresolvedKeys: interpolated.unresolvedKeys,
      hasNotApplied: interpolated.hasNotApplied,
    };
  }

  @Transactional()
  async save(dto: CreateContentPageDto): Promise<ContentPageEntity> {
    const existing = await this.contentPageRepository.findOne({
      where: { slug: dto.slug, locale: dto.locale ?? 'fr' },
    });
    if (existing) {
      throw new ConflictException(
        `Content page with slug "${dto.slug}" already exists`,
      );
    }
    return this.contentPageRepository.save({
      ...dto,
      locale: dto.locale ?? 'fr',
    });
  }

  @Transactional()
  async update(
    id: string,
    dto: UpdateContentPageDto,
  ): Promise<ContentPageEntity> {
    const page = await this.findOneById(id);
    return this.contentPageRepository.save({
      ...page,
      ...dto,
    });
  }

  async softDelete(id: string): Promise<ContentPageEntity | null> {
    await this.findOneById(id);
    return this.contentPageRepository.softDelete(id);
  }
}
