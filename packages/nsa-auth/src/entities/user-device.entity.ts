import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '@softsurgery/nsa-database';
import type { AbstractUserEntity } from '@softsurgery/nsa-um/entities/abstract-user.entity';
import type { UserConnectionHistoryEntity } from './user-connection-history.entity';

@Entity('user_devices')
export class UserDeviceEntity extends EntityHelper {
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

  @Column()
  macAddress: string;

  @Column({ nullable: true })
  deviceName?: string;

  @Column({ nullable: true })
  deviceModel?: string;

  @Column({ nullable: true })
  os?: string;

  @Column({ default: true })
  isTrusted: boolean;

  @OneToMany('UserConnectionHistoryEntity', (conn: any) => conn.device)
  connections?: UserConnectionHistoryEntity[];
}
