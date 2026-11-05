import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { RefTypeRepository } from '@softsurgery/nsa-reference-types/repositories/ref-type.repository';
import { RefParamRepository } from '@softsurgery/nsa-reference-types/repositories/ref-param.repository';
import { objectiveRoot, objectives } from './data/objectifs.data';
import { getRandomHexColor } from '@softsurgery/nsa-reference-types/utils/colors';

@Injectable()
export class ObjectivesSeedCommand {
  constructor(
    private readonly refTypeRepository: RefTypeRepository,
    private readonly refParamRepository: RefParamRepository,
  ) {}

  @Command({
    command: 'seed:objectives',
    describe: 'seed objectives',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of objectives...');
    //=============================================================================================

    let objectifRefType = await this.refTypeRepository.findOne({
      where: { label: objectiveRoot.label },
    });
    if (!objectifRefType) {
      objectifRefType = await this.refTypeRepository.findOne({
        where: { id: objectiveRoot.id },
      });
    }
    if (!objectifRefType) {
      objectifRefType = await this.refTypeRepository.save({
        id: objectiveRoot.id,
        label: objectiveRoot.label,
        description: objectiveRoot.description,
        extras: {
          color: getRandomHexColor(),
          translations: objectiveRoot.translations,
        },
      });
    } else {
      const extras = {
        ...(objectifRefType.extras ?? {}),
      } as Record<string, unknown>;
      if (objectiveRoot.translations) {
        extras.translations = objectiveRoot.translations;
      }
      if (!extras.color) {
        extras.color = getRandomHexColor();
      }
      objectifRefType.extras = extras;
      if (objectiveRoot.description) {
        objectifRefType.description = objectiveRoot.description;
      }
      objectifRefType = await this.refTypeRepository.save(objectifRefType);
    }

    for (const objectif of objectives) {
      const objectifId = objectif.label.toLowerCase().replace(/\s+/g, '-');
      let subRefType = await this.refTypeRepository.findOne({
        where: { label: objectif.label, parentId: objectifRefType.id },
      });
      if (!subRefType) {
        subRefType = await this.refTypeRepository.findOne({
          where: { id: objectifId },
        });
      }
      if (!subRefType) {
        subRefType = await this.refTypeRepository.save({
          id: objectifId,
          label: objectif.label,
          description: `${objectif.label} sector`,
          parent: objectifRefType,
          extras: {
            color: getRandomHexColor(),
            translations: objectif.translations,
          },
        });
      } else {
        const extras = {
          ...(subRefType.extras ?? {}),
        } as Record<string, unknown>;
        if (objectif.translations) {
          extras.translations = objectif.translations;
        }
        if (!extras.color) {
          extras.color = getRandomHexColor();
        }
        subRefType.extras = extras;
        subRefType.description =
          subRefType.description ?? `${objectif.label} sector`;
        subRefType.parent = objectifRefType;
        subRefType = await this.refTypeRepository.save(subRefType);
      }

      if (objectif.params && objectif.params.length > 0) {
        await Promise.all(
          objectif.params.map(async (paramLabel) => {
            const existingParam = await this.refParamRepository.findOne({
              where: { label: paramLabel.label },
            });
            if (!existingParam) {
              await this.refParamRepository.save({
                label: paramLabel.label,
                description: `${paramLabel.label} within ${objectif.label}`,
                refType: subRefType,
                extras: {
                  color: getRandomHexColor(),
                  translations: paramLabel.translations,
                },
              });
              return;
            }
            const extras = {
              ...(existingParam.extras ?? {}),
            } as Record<string, unknown>;
            if (paramLabel.translations) {
              extras.translations = paramLabel.translations;
            }
            if (!extras.color) {
              extras.color = getRandomHexColor();
            }
            existingParam.extras = extras;
            existingParam.description = `${paramLabel.label} within ${objectif.label}`;
            existingParam.refType = subRefType;
            await this.refParamRepository.save(existingParam);
          }),
        );
      }
    }

    //=============================================================================================
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
