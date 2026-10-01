import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' : GitHub Pages의 하위 경로(/Diet_Cd/)와 localhost 양쪽에서 그대로 동작
export default defineConfig({ base: './', plugins: [react()] })
