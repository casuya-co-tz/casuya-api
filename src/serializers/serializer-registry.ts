import { ISerializer, ISerializerRegistry, ContentType } from '../interfaces';
import { SerializationError } from '../utilities';
import { JsonSerializer } from './json-serializer';

export class SerializerRegistry implements ISerializerRegistry {
  private serializers: Map<string, ISerializer> = new Map();

  constructor() {
    this.register(new JsonSerializer());
  }

  register(serializer: ISerializer): void {
    this.serializers.set(serializer.contentType, serializer);
  }

  resolve(contentType: ContentType): ISerializer {
    const serializer = this.serializers.get(contentType);
    if (serializer) return serializer;

    for (const [, s] of this.serializers) {
      if (s.supports(contentType)) return s;
    }

    return this.getDefault();
  }

  getDefault(): ISerializer {
    const json = this.serializers.get('application/json');
    if (!json) {
      throw new SerializationError('No default serializer registered');
    }
    return json;
  }

  getAll(): ISerializer[] {
    return Array.from(this.serializers.values());
  }

  remove(contentType: ContentType): boolean {
    return this.serializers.delete(contentType);
  }

  clear(): void {
    this.serializers.clear();
  }
}
