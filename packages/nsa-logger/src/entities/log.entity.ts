import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'nsa-database';
import { EventType } from '../enums/event-type.registry';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';

@Entity('log')
export class LogEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: EventType, nullable: true })
  event: EventType;

  @Column({ nullable: true })
  api?: string;

  @Column({ nullable: true })
  method?: string;

  @ManyToOne('AbstractUserEntity', (user: any) => user.logs, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'json', nullable: true })
  logInfo?: object;
}
