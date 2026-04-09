import { Expose } from 'class-transformer';
import { SessionType } from 'src/app/enums/session.enum';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionStatus } from '../enums/session-status.enum';

@Entity('sessions')
export class SessionEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AbstractUserEntity, (user) => user.sessions, {
    nullable: true,
    eager: true,
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
  started: Date;

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

    // 2. Active: started or in planned window
    const startedAndNotEnded = this.started && this.started <= now;
    const plannedWindowActive =
      this.plannedStart &&
      this.plannedEnd &&
      this.plannedStart <= now &&
      this.plannedEnd >= now;

    if (startedAndNotEnded || plannedWindowActive) {
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
}
