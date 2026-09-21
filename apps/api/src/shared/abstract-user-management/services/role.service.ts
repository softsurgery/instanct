import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { RoleNotFoundException } from '../errors/role/role.notfound.error';
import { CreateRoleDto } from '../dtos/role/create-role.dto';
import { RoleAlreadyExistsException } from '../errors/role/role.alreadyexists.error';
import { RolePermissionService } from './role-permission.service';
import { UpdateRoleDto } from '../dtos/role/update-role.dto';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { CreateRolePermissionDto } from '../dtos/role-permission/create-role-permission.dto';
import { RoleEntity } from '../entities/role.entity';
import { AbstractCrudService } from '@/shared/database/services/abstract-crud.service';

@Injectable()
export class RoleService extends AbstractCrudService<RoleEntity> {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {
    super(roleRepository);
  }

  @Transactional()
  async saveWithPermissions(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { permissions, ...rest } = createRoleDto;
    const existingRole = await this.roleRepository.findOne({
      where: { label: createRoleDto.label },
    });
    if (existingRole) {
      throw new RoleAlreadyExistsException();
    }
    const role = await this.roleRepository.save(rest);
    await this.rolePermissionService.saveMany(
      permissions.map((p) => ({
        roleId: role.id,
        permissionId: p.permissionId,
      })),
    );
    return role;
  }

  @Transactional()
  async saveManyWithPermissions(
    createRoleDtos: CreateRoleDto[],
  ): Promise<RoleEntity[]> {
    return Promise.all(
      createRoleDtos.map((dto) => this.saveWithPermissions(dto)),
    );
  }

  @Transactional()
  async updateWithPermissions(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity | null> {
    const { permissions, ...rest } = updateRoleDto;
    const existingRole = await this.roleRepository.findOneById(id);
    if (!existingRole) throw new RoleNotFoundException();

    await this.roleRepository.update(id, rest);

    const updatedRole = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!updatedRole) throw new RoleNotFoundException();

    const existingPermissions = updatedRole?.permissions?.map(
      (p: RolePermissionEntity) => {
        return {
          id: p.id,
          permissionId: p.permissionId,
          roleId: p.roleId,
        };
      },
    );

    await this.roleRepository.updateAssociations<
      Pick<RolePermissionEntity, 'id' | 'permissionId' | 'roleId'>
    >({
      existingItems: existingPermissions || [],
      updatedItems: permissions?.map((permission) => ({
        id: permission.id,
        permissionId: permission.permissionId,
        roleId: updatedRole?.id,
      })),
      keys: ['permissionId', 'roleId'],
      onDelete: async (id: string) => {
        return this.rolePermissionService.softDelete(id);
      },
      onCreate: async (p: CreateRolePermissionDto) => {
        return this.rolePermissionService.save({
          roleId: updatedRole?.id,
          permissionId: p.permissionId,
        });
      },
    });

    return updatedRole;
  }

  @Transactional()
  async duplicateWithPermissions(id: string): Promise<RoleEntity | null> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new RoleNotFoundException();
    }
    return this.saveWithPermissions({
      label: `${role.label} copy`,
      description: role.description,
      permissions: role.permissions.map((p) => ({
        permissionId: p.permissionId,
      })),
    });
  }
}
