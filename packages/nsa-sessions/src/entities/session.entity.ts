import { Expose } from 'class-transformer';
import { SessionType } from '../enums/session-type.registry';
import { EntityHelper } from 'nsa-database';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionStatus } from '../enums/session-status.enum';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';

@Entity('sessions')
export class SessionEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('AbstractUserEntity', (user: any) => user.sessions, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'enum', enum: SessionType, nullable: true })
  sessionType: SessionType;

  @Column({ type: 'timestamp', nullable: true })
  plannedStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended: Date;

  @Column({ type: 'json', nullable: true })
  payload?: object;

  @Expose()
  status?: SessionStatus;

  @AfterLoad()
  setStatus() {
    const now = new Date();

    // 1. Cancelled
    if (this.ended) {
      this.status = SessionStatus.CANCELLED;
      return;
    }

    // 2. Active: started
    if (
      this.plannedStart &&
      this.plannedStart <= now &&
      this.plannedEnd &&
      this.plannedEnd >= now
    ) {
      this.status = SessionStatus.ACTIVE;
      return;
    }

    // 3. Scheduled in future
    if (this.plannedStart && this.plannedStart > now) {
      this.status = SessionStatus.SCHEDULED;
      return;
    }

    // 4. Default fallback (no valid dates)
    this.status = SessionStatus.COMPLETED;
  }

  getTimeWindow() {
    return {
      start: this.plannedStart,
      end: this.ended || this.plannedEnd,
    };
  }
}
