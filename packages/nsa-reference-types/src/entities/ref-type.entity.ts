import { EntityHelper } from 'nsa-database';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { RefParamEntity } from './ref-param.entity';

@Entity('ref-type')
export class RefTypeEntity extends EntityHelper {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  label: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  description: string;

  @OneToMany('RefParamEntity', (user: any) => user.refType)
  params: RefParamEntity[];

  @ManyToOne('RefTypeEntity', (reftype: any) => reftype.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: RefTypeEntity;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany('RefTypeEntity', (user: any) => user.parent)
  children: RefTypeEntity[];

  @Column({ type: 'json', nullable: true })
  extras: object;
}
