import { ApiVersion } from '../interfaces';
import { compareVersions } from '../utilities';

export interface VersionRecord {
  version: ApiVersion;
  status: 'active' | 'deprecated' | 'sunset' | 'planned';
  releaseDate: Date;
  sunsetDate?: Date;
  changelog: string[];
}

export class VersionManager {
  private versions: Map<ApiVersion, VersionRecord> = new Map();
  private defaultVersion: ApiVersion = '1.0.0';

  register(version: ApiVersion, record?: Partial<VersionRecord>): void {
    const existing = this.versions.get(version);
    this.versions.set(version, {
      version,
      status: record?.status || 'active',
      releaseDate: record?.releaseDate || new Date(),
      sunsetDate: record?.sunsetDate,
      changelog: record?.changelog || [],
      ...(existing ? existing : {}),
    });
  }

  deprecate(version: ApiVersion, sunsetDate?: Date): void {
    const record = this.versions.get(version);
    if (record) {
      record.status = 'deprecated';
      if (sunsetDate) record.sunsetDate = sunsetDate;
    }
  }

  sunset(version: ApiVersion): void {
    const record = this.versions.get(version);
    if (record) {
      record.status = 'sunset';
    }
  }

  getVersion(version: ApiVersion): VersionRecord | undefined {
    return this.versions.get(version);
  }

  getActiveVersions(): ApiVersion[] {
    return this.getAllVersions()
      .filter(v => v.status === 'active')
      .map(v => v.version);
  }

  getLatestVersion(): ApiVersion {
    const sorted = this.getAllVersions().sort((a, b) =>
      compareVersions(b.version, a.version),
    );
    return sorted[0]?.version || this.defaultVersion;
  }

  getAllVersions(): VersionRecord[] {
    return Array.from(this.versions.values());
  }

  isDeprecated(version: ApiVersion): boolean {
    return this.versions.get(version)?.status === 'deprecated';
  }

  isSunset(version: ApiVersion): boolean {
    return this.versions.get(version)?.status === 'sunset';
  }

  isValid(version: ApiVersion): boolean {
    return this.versions.has(version);
  }

  getDefaultVersion(): ApiVersion {
    return this.defaultVersion;
  }

  setDefaultVersion(version: ApiVersion): void {
    if (this.versions.has(version)) {
      this.defaultVersion = version;
    }
  }

  addChangelog(version: ApiVersion, entry: string): void {
    const record = this.versions.get(version);
    if (record) {
      record.changelog.push(entry);
    }
  }
}
