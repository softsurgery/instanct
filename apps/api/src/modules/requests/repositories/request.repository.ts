import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from '@softsurgery/nsa-database';
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

  /**
   * Optimized batch resolution of bidirectional accepted requests within active sessions.
   * Completely avoids O(N*M) table-scanning iterations in geolocation/presence queries.
   */
  async findAcceptedUserIdsInActiveSessions(
    userId: string,
    candidateUserIds: string[],
    now: Date = new Date(),
  ): Promise<string[]> {
    if (!candidateUserIds || candidateUserIds.length === 0) {
      return [];
    }

    type AcceptedUserIdRow = {
      sessionUserId: string;
      receiverUserId: string;
    };

    const rows = await this.requestRepository
      .createQueryBuilder('r')
      .innerJoin('r.session', 's')
      .innerJoin('r.receivers', 'rec')
      .where('r.status = :status', { status: RequestStatus.Accepted })
      .andWhere('s.ended IS NULL')
      .andWhere('s.plannedStart <= :now', { now })
      .andWhere('s.plannedEnd >= :now', { now })
      .andWhere(
        '( (s.userId = :userId AND rec.id IN (:...candidates)) OR (s.userId IN (:...candidates) AND rec.id = :userId) )',
        { userId, candidates: candidateUserIds },
      )
      .select(['s.userId AS sessionUserId', 'rec.id AS receiverUserId'])
      .getRawMany<AcceptedUserIdRow>();

    const result = new Set<string>();
    for (const row of rows) {
      if (row.sessionUserId === userId) {
        result.add(row.receiverUserId);
      } else {
        result.add(row.sessionUserId);
      }
    }
    return Array.from(result);
  }
}
