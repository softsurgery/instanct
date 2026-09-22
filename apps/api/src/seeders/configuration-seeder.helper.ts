import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { ConfigurationParamEntity } from '@/shared/configurations/entities/configuration-param.entity';
import { DeepPartial } from 'typeorm';

export async function seedConfigurationParams(
  configurationNamespaceRepository: ConfigurationNamespaceRepository,
  configurationParamRepository: ConfigurationParamRepository,
  namespace: string,
  params: DeepPartial<ConfigurationParamEntity>[],
) {
  let namespaceEntity = await configurationNamespaceRepository.findOne({
    where: { name: namespace },
  });

  if (!namespaceEntity) {
    namespaceEntity = await configurationNamespaceRepository.save({
      name: namespace,
      description: `${namespace} configuration`,
    });
  }

  const existingParams = await configurationParamRepository.findAll({
    where: { namespaceId: namespaceEntity.id },
  });
  const existingByName = new Map(
    existingParams.map((param) => [param.name, param]),
  );

  for (const param of params) {
    const existing = existingByName.get(param.name ?? '');
    if (existing) {
      const shouldRestoreValue =
        existing.value == null || existing.value === '';
      await configurationParamRepository.update(existing.id, {
        description: param.description,
        variant: param.variant,
        options: param.options,
        schema: param.schema,
        ...(shouldRestoreValue ? { value: param.value } : {}),
      });
      continue;
    }

    const created = await configurationParamRepository.save({
      ...param,
      namespaceId: namespaceEntity.id,
    });
    existingByName.set(param.name ?? '', created);
  }
}
