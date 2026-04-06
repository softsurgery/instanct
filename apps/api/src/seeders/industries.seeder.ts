import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { RefTypeRepository } from 'src/shared/reference-types/repositories/ref-type.repository';
import { RefParamRepository } from 'src/shared/reference-types/repositories/ref-param.repository';
import { industries } from './data/industries.data';
import { getRandomHexColor } from 'src/shared/reference-types/utils/colors';

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
      where: { label: 'Industry' },
    });

    if (!industryRefType) {
      industryRefType = await this.refTypeRepository.save({
        id: 'industry',
        label: 'Industry',
        description: 'Parent reference type for all industries',
      });
      for (const industry of industries) {
        const subRefType = await this.refTypeRepository.save({
          id: industry.industry.toLowerCase().replace(/\s+/g, '-'),
          label: industry.industry,
          description: `${industry.industry} sector`,
          parent: industryRefType,
          extras: {
            color: getRandomHexColor(),
          },
        });

        await Promise.all(
          industry.params.map(async (paramLabel) => {
            const existingParam = await this.refParamRepository.findOne({
              where: { label: paramLabel },
            });
            if (!existingParam) {
              await this.refParamRepository.save({
                label: paramLabel,
                description: `${paramLabel} within ${industry.industry}`,
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
