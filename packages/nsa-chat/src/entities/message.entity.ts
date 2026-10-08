import { EntityHelper } from 'nsa-database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { MessageVariant } from '../enums/message-variant.enum';
import { MessageUploadEntity } from './message-upload.entity';
import { MessageLinkEntity } from './message-link.entity';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';
import { StaticMessageEnum } from '../enums/static-message.registry';

@Entity('messages')
export class MessageEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @ManyToOne('AbstractUserEntity')
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne('ConversationEntity', (conversation: any) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @Column({ nullable: false })
  conversationId: number;

  @Column({ type: 'enum', enum: MessageVariant, default: MessageVariant.TEXT })
  variant: MessageVariant;

  @Column({
    type: 'enum',
    enum: StaticMessageEnum,
    default: null,
  })
  static?: StaticMessageEnum;

  @OneToMany('MessageUploadEntity', (upload: any) => upload.message, {
    nullable: true,
  })
  uploads: MessageUploadEntity[];

  @OneToMany('MessageLinkEntity', (link: any) => link.message, {
    nullable: true,
  })
  links: MessageLinkEntity[];
}
