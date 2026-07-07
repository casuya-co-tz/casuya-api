import { ApiVersion } from '../interfaces';
import { ConsoleLogger } from '../utilities';

export interface MigrationStep {
  from: ApiVersion;
  to: ApiVersion;
  migrate: (data: Record<string, unknown>) => Record<string, unknown>;
  rollback: (data: Record<string, unknown>) => Record<string, unknown>;
}

export class MigrationManager {
  private migrations: MigrationStep[] = [];
  private logger: ConsoleLogger;

  constructor(logger?: ConsoleLogger) {
    this.logger = logger || new ConsoleLogger();
  }

  register(migration: MigrationStep): void {
    this.migrations.push(migration);
    this.logger.info(`Registered migration: ${migration.from} -> ${migration.to}`);
  }

  migrate(data: Record<string, unknown>, from: ApiVersion, to: ApiVersion): Record<string, unknown> {
    const chain = this.buildChain(from, to, 'migrate');
    let result = { ...data };

    for (const step of chain) {
      result = step.migrate(result);
    }

    return result;
  }

  rollback(data: Record<string, unknown>, from: ApiVersion, to: ApiVersion): Record<string, unknown> {
    const chain = this.buildChain(from, to, 'rollback');
    let result = { ...data };

    for (const step of chain) {
      result = step.rollback(result);
    }

    return result;
  }

  private buildChain(
    from: ApiVersion,
    to: ApiVersion,
    direction: 'migrate' | 'rollback',
  ): MigrationStep[] {
    return this.migrations.filter(m => {
      if (direction === 'migrate') {
        return m.from === from && m.to === to;
      }
      return m.from === from && m.to === to;
    });
  }

  getMigrations(): MigrationStep[] {
    return [...this.migrations];
  }

  clear(): void {
    this.migrations = [];
  }
}
