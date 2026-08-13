/**
 * Guard for destructive test helpers.
 *
 * The e2e seed and the integration `resetDatabase()` helper both call
 * `deleteMany()` across every table. If `DATABASE_URL` happens to point at a
 * real deployment when they run, they silently destroy production data — which
 * is exactly what happened on 2026-08-13, when the e2e seed picked up the
 * production URL out of `backend/.env` and wiped every event and announcement.
 *
 * Every destructive helper must call `assertDisposableDatabase()` first.
 */

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  'host.docker.internal',
]);

/** Database names we accept on a non-local host, e.g. a throwaway CI instance. */
const DISPOSABLE_NAME = /(^|[_-])(e2e|test|integration)$/i;

/**
 * Throws unless `DATABASE_URL` clearly points at a disposable database.
 *
 * @param context - what is about to run, used in the error message.
 */
export function assertDisposableDatabase(context: string): void {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error(
      `${context} refused: DATABASE_URL is not set.\n` +
        `Point it at a local throwaway database first, e.g.\n` +
        `  export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isr_e2e`,
    );
  }

  let host: string;
  let database: string;
  try {
    const url = new URL(raw);
    host = url.hostname;
    database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  } catch {
    throw new Error(`${context} refused: DATABASE_URL is not a valid URL.`);
  }

  if (LOCAL_HOSTS.has(host)) return;
  if (DISPOSABLE_NAME.test(database)) return;

  if (process.env.ALLOW_DESTRUCTIVE_DB_RESET === '1') {
    console.warn(
      `WARNING: ${context} is wiping a non-local database (${host}/${database}) ` +
        `because ALLOW_DESTRUCTIVE_DB_RESET=1.`,
    );
    return;
  }

  throw new Error(
    `${context} refused: it deletes every row, and DATABASE_URL points at\n` +
      `  host: ${host}\n` +
      `  db:   ${database}\n` +
      `which is not a recognised throwaway database.\n\n` +
      `Expected a local host (${[...LOCAL_HOSTS].join(', ')}) or a database name\n` +
      `ending in _e2e / _test / _integration. Set DATABASE_URL explicitly:\n` +
      `  export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isr_e2e\n\n` +
      `If you genuinely mean to wipe this database, set ALLOW_DESTRUCTIVE_DB_RESET=1.`,
  );
}
