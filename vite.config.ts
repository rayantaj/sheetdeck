import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sheetdeck/',
  plugins: [react()],
  worker: { format: 'es' },
  build: { assetsInlineLimit: 0 }, // data: URLs are blocked by font-src 'self'
  test: { include: ['src/**/*.test.ts'] },
})
