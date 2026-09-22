import { ParamVariant } from 'src/shared/configurations/enums/param-variant.enum';
import { ConfigurationTimeObject } from 'src/shared/configurations/utils/configuration-time.object';

export const mapConfiguration = [
  // Range
  {
    name: 'range.min',
    description: 'Minimum range of the map',
    variant: ParamVariant.NUMBER,
    value: '0',
  },
  {
    name: 'range.max',
    description: 'Maximum range of the map',
    variant: ParamVariant.NUMBER,
    value: '10',
  },
  {
    name: 'range.unit',
    description: 'Range unit',
    variant: ParamVariant.SELECT,
    value: 'km',
    options: [
      { label: 'Kilometers', value: 'km' },
      { label: 'Miles', value: 'miles' },
    ],
  },
  // Last update
  {
    name: 'lastUpdate.value',
    description: 'Last update value',
    variant: ParamVariant.NUMBER,
    value: '1',
  },
  {
    name: 'lastUpdate.unit',
    description: 'Last update unit',
    variant: ParamVariant.SELECT,
    value: 'd',
    options: ConfigurationTimeObject,
  },
  // Reconnection
  {
    name: 'reconnection.maxAttempts',
    description: 'Max reconnection attempts',
    variant: ParamVariant.NUMBER,
    value: '3',
  },
  {
    name: 'reconnection.delay.value',
    description: 'Reconnection delay value',
    variant: ParamVariant.NUMBER,
    value: '2',
  },
  {
    name: 'reconnection.delay.unit',
    description: 'Reconnection delay unit',
    variant: ParamVariant.SELECT,
    value: 's',
    options: ConfigurationTimeObject,
  },
  // Refresh
  {
    name: 'refresh.value',
    description: 'Refresh value',
    variant: ParamVariant.NUMBER,
    value: '10',
  },
  {
    name: 'refresh.unit',
    description: 'Refresh unit',
    variant: ParamVariant.SELECT,
    value: 's',
    options: ConfigurationTimeObject,
  },
  {
    name: 'providers',
    description:
      'Map providers used by the app, with a privacy policy URL for each one',
    variant: ParamVariant.LIST,
    value: '[]',
    schema: [
      {
        key: 'name',
        label: 'Provider name',
        variant: ParamVariant.STRING,
        required: true,
      },
      {
        key: 'privacyUrl',
        label: 'Privacy policy URL',
        variant: ParamVariant.STRING,
        required: true,
      },
    ],
  },
];

export const coreConfiguration = [
  {
    name: 'company.name',
    description: 'Company name',
    variant: ParamVariant.STRING,
    value: 'SUPER COMPANY',
  },
  {
    name: 'company.support',
    description: 'Company support email',
    variant: ParamVariant.STRING,
    value: 'support@super.company',
  },
  {
    name: 'company.address',
    description: 'Company address',
    variant: ParamVariant.STRING,
    value: '123 Main Street, Anytown',
  },
  {
    name: 'company.legalName',
    description: 'Legal company name (raison sociale)',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'company.legalForm',
    description: 'Legal form and share capital',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'company.rcs',
    description: 'RCS / SIREN number',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'company.privacyEmail',
    description: 'Data protection contact email',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'hosting.provider',
    description: 'Hosting provider name',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'hosting.country',
    description: 'Hosting country',
    variant: ParamVariant.STRING,
    value: '',
  },
  {
    name: 'hosting.address',
    description: 'Hosting provider address',
    variant: ParamVariant.STRING,
    value: '',
  },
];

export const applicationConfiguration = [
  {
    name: 'languages',
    description: 'Available languages for the application',
    variant: ParamVariant.LIST,
    value: JSON.stringify([
      { label: 'English', code: 'en' },
      { label: 'French', code: 'fr' },
    ]),
    schema: [
      {
        key: 'label',
        label: 'Language label',
        variant: ParamVariant.STRING,
        required: true,
      },
      {
        key: 'code',
        label: 'Language code (e.g. en, fr)',
        variant: ParamVariant.STRING,
        required: true,
      },
    ],
  },
];
