import { ApiVersion } from '../interfaces';

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  label?: string;
}

export function parseVersion(version: ApiVersion): ParsedVersion {
  const cleaned = version.replace(/^v/, '');
  const parts = cleaned.split('-');
  const semver = parts[0].split('.').map(Number);

  return {
    major: semver[0] || 0,
    minor: semver[1] || 0,
    patch: semver[2] || 0,
    label: parts[1],
  };
}

export function compareVersions(a: ApiVersion, b: ApiVersion): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);

  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;
  return 0;
}

export function satisfies(version: ApiVersion, range: string): boolean {
  const [min, max] = range.split('-').map(r => r.trim());

  if (min) {
    if (compareVersions(version, min) < 0) return false;
  }

  if (max) {
    if (compareVersions(version, max) > 0) return false;
  }

  return true;
}
