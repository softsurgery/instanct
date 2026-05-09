import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';

@Entity('conversations')
export class ConversationEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => AbstractUserEntity, {
    eager: true,
  })
  @JoinTable()
  participants: AbstractUserEntity[];

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @Column({
    type: 'text',
    nullable: true,
  })
  participantsIdentifiers: string;

  @BeforeInsert()
  @BeforeUpdate()
  syncParticipantsIdentifiers() {
    this.participantsIdentifiers =
      this.participants
        ?.map((p) => identifyUser(p))
        .filter(Boolean)
        .join(',') || '';
  }
}
