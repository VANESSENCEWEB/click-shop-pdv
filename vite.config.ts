import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// No GitHub Pages o site fica em /click-shop-pdv/. Usamos o mesmo caminho
// em dev, build e preview para não ter surpresa na hora de publicar.
export default defineConfig({
  base: '/click-shop-pdv/',
  plugins: [react(), tailwindcss()],
})
