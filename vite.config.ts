import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const certDir = fileURLToPath(new URL('./.cert', import.meta.url))
const keyPath = `${certDir}/dev-key.pem`
const certPath = `${certDir}/dev-cert.pem`
const hasLocalCert = existsSync(keyPath) && existsSync(certPath)

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // served from https://<user>.github.io/rana-kerstkaart/ on GitHub Pages
  base: '/rana-kerstkaart/',
  server: {
    host: '0.0.0.0',
    // local HTTPS (mkcert) for testing device sensors on a phone; absent in CI/build
    ...(command === 'serve' && hasLocalCert
      ? { https: { key: readFileSync(keyPath), cert: readFileSync(certPath) } }
      : {}),
  },
}))
