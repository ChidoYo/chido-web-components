import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/package',
    lib: {
      entry: { index: 'src/index.ts', react: 'src/react/index.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rolldownOptions: {
      external: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/],
      output: { banner: chunk => chunk.name === 'react' ? "'use client';" : '' },
    },
  },
});
