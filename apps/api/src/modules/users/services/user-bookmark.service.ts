import { Injectable } from '@nestjs/common';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { UserBookmarkEntity } from '../entities/user-bookmark.entity';
import { UserBookmarkRepository } from '../repositories/user-bookmark.repository';

@Injectable()
export class UserBookmarkService extends AbstractCrudService<UserBookmarkEntity> {
  constructor(private readonly userBookmarkRepository: UserBookmarkRepository) {
    super(userBookmarkRepository);
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
