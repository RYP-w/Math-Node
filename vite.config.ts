import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Math-Node-Web/',
  server: {
    port: 3000,
    open: false
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
