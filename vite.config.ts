import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Command-aware base: dev serves from "/" (http://localhost:5173/),
// production builds target GitHub Pages at /ppmd10/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ppmd10/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
