import { EntityHelper } from 'nsa-database';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { AbstractUserEntity } from './abstract-user.entity';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('roles')
export class RoleEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  label: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(
    'RolePermissionEntity',
    (rolePermission: any) => rolePermission.role,
  )
  permissions: RolePermissionEntity[];

  @OneToMany('AbstractUserEntity', (user: any) => user.role)
  users: AbstractUserEntity[];
}
