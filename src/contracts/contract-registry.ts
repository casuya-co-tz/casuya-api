import { ApiVersion } from '../interfaces';
import { AnyContract, ContractType } from './types';

export class ContractRegistry {
  private contracts: Map<string, AnyContract> = new Map();

  register(contract: AnyContract): void {
    const key = this.buildKey(contract.name, contract.version);
    if (this.contracts.has(key)) {
      throw new Error(`Contract '${contract.name}' version '${contract.version}' already registered`);
    }
    this.contracts.set(key, contract);
  }

  unregister(name: string, version: ApiVersion): boolean {
    return this.contracts.delete(this.buildKey(name, version));
  }

  get(name: string, version?: ApiVersion): AnyContract | undefined {
    if (version) {
      return this.contracts.get(this.buildKey(name, version));
    }
    return this.getLatest(name);
  }

  getAll(): AnyContract[] {
    return Array.from(this.contracts.values());
  }

  getByType(type: ContractType): AnyContract[] {
    return this.getAll().filter(c => {
      if (type === 'rest') return 'method' in c && 'path' in c;
      if (type === 'graphql') return 'typeDefs' in c;
      if (type === 'websocket') return 'events' in c;
      return false;
    });
  }

  find(path: string, method?: string): AnyContract | undefined {
    return this.getAll().find(c => {
      if ('path' in c && c.path === path) {
        return method ? c.method === method : true;
      }
      return false;
    });
  }

  exists(name: string, version: ApiVersion): boolean {
    return this.contracts.has(this.buildKey(name, version));
  }

  count(): number {
    return this.contracts.size;
  }

  clear(): void {
    this.contracts.clear();
  }

  private getLatest(name: string): AnyContract | undefined {
    const versions = this.getAll()
      .filter(c => c.name === name)
      .sort((a, b) => b.version.localeCompare(a.version));

    return versions[0];
  }

  private buildKey(name: string, version: ApiVersion): string {
    return `${name}@${version}`;
  }
}
