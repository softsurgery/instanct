import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '@softsurgery/nsa-database';
import type { AbstractUserEntity } from '@softsurgery/nsa-um/entities/abstract-user.entity';
import { UserDeviceEntity } from './user-device.entity';

@Entity('user_connection_history')
@Index(['userId', 'createdAt'])
export class UserConnectionHistoryEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('AbstractUserEntity', {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: AbstractUserEntity;

  @Column({ nullable: true })
  deviceId?: string;

  @ManyToOne(() => UserDeviceEntity, (device) => device.connections, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'deviceId' })
  device?: UserDeviceEntity;

  @Column({ default: 'mobile' })
  source: string;

  @Column({ nullable: true })
  socketId?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ type: 'double', nullable: true })
  latitude?: number;

  @Column({ type: 'double', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'timestamp', nullable: true })
  disconnectedAt?: Date;
}
