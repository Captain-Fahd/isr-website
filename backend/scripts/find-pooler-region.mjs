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

const projectRef = 'fmulogrxdtkmdrhhcldz'
const { password } = poolConfigFromDatabaseUrl(process.env.DATABASE_URL)

const regions = [
  'ap-southeast-2',
  'ap-southeast-1',
  'us-east-1',
  'us-west-1',
  'eu-west-1',
  'eu-central-1',
  'ap-northeast-1',
  'sa-east-1',
]

for (const region of regions) {
  const pool = new pg.Pool({
    user: `postgres.${projectRef}`,
    password,
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })

  try {
    await pool.query('SELECT 1')
    console.log(`OK region=${region}`)
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.log(`FAIL region=${region}: ${err.message}`)
    await pool.end()
  }
}

process.exit(1)
