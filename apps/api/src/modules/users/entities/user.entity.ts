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
import { Education, Experience, Skill } from '../walk-of-life.interface';
import { AbstractUserEntity } from '../../../shared/abstract-user-management/entities/abstract-user.entity';
import { GeolocationEntity } from 'src/modules/geolocation/entities/geolocation.entity';
import { FollowEntity } from './follow.entity';

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

  @ManyToOne(() => UploadEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'officialDocumentId' })
  officialDocument?: UploadEntity;

  @Column({ nullable: true })
  officialDocumentId?: number;

  @ManyToOne(() => UploadEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'driverLicenseDocumentId' })
  driverLicenseDocument?: UploadEntity;

  @Column({ nullable: true })
  driverLicenseDocumentId?: number;

  @Column({ nullable: true, type: 'json' })
  experiences: Experience[];

  @Column({ nullable: true, type: 'json' })
  educations: Education[];

  @Column({ nullable: true, type: 'json' })
  skills: Skill[];

  @ManyToMany(() => RefParamEntity, {
    eager: true,
    cascade: false,
  })
  @JoinTable({
    name: 'profile-objectives',
    joinColumn: { name: 'profileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'refParamId', referencedColumnName: 'id' },
  })
  objectives: RefParamEntity[];

  @ManyToMany(() => RefParamEntity, {
    eager: true,
    cascade: false,
  })
  @JoinTable({
    name: 'profile-industries',
    joinColumn: { name: 'profileId', referencedColumnName: 'id' },
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
