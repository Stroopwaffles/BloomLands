/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

// The balance simulator: `npm run balance`. Separate from the tests (it takes a while).
export default defineConfig({
  test: {
    include: ['sim/**/*.sim.ts'],
    environment: 'node',
    testTimeout: 30 * 60_000,
  },
})
