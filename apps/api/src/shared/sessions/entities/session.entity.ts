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
  active?: boolean;

  @AfterLoad()
  setActive() {
    const now = new Date();

    const startedAndNotEnded =
      !!this.started && this.started <= now && !this.ended;

    const plannedWindowActive =
      !this.ended &&
      !!this.plannedStart &&
      !!this.plannedEnd &&
      this.plannedStart <= now &&
      this.plannedEnd >= now;

    this.active = startedAndNotEnded || plannedWindowActive;
  }
}
