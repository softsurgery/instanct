-- =============================================================================
-- Migration: V1_4__add_about_content_page.sql
-- Description: Add about content page (French and English)
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
    'f2a49280-9ec8-498c-859a-14db3a726ea8',
    'about',
    'À propos d\'Instanct',
    'Découvrez la mission d\'Instanct, nos fonctionnalités et nos engagements.',
    '<p>Instanct est une plateforme de networking professionnel en temps réel conçue pour permettre aux personnes présentes dans un même lieu ou événement de se connecter et d\'échanger en toute confiance.</p>\n\n<h2>1. Notre mission</h2>\n<p>Nous développons des outils modernes et intuitifs pour vous aider à nouer des relations professionnelles authentiques :</p>\n<ul><li>\n<p>Créer des connexions pertinentes basées sur des intérêts et des objectifs communs ;</p></li><li>\n<p>Rendre la découverte locale de professionnels simple, humaine et instantanée ;</p></li><li>\n<p>Placer la sécurité, la confiance et le respect de la vie privée au centre de chaque interaction.</p></li></ul>\n\n<h2>2. Ce que nous proposons</h2>\n<p>Instanct réunit le meilleur de la découverte géolocalisée et du networking qualifié :</p>\n<ul><li>\n<p>Des recommandations et suggestions adaptées à vos objectifs professionnels ;</p></li><li>\n<p>Un contrôle total sur votre visibilité, votre présence et vos informations partagées ;</p></li><li>\n<p>Une expérience fluide et élégante disponible sur l\'ensemble de vos appareils.</p></li></ul>\n\n<h2>3. Sécurité et confiance</h2>\n<p>La confiance est le pilier de notre communauté :</p>\n<ul><li>\n<p>Des règles d\'utilisation transparentes et des politiques de confidentialité rigoureuses ;</p></li><li>\n<p>Des outils de modération proactifs pour maintenir des échanges respectueux et professionnels ;</p></li><li>\n<p>Une équipe à votre écoute pour traiter rapidement vos signalements et questions.</p></li></ul>\n\n<h2>4. Contact & Support</h2>\n<p>Nous sommes toujours ravis d\'échanger avec vous et d\'accueillir vos suggestions :</p>\n<ul><li>\n<p>Contactez notre support directement depuis l\'application ou par e-mail à <mark>{{company.support}}</mark> ;</p></li><li>\n<p>Pour toute question relative à vos données personnelles : <mark>{{company.privacyEmail}}</mark> ;</p></li><li>\n<p>Édité par <mark>{{company.legalName}}</mark>, <mark>{{company.address}}</mark>.</p></li></ul>',
    'fr',
    NOW(6),
    NOW(6)
), (
    'b317c805-4ecb-43fb-bf07-8ec99607b22a',
    'about',
    'About Instanct',
    'Discover the Instanct mission, our features, and our commitments.',
    '<p>Instanct is a real-time professional networking platform designed to help people present in the same place or event discover relevant peers, start sessions, and build meaningful connections with confidence.</p>\n\n<h2>1. Our Mission</h2>\n<p>We build tools that help professionals connect simply and authentically:</p>\n<ul><li>\n<p>Create meaningful connections based on shared professional interests and goals;</p></li><li>\n<p>Make local discovery simple, human-first, and immediate;</p></li><li>\n<p>Prioritize safety, trust, and privacy at every step.</p></li></ul>\n\n<h2>2. What We Offer</h2>\n<p>Instanct combines curated proximity discovery with thoughtful networking features:</p>\n<ul><li>\n<p>Tailored recommendations based on your networking goals and expertise;</p></li><li>\n<p>Full control over your visibility, presence, and shared information;</p></li><li>\n<p>A modern, intuitive experience built for mobile and web.</p></li></ul>\n\n<h2>3. Safety & Trust</h2>\n<p>We design with trust and privacy at the core:</p>\n<ul><li>\n<p>Clear, transparent policies and continuous platform improvements;</p></li><li>\n<p>Proactive moderation tools to ensure respectful, professional interactions;</p></li><li>\n<p>Dedicated support to quickly address reports and user inquiries.</p></li></ul>\n\n<h2>4. Contact & Support</h2>\n<p>We love hearing from our community and welcome your feedback:</p>\n<ul><li>\n<p>Reach out anytime through in-app support or by email at <mark>{{company.support}}</mark>;</p></li><li>\n<p>For inquiries regarding your personal data: <mark>{{company.privacyEmail}}</mark>;</p></li><li>\n<p>Published by <mark>{{company.legalName}}</mark>, <mark>{{company.address}}</mark>.</p></li></ul>',
    'en',
    NOW(6),
    NOW(6)
) ON DUPLICATE KEY UPDATE
    `title` = VALUES(`title`),
    `subtitle` = VALUES(`subtitle`),
    `body` = VALUES(`body`),
    `updatedAt` = NOW(6);
