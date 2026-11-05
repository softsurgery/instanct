import type {
  CatalogGroup,
  CatalogRoot,
} from '@softsurgery/nsa-reference-types/interfaces/catalog.interface';

export const industryRoot: CatalogRoot = {
  id: 'industry',
  label: 'Industry',
  description: 'Parent reference type for all industries',
  translations: {
    en: 'Industry',
    fr: 'Industrie',
  },
};

export const industries: CatalogGroup[] = [
  {
    label: 'Technologies & Informatique',
    translations: {
      en: 'Technology & IT',
      fr: 'Technologies & Informatique',
    },
    params: [
      {
        label: 'Développement logiciel',
        translations: {
          en: 'Software development',
          fr: 'Développement logiciel',
        },
      },
      {
        label: 'Data & IA',
        translations: {
          en: 'Data & AI',
          fr: 'Data & IA',
        },
      },
      {
        label: 'Cybersécurité',
        translations: {
          en: 'Cybersecurity',
          fr: 'Cybersécurité',
        },
      },
      {
        label: 'Cloud & DevOps',
        translations: {
          en: 'Cloud & DevOps',
          fr: 'Cloud & DevOps',
        },
      },
      {
        label: 'Télécoms / IoT',
        translations: {
          en: 'Telecoms / IoT',
          fr: 'Télécoms / IoT',
        },
      },
      {
        label: 'Blockchain / Web3',
        translations: {
          en: 'Blockchain / Web3',
          fr: 'Blockchain / Web3',
        },
      },
      {
        label: 'Réalité virtuelle & immersive',
        translations: {
          en: 'Virtual & immersive reality',
          fr: 'Réalité virtuelle & immersive',
        },
      },
    ],
  },
  {
    label: 'Ingénierie & Industrie',
    translations: {
      en: 'Engineering & Industry',
      fr: 'Ingénierie & Industrie',
    },
    params: [
      {
        label: 'Ingénierie générale',
        translations: {
          en: 'General engineering',
          fr: 'Ingénierie générale',
        },
      },
      {
        label: 'Industrie lourde / manufacturière',
        translations: {
          en: 'Heavy / manufacturing industry',
          fr: 'Industrie lourde / manufacturière',
        },
      },
      {
        label: 'Aéronautique & spatial',
        translations: {
          en: 'Aeronautics & space',
          fr: 'Aéronautique & spatial',
        },
      },
      {
        label: 'Énergie / Hydrogène / Renouvelables',
        translations: {
          en: 'Energy / Hydrogen / Renewables',
          fr: 'Énergie / Hydrogène / Renouvelables',
        },
      },
      {
        label: 'Robotique & automatisation',
        translations: {
          en: 'Robotics & automation',
          fr: 'Robotique & automatisation',
        },
      },
      {
        label: 'Maintenance industrielle',
        translations: {
          en: 'Industrial maintenance',
          fr: 'Maintenance industrielle',
        },
      },
    ],
  },
  {
    label: 'Construction & BTP',
    translations: {
      en: 'Construction & Public Works',
      fr: 'Construction & BTP',
    },
    params: [
      {
        label: 'Bâtiment / Génie civil',
        translations: {
          en: 'Building / Civil engineering',
          fr: 'Bâtiment / Génie civil',
        },
      },
      {
        label: 'Travaux publics',
        translations: {
          en: 'Public works',
          fr: 'Travaux publics',
        },
      },
      {
        label: 'Architecture',
        translations: {
          en: 'Architecture',
          fr: 'Architecture',
        },
      },
      {
        label: 'Urbanisme / aménagement',
        translations: {
          en: 'Urban planning / development',
          fr: 'Urbanisme / aménagement',
        },
      },
      {
        label: 'Immobilier & foncier',
        translations: {
          en: 'Real estate & land',
          fr: 'Immobilier & foncier',
        },
      },
      {
        label: 'Rénovation énergétique / Décret tertiaire',
        translations: {
          en: 'Energy renovation / Tertiary decree',
          fr: 'Rénovation énergétique / Décret tertiaire',
        },
      },
    ],
  },
  {
    label: 'Mobilité, Transport & Logistique',
    translations: {
      en: 'Mobility, Transport & Logistics',
      fr: 'Mobilité, Transport & Logistique',
    },
    params: [
      {
        label: 'Transport terrestre',
        translations: {
          en: 'Land transport',
          fr: 'Transport terrestre',
        },
      },
      {
        label: 'Transport aérien / AAM / Drones',
        translations: {
          en: 'Air transport / AAM / Drones',
          fr: 'Transport aérien / AAM / Drones',
        },
      },
      {
        label: 'Transport maritime / ports',
        translations: {
          en: 'Maritime transport / ports',
          fr: 'Transport maritime / ports',
        },
      },
      {
        label: 'Logistique & supply chain',
        translations: {
          en: 'Logistics & supply chain',
          fr: 'Logistique & supply chain',
        },
      },
      {
        label: 'Mobility-as-a-Service',
        translations: {
          en: 'Mobility-as-a-Service',
          fr: 'Mobility-as-a-Service',
        },
      },
      {
        label: 'Infrastructures de transport',
        translations: {
          en: 'Transport infrastructure',
          fr: 'Infrastructures de transport',
        },
      },
    ],
  },
  {
    label: 'Infrastructures & Villes',
    translations: {
      en: 'Infrastructure & Cities',
      fr: 'Infrastructures & Villes',
    },
    params: [
      {
        label: 'Smart City',
        translations: {
          en: 'Smart City',
          fr: 'Smart City',
        },
      },
      {
        label: 'Eau / Assainissement',
        translations: {
          en: 'Water / Sanitation',
          fr: 'Eau / Assainissement',
        },
      },
      {
        label: 'Infrastructures publiques',
        translations: {
          en: 'Public infrastructure',
          fr: 'Infrastructures publiques',
        },
      },
      {
        label: 'Gestion des déchets',
        translations: {
          en: 'Waste management',
          fr: 'Gestion des déchets',
        },
      },
      {
        label: 'Éclairage public / Energie urbaine',
        translations: {
          en: 'Street lighting / Urban energy',
          fr: 'Éclairage public / Energie urbaine',
        },
      },
      {
        label: 'Aménagement territorial',
        translations: {
          en: 'Territorial planning',
          fr: 'Aménagement territorial',
        },
      },
    ],
  },
  {
    label: 'Santé & Sciences de la Vie',
    translations: {
      en: 'Health & Life Sciences',
      fr: 'Santé & Sciences de la Vie',
    },
    params: [
      {
        label: 'Santé / Hôpitaux',
        translations: {
          en: 'Health / Hospitals',
          fr: 'Santé / Hôpitaux',
        },
      },
      {
        label: 'Biotechnologies',
        translations: {
          en: 'Biotechnology',
          fr: 'Biotechnologies',
        },
      },
      {
        label: 'Pharmaceutique',
        translations: {
          en: 'Pharmaceuticals',
          fr: 'Pharmaceutique',
        },
      },
      {
        label: 'Médecine digitale',
        translations: {
          en: 'Digital medicine',
          fr: 'Médecine digitale',
        },
      },
      {
        label: 'Dispositifs médicaux',
        translations: {
          en: 'Medical devices',
          fr: 'Dispositifs médicaux',
        },
      },
    ],
  },
  {
    label: 'Finance & Services',
    translations: {
      en: 'Finance & Services',
      fr: 'Finance & Services',
    },
    params: [
      {
        label: 'Banque',
        translations: {
          en: 'Banking',
          fr: 'Banque',
        },
      },
      {
        label: 'Assurance',
        translations: {
          en: 'Insurance',
          fr: 'Assurance',
        },
      },
      {
        label: 'Audit / Conseil',
        translations: {
          en: 'Audit / Consulting',
          fr: 'Audit / Conseil',
        },
      },
      {
        label: 'FinTech',
        translations: {
          en: 'FinTech',
          fr: 'FinTech',
        },
      },
      {
        label: 'Comptabilité',
        translations: {
          en: 'Accounting',
          fr: 'Comptabilité',
        },
      },
      {
        label: 'Gestion d’actifs & investissements',
        translations: {
          en: 'Asset management & investments',
          fr: 'Gestion d’actifs & investissements',
        },
      },
    ],
  },
  {
    label: 'Commerce, Retail & Luxe',
    translations: {
      en: 'Commerce, Retail & Luxury',
      fr: 'Commerce, Retail & Luxe',
    },
    params: [
      {
        label: 'Distribution',
        translations: {
          en: 'Distribution',
          fr: 'Distribution',
        },
      },
      {
        label: 'E-commerce',
        translations: {
          en: 'E-commerce',
          fr: 'E-commerce',
        },
      },
      {
        label: 'Produits de luxe',
        translations: {
          en: 'Luxury goods',
          fr: 'Produits de luxe',
        },
      },
      {
        label: 'Mode & design',
        translations: {
          en: 'Fashion & design',
          fr: 'Mode & design',
        },
      },
      {
        label: 'Hôtellerie / restauration / tourisme',
        translations: {
          en: 'Hospitality / food service / tourism',
          fr: 'Hôtellerie / restauration / tourisme',
        },
      },
    ],
  },
  {
    label: 'Éducation & Recherche',
    translations: {
      en: 'Education & Research',
      fr: 'Éducation & Recherche',
    },
    params: [
      {
        label: 'Enseignement supérieur',
        translations: {
          en: 'Higher education',
          fr: 'Enseignement supérieur',
        },
      },
      {
        label: 'Recherche scientifique',
        translations: {
          en: 'Scientific research',
          fr: 'Recherche scientifique',
        },
      },
      {
        label: 'E-learning / EdTech',
        translations: {
          en: 'E-learning / EdTech',
          fr: 'E-learning / EdTech',
        },
      },
      {
        label: 'Formation professionnelle',
        translations: {
          en: 'Vocational training',
          fr: 'Formation professionnelle',
        },
      },
    ],
  },
  {
    label: 'Agriculture & Environnement',
    translations: {
      en: 'Agriculture & Environment',
      fr: 'Agriculture & Environnement',
    },
    params: [
      {
        label: 'Agriculture',
        translations: {
          en: 'Agriculture',
          fr: 'Agriculture',
        },
      },
      {
        label: 'Agroalimentaire',
        translations: {
          en: 'Agri-food',
          fr: 'Agroalimentaire',
        },
      },
      {
        label: 'Environnement & climat',
        translations: {
          en: 'Environment & climate',
          fr: 'Environnement & climat',
        },
      },
      {
        label: 'Ressources naturelles',
        translations: {
          en: 'Natural resources',
          fr: 'Ressources naturelles',
        },
      },
      {
        label: 'Économie circulaire',
        translations: {
          en: 'Circular economy',
          fr: 'Économie circulaire',
        },
      },
    ],
  },
  {
    label: 'Culture, Médias & Création',
    translations: {
      en: 'Culture, Media & Creative',
      fr: 'Culture, Médias & Création',
    },
    params: [
      {
        label: 'Marketing & communication',
        translations: {
          en: 'Marketing & communication',
          fr: 'Marketing & communication',
        },
      },
      {
        label: 'Design / création',
        translations: {
          en: 'Design / creative work',
          fr: 'Design / création',
        },
      },
      {
        label: 'Art, culture & patrimoine',
        translations: {
          en: 'Art, culture & heritage',
          fr: 'Art, culture & patrimoine',
        },
      },
      {
        label: 'Média & audiovisuel',
        translations: {
          en: 'Media & audiovisual',
          fr: 'Média & audiovisuel',
        },
      },
      {
        label: 'Événementiel',
        translations: {
          en: 'Events',
          fr: 'Événementiel',
        },
      },
    ],
  },
  {
    label: 'Public, ONG & Organisations Internationales',
    translations: {
      en: 'Public Sector, NGOs & International Organizations',
      fr: 'Public, ONG & Organisations Internationales',
    },
    params: [
      {
        label: 'Secteur public',
        translations: {
          en: 'Public sector',
          fr: 'Secteur public',
        },
      },
      {
        label: 'Collectivités territoriales',
        translations: {
          en: 'Local authorities',
          fr: 'Collectivités territoriales',
        },
      },
      {
        label: 'Coopération internationale',
        translations: {
          en: 'International cooperation',
          fr: 'Coopération internationale',
        },
      },
      {
        label: 'ONG & associations',
        translations: {
          en: 'NGOs & associations',
          fr: 'ONG & associations',
        },
      },
      {
        label: 'Institutions financières internationales (IFIs)',
        translations: {
          en: 'International financial institutions (IFIs)',
          fr: 'Institutions financières internationales (IFIs)',
        },
      },
    ],
  },
];
