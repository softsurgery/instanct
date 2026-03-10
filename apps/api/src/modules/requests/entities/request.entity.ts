import { UserEntity } from 'src/modules/users/entities/user.entity';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('requests')
export class RequestEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  // Sender
  @ManyToOne(() => UserEntity, (user) => user.sentRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  @Column()
  senderId: string;

  // Multiple Receivers
  @ManyToMany(() => UserEntity, (user) => user.receivedRequests)
  @JoinTable({
    name: 'request_receivers',
    joinColumn: {
      name: 'requestId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'receiverId',
      referencedColumnName: 'id',
    },
  })
  receivers: UserEntity[];

  // Request details
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  place?: string;

  @Column({ type: 'timestamp', nullable: true })
  time?: Date;
}
