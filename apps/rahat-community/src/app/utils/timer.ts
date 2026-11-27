import { performance } from 'node:perf_hooks';

/**
 * Tiny stopwatch for timing logs (same helper as first-version-beneficiary-s3).
 *
 *   const t = startTimer();
 *   await query();      t.lap('insert');
 *   await other();      t.lap('status');
 *   t.summary()  → "insert=812ms status=4ms total=820ms"
 *   t.toJSON()   → { insert: 812, status: 4, total: 820 }
 */
export function startTimer() {
  const start = performance.now();
  let last = start;
  const laps: [string, number][] = [];

  const round = (ms: number) => Math.round(ms * 10) / 10;
  const total = () => round(performance.now() - start);

  return {
    /** Time since the previous lap (or the start). */
    lap(name: string): number {
      const now = performance.now();
      const ms = round(now - last);
      laps.push([name, ms]);
      last = now;
      return ms;
    },
    total,
    summary(): string {
      return [
        ...laps.map(([n, ms]) => `${n}=${ms}ms`),
        `total=${total()}ms`,
      ].join(' ');
    },
    toJSON(): Record<string, number> {
      return { ...Object.fromEntries(laps), total: total() };
    },
  };
}

/** Anything slower than this is logged as a warning. */
// Falls back to 1000 when the variable is missing, empty, not a number or <= 0.
const slowEnv = Number(process.env.TARGET_SLOW_QUERY_MS);
export const SLOW_QUERY_MS =
  Number.isFinite(slowEnv) && slowEnv > 0 ? slowEnv : 1000;
