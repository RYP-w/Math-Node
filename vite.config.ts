import { defineConfig } from 'vite'

export default defineConfig({
  base: '/math-node-web/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    minify: "esbuild",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        inlineDynamicImports: true,
        manualChunks: undefined,

        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop()

          if (['svg','webp','woff','woff2','ttf'].includes(ext || '')) {
            return 'assets/[name][extname]'
          }

          return '[name][extname]'
        }
      }
    }
  },
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2']
})