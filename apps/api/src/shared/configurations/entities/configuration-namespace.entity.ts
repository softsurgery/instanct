import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ConfigurationParamEntity } from './configuration-param.entity';

@Entity('configuration-namespace')
export class ConfigurationNamespaceEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @OneToMany(() => ConfigurationParamEntity, (param) => param.namespace)
  params: ConfigurationParamEntity[];
}
