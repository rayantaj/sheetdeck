import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sheetdeck/',
  plugins: [react()],
  worker: { format: 'es' },
  test: { include: ['src/**/*.test.ts'] },
})
