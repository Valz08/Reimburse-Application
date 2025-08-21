import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // agar bisa diakses dari IP lokal
    port: 3000          // bebas, asal tahu port-nya
  }
})
