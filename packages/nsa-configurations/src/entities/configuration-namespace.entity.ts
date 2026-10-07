import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfigurationParamEntity } from './configuration-param.entity';
import type { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';

@Entity('configuration-namespace')
export class ConfigurationNamespaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @OneToMany('ConfigurationParamEntity', (param: any) => param.namespace, {
    eager: true,
  })
  params: ConfigurationParamEntity[];

  @ManyToOne('AbstractUserEntity', (user: any) => user.logs, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: AbstractUserEntity;

  @Column({ nullable: true })
  userId?: string;
}
