-- Migration: V1_16__add_french_translations_for_objectives_and_industries.sql
-- Stores English and French labels for every objective and industry entry.
-- `label` stays the canonical value already used by the apps.
-- Translations are written to extras.translations and match the seeders.

UPDATE `ref-type` rt
INNER JOIN (
    SELECT 'Objectif' AS label, 'Objective' AS en, 'Objectif' AS fr
    UNION ALL
    SELECT 'Professional Growth', 'Professional Growth', 'Croissance professionnelle'
    UNION ALL
    SELECT 'Networking & Collaboration', 'Networking & Collaboration', 'Réseautage et collaboration'
    UNION ALL
    SELECT 'Casual & Social', 'Casual & Social', 'Informel et social'
    UNION ALL
    SELECT 'Personal Development', 'Personal Development', 'Développement personnel'
    UNION ALL
    SELECT 'Explore Mode', 'Explore Mode', 'Mode exploration'
    UNION ALL
    SELECT 'Industry', 'Industry', 'Industrie'
    UNION ALL
    SELECT 'Technologies & Informatique', 'Technology & IT', 'Technologies & Informatique'
    UNION ALL
    SELECT 'Ingénierie & Industrie', 'Engineering & Industry', 'Ingénierie & Industrie'
    UNION ALL
    SELECT 'Construction & BTP', 'Construction & Public Works', 'Construction & BTP'
    UNION ALL
    SELECT 'Mobilité, Transport & Logistique', 'Mobility, Transport & Logistics', 'Mobilité, Transport & Logistique'
    UNION ALL
    SELECT 'Infrastructures & Villes', 'Infrastructure & Cities', 'Infrastructures & Villes'
    UNION ALL
    SELECT 'Santé & Sciences de la Vie', 'Health & Life Sciences', 'Santé & Sciences de la Vie'
    UNION ALL
    SELECT 'Finance & Services', 'Finance & Services', 'Finance & Services'
    UNION ALL
    SELECT 'Commerce, Retail & Luxe', 'Commerce, Retail & Luxury', 'Commerce, Retail & Luxe'
    UNION ALL
    SELECT 'Éducation & Recherche', 'Education & Research', 'Éducation & Recherche'
    UNION ALL
    SELECT 'Agriculture & Environnement', 'Agriculture & Environment', 'Agriculture & Environnement'
    UNION ALL
    SELECT 'Culture, Médias & Création', 'Culture, Media & Creative', 'Culture, Médias & Création'
    UNION ALL
    SELECT 'Public, ONG & Organisations Internationales', 'Public Sector, NGOs & International Organizations', 'Public, ONG & Organisations Internationales'
) t ON t.label = rt.label
SET
    rt.extras = JSON_SET(
        COALESCE(rt.extras, JSON_OBJECT()),
        '$.translations',
        JSON_OBJECT('en', t.en, 'fr', t.fr)
    ),
    rt.updatedAt = NOW(6)
WHERE
    rt.id IN ('objectif', 'industry')
    OR rt.parentId IN ('objectif', 'industry');

UPDATE `ref-param` rp
INNER JOIN `ref-type` rt ON rt.id = rp.refTypeId
INNER JOIN (
    SELECT 'Find a Co-Founder' AS label, 'Find a Co-Founder' AS en, 'Trouver un cofondateur' AS fr
    UNION ALL
    SELECT 'Build My Team', 'Build My Team', 'Constituer mon équipe'
    UNION ALL
    SELECT 'Join a Startup', 'Join a Startup', 'Rejoindre une startup'
    UNION ALL
    SELECT 'Find an Investor / Raise Funding', 'Find an Investor / Raise Funding', 'Trouver un investisseur / Lever des fonds'
    UNION ALL
    SELECT 'Looking to Invest', 'Looking to Invest', 'Chercher à investir'
    UNION ALL
    SELECT 'Find Clients or Partners', 'Find Clients or Partners', 'Trouver des clients ou des partenaires'
    UNION ALL
    SELECT 'Get Mentorship / Advice', 'Get Mentorship / Advice', 'Recevoir du mentorat / des conseils'
    UNION ALL
    SELECT 'Offer Mentorship / Consulting', 'Offer Mentorship / Consulting', 'Proposer du mentorat / du conseil'
    UNION ALL
    SELECT 'Networking & Connections', 'Networking & Connections', 'Réseautage et mises en relation'
    UNION ALL
    SELECT 'Collaboration on Projects', 'Collaboration on Projects', 'Collaboration sur des projets'
    UNION ALL
    SELECT 'Brainstorming Sessions', 'Brainstorming Sessions', 'Sessions de brainstorming'
    UNION ALL
    SELECT 'Knowledge Exchange', 'Knowledge Exchange', 'Échange de connaissances'
    UNION ALL
    SELECT 'Community Building', 'Community Building', 'Animation de communauté'
    UNION ALL
    SELECT 'Grab a Coffee', 'Grab a Coffee', 'Prendre un café'
    UNION ALL
    SELECT 'Expand My Circle', 'Expand My Circle', 'Élargir mon cercle'
    UNION ALL
    SELECT 'Attend Local Events Together', 'Attend Local Events Together', 'Participer ensemble à des événements locaux'
    UNION ALL
    SELECT 'Work Buddy / Cowork Together', 'Work Buddy / Cowork Together', 'Collègue de travail / Coworking ensemble'
    UNION ALL
    SELECT 'Inspiration & Motivation', 'Inspiration & Motivation', 'Inspiration et motivation'
    UNION ALL
    SELECT 'Learn a New Skill', 'Learn a New Skill', 'Apprendre une nouvelle compétence'
    UNION ALL
    SELECT 'Public Speaking / Pitch Practice', 'Public Speaking / Pitch Practice', 'Prise de parole / Entraînement au pitch'
    UNION ALL
    SELECT 'Accountability Partner', 'Accountability Partner', 'Partenaire de responsabilisation'
    UNION ALL
    SELECT 'Build My Personal Brand', 'Build My Personal Brand', 'Construire ma marque personnelle'
    UNION ALL
    SELECT 'Startup Dating', 'Startup Dating', 'Rencontres startup'
    UNION ALL
    SELECT 'Investor Connect', 'Investor Connect', 'Connexion avec des investisseurs'
    UNION ALL
    SELECT 'Creative Collab', 'Creative Collab', 'Collaboration créative'
    UNION ALL
    SELECT 'Tech Talks Nearby', 'Tech Talks Nearby', 'Conférences tech à proximité'
    UNION ALL
    SELECT 'Coffee Chats', 'Coffee Chats', 'Discussions autour d''un café'
    UNION ALL
    SELECT 'Développement logiciel', 'Software development', 'Développement logiciel'
    UNION ALL
    SELECT 'Data & IA', 'Data & AI', 'Data & IA'
    UNION ALL
    SELECT 'Cybersécurité', 'Cybersecurity', 'Cybersécurité'
    UNION ALL
    SELECT 'Cloud & DevOps', 'Cloud & DevOps', 'Cloud & DevOps'
    UNION ALL
    SELECT 'Télécoms / IoT', 'Telecoms / IoT', 'Télécoms / IoT'
    UNION ALL
    SELECT 'Blockchain / Web3', 'Blockchain / Web3', 'Blockchain / Web3'
    UNION ALL
    SELECT 'Réalité virtuelle & immersive', 'Virtual & immersive reality', 'Réalité virtuelle & immersive'
    UNION ALL
    SELECT 'Ingénierie générale', 'General engineering', 'Ingénierie générale'
    UNION ALL
    SELECT 'Industrie lourde / manufacturière', 'Heavy / manufacturing industry', 'Industrie lourde / manufacturière'
    UNION ALL
    SELECT 'Aéronautique & spatial', 'Aeronautics & space', 'Aéronautique & spatial'
    UNION ALL
    SELECT 'Énergie / Hydrogène / Renouvelables', 'Energy / Hydrogen / Renewables', 'Énergie / Hydrogène / Renouvelables'
    UNION ALL
    SELECT 'Robotique & automatisation', 'Robotics & automation', 'Robotique & automatisation'
    UNION ALL
    SELECT 'Maintenance industrielle', 'Industrial maintenance', 'Maintenance industrielle'
    UNION ALL
    SELECT 'Bâtiment / Génie civil', 'Building / Civil engineering', 'Bâtiment / Génie civil'
    UNION ALL
    SELECT 'Travaux publics', 'Public works', 'Travaux publics'
    UNION ALL
    SELECT 'Architecture', 'Architecture', 'Architecture'
    UNION ALL
    SELECT 'Urbanisme / aménagement', 'Urban planning / development', 'Urbanisme / aménagement'
    UNION ALL
    SELECT 'Immobilier & foncier', 'Real estate & land', 'Immobilier & foncier'
    UNION ALL
    SELECT 'Rénovation énergétique / Décret tertiaire', 'Energy renovation / Tertiary decree', 'Rénovation énergétique / Décret tertiaire'
    UNION ALL
    SELECT 'Transport terrestre', 'Land transport', 'Transport terrestre'
    UNION ALL
    SELECT 'Transport aérien / AAM / Drones', 'Air transport / AAM / Drones', 'Transport aérien / AAM / Drones'
    UNION ALL
    SELECT 'Transport maritime / ports', 'Maritime transport / ports', 'Transport maritime / ports'
    UNION ALL
    SELECT 'Logistique & supply chain', 'Logistics & supply chain', 'Logistique & supply chain'
    UNION ALL
    SELECT 'Mobility-as-a-Service', 'Mobility-as-a-Service', 'Mobility-as-a-Service'
    UNION ALL
    SELECT 'Infrastructures de transport', 'Transport infrastructure', 'Infrastructures de transport'
    UNION ALL
    SELECT 'Smart City', 'Smart City', 'Smart City'
    UNION ALL
    SELECT 'Eau / Assainissement', 'Water / Sanitation', 'Eau / Assainissement'
    UNION ALL
    SELECT 'Infrastructures publiques', 'Public infrastructure', 'Infrastructures publiques'
    UNION ALL
    SELECT 'Gestion des déchets', 'Waste management', 'Gestion des déchets'
    UNION ALL
    SELECT 'Éclairage public / Energie urbaine', 'Street lighting / Urban energy', 'Éclairage public / Energie urbaine'
    UNION ALL
    SELECT 'Aménagement territorial', 'Territorial planning', 'Aménagement territorial'
    UNION ALL
    SELECT 'Santé / Hôpitaux', 'Health / Hospitals', 'Santé / Hôpitaux'
    UNION ALL
    SELECT 'Biotechnologies', 'Biotechnology', 'Biotechnologies'
    UNION ALL
    SELECT 'Pharmaceutique', 'Pharmaceuticals', 'Pharmaceutique'
    UNION ALL
    SELECT 'Médecine digitale', 'Digital medicine', 'Médecine digitale'
    UNION ALL
    SELECT 'Dispositifs médicaux', 'Medical devices', 'Dispositifs médicaux'
    UNION ALL
    SELECT 'Banque', 'Banking', 'Banque'
    UNION ALL
    SELECT 'Assurance', 'Insurance', 'Assurance'
    UNION ALL
    SELECT 'Audit / Conseil', 'Audit / Consulting', 'Audit / Conseil'
    UNION ALL
    SELECT 'FinTech', 'FinTech', 'FinTech'
    UNION ALL
    SELECT 'Comptabilité', 'Accounting', 'Comptabilité'
    UNION ALL
    SELECT 'Gestion d’actifs & investissements', 'Asset management & investments', 'Gestion d’actifs & investissements'
    UNION ALL
    SELECT 'Distribution', 'Distribution', 'Distribution'
    UNION ALL
    SELECT 'E-commerce', 'E-commerce', 'E-commerce'
    UNION ALL
    SELECT 'Produits de luxe', 'Luxury goods', 'Produits de luxe'
    UNION ALL
    SELECT 'Mode & design', 'Fashion & design', 'Mode & design'
    UNION ALL
    SELECT 'Hôtellerie / restauration / tourisme', 'Hospitality / food service / tourism', 'Hôtellerie / restauration / tourisme'
    UNION ALL
    SELECT 'Enseignement supérieur', 'Higher education', 'Enseignement supérieur'
    UNION ALL
    SELECT 'Recherche scientifique', 'Scientific research', 'Recherche scientifique'
    UNION ALL
    SELECT 'E-learning / EdTech', 'E-learning / EdTech', 'E-learning / EdTech'
    UNION ALL
    SELECT 'Formation professionnelle', 'Vocational training', 'Formation professionnelle'
    UNION ALL
    SELECT 'Agriculture', 'Agriculture', 'Agriculture'
    UNION ALL
    SELECT 'Agroalimentaire', 'Agri-food', 'Agroalimentaire'
    UNION ALL
    SELECT 'Environnement & climat', 'Environment & climate', 'Environnement & climat'
    UNION ALL
    SELECT 'Ressources naturelles', 'Natural resources', 'Ressources naturelles'
    UNION ALL
    SELECT 'Économie circulaire', 'Circular economy', 'Économie circulaire'
    UNION ALL
    SELECT 'Marketing & communication', 'Marketing & communication', 'Marketing & communication'
    UNION ALL
    SELECT 'Design / création', 'Design / creative work', 'Design / création'
    UNION ALL
    SELECT 'Art, culture & patrimoine', 'Art, culture & heritage', 'Art, culture & patrimoine'
    UNION ALL
    SELECT 'Média & audiovisuel', 'Media & audiovisual', 'Média & audiovisuel'
    UNION ALL
    SELECT 'Événementiel', 'Events', 'Événementiel'
    UNION ALL
    SELECT 'Secteur public', 'Public sector', 'Secteur public'
    UNION ALL
    SELECT 'Collectivités territoriales', 'Local authorities', 'Collectivités territoriales'
    UNION ALL
    SELECT 'Coopération internationale', 'International cooperation', 'Coopération internationale'
    UNION ALL
    SELECT 'ONG & associations', 'NGOs & associations', 'ONG & associations'
    UNION ALL
    SELECT 'Institutions financières internationales (IFIs)', 'International financial institutions (IFIs)', 'Institutions financières internationales (IFIs)'
) t ON t.label = rp.label
SET
    rp.extras = JSON_SET(
        COALESCE(rp.extras, JSON_OBJECT()),
        '$.translations',
        JSON_OBJECT('en', t.en, 'fr', t.fr)
    ),
    rp.updatedAt = NOW(6)
WHERE rt.parentId IN ('objectif', 'industry');
