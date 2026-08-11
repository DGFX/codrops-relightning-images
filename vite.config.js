import { cp } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { defineConfig } from 'vite'

const extensionsDir = join(
  dirname(
    createRequire(import.meta.url).resolve(
      'three/addons/inspector/Inspector.js',
    ),
  ),
  'extensions',
)

function inspectorExtensions() {
  let extensionsOutDir = 'dist/extensions'

  return {
    name: 'inspector-extensions',
    apply: 'build',
    configResolved({ root, build }) {
      extensionsOutDir = join(resolve(root, build.outDir), 'extensions')
    },
    async closeBundle() {
      await cp(extensionsDir, extensionsOutDir, { recursive: true })
    },
  }
}

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'demo2.html', 'demo3.html'],
    exclude: ['three'],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        demo2: 'demo2.html',
        demo3: 'demo3.html',
      },
    },
  },
  plugins: [inspectorExtensions()],
})
