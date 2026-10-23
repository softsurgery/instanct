import { EntityHelper } from '@softsurgery/nsa-database';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TemplateStyleEntity } from './template-style.entity';

@Entity('templates')
export class TemplateEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'longtext' })
  content?: string;

  @Column({ type: 'int', default: 0 })
  size: number;

  @ManyToMany('TemplateStyleEntity', (style: any) => style.templates, {
    cascade: true,
  })
  @JoinTable({
    name: 'template_template_styles',
    joinColumn: {
      name: 'templateId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'styleId',
      referencedColumnName: 'id',
    },
  })
  styles: TemplateStyleEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  calculateSize() {
    if (this.content !== undefined && this.content !== null) {
      this.size = Buffer.byteLength(this.content, 'utf8');
    }
  }
}
