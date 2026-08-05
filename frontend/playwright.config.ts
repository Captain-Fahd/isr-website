import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const frontendDir = __dirname
const backendDir = path.resolve(frontendDir, '../backend')

// Dedicated ports so local `next dev` / API on 3000/4000 can keep running.
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:4001'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3005'

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5432/isr_e2e'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: backendDir,
      url: `${apiUrl}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: '4001',
        MOCK_EXTERNALS: '1',
        DATABASE_URL: databaseUrl,
        SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? 'e2e-anon-key',
        RESEND_API_KEY: process.env.RESEND_API_KEY ?? 're_e2e_test',
        RESEND_FROM_ADDRESS: process.env.RESEND_FROM_ADDRESS ?? 'noreply@example.com',
        WEATHER_API_KEY: process.env.WEATHER_API_KEY ?? 'weather-e2e-test',
      },
    },
    {
      command: 'npx next dev -p 3005',
      cwd: frontendDir,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: '3005',
        NEXT_PUBLIC_API_URL: apiUrl,
      },
    },
  ],
})
