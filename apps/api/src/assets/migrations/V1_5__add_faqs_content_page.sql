-- =============================================================================
-- Migration: V1_5__add_faqs_content_page.sql
-- Description: Add FAQs content page (French and English)
-- =============================================================================

INSERT INTO `content-page` (
    `id`,
    `slug`,
    `title`,
    `subtitle`,
    `body`,
    `locale`,
    `createdAt`,
    `updatedAt`
) VALUES (
    'e89452bf-1c8f-4cf6-993d-d12ebfe26507',
    'faqs',
    'Questions fréquentes',
    'Trouvez des réponses aux questions fréquemment posées sur l\'application.',
    '<p>Ici, vous trouverez des réponses aux questions les plus courantes sur notre application. Si vous avez d\'autres questions, n\'hésitez pas à contacter notre équipe d\'assistance.</p>\n\n<details>\n  <summary>Comment modifier mon profil ?</summary>\n  <p>Rendez-vous sur votre onglet profil et appuyez sur le bouton « Modifier le profil ». Vous pouvez y mettre à jour vos photos, votre bio et vos centres d\'intérêt.</p>\n</details>\n\n<details>\n  <summary>Instanct est-il gratuit ?</summary>\n  <p>Oui ! Instanct est gratuit à télécharger et à utiliser. Nous proposons également des abonnements premium optionnels qui débloquent des fonctionnalités exclusives.</p>\n</details>\n\n<details>\n  <summary>Comment fonctionnent les suggestions et connexions ?</summary>\n  <p>Nous vous présentons des profils pertinents en fonction de vos préférences et de votre localisation. Échangez avec les personnes présentes dans le même espace ou lors d\'un événement pour créer des opportunités de networking authentiques.</p>\n</details>\n\n<details>\n  <summary>Puis-je modifier ma localisation ?</summary>\n  <p>Absolument. Vous pouvez mettre à jour vos préférences de localisation dans les paramètres de l\'application ou utiliser notre mode Voyage (fonctionnalité Premium) pour découvrir des opportunités dans d\'autres villes.</p>\n</details>\n\n<details>\n  <summary>Comment signaler un bug ou un problème ?</summary>\n  <p>Si vous rencontrez le moindre souci, utilisez le formulaire « Signaler un bug » dans les paramètres ou contactez directement notre équipe d\'assistance.</p>\n</details>\n\n<details>\n  <summary>Mes données sont-elles sécurisées ?</summary>\n  <p>Nous prenons la confidentialité très au sérieux. Toutes les données personnelles sont chiffrées et nous ne partageons jamais vos informations privées avec des tiers sans votre consentement.</p>\n</details>\n\n<h2>Vous avez encore besoin d\'aide ?</h2>\n<p>Vous ne trouvez pas ce que vous cherchez ? Notre équipe d\'assistance est à votre écoute :</p>\n<ul>\n  <li>Contactez notre support par e-mail à <mark>{{company.support}}</mark> ;</li>\n  <li>Pour toute question relative à vos données personnelles : <mark>{{company.privacyEmail}}</mark>.</li>\n</ul>',
    'fr',
    NOW(6),
    NOW(6)
), (
    'c4623789-5f21-4f96-be60-d26392a832c3',
    'faqs',
    'Frequently Asked Questions',
    'Find answers to frequently asked questions about the app.',
    '<p>Here you\'ll find answers to the most common questions about our app. If you have any other questions, feel free to contact our support team.</p>\n\n<details>\n  <summary>How do I edit my profile?</summary>\n  <p>Go to your profile tab and tap the \'Edit Profile\' button. You can update your photos, bio, and interests there.</p>\n</details>\n\n<details>\n  <summary>Is Instanct free to use?</summary>\n  <p>Yes! Instanct is free to download and use. We also offer optional premium subscriptions that unlock exclusive features like unlimited connections and seeing who viewed your profile.</p>\n</details>\n\n<details>\n  <summary>How does matching work?</summary>\n  <p>We show you profiles based on your preferences and location in real time. Connect with people in the same venue or event to build meaningful relationships!</p>\n</details>\n\n<details>\n  <summary>Can I change my location?</summary>\n  <p>Absolutely. You can update your location settings in the app preferences or use our Travel Mode (Premium feature) to match in other cities.</p>\n</details>\n\n<details>\n  <summary>How do I report a bug or issue?</summary>\n  <p>If you encounter any problems, please use the \'Report a Bug\' form in the settings menu or contact our support team directly.</p>\n</details>\n\n<details>\n  <summary>Is my data safe?</summary>\n  <p>We take user privacy very seriously. All personal data is encrypted and we never share your private information with third parties without consent.</p>\n</details>\n\n<h2>Still need help?</h2>\n<p>Can\'t find what you\'re looking for? Our support team is here to help:</p>\n<ul>\n  <li>Reach out anytime by email at <mark>{{company.support}}</mark>;</li>\n  <li>For questions regarding your personal data: <mark>{{company.privacyEmail}}</mark>.</li>\n</ul>',
    'en',
    NOW(6),
    NOW(6)
) ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `subtitle` = VALUES(`subtitle`),
    `body` = VALUES(`body`),
    `updatedAt` = NOW(6);
