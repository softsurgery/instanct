import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterTypeOrm } from "@nestjs-cls/transactional-adapter-typeorm";
import { DatabaseAbstractRepository } from "@softsurgery/nsa-database";
import { UserConnectionHistoryEntity } from "../entities/user-connection-history.entity";

@Injectable()
export class UserConnectionHistoryRepository extends DatabaseAbstractRepository<UserConnectionHistoryEntity> {
  constructor(
    @InjectRepository(UserConnectionHistoryEntity)
    private readonly userConnectionHistoryRepository: Repository<UserConnectionHistoryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(userConnectionHistoryRepository, txHost);
  }
}
