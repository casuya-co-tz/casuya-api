import { v4 as uuidv4 } from 'uuid';
import {
  IEndpointContract,
  IParameterDefinition,
  IResponseDefinition,
  IHeaderDefinition,
} from '../interfaces';
import { EndpointOptions } from './types';

export class ContractBuilder {
  static endpoint(options: EndpointOptions): IEndpointContract {
    return {
      id: uuidv4(),
      name: options.name,
      version: options.version,
      method: options.method,
      path: options.path,
      description: options.description,
      tags: options.tags || [],
      deprecated: options.deprecated || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      requestSchema: {},
      responseSchema: {},
      parameters: [],
      headers: [],
      responses: [],
    };
  }

  static withParameter(
    contract: IEndpointContract,
    param: IParameterDefinition,
  ): IEndpointContract {
    return {
      ...contract,
      parameters: [...contract.parameters, param],
      updatedAt: new Date(),
    };
  }

  static withHeader(
    contract: IEndpointContract,
    header: IHeaderDefinition,
  ): IEndpointContract {
    return {
      ...contract,
      headers: [...contract.headers, header],
      updatedAt: new Date(),
    };
  }

  static withResponse(
    contract: IEndpointContract,
    response: IResponseDefinition,
  ): IEndpointContract {
    return {
      ...contract,
      responses: [...contract.responses, response],
      updatedAt: new Date(),
    };
  }

  static withRequestSchema(
    contract: IEndpointContract,
    schema: Record<string, unknown>,
  ): IEndpointContract {
    return {
      ...contract,
      requestSchema: schema,
      updatedAt: new Date(),
    };
  }

  static withResponseSchema(
    contract: IEndpointContract,
    schema: Record<string, unknown>,
  ): IEndpointContract {
    return {
      ...contract,
      responseSchema: schema,
      updatedAt: new Date(),
    };
  }

  static deprecate(contract: IEndpointContract): IEndpointContract {
    return {
      ...contract,
      deprecated: true,
      updatedAt: new Date(),
    };
  }

  static tag(contract: IEndpointContract, tag: string): IEndpointContract {
    return {
      ...contract,
      tags: [...contract.tags, tag],
      updatedAt: new Date(),
    };
  }
}
