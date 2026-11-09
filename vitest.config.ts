import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Los tests de integración comparten una BD de desarrollo: se ejecutan en serie.
    fileParallelism: false,
    testTimeout: 30000,
  },
});
