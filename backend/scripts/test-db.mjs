import 'dotenv/config'
import pg from 'pg'

function poolConfigFromDatabaseUrl(connectionString) {
  const url = new URL(connectionString)

  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.replace(/^\//, ''),
    ssl: url.hostname.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  }
}

const { password } = poolConfigFromDatabaseUrl(process.env.DATABASE_URL)
const projectRef = 'fmulogrxdtkmdrhhcldz'

const attempts = [
  {
    label: 'direct:5432',
    config: {
      user: 'postgres',
      password,
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
  },
  {
    label: 'dedicated-pooler:6543',
    config: {
      user: 'postgres',
      password,
      host: `db.${projectRef}.supabase.co`,
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
  },
  {
    label: 'shared-pooler-session:5432',
    config: {
      user: `postgres.${projectRef}`,
      password,
      host: 'aws-0-ap-southeast-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
  },
  {
    label: 'shared-pooler-tx:6543',
    config: {
      user: `postgres.${projectRef}`,
      password,
      host: 'aws-0-ap-southeast-2.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
  },
]

for (const attempt of attempts) {
  const pool = new pg.Pool(attempt.config)

  try {
    await pool.query('SELECT 1')
    console.log(`OK ${attempt.label}`)
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.log(`FAIL ${attempt.label}: ${err.message}`)
    await pool.end()
  }
}

process.exit(1)
