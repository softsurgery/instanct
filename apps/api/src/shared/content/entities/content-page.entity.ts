import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('content-page')
export class ContentPageEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  subtitle?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 8, default: 'fr' })
  locale: string;

  @Column({ type: 'boolean', default: true })
  published: boolean;
}
