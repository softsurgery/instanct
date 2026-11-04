import { BugStatus } from '../enums/bug-status.enum';
import { EntityHelper } from '@softsurgery/nsa-database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BugVariant } from '../enums/bug-variant.enum';
import { UserDeviceEntity } from '@softsurgery/nsa-auth/entities/user-device.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { BugInterestedUserEntity } from './bug-interested-user.entity';

@Entity('bugs')
export class BugEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: BugVariant, nullable: false })
  variant: BugVariant;

  @Column({ type: 'enum', enum: BugStatus, default: BugStatus.PENDING })
  status: BugStatus;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => UserDeviceEntity, {
    onDelete: 'SET NULL',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'deviceId' })
  device?: UserDeviceEntity | null;

  @Column({ nullable: true })
  deviceId?: string | null;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({})
  userId: string;

  @OneToMany(
    () => BugInterestedUserEntity,
    (interestedUser) => interestedUser.bug,
    {
      eager: true,
      cascade: true,
    },
  )
  interestedUsers?: BugInterestedUserEntity[];
}
