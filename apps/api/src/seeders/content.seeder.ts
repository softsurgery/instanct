import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ContentPageService } from '@/shared/content/services/content-page.service';
import { ContentPageSlug } from '@/app/enums/content-page-slug.enum';
import { termsHtml, termsHtmlEn } from './data/content/terms.data';
import { privacyHtml, privacyHtmlEn } from './data/content/privacy.data';

@Injectable()
export class ContentSeedCommand {
  constructor(private readonly contentPageService: ContentPageService) {}

  @Command({
    command: 'seed:content',
    describe: 'seed legal content pages',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of content pages...');

    const pages = [
      {
        slug: ContentPageSlug.TERMS,
        title: "Conditions générales d'utilisation",
        subtitle:
          "Les règles d'utilisation d'Instanct. Les passages surlignés ne sont pas encore appliqués ou restent à confirmer.",
        body: termsHtml,
        locale: 'fr',
      },
      {
        slug: ContentPageSlug.PRIVACY,
        title: 'Politique de confidentialité',
        subtitle:
          'Comment Instanct traite vos données. Les passages surlignés ne sont pas encore appliqués ou restent à confirmer.',
        body: privacyHtml,
        locale: 'fr',
      },
      {
        slug: ContentPageSlug.TERMS,
        title: 'Terms of Service',
        subtitle: 'Rules for using Instanct.',
        body: termsHtmlEn,
        locale: 'en',
      },
      {
        slug: ContentPageSlug.PRIVACY,
        title: 'Privacy Policy',
        subtitle: 'How Instanct processes your data.',
        body: privacyHtmlEn,
        locale: 'en',
      },
    ];

    for (const page of pages) {
      const existing = await this.contentPageService.findOneBySlug(
        page.slug,
        page.locale,
      );
      if (existing) {
        await this.contentPageService.update(existing.id, {
          title: page.title,
          subtitle: page.subtitle,
          body: page.body,
          locale: page.locale,
        });
        console.log(`🔁 Updated content page: ${page.slug} (${page.locale})`);
        continue;
      }
      await this.contentPageService.save(page);
      console.log(`✅ Seeded content page: ${page.slug} (${page.locale})`);
    }

    const end = new Date();
    console.log(
      `✅ Content seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
