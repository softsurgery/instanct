import {
  AfterLoad,
  ChildEntity,
  Column,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Gender } from '@softsurgery/nsa-um/enums/gender.enum';
import { StorageEntity } from '@softsurgery/nsa-storage/entities/storage.entity';
import { UserUploadEntity } from './user-upload.entity';

import { RefParamEntity } from '@softsurgery/nsa-reference-types/entities/ref-param.entity';
import { AbstractUserEntity } from '@softsurgery/nsa-um/entities/abstract-user.entity';
import { GeolocationEntity } from 'src/modules/geolocation/entities/geolocation.entity';
import { FollowEntity } from './follow.entity';
import { ExperienceEntity } from './experience.entity';
import { EducationEntity } from './education.entity';
import { IsOptional } from 'class-validator';
import { UserBookmarkEntity } from './user-bookmark.entity';
import { Expose } from 'class-transformer';
import { SessionEntity } from '@softsurgery/nsa-sessions/entities/session.entity';
import { SessionStatus } from '@softsurgery/nsa-sessions/enums/session-status.enum';

@ChildEntity()
export class UserEntity extends AbstractUserEntity {
  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: true })
  cin?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  website?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  linkedin?: string;

  @ManyToOne(() => StorageEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'pictureId' })
  picture?: StorageEntity;

  @Column({ nullable: true })
  pictureId?: number;

  @ManyToOne(() => StorageEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'coverId' })
  cover?: StorageEntity;

  @Column({ nullable: true })
  coverId?: number;

  @OneToMany(() => UserUploadEntity, (upload) => upload.user, {
    eager: true,
  })
  uploads: UserUploadEntity[];

  @OneToMany(() => ExperienceEntity, (experience) => experience.user, {})
  experiences: ExperienceEntity[];

  @OneToMany(() => EducationEntity, (education) => education.user, {})
  educations: EducationEntity[];

  @ManyToMany(() => RefParamEntity, {
    cascade: false,
  })
  @JoinTable({
    name: 'user-industries',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'industryId', referencedColumnName: 'id' },
  })
  industries: RefParamEntity[];

  @OneToOne(() => GeolocationEntity, (location) => location.user)
  geolocations: GeolocationEntity;

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers: FollowEntity[];

  @OneToMany(() => UserBookmarkEntity, (bookmark) => bookmark.user)
  bookmarks: UserBookmarkEntity[];

  @OneToMany(() => UserBookmarkEntity, (bookmark) => bookmark.bookmark)
  bookmarked: UserBookmarkEntity[];

  @Expose()
  activeSession?: SessionEntity;

  @AfterLoad()
  setActiveSession() {
    if (this.sessions) {
      this.activeSession = this.sessions.find(
        (session) => session.status === SessionStatus.ACTIVE,
      );
    }
  }
}
