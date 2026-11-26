import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.WATCH_HELPER_E2E_URL ?? 'http://localhost:5173',
    viewport: { width: 390, height: 844 },
  },
})
