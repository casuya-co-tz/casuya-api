import { ApiVersion, JsonValue } from '../interfaces';

export class UrlBuilder {
  private parts: string[] = [];

  constructor(base: string = '') {
    if (base) {
      this.parts.push(base.replace(/\/+$/, ''));
    }
  }

  segment(part: string): UrlBuilder {
    this.parts.push(part.replace(/^\/+|\/+$/g, ''));
    return this;
  }

  param(key: string, value: string | number): UrlBuilder {
    this.parts.push(`${key}/${value}`);
    return this;
  }

  version(version: ApiVersion): UrlBuilder {
    return this.segment(`v${version}`);
  }

  build(): string {
    return this.parts.join('/');
  }

  static api(version: ApiVersion): UrlBuilder {
    return new UrlBuilder().version(version);
  }
}

export function buildQueryString(params: Record<string, JsonValue>): string {
  const entries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const encoded = encodeURIComponent(String(value));
      return `${encodeURIComponent(key)}=${encoded}`;
    });

  return entries.length > 0 ? `?${entries.join('&')}` : '';
}
