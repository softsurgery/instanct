import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';

@Entity('user_devices')
export class UserDeviceEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => AbstractUserEntity, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: AbstractUserEntity;

  @Column()
  fingerprint: string;

  @Column({ nullable: true })
  deviceName?: string;

  @Column({ nullable: true })
  deviceModel?: string;

  @Column({ nullable: true })
  os?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ type: 'double', nullable: true })
  latitude?: number;

  @Column({ type: 'double', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSignInAt: Date;

  @Column({ default: 1 })
  signInCount: number;

  @Column({ default: true })
  isTrusted: boolean;
}
