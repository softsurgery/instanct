import { EntityHelper } from 'src/shared/database/interfaces/database.entity.interface';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('content-page')
@Unique(['slug', 'locale'])
export class ContentPageEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  subtitle?: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 8, default: 'fr' })
  locale: string;
}
