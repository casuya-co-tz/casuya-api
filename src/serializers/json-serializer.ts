import { ISerializer, ContentType, JsonValue } from '../interfaces';
import { SerializationError } from '../utilities';

export class JsonSerializer implements ISerializer {
  readonly contentType: ContentType = 'application/json';

  serialize(data: JsonValue): Buffer | string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new SerializationError(
        'Failed to serialize data to JSON',
        { originalError: String(error) },
      );
    }
  }

  deserialize(data: Buffer | string): JsonValue {
    try {
      const str = Buffer.isBuffer(data) ? data.toString('utf-8') : data;
      return JSON.parse(str);
    } catch (error) {
      throw new SerializationError(
        'Failed to deserialize JSON data',
        { originalError: String(error) },
      );
    }
  }

  supports(contentType: ContentType): boolean {
    return contentType.includes('application/json') || contentType.includes('*/json');
  }
}
