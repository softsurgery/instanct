import { EntityHelper } from '@softsurgery/nsa-database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FeedbackCategory } from '../enums/feedback-category.enum';
import { UserDeviceEntity } from '@softsurgery/nsa-auth/entities/user-device.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Entity('feedback')
export class FeedbackEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: FeedbackCategory, nullable: false })
  category: FeedbackCategory;

  @Column({ nullable: true })
  rating?: number;

  @ManyToOne(() => UserDeviceEntity, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'deviceId' })
  device?: UserDeviceEntity;

  @Column({ nullable: true })
  deviceId?: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({})
  userId: string;
}
