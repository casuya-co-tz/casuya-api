import { IGraphQLContract } from '../interfaces';

export class SchemaBuilder {
  private contracts: IGraphQLContract[] = [];

  register(contract: IGraphQLContract): void {
    this.contracts.push(contract);
  }

  buildTypeDefs(): string {
    return this.contracts
      .map(c => c.typeDefs)
      .join('\n');
  }

  buildResolvers(): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    for (const contract of this.contracts) {
      for (const [type, resolvers] of Object.entries(contract.resolvers)) {
        if (!merged[type]) {
          merged[type] = {};
        }
        Object.assign(merged[type] as Record<string, unknown>, resolvers as Record<string, unknown>);
      }
    }

    return merged;
  }

  getContracts(): IGraphQLContract[] {
    return [...this.contracts];
  }

  getQueryNames(): string[] {
    return this.contracts.flatMap(c => c.queries);
  }

  getMutationNames(): string[] {
    return this.contracts.flatMap(c => c.mutations);
  }

  getSubscriptionNames(): string[] {
    return this.contracts.flatMap(c => c.subscriptions);
  }

  clear(): void {
    this.contracts = [];
  }
}
