import { Injectable } from '@nestjs/common';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { UserBookmarkEntity } from '../entities/user-bookmark.entity';
import { UserBookmarkRepository } from '../repositories/user-bookmark.repository';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { FindManyOptions } from 'typeorm';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';

@Injectable()
export class UserBookmarkService extends AbstractCrudService<UserBookmarkEntity> {
  constructor(private readonly userBookmarkRepository: UserBookmarkRepository) {
    super(userBookmarkRepository);
  }

  async findAllPaginatedByUser(
    query: IQueryObject,
    userId: string,
  ): Promise<PageDto<UserBookmarkEntity>> {
    query.filter = query.filter
      ? `${query.filter},userId||$eq||${userId}`
      : `userId||$eq||${userId}`;

    const queryBuilder = new QueryBuilder(
      this.userBookmarkRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const count = await this.userBookmarkRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.userBookmarkRepository.findAll(
      queryOptions as FindManyOptions<UserBookmarkEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findBookmark(
    userId: string,
    bookmarkId: string,
  ): Promise<UserBookmarkEntity | null> {
    return this.userBookmarkRepository.findOne({
      where: { userId, bookmarkId },
    });
  }

  async saveBookmark(
    userId: string,
    bookmarkId: string,
  ): Promise<UserBookmarkEntity> {
    return this.userBookmarkRepository.save({ userId, bookmarkId });
  }

  async deleteBookmark(
    userId: string,
    bookmarkId: string,
  ): Promise<UserBookmarkEntity | null> {
    const bookmark = await this.userBookmarkRepository.findOne({
      where: { userId, bookmarkId },
    });
    if (!bookmark) throw new Error('Bookmark not found');
    return this.userBookmarkRepository.delete(bookmark.id);
  }
}
