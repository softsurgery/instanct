const PLACEHOLDER_RE = /\{\{([a-zA-Z0-9._-]+)\}\}/g;

export const LEGAL_PLACEHOLDERS = [
  "company.legalName",
  "company.legalForm",
  "company.address",
  "company.rcs",
  "company.privacyEmail",
  "company.support",
  "hosting.provider",
  "hosting.country",
  "hosting.address",
  "maps.providers",
] as const;

export function hasNotAppliedBlocks(content: string) {
  return /legal-not-applied/.test(content);
}

export function hasUnresolvedPlaceholders(content: string) {
  return /\{\{[a-zA-Z0-9._-]+\}\}/.test(content);
}

export function prepareLegalHtml(content: string) {
  return content.replace(
    PLACEHOLDER_RE,
    (match, key: string, offset: number, fullString: string) => {
      const precedingText = fullString.slice(Math.max(0, offset - 30), offset);
      if (/<mark[^>]*>$/i.test(precedingText)) {
        return match;
      }
      return `<mark>{{${key}}}</mark>`;
    },
  );
}

export function insertHtmlSnippet(
  source: string,
  start: number,
  end: number,
  tag = "blockquote",
  className = "legal-not-applied",
) {
  const selected = source.slice(start, end) || "Texte ici";
  const prefix = `<${tag} class="${className}">`;
  const suffix = `</${tag}>`;
  const next = `${source.slice(0, start)}${prefix}${selected}${suffix}${source.slice(end)}`;
  const cursor = start + prefix.length + selected.length + suffix.length;
  return { next, cursor };
}
