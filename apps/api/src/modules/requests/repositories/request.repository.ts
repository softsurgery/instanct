import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { RequestEntity } from '../entities/request.entity';
import { Repository } from 'typeorm';
import { RequestStatus } from '../enums/request-status.enum';

@Injectable()
export class RequestRepository extends DatabaseAbstractRepository<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(requestRepository, txHost);
  }

  async expireSentRequestsForSession(sessionId: number): Promise<number> {
    const result = await this.requestRepository
      .createQueryBuilder()
      .update(RequestEntity)
      .set({ status: RequestStatus.EXPIRED })
      .where('status = :status', { status: RequestStatus.Sent })
      .andWhere('sessionId = :sessionId', { sessionId })
      .execute();

    return result.affected ?? 0;
  }

  async expireSentRequestsForEndedSessions(now: Date): Promise<number> {
    const result = await this.requestRepository
      .createQueryBuilder()
      .update(RequestEntity)
      .set({ status: RequestStatus.EXPIRED })
      .where('status = :status', { status: RequestStatus.Sent })
      .andWhere(
        `sessionId IN (
          SELECT id FROM sessions
          WHERE ended IS NOT NULL OR plannedEnd <= :now
        )`,
      )
      .setParameter('now', now)
      .execute();

    return result.affected ?? 0;
  }
}
