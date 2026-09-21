import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import { UserEntity } from './user.entity';

@Entity('user-bookmarks')
export class UserBookmarkEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.uploads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookmarkId' })
  bookmark: UserEntity;

  @Column()
  bookmarkId: string;
}
