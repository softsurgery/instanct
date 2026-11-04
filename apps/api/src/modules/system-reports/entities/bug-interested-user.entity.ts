import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from '@softsurgery/nsa-database';
import { BugEntity } from './bug.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Entity('bug_interested_users')
@Unique(['bugId', 'userId'])
export class BugInterestedUserEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BugEntity, (bug) => bug.interestedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bugId' })
  bug: BugEntity;

  @Column()
  @Index()
  bugId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  @Index()
  userId: string;
}
