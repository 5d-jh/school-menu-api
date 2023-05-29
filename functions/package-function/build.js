#!/usr/bin/env node

require('esbuild')
  .build({
    logLevel: 'info',
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node16',
    loader: {
      '.node': 'file'
    },
    external: ['jsdom'],
    outfile: 'dist/index.min.js'
  })
  .catch(() => process.exit(1))
