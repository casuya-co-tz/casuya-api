export class Stopwatch {
  private startTime: number;
  private _elapsed: number = 0;

  constructor() {
    this.startTime = performance.now();
  }

  get elapsed(): number {
    return this._elapsed > 0 ? this._elapsed : performance.now() - this.startTime;
  }

  stop(): number {
    this._elapsed = performance.now() - this.startTime;
    return this._elapsed;
  }

  reset(): void {
    this.startTime = performance.now();
    this._elapsed = 0;
  }
}

export function measure<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  return { result, duration: performance.now() - start };
}

export async function measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  return { result, duration: performance.now() - start };
}
