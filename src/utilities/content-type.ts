import { ContentType } from '../interfaces';

const CHARSET_REGEX = /;\s*charset=[^;]+/i;

export function parseContentType(header: string): ContentType {
  return header.replace(CHARSET_REGEX, '').trim().toLowerCase() as ContentType;
}

export function isJsonContentType(contentType: string): boolean {
  return contentType.includes('application/json');
}

export function isGraphQLContentType(contentType: string): boolean {
  return contentType.includes('application/graphql');
}

export const MIME_TYPES = {
  json: 'application/json' as ContentType,
  graphql: 'application/graphql' as ContentType,
  text: 'text/plain' as ContentType,
  octetStream: 'application/octet-stream' as ContentType,
  form: 'application/x-www-form-urlencoded' as ContentType,
  multipart: 'multipart/form-data' as ContentType,
} as const;
