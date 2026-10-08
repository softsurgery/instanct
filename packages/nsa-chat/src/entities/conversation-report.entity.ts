import { EntityHelper } from 'nsa-database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationReportReason } from '../enums/conversation-report-reason.enum';
import { ConversationEntity } from './conversation.entity';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';

@Entity('conversation_reports')
export class ConversationReportEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @ManyToOne('ConversationEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @Column()
  userId: string;

  @ManyToOne('AbstractUserEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: true })
  reportedUserId?: string;

  @ManyToOne('AbstractUserEntity', {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: AbstractUserEntity;

  @Column({ type: 'enum', enum: ConversationReportReason })
  reason: ConversationReportReason;

  @Column({ type: 'text' })
  description: string;
}
