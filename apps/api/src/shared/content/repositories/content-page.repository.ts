import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { ContentPageEntity } from '../entities/content-page.entity';

@Injectable()
export class ContentPageRepository extends DatabaseAbstractRepository<ContentPageEntity> {
  constructor(
    @InjectRepository(ContentPageEntity)
    private readonly contentPageRepository: Repository<ContentPageEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(contentPageRepository, txHost);
  }
}
