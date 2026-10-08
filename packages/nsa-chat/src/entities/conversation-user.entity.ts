import { EntityHelper } from 'nsa-database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('conversation_users')
export class ConversationUserEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  conversationId: number;

  @ManyToOne('AbstractUserEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @ManyToOne('ConversationEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @Column({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  lastCheck: Date;
}
