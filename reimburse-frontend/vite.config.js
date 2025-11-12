import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // agar bisa diakses dari IP lokal
    port: 3000          // port lokal kamu tetap aman
  },
  preview: {
    port: 8080,         // port runtime di OpenShift
    allowedHosts: [
      'reimburse-frontend-webapp.apps-crc.testing' // ✅ whitelist domain CRC
    ]
  }
})
