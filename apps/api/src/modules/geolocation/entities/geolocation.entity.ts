import { UserEntity } from 'src/modules/user-management/entities/user.entity';
import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('geolocations')
@Index(['latitude', 'longitude'])
@Unique(['userId'])
export class GeolocationEntity extends EntityHelper {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'double', nullable: true })
  latitude?: number;

  @Column({ type: 'double', nullable: true })
  longitude?: number;

  @ManyToOne(() => UserEntity, (user) => user.geolocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;
}
