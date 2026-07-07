import { v4 as uuidv4 } from 'uuid';
import { IGraphQLContract } from '../interfaces';
import { ContractOptions } from './types';

export class GraphQLContract implements IGraphQLContract {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  createdAt: Date;
  updatedAt: Date;
  typeDefs: string;
  resolvers: Record<string, unknown>;
  queries: string[];
  mutations: string[];
  subscriptions: string[];

  constructor(options: ContractOptions) {
    this.id = uuidv4();
    this.name = options.name;
    this.version = options.version;
    this.description = options.description;
    this.tags = options.tags || [];
    this.deprecated = options.deprecated || false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.typeDefs = '';
    this.resolvers = {};
    this.queries = [];
    this.mutations = [];
    this.subscriptions = [];
  }

  setTypeDefs(typeDefs: string): GraphQLContract {
    this.typeDefs = typeDefs;
    this.updatedAt = new Date();
    return this;
  }

  setResolvers(resolvers: Record<string, unknown>): GraphQLContract {
    this.resolvers = resolvers;
    this.updatedAt = new Date();
    return this;
  }

  addQuery(name: string): GraphQLContract {
    if (!this.queries.includes(name)) {
      this.queries.push(name);
    }
    this.updatedAt = new Date();
    return this;
  }

  addMutation(name: string): GraphQLContract {
    if (!this.mutations.includes(name)) {
      this.mutations.push(name);
    }
    this.updatedAt = new Date();
    return this;
  }

  addSubscription(name: string): GraphQLContract {
    if (!this.subscriptions.includes(name)) {
      this.subscriptions.push(name);
    }
    this.updatedAt = new Date();
    return this;
  }
}
