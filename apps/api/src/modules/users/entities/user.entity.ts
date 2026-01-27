import {
  ChildEntity,
  Column,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Gender } from '../../../shared/abstract-user-management/enums/gender.enum';
import { UploadEntity } from 'src/shared/uploads/entities/upload.entity';
import { UserUploadEntity } from './user-upload.entity';

import { RefParamEntity } from 'src/shared/reference-types/entities/ref-param.entity';
import { AbstractUserEntity } from '../../../shared/abstract-user-management/entities/abstract-user.entity';
import { GeolocationEntity } from 'src/modules/geolocation/entities/geolocation.entity';
import { FollowEntity } from './follow.entity';
import { ExperienceEntity } from './experience.entity';
import { EducationEntity } from './education.entity';

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

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ nullable: true })
  regionId?: number;

  @ManyToOne(() => UploadEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'pictureId' })
  picture?: UploadEntity;

  @Column({ nullable: true })
  pictureId?: number;

  @OneToMany(() => UserUploadEntity, (upload) => upload.user, {
    eager: true,
  })
  uploads: UserUploadEntity[];

  @OneToMany(() => ExperienceEntity, (experience) => experience.user, {})
  experiences: ExperienceEntity[];

  @OneToMany(() => EducationEntity, (education) => education.user, {})
  educations: EducationEntity[];

  @ManyToMany(() => RefParamEntity, {
    eager: true,
    cascade: false,
  })
  @JoinTable({
    name: 'user-objectives',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'refParamId', referencedColumnName: 'id' },
  })
  objectives: RefParamEntity[];

  @ManyToMany(() => RefParamEntity, {
    eager: true,
    cascade: false,
  })
  @JoinTable({
    name: 'user-industries',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'refParamId', referencedColumnName: 'id' },
  })
  industries: RefParamEntity[];

  @OneToOne(() => GeolocationEntity, (location) => location.user)
  geolocations: GeolocationEntity;

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers: FollowEntity[];
}
