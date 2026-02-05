import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ConfigurationParamEntity } from './configuration-param.entity';
import { AbstractUserEntity } from 'src/shared/abstract-user-management/entities/abstract-user.entity';

@Entity('configuration-namespace')
export class ConfigurationNamespaceEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @OneToMany(() => ConfigurationParamEntity, (param) => param.namespace, {
    eager: true,
  })
  params: ConfigurationParamEntity[];

  @ManyToOne(() => AbstractUserEntity, (user) => user.logs, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: true })
  userId?: string;
}
