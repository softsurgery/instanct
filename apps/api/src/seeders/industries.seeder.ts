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
      industryRefType = await this.refTypeRepository.findOne({
        where: { id: industryRoot.id },
      });
    }
    if (!industryRefType) {
      industryRefType = await this.refTypeRepository.save({
        id: industryRoot.id,
        label: industryRoot.label,
        description: industryRoot.description,
        extras: {
          color: getRandomHexColor(),
          translations: industryRoot.translations,
        },
      });
    } else {
      const extras = {
        ...(industryRefType.extras ?? {}),
      } as Record<string, unknown>;
      if (industryRoot.translations) {
        extras.translations = industryRoot.translations;
      }
      if (!extras.color) {
        extras.color = getRandomHexColor();
      }
      industryRefType.extras = extras;
      if (industryRoot.description) {
        industryRefType.description = industryRoot.description;
      }
      industryRefType = await this.refTypeRepository.save(industryRefType);
    }

    for (const industry of industries) {
      const industryId = industry.label.toLowerCase().replace(/\s+/g, '-');
      let subRefType = await this.refTypeRepository.findOne({
        where: { label: industry.label, parentId: industryRefType.id },
      });
      if (!subRefType) {
        subRefType = await this.refTypeRepository.findOne({
          where: { id: industryId },
        });
      }
      if (!subRefType) {
        subRefType = await this.refTypeRepository.save({
          id: industryId,
          label: industry.label,
          description: `${industry.label} sector`,
          parent: industryRefType,
          extras: {
            color: getRandomHexColor(),
            translations: industry.translations,
          },
        });
      } else {
        const extras = {
          ...(subRefType.extras ?? {}),
        } as Record<string, unknown>;
        if (industry.translations) {
          extras.translations = industry.translations;
        }
        if (!extras.color) {
          extras.color = getRandomHexColor();
        }
        subRefType.extras = extras;
        subRefType.description =
          subRefType.description ?? `${industry.label} sector`;
        subRefType.parent = industryRefType;
        subRefType = await this.refTypeRepository.save(subRefType);
      }

      if (industry.params && industry.params.length > 0) {
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
            existingParam.description = `${paramLabel.label} within ${industry.label}`;
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
