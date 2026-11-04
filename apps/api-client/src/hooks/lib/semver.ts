export interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: (string | number)[];
  raw: string;
}

const SEMVER_REGEX =
  /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

/**
 * Parses a semantic version string into its numeric components and prerelease identifiers.
 * Returns null if the version string does not conform to semver.
 */
export function parseSemver(
  version: string | null | undefined,
): ParsedSemver | null {
  if (!version || typeof version !== "string") {
    return null;
  }

  const trimmed = version.trim();
  const match = trimmed.match(SEMVER_REGEX);
  if (!match) {
    return null;
  }

  const majorStr = match[1];
  const minorStr = match[2];
  const patchStr = match[3];

  // Disallow leading zeroes in numeric identifiers per SemVer 2.0.0
  if (
    (majorStr.length > 1 && majorStr.startsWith("0")) ||
    (minorStr.length > 1 && minorStr.startsWith("0")) ||
    (patchStr.length > 1 && patchStr.startsWith("0"))
  ) {
    return null;
  }

  const major = parseInt(majorStr, 10);
  const minor = parseInt(minorStr, 10);
  const patch = parseInt(patchStr, 10);

  const prereleaseStr = match[4];
  let prerelease: (string | number)[] = [];
  if (prereleaseStr !== undefined) {
    const parts = prereleaseStr.split(".");
    if (parts.some((part) => part.length === 0)) {
      return null;
    }
    prerelease = parts.map((part) => {
      const num = parseInt(part, 10);
      return isNaN(num) || num.toString() !== part ? part : num;
    });
  }

  return {
    major,
    minor,
    patch,
    prerelease,
    raw: trimmed,
  };
}

export function isSemverValid(version: string | null | undefined): boolean {
  return parseSemver(version) !== null;
}

/**
 * Compares two semantic versions.
 * Returns:
 *   -1 if v1 < v2
 *    0 if v1 === v2
 *    1 if v1 > v2
 * If either version is invalid, returns null.
 */
export function compareSemver(
  v1: string | null | undefined,
  v2: string | null | undefined,
): -1 | 0 | 1 | null {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  if (!p1 || !p2) {
    return null;
  }

  if (p1.major !== p2.major) {
    return p1.major > p2.major ? 1 : -1;
  }
  if (p1.minor !== p2.minor) {
    return p1.minor > p2.minor ? 1 : -1;
  }
  if (p1.patch !== p2.patch) {
    return p1.patch > p2.patch ? 1 : -1;
  }

  // Prerelease comparison rules (SemVer 2.0.0):
  // 1. Normal version has higher precedence than prerelease (1.0.0 > 1.0.0-alpha)
  if (p1.prerelease.length === 0 && p2.prerelease.length > 0) return 1;
  if (p1.prerelease.length > 0 && p2.prerelease.length === 0) return -1;
  if (p1.prerelease.length === 0 && p2.prerelease.length === 0) return 0;

  // 2. Compare each prerelease identifier
  const len = Math.max(p1.prerelease.length, p2.prerelease.length);
  for (let i = 0; i < len; i++) {
    const id1 = p1.prerelease[i];
    const id2 = p2.prerelease[i];

    if (id1 === undefined) return -1;
    if (id2 === undefined) return 1;
    if (id1 === id2) continue;

    const num1 = typeof id1 === "number";
    const num2 = typeof id2 === "number";

    if (num1 && num2) {
      return id1 > id2 ? 1 : -1;
    }
    if (num1 && !num2) return -1;
    if (!num1 && num2) return 1;
    return String(id1) < String(id2) ? -1 : 1;
  }

  return 0;
}

/**
 * Determines whether the installed version is older than the required minimum version.
 * Fails safely: if minimumVersion is missing or invalid semver, returns false (no lockout).
 */
export function isVersionOutdated(
  installedVersion: string | null | undefined,
  minimumVersion: string | null | undefined,
): boolean {
  if (
    !minimumVersion ||
    typeof minimumVersion !== "string" ||
    !minimumVersion.trim()
  ) {
    return false;
  }

  const comparison = compareSemver(installedVersion, minimumVersion);
  if (comparison === null) {
    // Malformed input fails safely without inventing an accidental lockout
    return false;
  }

  return comparison === -1;
}
