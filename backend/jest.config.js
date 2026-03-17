/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Inject test DB env vars before any module is evaluated (must be setupFiles, not setupFilesAfterFramework)
  setupFiles: ['<rootDir>/tests/helpers/setTestEnv.ts'],
  // Integration tests share a single MySQL DB — run suites sequentially to prevent race conditions
  maxWorkers: 1,
  rootDir: '.',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/migrations/**',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
    },
  },
};
