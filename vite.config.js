import path from 'path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget =
    env.VITE_PROXY_TARGET || 'https://gaurav-n8nspace.duckdns.org'

  const proxyConfig = {
    '/api': {
      target: proxyTarget,
      changeOrigin: true,
      secure: true,
      rewrite: (p) => p.replace(/^\/api/, ''),
    },
  }

  const previewPort = Number(process.env.PORT) || 4173

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: proxyConfig,
    },
    preview: {
      proxy: proxyConfig,
      host: true,
      port: previewPort,
      strictPort: !!process.env.PORT,
      // Render / other PaaS use custom hostnames — allow all in preview (production serve)
      allowedHosts: true,
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      minify: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            if (id.includes('@radix-ui')) return 'vendor-ui'
            if (id.includes('lucide-react')) return 'vendor-icons'
            return 'vendor'
          },
        },
      },
    },
  }
})
