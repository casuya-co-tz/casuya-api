import { ContentType, JsonValue } from './types';
import { ApiRequest } from './api-request';

export interface ISerializer {
  readonly contentType: ContentType;
  serialize(data: JsonValue, request?: ApiRequest): Buffer | string;
  deserialize(data: Buffer | string, request?: ApiRequest): JsonValue;
  supports(contentType: ContentType): boolean;
}

export interface ISerializerRegistry {
  register(serializer: ISerializer): void;
  resolve(contentType: ContentType): ISerializer;
  getDefault(): ISerializer;
  getAll(): ISerializer[];
}
