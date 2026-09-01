import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const certDir = fileURLToPath(new URL('./.cert', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      key: readFileSync(`${certDir}/dev-key.pem`),
      cert: readFileSync(`${certDir}/dev-cert.pem`),
    },
  },
})
