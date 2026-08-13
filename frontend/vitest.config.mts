import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` -> `./*` mapping in tsconfig.json.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    name: 'unit',
    environment: 'node',
    // Every date helper pins Australia/Melbourne explicitly. Running under an
    // unrelated zone (not Melbourne, not CI's UTC) proves none of them fall
    // back to server-local time.
    env: { TZ: 'America/New_York' },
    include: ['__tests__/**/*.test.ts'],
    // Playwright specs live in e2e/ and are run by `npm run test:e2e`.
    exclude: ['e2e/**', 'node_modules/**', '.next/**', 'out/**'],
  },
})
