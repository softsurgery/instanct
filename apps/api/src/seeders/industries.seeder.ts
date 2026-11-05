import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { RefTypeRepository } from '@softsurgery/nsa-reference-types/repositories/ref-type.repository';
import { RefParamRepository } from '@softsurgery/nsa-reference-types/repositories/ref-param.repository';
import { industries, industryRoot } from './data/industries.data';
import { getRandomHexColor } from '@softsurgery/nsa-reference-types/utils/colors';

@Injectable()
export class IndustriesSeedCommand {
  constructor(
    private readonly refTypeRepository: RefTypeRepository,
    private readonly refParamRepository: RefParamRepository,
  ) {}

  @Command({
    command: 'seed:industries',
    describe: 'seed industries',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of industries...');
    //=============================================================================================

    let industryRefType = await this.refTypeRepository.findOne({
      where: { label: industryRoot.label },
    });

    if (!industryRefType) {
      industryRefType = await this.refTypeRepository.save({
        id: industryRoot.id,
        label: industryRoot.label,
        description: industryRoot.description,
      });

      for (const industry of industries) {
        const subRefType = await this.refTypeRepository.save({
          id: industry.label.toLowerCase().replace(/\s+/g, '-'),
          label: industry.label,
          description: `${industry.label} sector`,
          parent: industryRefType,
          extras: {
            color: getRandomHexColor(),
            translations: industry.translations,
          },
        });

        if (industry.params && industry.params.length > 0)
          await Promise.all(
            industry.params.map(async (paramLabel) => {
              const existingParam = await this.refParamRepository.findOne({
                where: { label: paramLabel.label },
              });
              if (!existingParam) {
                await this.refParamRepository.save({
                  label: paramLabel.label,
                  description: `${paramLabel.label} within ${industry.label}`,
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
