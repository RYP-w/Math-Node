import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    minify: "esbuild",//!
    assetsDir: "",//!
    cssCodeSplit: false,//!
    rollupOptions: {//!
      output: {//!
        entryFileNames: "app.js",//!
        assetFileNames: "[name].[ext]",//!
        inlineDynamicImports: true,//!
        manualChunks: undefined,//!
      }//!
    }//!
  },
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2']
})
