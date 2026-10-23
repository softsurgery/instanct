import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ContentPageService } from '@softsurgery/nsa-content/services/content-page.service';
import { ContentPageSlug } from '@/app/enums/content-page-slug.enum';
import { termsHtml, termsHtmlEn } from './data/content/terms.data';
import { privacyHtml, privacyHtmlEn } from './data/content/privacy.data';
import { aboutHtml, aboutHtmlEn } from './data/content/about.data';
import { faqsHtml, faqsHtmlEn } from './data/content/faqs.data';
import { supportHtmlFr, supportHtmlEn } from './data/content/support.data';

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
        slug: ContentPageSlug.ABOUT,
        title: "À propos d'Instanct",
        subtitle:
          "Découvrez la mission d'Instanct, nos fonctionnalités et nos engagements.",
        body: aboutHtml,
        locale: 'fr',
      },
      {
        slug: ContentPageSlug.FAQS,
        title: 'Questions fréquentes',
        subtitle:
          "Trouvez des réponses aux questions fréquemment posées sur l'application.",
        body: faqsHtml,
        locale: 'fr',
      },
      {
        slug: ContentPageSlug.SUPPORT,
        title: "Support & Centre d'aide",
        subtitle:
          "Besoin d'aide avec Instanct ? Notre équipe est à votre écoute pour vous accompagner dans votre expérience.",
        body: supportHtmlFr,
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
      {
        slug: ContentPageSlug.ABOUT,
        title: 'About Instanct',
        subtitle:
          'Discover the Instanct mission, our features, and our commitments.',
        body: aboutHtmlEn,
        locale: 'en',
      },
      {
        slug: ContentPageSlug.FAQS,
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to frequently asked questions about the app.',
        body: faqsHtmlEn,
        locale: 'en',
      },
      {
        slug: ContentPageSlug.SUPPORT,
        title: 'Support & Help Center',
        subtitle:
          'Need help with Instanct? Our support team is here to assist you.',
        body: supportHtmlEn,
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
