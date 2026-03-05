import { SessionType } from 'src/app/enums/session.enum';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import {
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
}
