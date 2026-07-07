import { HealthCheckResult } from '../interfaces';

export interface HealthCheck {
  name: string;
  check: () => Promise<{ status: string; message?: string }>;
}

export class HealthChecker {
  private checks: HealthCheck[] = [];
  private startTime: number = Date.now();
  private appVersion: string;

  constructor(appVersion: string = '1.0.0') {
    this.appVersion = appVersion;
  }

  register(check: HealthCheck): void {
    this.checks.push(check);
  }

  async checkAll(): Promise<HealthCheckResult> {
    const results = await Promise.all(
      this.checks.map(async (check) => {
        try {
          const result = await check.check();
          return { [check.name]: result };
        } catch {
          return { [check.name]: { status: 'unhealthy', message: 'Check failed' } };
        }
      }),
    );

    const checks = Object.assign({}, ...results);
    const statuses = Object.values(checks).map((c: unknown) => (c as { status: string }).status);
    const hasUnhealthy = statuses.includes('unhealthy');
    const hasDegraded = statuses.includes('degraded');

    return {
      status: hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
      uptime: Date.now() - this.startTime,
      version: this.appVersion,
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
