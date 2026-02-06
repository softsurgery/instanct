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
];
