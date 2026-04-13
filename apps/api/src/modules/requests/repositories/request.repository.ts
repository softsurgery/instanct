import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { RequestEntity } from '../entities/request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestRepository extends DatabaseAbstractRepository<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(requestRepository, txHost);
  }
}
