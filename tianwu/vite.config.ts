import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 改为相对路径，确保在任何目录下直接打开 index.html 都能找到资源
})
