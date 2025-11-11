import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { RefTypeRepository } from 'src/shared/reference-types/repositories/ref-type.repository';
import { RefParamRepository } from 'src/shared/reference-types/repositories/ref-param.repository';
import { objectives } from './data/objectifs.data';
import { getRandomHexColor } from 'src/shared/reference-types/utils/colors';

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
      where: { label: 'Objectif' },
    });

    if (!objectifRefType) {
      objectifRefType = await this.refTypeRepository.save({
        label: 'Objectif',
        description: 'Parent reference type for all Objectives',
      });
      for (const objectif of objectives) {
        const subRefType = await this.refTypeRepository.save({
          label: objectif.category,
          description: `${objectif.category} sector`,
          parent: objectifRefType,
          extras: {
            color: getRandomHexColor(),
          },
        });

        await Promise.all(
          objectif.params.map(async (paramLabel) => {
            const existingParam = await this.refParamRepository.findOne({
              where: { label: paramLabel },
            });
            if (!existingParam) {
              await this.refParamRepository.save({
                label: paramLabel,
                description: `${paramLabel} within ${objectif.category}`,
                refType: subRefType,
                extras: {
                  color: getRandomHexColor(),
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
