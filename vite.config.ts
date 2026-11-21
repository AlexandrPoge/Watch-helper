import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const config = loadEnv(mode, process.cwd(), '')
  const api = `http://127.0.0.1:${config.API_PORT || 3001}`
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(config.WEB_PORT || 5173),
      strictPort: true,
      proxy: {
        '/health': api,
        '/api': api,
        '/socket.io': { target: api, ws: true },
      },
    },
  }
})
