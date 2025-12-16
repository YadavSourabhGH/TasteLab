import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: parseInt(process.env.PORT, 10) || 5173,
        proxy: {
            '/api': {
                target: 'https://tastelab-mqir.onrender.com',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'https://tastelab-mqir.onrender.com',
                ws: true
            }
        },
        allowedHosts: 'https://tastelab-collab.onrender.com/'
    }
})
