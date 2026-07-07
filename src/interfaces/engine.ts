import { Protocol } from './types';
import { IContract } from './contract';
import { ILogger } from './logger';

export interface IEngine {
  readonly protocol: Protocol;
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  registerContract(contract: IContract): void;
  isRunning(): boolean;
}

export interface IEngineConfig {
  port: number;
  host: string;
  logger?: ILogger;
  middleware?: unknown[];
  [key: string]: unknown;
}
