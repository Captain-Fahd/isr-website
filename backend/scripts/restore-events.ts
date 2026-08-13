/**
 * One-off recovery script.
 *
 * On 2026-08-13T00:32:58Z the e2e fixture seed was run against the production
 * database, deleting every Event and Announcement row. The event records were
 * recovered from the static HTML of the previously deployed site (which had
 * been built before the wipe) and live in ./recovered-events.json.
 *
 * This script re-inserts them with their original IDs so existing /events/:id
 * links keep working. It is idempotent: rows that already exist are skipped.
 *
 * Usage:
 *   npx tsx scripts/restore-events.ts              # dry run, prints the plan
 *   npx tsx scripts/restore-events.ts --commit     # actually writes
 *   npx tsx scripts/restore-events.ts --commit --remove-fixtures
 *                                                  # also delete the leftover
 *                                                  # example.com test rows
 *
 * Safe to delete once the restore is confirmed.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { prisma } from '../lib/prisma';

type RecoveredEvent = {
  id: number;
  name: string;
  date: string;
  imageUrl: string;
  description: string;
  ticketUrl: string | null;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const recovered: RecoveredEvent[] = JSON.parse(
  readFileSync(path.join(scriptDir, 'recovered-events.json'), 'utf8'),
);

const commit = process.argv.includes('--commit');
const removeFixtures = process.argv.includes('--remove-fixtures');

/** Test rows written by the fixture seed, matched on their placeholder domain. */
const FIXTURE_IMAGE_HOST = 'https://example.com/';

function describeTarget(): string {
  const url = process.env.DATABASE_URL ?? '';
  const host = url.match(/@([^/:?]+)/)?.[1] ?? 'unknown host';
  const db = url.match(/\/([^/?]+)(\?|$)/)?.[1] ?? 'unknown db';
  return `${host} / ${db}`;
}

async function main() {
  console.log(`Target database : ${describeTarget()}`);
  console.log(`Mode            : ${commit ? 'COMMIT (writes)' : 'dry run'}\n`);

  const existing = await prisma.event.findMany({ orderBy: { id: 'asc' } });
  console.log(`Existing events : ${existing.length}`);
  for (const e of existing) {
    const fixture = e.imageUrl.startsWith(FIXTURE_IMAGE_HOST) ? '  <- test fixture' : '';
    console.log(`  id=${e.id}  ${e.name}${fixture}`);
  }
  console.log();

  const existingIds = new Set(existing.map((e) => e.id));
  const toInsert = recovered.filter((e) => !existingIds.has(e.id));
  const skipped = recovered.filter((e) => existingIds.has(e.id));

  for (const e of skipped) {
    console.log(`skip   id=${e.id}  ${e.name} (already present)`);
  }
  for (const e of toInsert) {
    console.log(`insert id=${e.id}  ${e.name}  (${e.date})`);
  }

  const fixtures = existing.filter((e) => e.imageUrl.startsWith(FIXTURE_IMAGE_HOST));
  if (removeFixtures) {
    for (const e of fixtures) {
      console.log(`delete id=${e.id}  ${e.name} (test fixture)`);
    }
  } else if (fixtures.length > 0) {
    console.log(
      `\nnote: ${fixtures.length} test fixture row(s) left in place; ` +
        `re-run with --remove-fixtures to delete them.`,
    );
  }

  if (!commit) {
    console.log('\nDry run — nothing written. Re-run with --commit to apply.');
    return;
  }

  for (const e of toInsert) {
    await prisma.event.create({
      data: {
        id: e.id,
        name: e.name,
        date: new Date(e.date),
        imageUrl: e.imageUrl,
        description: e.description,
        ticketUrl: e.ticketUrl,
      },
    });
  }

  if (removeFixtures && fixtures.length > 0) {
    await prisma.event.deleteMany({ where: { id: { in: fixtures.map((e) => e.id) } } });
  }

  // Explicit IDs bypass the sequence; realign it so future admin inserts don't
  // collide with a restored ID.
  const max = await prisma.event.aggregate({ _max: { id: true } });
  const nextId = (max._max.id ?? 0) + 1;
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Event"', 'id'), ${nextId}, false)`,
  );

  const final = await prisma.event.findMany({ orderBy: { id: 'asc' } });
  console.log(`\nDone. ${final.length} events now in the table:`);
  for (const e of final) {
    console.log(`  id=${e.id}  ${e.name}  ${e.date.toISOString()}`);
  }
  console.log(`Sequence next value: ${nextId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
