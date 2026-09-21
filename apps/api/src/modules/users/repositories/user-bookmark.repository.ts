import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { UserBookmarkEntity } from '../entities/user-bookmark.entity';

@Injectable()
export class UserBookmarkRepository extends DatabaseAbstractRepository<UserBookmarkEntity> {
  constructor(
    @InjectRepository(UserBookmarkEntity)
    private readonly userBookmarkRepository: Repository<UserBookmarkEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(userBookmarkRepository, txHost);
  }
}
