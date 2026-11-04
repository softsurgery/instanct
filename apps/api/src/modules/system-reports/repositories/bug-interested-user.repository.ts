import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from '@softsurgery/nsa-database';
import { BugInterestedUserEntity } from '../entities/bug-interested-user.entity';

@Injectable()
export class BugInterestedUserRepository extends DatabaseAbstractRepository<BugInterestedUserEntity> {
  constructor(
    @InjectRepository(BugInterestedUserEntity)
    private readonly bugInterestedUserRepository: Repository<BugInterestedUserEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(bugInterestedUserRepository, txHost);
  }
}
