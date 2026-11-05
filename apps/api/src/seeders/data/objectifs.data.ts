import type {
  CatalogGroup,
  CatalogRoot,
} from '@softsurgery/nsa-reference-types/interfaces/catalog.interface';

export const objectiveRoot: CatalogRoot = {
  id: 'objectif',
  label: 'Objectif',
  description: 'Parent reference type for all Objectives',
  translations: {
    en: 'Objective',
    fr: 'Objectif',
  },
};

export const objectives: CatalogGroup[] = [
  {
    label: 'Professional Growth',
    translations: {
      en: 'Professional Growth',
      fr: 'Croissance professionnelle',
    },
    params: [
      {
        label: 'Find a Co-Founder',
        translations: {
          en: 'Find a Co-Founder',
          fr: 'Trouver un cofondateur',
        },
      },
      {
        label: 'Build My Team',
        translations: {
          en: 'Build My Team',
          fr: 'Constituer mon équipe',
        },
      },
      {
        label: 'Join a Startup',
        translations: {
          en: 'Join a Startup',
          fr: 'Rejoindre une startup',
        },
      },
      {
        label: 'Find an Investor / Raise Funding',
        translations: {
          en: 'Find an Investor / Raise Funding',
          fr: 'Trouver un investisseur / Lever des fonds',
        },
      },
      {
        label: 'Looking to Invest',
        translations: {
          en: 'Looking to Invest',
          fr: 'Chercher à investir',
        },
      },
      {
        label: 'Find Clients or Partners',
        translations: {
          en: 'Find Clients or Partners',
          fr: 'Trouver des clients ou des partenaires',
        },
      },
      {
        label: 'Get Mentorship / Advice',
        translations: {
          en: 'Get Mentorship / Advice',
          fr: 'Recevoir du mentorat / des conseils',
        },
      },
      {
        label: 'Offer Mentorship / Consulting',
        translations: {
          en: 'Offer Mentorship / Consulting',
          fr: 'Proposer du mentorat / du conseil',
        },
      },
    ],
  },
  {
    label: 'Networking & Collaboration',
    translations: {
      en: 'Networking & Collaboration',
      fr: 'Réseautage et collaboration',
    },
    params: [
      {
        label: 'Networking & Connections',
        translations: {
          en: 'Networking & Connections',
          fr: 'Réseautage et mises en relation',
        },
      },
      {
        label: 'Collaboration on Projects',
        translations: {
          en: 'Collaboration on Projects',
          fr: 'Collaboration sur des projets',
        },
      },
      {
        label: 'Brainstorming Sessions',
        translations: {
          en: 'Brainstorming Sessions',
          fr: 'Sessions de brainstorming',
        },
      },
      {
        label: 'Knowledge Exchange',
        translations: {
          en: 'Knowledge Exchange',
          fr: 'Échange de connaissances',
        },
      },
      {
        label: 'Community Building',
        translations: {
          en: 'Community Building',
          fr: 'Animation de communauté',
        },
      },
    ],
  },
  {
    label: 'Casual & Social',
    translations: {
      en: 'Casual & Social',
      fr: 'Informel et social',
    },
    params: [
      {
        label: 'Grab a Coffee',
        translations: {
          en: 'Grab a Coffee',
          fr: 'Prendre un café',
        },
      },
      {
        label: 'Expand My Circle',
        translations: {
          en: 'Expand My Circle',
          fr: 'Élargir mon cercle',
        },
      },
      {
        label: 'Attend Local Events Together',
        translations: {
          en: 'Attend Local Events Together',
          fr: 'Participer ensemble à des événements locaux',
        },
      },
      {
        label: 'Work Buddy / Cowork Together',
        translations: {
          en: 'Work Buddy / Cowork Together',
          fr: 'Collègue de travail / Coworking ensemble',
        },
      },
      {
        label: 'Inspiration & Motivation',
        translations: {
          en: 'Inspiration & Motivation',
          fr: 'Inspiration et motivation',
        },
      },
    ],
  },
  {
    label: 'Personal Development',
    translations: {
      en: 'Personal Development',
      fr: 'Développement personnel',
    },
    params: [
      {
        label: 'Learn a New Skill',
        translations: {
          en: 'Learn a New Skill',
          fr: 'Apprendre une nouvelle compétence',
        },
      },
      {
        label: 'Public Speaking / Pitch Practice',
        translations: {
          en: 'Public Speaking / Pitch Practice',
          fr: 'Prise de parole / Entraînement au pitch',
        },
      },
      {
        label: 'Accountability Partner',
        translations: {
          en: 'Accountability Partner',
          fr: 'Partenaire de responsabilisation',
        },
      },
      {
        label: 'Build My Personal Brand',
        translations: {
          en: 'Build My Personal Brand',
          fr: 'Construire ma marque personnelle',
        },
      },
    ],
  },
  {
    label: 'Explore Mode',
    translations: {
      en: 'Explore Mode',
      fr: 'Mode exploration',
    },
    params: [
      {
        label: 'Startup Dating',
        translations: {
          en: 'Startup Dating',
          fr: 'Rencontres startup',
        },
      },
      {
        label: 'Investor Connect',
        translations: {
          en: 'Investor Connect',
          fr: 'Connexion avec des investisseurs',
        },
      },
      {
        label: 'Creative Collab',
        translations: {
          en: 'Creative Collab',
          fr: 'Collaboration créative',
        },
      },
      {
        label: 'Tech Talks Nearby',
        translations: {
          en: 'Tech Talks Nearby',
          fr: 'Conférences tech à proximité',
        },
      },
      {
        label: 'Coffee Chats',
        translations: {
          en: 'Coffee Chats',
          fr: "Discussions autour d'un café",
        },
      },
    ],
  },
];
