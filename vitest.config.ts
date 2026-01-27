import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    isolate: false,
    singleFork: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/dashboard.ts', // Dashboard server has its own concerns
        'src/index.ts' // MCP server entry point - tested via integration
      ]
    },
    setupFiles: [],
    testTimeout: 10000
  },
});
