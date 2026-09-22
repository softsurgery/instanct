import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';
import { ParamVariant } from 'src/shared/configurations/enums/param-variant.enum';
import {
  ConfigurationListFieldSchema,
  parseConfigurationListValue,
} from 'src/shared/configurations/utils/configuration-list-schema';
import { ConfigurationParamEntity } from 'src/shared/configurations/entities/configuration-param.entity';

const PLACEHOLDER_RE =
  /(?:<mark(?:\s[^>]*)?>)?\{\{([a-zA-Z0-9._-]+)\}\}(?:<\/mark>)?/g;
const NOT_APPLIED_RE = /legal-not-applied/;

const DUMMY_VALUES = new Set([
  'SUPER COMPANY',
  'support@super.company',
  '123 Main Street, Anytown',
]);

export type InterpolatedContent = {
  body: string;
  unresolvedKeys: string[];
  hasNotApplied: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatListForTemplate(
  value: string,
  schema: ConfigurationListFieldSchema[] = [],
) {
  const items = parseConfigurationListValue(value);
  const fields = schema.length
    ? schema
    : Object.keys(items[0] || {}).map((key) => ({
        key,
        label: key,
        variant: ParamVariant.STRING,
      }));

  const rows = items
    .map((item) => {
      const parts = fields
        .map((field, index) => {
          const raw = String(item[field.key] ?? '').trim();
          if (!raw) return '';
          const escaped = escapeHtml(raw);
          const isUrl =
            /^https?:\/\//i.test(raw) ||
            field.key.toLowerCase().includes('url');
          if (isUrl) {
            return `<a target="_blank" rel="noopener noreferrer nofollow" href="${escaped}">${escaped}</a>`;
          }
          return index === 0 ? `<strong>${escaped}</strong>` : escaped;
        })
        .filter(Boolean);
      if (!parts.length) return '';
      return `<li><p>${parts.join(' — ')}</p></li>`;
    })
    .filter(Boolean);

  return rows.length ? `<ul>${rows.join('')}</ul>` : '';
}

@Injectable()
export class ContentInterpolationService {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {}

  async interpolate(body: string): Promise<InterpolatedContent> {
    const values = await this.resolveParams();
    const unresolved = new Set<string>();
    const interpolated = body.replace(PLACEHOLDER_RE, (_match, key: string) => {
      const value = values[key];
      if (!value || DUMMY_VALUES.has(value)) {
        unresolved.add(key);
        return `<mark>{{${key}}}</mark>`;
      }
      return value;
    });

    return {
      body: interpolated,
      unresolvedKeys: [...unresolved],
      hasNotApplied: NOT_APPLIED_RE.test(body),
    };
  }

  private async resolveParams(): Promise<Record<string, string>> {
    const namespaces = await this.configurationNamespaceService.findAllGlobal(
      {},
    );
    const values: Record<string, string> = {};

    for (const namespace of namespaces) {
      for (const param of namespace.params || []) {
        if (!param.name) continue;
        const value = this.formatParamValue(param);
        values[param.name] = value;
        if (namespace.name) {
          values[`${namespace.name}.${param.name}`] = value;
        }
      }
    }

    return values;
  }

  private formatParamValue(param: ConfigurationParamEntity) {
    if (param.variant === ParamVariant.LIST) {
      return formatListForTemplate(param.value ?? '', param.schema);
    }
    return param.value?.trim() ?? '';
  }
}
