import { ApiVersion } from '../interfaces';
import { VersionManager } from './version-manager';

export class VersionResolver {
  private versionManager: VersionManager;

  constructor(versionManager: VersionManager) {
    this.versionManager = versionManager;
  }

  resolve(path: string): { version: ApiVersion; originalPath: string } {
    const versionMatch = path.match(/^\/v(\d+(?:\.\d+(?:\.\d+)?)?)\//);
    if (versionMatch) {
      const version = versionMatch[1];
      const originalPath = path.replace(/^\/v\d+(?:\.\d+(?:\.\d+)?)?/, '');
      return { version, originalPath: originalPath || '/' };
    }

    const defaultVersion = this.versionManager.getDefaultVersion();
    return { version: defaultVersion, originalPath: path };
  }

  resolveFromHeader(headers: Record<string, string>): ApiVersion {
    const acceptVersion = headers['accept-version'] || headers['x-api-version'];
    if (acceptVersion && this.versionManager.isValid(acceptVersion)) {
      return acceptVersion;
    }

    return this.versionManager.getDefaultVersion();
  }

  getVersionPrefix(version: ApiVersion): string {
    return `/v${version}`;
  }
}
