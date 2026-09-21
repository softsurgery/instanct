import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';

const PLACEHOLDER_RE = /\{\{([a-zA-Z0-9._-]+)\}\}/g;
const NOT_APPLIED_RE = /:::not-applied\b/;

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

@Injectable()
export class ContentInterpolationService {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {}

  async interpolate(body: string): Promise<InterpolatedContent> {
    const values = await this.resolveParams();
    const unresolved = new Set<string>();
    const interpolated = body.replace(PLACEHOLDER_RE, (match, key: string) => {
      const value = values[key];
      if (!value || DUMMY_VALUES.has(value)) {
        unresolved.add(key);
        return match;
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
        const value = param.value?.trim() ?? '';
        values[param.name] = value;
        if (namespace.name) {
          values[`${namespace.name}.${param.name}`] = value;
        }
      }
    }

    return values;
  }
}
