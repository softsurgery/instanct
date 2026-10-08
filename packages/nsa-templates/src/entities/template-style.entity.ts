import { EntityHelper } from 'nsa-database';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('template-styles')
export class TemplateStyleEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  content?: string;

  @ManyToMany('TemplateEntity', (template: any) => template.styles)
  templates: TemplateEntity[];
}
