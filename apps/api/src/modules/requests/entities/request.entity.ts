import { UserEntity } from 'src/modules/users/entities/user.entity';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import { SessionEntity } from 'src/shared/sessions/entities/session.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestStatus } from '../enums/request-status.enum';

@Entity('requests')
export class RequestEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // Sender
  @ManyToOne(() => SessionEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: SessionEntity;

  @Column()
  sessionId: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.Sent,
  })
  status: RequestStatus;

  // Multiple Receivers
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'request_receivers_users',
    joinColumn: {
      name: 'requestId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'receiverUserId',
      referencedColumnName: 'id',
    },
  })
  receivers: UserEntity[];

  // Request details
  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'double', nullable: true })
  latitude?: number;

  @Column({ type: 'double', nullable: true })
  longitude?: number;

  @Column({ type: 'timestamp', nullable: true })
  time?: Date;
}
