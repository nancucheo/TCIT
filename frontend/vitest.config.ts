import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test-setup.ts',
      exclude: ['node_modules', 'e2e'],
      coverage: {
        provider: 'v8',
        thresholds: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'node_modules',
          'src/test-setup.ts',
          'src/test-utils/**',
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/**/types/**',
          'src/**/api/**',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  }),
);
