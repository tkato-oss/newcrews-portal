import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/newcrews-portal/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api/slack': {
        target: 'https://slack.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/slack/, ''),
      },
      '/navi-api': {
        target: 'https://kn3dj4dyskmja7ehxdan4kdtmu0konod.lambda-url.ap-northeast-1.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/navi-api/, ''),
      }
    }
  }
})
