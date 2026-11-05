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
      objectifRefType = await this.refTypeRepository.save({
        id: objectiveRoot.id,
        label: objectiveRoot.label,
        description: objectiveRoot.description,
      });

      for (const objectif of objectives) {
        const subRefType = await this.refTypeRepository.save({
          id: objectif.label.toLowerCase().replace(/\s+/g, '-'),
          label: objectif.label,
          description: `${objectif.label} sector`,
          parent: objectifRefType,
          extras: {
            color: getRandomHexColor(),
            translations: objectif.translations,
          },
        });

        if (objectif.params && objectif.params.length > 0)
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
              }
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
