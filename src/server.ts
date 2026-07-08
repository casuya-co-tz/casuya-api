import { RestEngine } from './rest/rest-engine';
import { ConsoleLogger } from './utilities';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import net from 'node:net';
import { HealthChecker } from './monitoring/health-checker';

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 8081);
const HOST = process.env.HOST ?? '0.0.0.0';
const logger = new ConsoleLogger();

const restEngine = new RestEngine({ port: PORT, host: HOST, logger });

// Register this service's own API contract if present.
const contractPath = join(process.cwd(), 'contracts', 'contract.json');
if (existsSync(contractPath)) {
  try {
    const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
    restEngine.registerContract(contract);
  } catch (err) {
    logger.warn(`Failed to load API contract: ${(err as Error).message}`);
  }
}

// Readiness probes for shared infrastructure (lightweight TCP checks).
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT ?? 5432);
const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);
const DB_HOST = process.env.POSTGRES_HOST ?? 'localhost';
const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';

function tcpProbe(host: string, port: number, timeoutMs = 1500): Promise<{ status: string; message?: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket
      .once('connect', () => {
        socket.destroy();
        resolve({ status: 'healthy' });
      })
      .once('timeout', () => {
        socket.destroy();
        resolve({ status: 'unhealthy', message: `timeout connecting to ${host}:${port}` });
      })
      .once('error', (err: Error) => {
        socket.destroy();
        resolve({ status: 'unhealthy', message: err.message });
      });
    socket.connect(port, host);
  });
}

const healthChecker = new HealthChecker('1.0.0');
healthChecker.register({ name: 'postgres', check: () => tcpProbe(DB_HOST, POSTGRES_PORT) });
healthChecker.register({ name: 'redis', check: () => tcpProbe(REDIS_HOST, REDIS_PORT) });

// Expose readiness + detailed health on the engine's app.
const app = restEngine.getApp();
app.get('/health/ready', async (_req, res) => {
  // Always 200 so the service is considered "up" even when infrastructure
  // (postgres/redis) is degraded — the body reports the real status.
  const result = await healthChecker.checkAll();
  res.status(200).json(result);
});
app.get('/health/detail', async (_req, res) => {
  const result = await healthChecker.checkAll();
  res.json(result);
});

restEngine.start().then(() => {
  logger.info(`Casuya API gateway listening on http://${HOST}:${PORT}`);
  logger.info(`Health: /health (liveness)  /health/ready (readiness)  /health/detail`);
}).catch((err) => {
  logger.error(`Failed to start API gateway: ${(err as Error).message}`);
  process.exit(1);
});

function shutdown(): void {
  logger.info('Shutting down API gateway...');
  restEngine.stop().finally(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
